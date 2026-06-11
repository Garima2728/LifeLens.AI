import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"
import {
  TrendingUp, TrendingDown, Minus, Brain, Heart, Moon, Zap,
  Salad, Clock, ChevronRight, Sparkles, Bell, RefreshCw,
} from "lucide-react"
import Link from "next/link"
import Sidebar from "../../components/ui/Sidebar"
import ScoreRing from "../../components/ui/ScoreRing"
import { useAppStore } from "../../store"
import { MOCK_CHART_DATA, getEmotionColor, getEmotionEmoji, formatDate, getScoreColor } from "../../lib/utils"
import type { Emotion, ViewPeriod } from "../../lib/types"

const MoodOrb = dynamic(() => import("../../components/ui/MoodOrb"), { ssr:false })

const TODAY = { health:74, productivity:81, mood:68, sleep:62, diet:77, overall:72 }
const EMOTION: Emotion = "neutral"

const METRIC_CARDS = [
  { key:"mood",         label:"Mood",         icon:Brain, color:"#EC4899", score:68, delta:+5  },
  { key:"sleep",        label:"Sleep",        icon:Moon,  color:"#3B82F6", score:62, delta:-3  },
  { key:"productivity", label:"Productivity", icon:Zap,   color:"#7C3AED", score:81, delta:+8  },
  { key:"diet",         label:"Diet",         icon:Salad, color:"#10B981", score:77, delta:+2  },
]

const SUGGESTIONS = [
  { id:"1", category:"sleep",       title:"Earlier bedtime",    desc:"Try sleeping 30 min earlier.",          color:"#3B82F6", priority:"high"   },
  { id:"2", category:"exercise",    title:"Afternoon walk",     desc:"20-min walk reduces stress by 40%.",    color:"#10B981", priority:"medium" },
  { id:"3", category:"diet",        title:"Hydration boost",    desc:"Aim for 2L of water today.",            color:"#F59E0B", priority:"medium" },
  { id:"4", category:"productivity",title:"Screen-free hour",   desc:"1h screen-free before bed improves sleep.", color:"#7C3AED", priority:"low" },
]

const RADAR_DATA = [
  { subject:"Sleep", A:62 }, { subject:"Diet", A:77 }, { subject:"Exercise", A:65 },
  { subject:"Mood",  A:68 }, { subject:"Focus", A:81 }, { subject:"Social", A:72 },
]

const MOOD_DIST: [string,number][] = [["happy",30],["neutral",35],["stressed",20],["sad",10],["angry",5]]

const STREAK = Array.from({length:14},(_,i)=>({
  i, label:["S","M","T","W","T","F","S","S","M","T","W","T","F","S"][i],
  s: i<11 ? (i%7===0||Math.random()>.2?"done":"miss") : i===11?"today":"future"
}))

function CTooltip({ active,payload,label }: any) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:"rgba(9,18,36,0.95)", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color:"var(--text-secondary)", marginBottom:5 }}>{label}</p>
      {payload.map((p:any) => (
        <div key={p.dataKey} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:p.color }}/>
          <span style={{ color:"var(--text-muted)", textTransform:"capitalize" }}>{p.dataKey}:</span>
          <span style={{ color:"var(--text-primary)", fontWeight:500 }}>{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const user = useAppStore(s=>s.user)
  const [period, setPeriod] = useState<ViewPeriod>("weekly")
  const [insight, setInsight] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ setTimeout(()=>{
    setInsight("You've been consistently productive this week — great work! Sleep quality has dipped slightly. Your patterns suggest mild stress; consider a short mindfulness break and reducing screen time before bed.")
    setLoading(false)
  },1200) },[])

  const fadeUp = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0} }
  const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
  const hour = new Date().getHours()
  const greeting = hour<12?"morning":hour<18?"afternoon":"evening"

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1, padding:"26px 30px", overflowY:"auto", maxWidth:1380 }}>

        {/* Header */}
        <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }}
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>
              Good {greeting}, <span className="gradient-text">{user?.name?.split(" ")[0]??"Friend"}</span> ✨
            </h1>
            <p style={{ color:"var(--text-secondary)", fontSize:13, marginTop:3 }}>
              {formatDate(new Date())} · Your wellness journey continues
            </p>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3,
              border:"1px solid rgba(255,255,255,0.07)" }}>
              {(["daily","weekly","monthly"] as ViewPeriod[]).map(p=>(
                <button key={p} onClick={()=>setPeriod(p)} style={{
                  padding:"6px 13px", borderRadius:8, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:500, textTransform:"capitalize", transition:"all 0.2s",
                  background: period===p?"linear-gradient(135deg,#7C3AED,#6D28D9)":"transparent",
                  color: period===p?"white":"var(--text-secondary)",
                }}>{p}</button>
              ))}
            </div>
            <Link href="/dashboard/tracker">
              <button className="btn-primary" style={{ fontSize:13 }}><Bell size={13}/> Log Today</button>
            </Link>
          </div>
        </motion.div>

        {/* Row 1 */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display:"grid", gridTemplateColumns:"190px 190px 1fr", gap:18, marginBottom:18 }}>

          <motion.div variants={fadeUp} className="glass-card"
            style={{ padding:22, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <ScoreRing score={TODAY.overall} size={126}/>
            <p style={{ color:"var(--text-secondary)", fontSize:12, marginTop:10, textAlign:"center" }}>Overall score</p>
            <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:5, color:"#10B981", fontSize:12, fontWeight:500 }}>
              <TrendingUp size={11}/> +4 from yesterday
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card"
            style={{ padding:14, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <MoodOrb emotion={EMOTION} score={TODAY.mood} size={138}/>
            <p style={{ color:"var(--text-secondary)", fontSize:11, marginTop:2, textAlign:"center" }}>
              {getEmotionEmoji(EMOTION)} <span style={{ color:"var(--text-primary)", fontWeight:500, textTransform:"capitalize" }}>{EMOTION}</span>
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {METRIC_CARDS.map(({ key, label, icon:Icon, color, score, delta })=>(
              <div key={key} className="glass-card glass-card-hover" style={{ padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30,height:30,borderRadius:8,background:`${color}18`,
                      border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <Icon size={15} color={color}/>
                    </div>
                    <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:500 }}>{label}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:2, fontSize:11, fontWeight:600,
                    color: delta>0?"#10B981":delta<0?"#EF4444":"#94A3B8" }}>
                    {delta>0?<TrendingUp size={10}/>:delta<0?<TrendingDown size={10}/>:<Minus size={10}/>}
                    {Math.abs(delta)}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ fontSize:26, fontWeight:700, color:getScoreColor(score) }}>{score}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:5,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden" }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${score}%` }}
                        transition={{ duration:1.2,ease:"easeOut",delay:0.3 }}
                        style={{ height:"100%",borderRadius:3,background:`linear-gradient(90deg,${color}70,${color})` }}/>
                    </div>
                    <div style={{ fontSize:10,color:"var(--text-muted)",marginTop:2 }}>/100</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Row 2: Charts */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:18, marginBottom:18 }}>

          <motion.div variants={fadeUp} className="glass-card" style={{ padding:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18 }}>
              <div>
                <h3 style={{ fontSize:15,fontWeight:600,margin:0 }}>Wellness trends</h3>
                <p style={{ fontSize:12,color:"var(--text-secondary)",marginTop:2 }}>Last 14 days</p>
              </div>
              <div style={{ display:"flex", gap:14, fontSize:11 }}>
                {[["mood","#EC4899"],["health","#10B981"],["productivity","#7C3AED"],["sleep","#3B82F6"]].map(([k,c])=>(
                  <div key={k} style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <div style={{ width:10,height:3,borderRadius:2,background:c }}/>
                    <span style={{ color:"var(--text-muted)",textTransform:"capitalize" }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={MOCK_CHART_DATA} margin={{ left:-10, right:8 }}>
                <defs>
                  {[["mood","#EC4899"],["health","#10B981"],["productivity","#7C3AED"],["sleep","#3B82F6"]].map(([k,c])=>(
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.22}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0.02}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="label" tick={{ fill:"#64748B",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fill:"#64748B",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CTooltip/>}/>
                <Area type="monotone" dataKey="mood"         stroke="#EC4899" fill="url(#g-mood)"         strokeWidth={2} dot={false}/>
                <Area type="monotone" dataKey="health"       stroke="#10B981" fill="url(#g-health)"       strokeWidth={2} dot={false}/>
                <Area type="monotone" dataKey="productivity" stroke="#7C3AED" fill="url(#g-productivity)" strokeWidth={2} dot={false}/>
                <Area type="monotone" dataKey="sleep"        stroke="#3B82F6" fill="url(#g-sleep)"        strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={fadeUp} className="glass-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 4px" }}>Wellness radar</h3>
            <p style={{ fontSize:11,color:"var(--text-secondary)",marginBottom:4 }}>Today's balance</p>
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.07)"/>
                <PolarAngleAxis dataKey="subject" tick={{ fill:"#64748B",fontSize:10 }}/>
                <Radar dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.2} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>

        {/* Row 3: Insight + Suggestions + Streak */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr 240px", gap:18 }}>

          {/* AI insight */}
          <motion.div variants={fadeUp} className="glass-card" style={{ padding:22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:30,height:30,borderRadius:8,background:"rgba(124,58,237,0.2)",
                  border:"1px solid rgba(124,58,237,0.3)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Sparkles size={15} color="#A78BFA"/>
                </div>
                <div>
                  <p style={{ fontSize:13,fontWeight:600,margin:0 }}>AI Insight</p>
                  <p style={{ fontSize:10,color:"var(--text-muted)",margin:0 }}>Powered by Claude AI</p>
                </div>
              </div>
              <button className="btn-ghost" style={{ padding:"5px 7px" }}><RefreshCw size={12}/></button>
            </div>
            {loading ? (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {[90,100,65].map(w=><div key={w} className="shimmer" style={{ height:13,borderRadius:5,width:`${w}%` }}/>)}
              </div>
            ) : (
              <>
                <p style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.65,margin:0 }}>{insight}</p>
                <div style={{ marginTop:12,padding:"9px 11px",borderRadius:8,
                  background:"rgba(124,58,237,0.09)",border:"1px solid rgba(124,58,237,0.18)" }}>
                  <p style={{ fontSize:11,color:"#A78BFA",margin:0 }}>
                    AI wellness suggestions only — not medical advice.
                  </p>
                </div>
              </>
            )}
            <Link href="/dashboard/insights" style={{ textDecoration:"none" }}>
              <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:12,color:"#A78BFA",fontSize:13,cursor:"pointer" }}>
                Full report <ChevronRight size={13}/>
              </div>
            </Link>
          </motion.div>

          {/* Suggestions */}
          <motion.div variants={fadeUp} className="glass-card" style={{ padding:22 }}>
            <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 14px" }}>Smart suggestions</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
              {SUGGESTIONS.map(s=>(
                <motion.div key={s.id} whileHover={{ x:3 }}
                  style={{ display:"flex",alignItems:"flex-start",gap:10,padding:11,borderRadius:9,
                    background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer" }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:s.color,marginTop:4,flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:500,marginBottom:2 }}>{s.title}</div>
                    <div style={{ fontSize:12,color:"var(--text-muted)",lineHeight:1.4 }}>{s.desc}</div>
                  </div>
                  <span style={{ fontSize:10,padding:"2px 6px",borderRadius:4,fontWeight:600,flexShrink:0,
                    background: s.priority==="high"?"rgba(239,68,68,0.15)":s.priority==="medium"?"rgba(245,158,11,0.15)":"rgba(124,58,237,0.15)",
                    color: s.priority==="high"?"#FCA5A5":s.priority==="medium"?"#FCD34D":"#C4B5FD" }}>
                    {s.priority}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Streak + Mood dist */}
          <motion.div variants={fadeUp} style={{ display:"flex",flexDirection:"column",gap:14 }}>
            <div className="glass-card" style={{ padding:18 }}>
              <h3 style={{ fontSize:13,fontWeight:600,margin:"0 0 10px" }}>🔥 7-day streak</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3 }}>
                {STREAK.map(d=>(
                  <div key={d.i} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:9,color:"var(--text-muted)",marginBottom:2 }}>{d.label}</div>
                    <div style={{ width:20,height:20,borderRadius:"50%",margin:"0 auto",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:600,
                      background: d.s==="done"?"rgba(124,58,237,0.3)":d.s==="today"?"rgba(124,58,237,0.5)":d.s==="miss"?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.04)",
                      border: d.s==="done"?"1px solid #7C3AED":d.s==="today"?"2px solid #7C3AED":d.s==="miss"?"1px solid rgba(239,68,68,0.3)":"1px solid rgba(255,255,255,0.06)",
                      color: d.s==="done"?"#C4B5FD":d.s==="today"?"white":d.s==="miss"?"#FCA5A5":"var(--text-muted)" }}>
                      {d.s==="done"?"✓":d.s==="today"?"●":d.s==="miss"?"✗":"○"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding:18,flex:1 }}>
              <h3 style={{ fontSize:13,fontWeight:600,margin:"0 0 10px" }}>Mood this week</h3>
              {MOOD_DIST.map(([e,pct])=>(
                <div key={e} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                    <span style={{ color:"var(--text-secondary)",textTransform:"capitalize" }}>
                      {getEmotionEmoji(e)} {e}
                    </span>
                    <span style={{ color:"var(--text-muted)" }}>{pct}%</span>
                  </div>
                  <div style={{ height:4,borderRadius:2,background:"rgba(255,255,255,0.05)" }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                      transition={{ duration:0.9,ease:"easeOut",delay:0.1 }}
                      style={{ height:"100%",borderRadius:2,background:getEmotionColor(e as Emotion) }}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
