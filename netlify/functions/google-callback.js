const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;
  if (!code) return { statusCode: 400, body: "Code manquant" };

  try {
    // 1. Échanger le code contre des tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenRes.json();
    if (tokens.error) throw new Error(tokens.error_description);

    // 2. Récupérer l'email de l'utilisateur
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = await userRes.json();

    // 3. Stocker les tokens dans Supabase
    const expiry = Date.now() + tokens.expires_in * 1000;
    await supabase.from("google_tokens").upsert({
      user_id: user.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry,
    }, { onConflict: "user_id" });

    // 4. Rediriger vers le front avec l'user_id
    return {
      statusCode: 302,
      headers: { Location: `/?user=${encodeURIComponent(user.email)}&connected=true` },
      body: "",
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: `Erreur OAuth: ${err.message}` };
  }
};