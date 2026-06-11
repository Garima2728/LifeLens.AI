import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Flame, Check, Trash2, Award, Target } from "lucide-react"
import toast from "react-hot-toast"
import Sidebar from "../../components/ui/Sidebar"
import { getTodayString } from "../../lib/utils"
import type { Habit } from "../../lib/types"
import axios from "axios"

const PRESETS = [
  { name:"30-min walk",       category:"exercise",        color:"#10B981", icon:"🚶", targetDays:7 },
  { name:"Drink 2L water",    category:"health",          color:"#3B82F6", icon:"💧", targetDays:7 },
  { name:"Sleep by 11pm",     category:"sleep",           color:"#7C3AED", icon:"😴", targetDays:7 },
  { name:"No screens before bed", category:"sleep",       color:"#6D28D9", icon:"📵", targetDays:7 },
  { name:"Meditate 10min",    category:"mental_wellness", color:"#EC4899", icon:"🧘", targetDays:5 },
  { name:"Read 20 pages",     category:"productivity",    color:"#F59E0B", icon:"📖", targetDays:5 },
]

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const today = getTodayString()
  const apiBase = `${process.env.NEXT_PUBLIC_API_URL||"http://localhost:8000"}/api/v1`
  const headers = () => ({ Authorization:`Bearer ${localStorage.getItem("ll_token")}` })

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${apiBase}/habits`, { headers:headers() })
      setHabits(res.data.data)
    } catch {
      setHabits([
        { id:"1", userId:"demo", name:"30-min walk", category:"exercise", targetDays:7, currentStreak:5, longestStreak:12, completedDates:[today], color:"#10B981", icon:"🚶" },
        { id:"2", userId:"demo", name:"Drink 2L water", category:"health", targetDays:7, currentStreak:11, longestStreak:14, completedDates:[today], color:"#3B82F6", icon:"💧" },
        { id:"3", userId:"demo", name:"Sleep by 11pm", category:"sleep", targetDays:7, currentStreak:3, longestStreak:7, completedDates:[], color:"#7C3AED", icon:"😴" },
      ] as any)
    } finally { setLoading(false) }
  }

  const complete = async (id:string) => {
    try { await axios.post(`${apiBase}/habits/${id}/complete`, { date:today }, { headers:headers() }) }
    catch {}
    setHabits(h=>h.map(x=>x.id===id?{ ...x, completedDates:[...(x.completedDates||[]),today], currentStreak:(x.currentStreak||0)+1 }:x))
    toast.success("+5 points! Habit completed 🎉")
  }

  const del = async (id:string) => {
    try { await axios.delete(`${apiBase}/habits/${id}`, { headers:headers() }) } catch {}
    setHabits(h=>h.filter(x=>x.id!==id))
    toast.success("Habit removed")
  }

  const addPreset = async (p: typeof PRESETS[0]) => {
    try {
      const res = await axios.post(`${apiBase}/habits`, p, { headers:headers() })
      setHabits(h=>[res.data.data,...h])
    } catch {
      setHabits(h=>[{ ...p, id:Date.now().toString(), userId:"demo", currentStreak:0, longestStreak:0, completedDates:[] } as any,...h])
    }
    toast.success("Habit added!")
  }

  useEffect(()=>{ load() },[])

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1,padding:"26px 30px",overflowY:"auto" }}>
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26 }}>
            <div>
              <h1 style={{ fontSize:22,fontWeight:700,margin:"0 0 4px" }}>Habit tracker</h1>
              <p style={{ color:"var(--text-secondary)",fontSize:13 }}>Build streaks, earn points, transform your life</p>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22 }}>
            {[
              { label:"Active habits",    value:habits.length, icon:Target, color:"#7C3AED" },
              { label:"Completed today",  value:habits.filter(h=>h.completedDates?.includes(today)).length, icon:Check, color:"#10B981" },
              { label:"Longest streak",   value:`${Math.max(0,...habits.map(h=>h.longestStreak||0))} days`, icon:Flame, color:"#F59E0B" },
            ].map(({ label,value,icon:Icon,color })=>(
              <div key={label} className="glass-card" style={{ padding:"16px 18px",display:"flex",alignItems:"center",gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${color}28` }}>
                  <Icon size={17} color={color}/>
                </div>
                <div>
                  <div style={{ fontSize:21,fontWeight:700,color }}>{value}</div>
                  <div style={{ fontSize:11,color:"var(--text-muted)" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding:18,marginBottom:18 }}>
            <h3 style={{ fontSize:13,fontWeight:600,margin:"0 0 11px" }}>Quick add presets</h3>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {PRESETS.map(p=>(
                <button key={p.name} onClick={()=>addPreset(p)}
                  style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",
                    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:8,cursor:"pointer",color:"var(--text-secondary)",fontSize:12,transition:"all 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=p.color; e.currentTarget.style.color=p.color }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="var(--text-secondary)" }}>
                  <span style={{ fontSize:14 }}>{p.icon}</span> {p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {loading ? [1,2,3].map(i=><div key={i} className="glass-card shimmer" style={{ height:74 }}/>)
            : habits.length===0 ? (
              <div className="glass-card" style={{ padding:36,textAlign:"center" }}>
                <Award size={34} color="#7C3AED" style={{ margin:"0 auto 10px" }}/>
                <p style={{ color:"var(--text-secondary)",fontSize:13 }}>No habits yet. Add one from the presets above.</p>
              </div>
            ) : habits.map((h,i)=>{
              const done = h.completedDates?.includes(today)
              return (
                <motion.div key={h.id} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.05 }}
                  className="glass-card" style={{ padding:"15px 18px",display:"flex",alignItems:"center",gap:14,
                    borderColor: done?`${h.color}30`:"rgba(255,255,255,0.08)",
                    background: done?`${h.color}08`:"rgba(30,41,59,0.7)" }}>
                  <button onClick={()=>!done&&complete(h.id)} style={{ width:38,height:38,borderRadius:"50%",flexShrink:0,
                    cursor:done?"default":"pointer",border:`2px solid ${done?h.color:"rgba(255,255,255,0.2)"}`,
                    background:done?`${h.color}25`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",
                    transition:"all 0.2s",fontSize:17 }}>
                    {done?<Check size={17} color={h.color}/>:<span>{h.icon}</span>}
                  </button>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:500,marginBottom:2,
                      textDecoration:done?"line-through":"none", color:done?"var(--text-muted)":"var(--text-primary)" }}>{h.name}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                      <span style={{ fontSize:11,color:"var(--text-muted)",textTransform:"capitalize" }}>{h.category.replace("_"," ")}</span>
                      {h.currentStreak>0&&<span style={{ fontSize:11,display:"flex",alignItems:"center",gap:3,color:"#F59E0B" }}>
                        <Flame size={10}/> {h.currentStreak} day streak</span>}
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:4 }}>
                    {Array.from({length:7},(_,j)=>{
                      const d=new Date(); d.setDate(d.getDate()-(6-j))
                      const ds=d.toISOString().split("T")[0]
                      const c=h.completedDates?.includes(ds)
                      return <div key={j} style={{ width:7,height:7,borderRadius:"50%",
                        background:c?h.color:"rgba(255,255,255,0.08)",
                        border:ds===today?`1px solid ${h.color}`:"none" }}/>
                    })}
                  </div>
                  <div style={{ textAlign:"right",minWidth:54 }}>
                    <div style={{ fontSize:15,fontWeight:700,color:h.color }}>{h.longestStreak}</div>
                    <div style={{ fontSize:10,color:"var(--text-muted)" }}>best</div>
                  </div>
                  <button onClick={()=>del(h.id)} style={{ background:"none",border:"none",cursor:"pointer",
                    color:"var(--text-muted)",padding:4,borderRadius:6,transition:"color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color="#EF4444")}
                    onMouseLeave={e=>(e.currentTarget.style.color="var(--text-muted)")}>
                    <Trash2 size={13}/>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
