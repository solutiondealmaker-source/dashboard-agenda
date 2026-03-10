const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  if (event.httpMethod === "GET") {
    const userId = event.queryStringParameters?.user_id;
    if (!userId) return { statusCode: 400, headers, body: JSON.stringify([]) };
    const { data, error } = await supabase.from("gantt_tasks").select("*").eq("user_id", userId).order("start_date");
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  }

  if (event.httpMethod === "POST") {
    const { action, task } = JSON.parse(event.body);

    if (action === "create") {
      const { id, ...rest } = task;
      const { data, error } = await supabase.from("gantt_tasks").insert(rest).select().single();
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (action === "update") {
      const { id, user_id, ...rest } = task;
      const { data, error } = await supabase.from("gantt_tasks").update(rest).eq("id", id).eq("user_id", user_id).select().single();
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (action === "delete") {
      const { error } = await supabase.from("gantt_tasks").delete().eq("id", task.id).eq("user_id", task.user_id);
      if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};