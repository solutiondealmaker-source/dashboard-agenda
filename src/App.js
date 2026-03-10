import { useState, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CALENDAR_COLORS = [
  "#4F8EF7", "#F76A4F", "#4FD18B", "#F7C84F", "#B44FF7",
  "#F74FA6", "#4FF7F0", "#F7954F"
];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function isSameDay(a, b) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function toLocalISO(d) { return d.toISOString().slice(0,10); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate()+n); return r; }
function mondayOfWeek(d) { const day=d.getDay(); const diff=(day===0?-6:1-day); return addDays(d,diff); }
function formatTime(dateStr) { if(!dateStr) return ""; const d=new Date(dateStr); return d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}); }

// ─── STYLES ───────────────────────────────────────────────────────────────────
const btnStyle = { background:"#1e1e3a", color:"#aaa", border:"1px solid #2e2e4e", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13 };
const inputStyle = { background:"#0e0e1a", color:"#eee", border:"1px solid #2e2e4e", borderRadius:8, padding:"6px 10px", fontSize:13, outline:"none" };
const labelStyle = { color:"#888", fontSize:11 };

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const today = new Date();
const DEFAULT_TASKS = [
  { id:"t1", name:"Script de closing V1", start_date:toLocalISO(today), end_date:toLocalISO(addDays(today,5)), status:"en cours", color:CALENDAR_COLORS[2] },
  { id:"t2", name:"Lancement Discord Academy", start_date:toLocalISO(addDays(today,3)), end_date:toLocalISO(addDays(today,10)), status:"à faire", color:CALENDAR_COLORS[0] },
];

// ─── COMPOSANTS UI ────────────────────────────────────────────────────────────
function Badge({ color, label }) {
  return <span style={{ background:color+"33", color, border:`1px solid ${color}55`, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{label}</span>;
}

function EventPill({ event, calendars }) {
  const cal = calendars.find(c=>c.id===event.calendarId)||{color:"#888"};
  const start = event.start?.dateTime ? formatTime(event.start.dateTime) : "Journée";
  return (
    <div style={{ background:cal.color+"22", borderLeft:`3px solid ${cal.color}`, borderRadius:4, padding:"2px 5px", marginBottom:2, fontSize:11, color:"#eee", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
      {start && <span style={{ color:cal.color, fontWeight:700, marginRight:4 }}>{start}</span>}
      {event.summary}
    </div>
  );
}

function CalendarLegend({ calendars }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:20 }}>
      {calendars.map(c=>(
        <div key={c.id} style={{ display:"flex", alignItems:"center", gap:6, background:"#1a1a2e", borderRadius:8, padding:"4px 12px" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:c.color }} />
          <span style={{ color:"#ccc", fontSize:13 }}>{c.summary}</span>
        </div>
      ))}
    </div>
  );
}

// ─── VUE MOIS ─────────────────────────────────────────────────────────────────
function MonthView({ events, calendars, current, setCurrent }) {
  const first = startOfMonth(current);
  const total = daysInMonth(current);
  const startDow = (first.getDay()+6)%7;
  const cells = [];
  for(let i=0;i<startDow;i++) cells.push(null);
  for(let d=1;d<=total;d++) cells.push(new Date(current.getFullYear(),current.getMonth(),d));
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>
        <button onClick={()=>setCurrent(new Date(current.getFullYear(),current.getMonth()-1,1))} style={btnStyle}>‹</button>
        <h2 style={{ color:"#fff", fontSize:20, margin:0 }}>{MONTHS_FR[current.getMonth()]} {current.getFullYear()}</h2>
        <button onClick={()=>setCurrent(new Date(current.getFullYear(),current.getMonth()+1,1))} style={btnStyle}>›</button>
        <button onClick={()=>setCurrent(new Date())} style={{...btnStyle,fontSize:12,padding:"4px 10px"}}>Aujourd'hui</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {DAYS_FR.map(d=><div key={d} style={{ textAlign:"center", fontSize:12, color:"#888", paddingBottom:6 }}>{d}</div>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={`e${i}`}/>;
          const dayEvents = events.filter(e=>{ const s=e.start?.dateTime||e.start?.date; return s&&isSameDay(new Date(s),day); });
          const isToday = isSameDay(day,new Date());
          return (
            <div key={i} style={{ background:isToday?"#1e3a5f":"#1a1a2e", borderRadius:8, minHeight:80, padding:"6px 4px", border:isToday?"1px solid #4F8EF7":"1px solid #2a2a3e" }}>
              <div style={{ fontSize:13, color:isToday?"#4F8EF7":"#ccc", fontWeight:isToday?700:400, marginBottom:4 }}>{day.getDate()}</div>
              {dayEvents.slice(0,3).map(e=><EventPill key={e.id} event={e} calendars={calendars}/>)}
              {dayEvents.length>3&&<div style={{ fontSize:10, color:"#666" }}>+{dayEvents.length-3} autres</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── VUE SEMAINE ──────────────────────────────────────────────────────────────
function WeekView({ events, calendars, current, setCurrent }) {
  const monday = mondayOfWeek(current);
  const days = Array.from({length:7},(_,i)=>addDays(monday,i));
  const hours = Array.from({length:14},(_,i)=>i+7);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18 }}>
        <button onClick={()=>setCurrent(addDays(current,-7))} style={btnStyle}>‹ Préc.</button>
        <h2 style={{ color:"#fff", fontSize:18, margin:0 }}>Semaine du {days[0].getDate()} {MONTHS_FR[days[0].getMonth()]}</h2>
        <button onClick={()=>setCurrent(addDays(current,7))} style={btnStyle}>Suiv. ›</button>
        <button onClick={()=>setCurrent(new Date())} style={{...btnStyle,fontSize:12}}>Auj.</button>
      </div>
      <div style={{ overflowX:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"50px repeat(7,1fr)", minWidth:600 }}>
          <div/>
          {days.map((d,i)=>(
            <div key={i} style={{ textAlign:"center", padding:"6px 0", fontSize:12, color:isSameDay(d,new Date())?"#4F8EF7":"#aaa", fontWeight:isSameDay(d,new Date())?700:400 }}>
              {DAYS_FR[i]}<br/><span style={{ fontSize:16 }}>{d.getDate()}</span>
            </div>
          ))}
          {hours.map(h=>(
            <React.Fragment key={h}>
              <div style={{ fontSize:11, color:"#555", paddingTop:4, textAlign:"right", paddingRight:6 }}>{h}h</div>
              {days.map((d,di)=>{
                const slotEvents = events.filter(e=>{ if(!e.start?.dateTime) return false; const s=new Date(e.start.dateTime); return isSameDay(s,d)&&s.getHours()===h; });
                return (
                  <div key={`${h}-${di}`} style={{ borderTop:"1px solid #1e1e2e", minHeight:40, padding:2, background:isSameDay(d,new Date())?"#1a2540":"transparent" }}>
                    {slotEvents.map(e=>{ const cal=calendars.find(c=>c.id===e.calendarId)||{color:"#888"}; return <div key={e.id} style={{ background:cal.color, borderRadius:4, padding:"2px 4px", fontSize:10, color:"#fff", marginBottom:1, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{formatTime(e.start.dateTime)} {e.summary}</div>; })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── VUE JOUR ─────────────────────────────────────────────────────────────────
function DayView({ events, calendars }) {
  const todayEvents = events.filter(e=>{ const s=e.start?.dateTime||e.start?.date; return s&&isSameDay(new Date(s),new Date()); }).sort((a,b)=>new Date(a.start?.dateTime||a.start?.date)-new Date(b.start?.dateTime||b.start?.date));
  return (
    <div>
      <h2 style={{ color:"#fff", fontSize:20, marginBottom:18 }}>📅 {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</h2>
      {todayEvents.length===0&&<div style={{ color:"#555", textAlign:"center", paddingTop:40 }}>Aucun événement aujourd'hui</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {todayEvents.map(e=>{ const cal=calendars.find(c=>c.id===e.calendarId)||{color:"#888",summary:"?"}; return (
          <div key={e.id} style={{ background:"#1a1a2e", borderLeft:`4px solid ${cal.color}`, borderRadius:10, padding:"14px 18px", display:"flex", gap:16, alignItems:"center" }}>
            <div style={{ minWidth:80, textAlign:"center" }}>
              <div style={{ color:cal.color, fontWeight:700, fontSize:18 }}>{formatTime(e.start?.dateTime)}</div>
              {e.end?.dateTime&&<div style={{ color:"#555", fontSize:12 }}>→ {formatTime(e.end.dateTime)}</div>}
            </div>
            <div>
              <div style={{ color:"#fff", fontWeight:600, fontSize:15 }}>{e.summary}</div>
              <Badge color={cal.color} label={cal.summary}/>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}

// ─── VUE GANTT ────────────────────────────────────────────────────────────────
const STATUS_OPTS = ["à faire","en cours","terminé","bloqué"];
const STATUS_COLORS = { "à faire":"#555","en cours":"#4F8EF7","terminé":"#4FD18B","bloqué":"#F76A4F" };

function GanttView({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name:"", start_date:toLocalISO(today), end_date:toLocalISO(addDays(today,7)), status:"à faire", color:CALENDAR_COLORS[0] });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ loadTasks(); },[userId]);

  async function loadTasks() {
    setLoading(true);
    try {
      if(userId) {
        const res = await fetch(`/.netlify/functions/gantt?action=list&user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        setTasks(data||[]);
      } else {
        setTasks(DEFAULT_TASKS);
      }
    } catch(e) { setTasks(DEFAULT_TASKS); }
    setLoading(false);
  }

  async function saveTask() {
    if(!form.name) return;
    setSaving(true);
    try {
      if(userId) {
        const body = editing ? {...form, id:editing, user_id:userId} : {...form, user_id:userId};
        const res = await fetch("/.netlify/functions/gantt", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action: editing?"update":"create", task:body}) });
        const saved = await res.json();
        if(editing) setTasks(tasks.map(t=>t.id===editing?saved:t));
        else setTasks([...tasks, saved]);
      } else {
        if(editing) setTasks(tasks.map(t=>t.id===editing?{...form,id:editing}:t));
        else setTasks([...tasks,{...form,id:Date.now().toString()}]);
      }
    } catch(e) {}
    setEditing(null);
    setForm({ name:"", start_date:toLocalISO(today), end_date:toLocalISO(addDays(today,7)), status:"à faire", color:CALENDAR_COLORS[0] });
    setSaving(false);
  }

  async function deleteTask(id) {
    try {
      if(userId) await fetch("/.netlify/functions/gantt", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"delete", task:{id, user_id:userId}}) });
      setTasks(tasks.filter(t=>t.id!==id));
    } catch(e) {}
  }

  function editTask(t) { setForm({name:t.name,start_date:t.start_date,end_date:t.end_date,status:t.status,color:t.color}); setEditing(t.id); }

  const ganttStart = tasks.length ? tasks.reduce((m,t)=>t.start_date<m?t.start_date:m, tasks[0].start_date) : toLocalISO(today);
  const ganttEnd = tasks.length ? tasks.reduce((m,t)=>t.end_date>m?t.end_date:m, tasks[0].end_date) : toLocalISO(addDays(today,30));
  const totalDays = Math.max(1,(new Date(ganttEnd)-new Date(ganttStart))/86400000)+2;
  function pct(d) { return Math.max(0,Math.min(100,((new Date(d)-new Date(ganttStart))/86400000/totalDays)*100)); }

  if(loading) return <div style={{ color:"#888", paddingTop:40, textAlign:"center" }}>Chargement...</div>;

  return (
    <div>
      <h2 style={{ color:"#fff", fontSize:20, marginBottom:16 }}>📊 Diagramme de Gantt</h2>
      <div style={{ background:"#1a1a2e", borderRadius:10, padding:16, marginBottom:20, display:"flex", flexWrap:"wrap", gap:10, alignItems:"flex-end" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={labelStyle}>Tâche</label>
          <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nom de la tâche" style={inputStyle}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={labelStyle}>Début</label>
          <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={inputStyle}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={labelStyle}>Fin</label>
          <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={inputStyle}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={labelStyle}>Statut</label>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>
            {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          <label style={labelStyle}>Couleur</label>
          <div style={{ display:"flex", gap:6 }}>
            {CALENDAR_COLORS.slice(0,6).map(c=>(
              <div key={c} onClick={()=>setForm({...form,color:c})} style={{ width:22, height:22, borderRadius:"50%", background:c, cursor:"pointer", border:form.color===c?"2px solid #fff":"2px solid transparent" }}/>
            ))}
          </div>
        </div>
        <button onClick={saveTask} disabled={saving} style={{...btnStyle,background:"#4F8EF7",color:"#fff",padding:"8px 18px"}}>
          {saving?"..." : editing?"✔ Modifier":"+Ajouter"}
        </button>
        {editing&&<button onClick={()=>{setEditing(null);setForm({name:"",start_date:toLocalISO(today),end_date:toLocalISO(addDays(today,7)),status:"à faire",color:CALENDAR_COLORS[0]});}} style={{...btnStyle,padding:"8px 12px"}}>Annuler</button>}
      </div>
      <div style={{ overflowX:"auto" }}>
        {tasks.map(t=>{
          const left=pct(t.start_date);
          const width=Math.max(1,pct(t.end_date)-left);
          const days=Math.round((new Date(t.end_date)-new Date(t.start_date))/86400000);
          return (
            <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ minWidth:180, fontSize:13, color:"#ddd", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
              <div style={{ flex:1, position:"relative", height:28, background:"#1a1a2e", borderRadius:6 }}>
                <div style={{ position:"absolute", left:`${left}%`, width:`${width}%`, height:"100%", background:t.color, borderRadius:6, display:"flex", alignItems:"center", paddingLeft:8, boxSizing:"border-box", overflow:"hidden" }}>
                  <span style={{ color:"#fff", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{days}j</span>
                </div>
                <div style={{ position:"absolute", left:`${pct(toLocalISO(today))}%`, top:0, bottom:0, width:2, background:"#F76A4F" }}/>
              </div>
              <Badge color={STATUS_COLORS[t.status]} label={t.status}/>
              <button onClick={()=>editTask(t)} style={{...btnStyle,fontSize:12,padding:"3px 8px"}}>✏</button>
              <button onClick={()=>deleteTask(t.id)} style={{...btnStyle,fontSize:12,padding:"3px 8px",color:"#F76A4F"}}>✕</button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#888" }}>
        <div style={{ width:12, height:12, background:"#F76A4F", borderRadius:2 }}/> Ligne rouge = aujourd'hui
      </div>
    </div>
  );
}

// ─── VUE PARAMÈTRES ───────────────────────────────────────────────────────────
function SettingsView({ userId, calendars, setCalendars, onDisconnect }) {
  const [step, setStep] = useState(userId ? "done" : "idle");
  const [fetchedCals, setFetchedCals] = useState([]);
  const [selected, setSelected] = useState({});
  const [colorMap, setColorMap] = useState({});
  const [loadingCals, setLoadingCals] = useState(false);

  useEffect(()=>{
    if(userId && step==="done" && calendars.length===0) fetchCalendars();
  },[userId]);

  async function fetchCalendars() {
    setLoadingCals(true);
    try {
      const res = await fetch(`/.netlify/functions/fetch-calendars?user_id=${encodeURIComponent(userId)}&type=calendars`);
      const data = await res.json();
      setFetchedCals(data);
      const sel={}, col={};
      data.forEach(c=>{ sel[c.id]=true; col[c.id]=c.backgroundColor||CALENDAR_COLORS[0]; });
      setSelected(sel); setColorMap(col);
      setStep("picking");
    } catch(e) { setStep("done"); }
    setLoadingCals(false);
  }

  function handleConnect() { window.location.href="/.netlify/functions/google-auth"; }

  function handleSave() {
    const chosen = fetchedCals.filter(c=>selected[c.id]).map(c=>({id:c.id,summary:c.summary,color:colorMap[c.id]}));
    setCalendars(chosen);
    setStep("done");
  }

  return (
    <div style={{ maxWidth:620 }}>
      <h2 style={{ color:"#fff", fontSize:20, marginBottom:6 }}>⚙️ Connexion Google Calendar</h2>
      <p style={{ color:"#888", fontSize:13, marginBottom:24 }}>Connecte ton compte Google pour importer tes agendas.</p>

      {step==="idle" && (
        <>
          <button onClick={handleConnect} style={{ display:"flex", alignItems:"center", gap:12, background:"#fff", color:"#333", border:"none", borderRadius:10, padding:"14px 24px", fontSize:15, fontWeight:600, cursor:"pointer" }}>
            <GoogleIcon/> Se connecter avec Google
          </button>
        </>
      )}

      {step==="done" && userId && (
        <div>
          <div style={{ background:"#0d2e1a", border:"1px solid #4FD18B55", borderRadius:10, padding:16, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>✅</span>
              <div>
                <div style={{ color:"#4FD18B", fontWeight:700 }}>Connecté</div>
                <div style={{ color:"#888", fontSize:12 }}>{userId}</div>
              </div>
            </div>
            <button onClick={onDisconnect} style={{...btnStyle,color:"#F76A4F",fontSize:12}}>Déconnecter</button>
          </div>
          {calendars.length>0 ? (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {calendars.map(c=>(
                  <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, background:"#1a1a2e", borderRadius:8, padding:"10px 14px" }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:c.color }}/>
                    <span style={{ color:"#ddd", fontSize:13 }}>{c.summary}</span>
                  </div>
                ))}
              </div>
              <button onClick={fetchCalendars} style={{...btnStyle,padding:"8px 16px"}} disabled={loadingCals}>
                {loadingCals?"Chargement...":"🔄 Modifier les agendas"}
              </button>
            </>
          ) : (
            <button onClick={fetchCalendars} style={{...btnStyle,background:"#4F8EF7",color:"#fff",padding:"10px 20px"}} disabled={loadingCals}>
              {loadingCals?"Chargement...":"📅 Importer mes agendas"}
            </button>
          )}
        </div>
      )}

      {step==="picking" && (
        <div>
          <p style={{ color:"#aaa", fontSize:13, marginBottom:14 }}>Sélectionne les agendas à afficher et personnalise leur couleur.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {fetchedCals.map(c=>(
              <div key={c.id} style={{ background:"#1a1a2e", borderRadius:10, padding:"12px 16px", display:"flex", alignItems:"center", gap:14, border:selected[c.id]?`1px solid ${colorMap[c.id]}88`:"1px solid #2e2e4e", opacity:selected[c.id]?1:0.5 }}>
                <input type="checkbox" checked={!!selected[c.id]} onChange={()=>setSelected(s=>({...s,[c.id]:!s[c.id]}))} style={{ width:16, height:16, cursor:"pointer", accentColor:colorMap[c.id] }}/>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#fff", fontWeight:600, fontSize:14 }}>{c.summary}</div>
                  <div style={{ color:"#555", fontSize:11 }}>{c.id}</div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {CALENDAR_COLORS.map(col=>(
                    <div key={col} onClick={()=>setColorMap(m=>({...m,[c.id]:col}))} style={{ width:18, height:18, borderRadius:"50%", background:col, cursor:"pointer", border:colorMap[c.id]===col?"2px solid #fff":"2px solid transparent" }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleSave} style={{...btnStyle,background:"#4F8EF7",color:"#fff",padding:"10px 22px",fontWeight:600}}>
              ✔ Enregistrer ({Object.values(selected).filter(Boolean).length} agendas)
            </button>
            <button onClick={()=>setStep("done")} style={{...btnStyle,padding:"10px 16px"}}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.1-4.5 6.7v5.6h7.3c4.3-3.9 6.9-9.7 6.9-16.3z"/>
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.6c-2.1 1.4-4.8 2.3-8.6 2.3-6.6 0-12.2-4.5-14.2-10.5H2.3v5.8C6.3 42.9 14.6 48 24 48z"/>
      <path fill="#FBBC05" d="M9.8 28.4c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4v-5.8H2.3C.8 17 0 20.4 0 24s.8 7 2.3 10.2l7.5-5.8z"/>
      <path fill="#EA4335" d="M24 9.5c3.7 0 7 1.3 9.6 3.8l7.2-7.2C36.9 2.1 31.5 0 24 0 14.6 0 6.3 5.1 2.3 13.8l7.5 5.8C11.8 14 17.4 9.5 24 9.5z"/>
    </svg>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"day", label:"☀️ Aujourd'hui" },
  { id:"week", label:"🗓 Semaine" },
  { id:"month", label:"📅 Mois" },
  { id:"gantt", label:"📊 Gantt" },
  { id:"settings", label:"⚙️ Agendas" },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
// NOTE: React doit être importé pour JSX dans certains configs
import React from "react";

export default function App() {
  const [tab, setTab] = useState("settings");
  const [current, setCurrent] = useState(new Date());
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState(null);

  // Lire les paramètres URL après OAuth
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    const connected = params.get("connected");
    if(user && connected==="true") {
      setUserId(user);
      setTab("settings");
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, "/");
    } else {
      // Vérifier si user en localStorage
      const saved = localStorage.getItem("agenda_user");
      if(saved) setUserId(saved);
    }
  },[]);

  // Sauvegarder userId
  useEffect(()=>{
    if(userId) localStorage.setItem("agenda_user", userId);
  },[userId]);

  // Charger les events quand les calendriers changent
  useEffect(()=>{
    if(userId && calendars.length>0) loadEvents();
  },[calendars]);

  async function loadEvents() {
    try {
      const allEvents = [];
      for(const cal of calendars) {
        const res = await fetch(`/.netlify/functions/fetch-calendars?user_id=${encodeURIComponent(userId)}&type=events&calendar_id=${encodeURIComponent(cal.id)}`);
        const data = await res.json();
        const mapped = (data||[]).map(e=>({...e, calendarId:cal.id}));
        allEvents.push(...mapped);
      }
      setEvents(allEvents);
    } catch(e) {}
  }

  function handleDisconnect() {
    setUserId(null);
    setCalendars([]);
    setEvents([]);
    localStorage.removeItem("agenda_user");
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a14", color:"#fff", fontFamily:"'Inter', sans-serif" }}>
      <div style={{ background:"#10101e", borderBottom:"1px solid #1e1e3e", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>🗓</span>
          <span style={{ color:"#fff", fontWeight:700, fontSize:18 }}>Dashboard Agenda</span>
        </div>
        {userId && <div style={{ fontSize:12, color:"#4FD18B" }}>✅ {userId}</div>}
      </div>
      <div style={{ background:"#10101e", padding:"0 24px", display:"flex", gap:4, borderBottom:"1px solid #1e1e3e" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:tab===t.id?"#1e2a50":"transparent", color:tab===t.id?"#4F8EF7":"#888", border:"none", borderBottom:tab===t.id?"2px solid #4F8EF7":"2px solid transparent", padding:"12px 18px", cursor:"pointer", fontSize:14, fontWeight:tab===t.id?700:400 }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding:"24px" }}>
        {tab!=="gantt" && tab!=="settings" && <CalendarLegend calendars={calendars}/>}
        {tab==="month" && <MonthView events={events} calendars={calendars} current={current} setCurrent={setCurrent}/>}
        {tab==="week" && <WeekView events={events} calendars={calendars} current={current} setCurrent={setCurrent}/>}
        {tab==="day" && <DayView events={events} calendars={calendars}/>}
        {tab==="gantt" && <GanttView userId={userId}/>}
        {tab==="settings" && <SettingsView userId={userId} calendars={calendars} setCalendars={setCalendars} onDisconnect={handleDisconnect}/>}
      </div>
    </div>
  );
}