const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Rafraîchit le token si expiré
async function getValidToken(userId) {
  const { data } = await supabase
    .from("google_tokens")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!data) throw new Error("Utilisateur non connecté");

  // Token encore valide (marge 5 min)
  if (Date.now() < data.expiry - 300000) return data.access_token;

  // Rafraîchir
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const newTokens = await res.json();
  if (newTokens.error) throw new Error("Refresh token invalide");

  const expiry = Date.now() + newTokens.expires_in * 1000;
  await supabase.from("google_tokens").update({
    access_token: newTokens.access_token,
    expiry,
  }).eq("user_id", userId);

  return newTokens.access_token;
}

exports.handler = async (event) => {
  const userId = event.queryStringParameters?.user_id;
  const type = event.queryStringParameters?.type || "calendars"; // "calendars" | "events"

  if (!userId) return { statusCode: 400, body: "user_id manquant" };

  try {
    const token = await getValidToken(userId);
    const headers = { Authorization: `Bearer ${token}` };

    if (type === "calendars") {
      // Liste des agendas
      const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", { headers });
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.items || []),
      };
    }

    if (type === "events") {
      // Événements sur 3 mois (mois passé + 2 mois futurs)
      const calendarId = event.queryStringParameters?.calendar_id || "primary";
      const timeMin = new Date();
      timeMin.setMonth(timeMin.getMonth() - 1);
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 2);

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "250",
      });

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        { headers }
      );
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.items || []),
      };
    }

    return { statusCode: 400, body: "type invalide" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err.message };
  }
};