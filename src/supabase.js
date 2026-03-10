import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// ── Tâches Gantt ──────────────────────────────────────────────────────────────

export async function loadTasks(userId) {
  const { data, error } = await supabase
    .from("gantt_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("start_date");
  if (error) throw error;
  return data;
}

export async function saveTask(userId, task) {
  const payload = { ...task, user_id: userId };
  if (task.id && typeof task.id === "string") {
    // update
    const { data, error } = await supabase
      .from("gantt_tasks")
      .update(payload)
      .eq("id", task.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // insert
    const { id, ...rest } = payload; // retirer l'id temporaire
    const { data, error } = await supabase
      .from("gantt_tasks")
      .insert({ ...rest })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from("gantt_tasks").delete().eq("id", taskId);
  if (error) throw error;
}

// ── Préférences agendas ───────────────────────────────────────────────────────

export async function loadCalendarPrefs(userId) {
  const { data, error } = await supabase
    .from("calendar_prefs")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

export async function saveCalendarPrefs(userId, calendars) {
  // Upsert de chaque agenda
  const rows = calendars.map(c => ({
    user_id: userId,
    calendar_id: c.id,
    summary: c.summary,
    color: c.color,
    visible: true,
  }));
  const { error } = await supabase
    .from("calendar_prefs")
    .upsert(rows, { onConflict: "user_id,calendar_id" });
  if (error) throw error;
}