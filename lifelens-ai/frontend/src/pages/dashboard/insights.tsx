import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw,
  Heart, Moon, Zap, Salad, Brain, Activity, ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import Sidebar from "../../components/ui/Sidebar"
import ScoreRing from "../../components/ui/ScoreRing"
import { insightsApi, getErrorMessage } from "../../lib/api"
import { SUGGESTION_CATEGORY_COLORS } from "../../lib/utils"
import type { ViewPeriod, AIInsight, Suggestion } from "../../lib/types"

const ICONS: Record<string,any> = { health:Heart, sleep:Moon, productivity:Zap, mental_wellness:Brain, diet:Salad, exercise:Activity }
const LABELS: Record<ViewPeriod,string> = { daily:"Today", weekly:"This week", monthly:"This month" }

const MOCK_INSIGHT: AIInsight = {
  id:"mock", userId:"demo", period:"weekly", date:new Date().toISOString().split("T")[0],
  summary:"You've been consistently productive this week — great work! Sleep quality dipped slightly mid-week, and your mood scans suggest mild stress on Wednesday and Thursday. Overall a solid week with clear room to optimise sleep.",
  positives:[
    "Exercise consistency improved by 30% compared to last week.",
    "Social interaction levels were healthy — you connected with others most days.",
    "Diet quality remained strong, especially on weekdays.",
  ],
  concerns:[
    "Average sleep duration dropped to 6.2 hours, below the 7-9h recommendation.",
    "Screen time exceeded 7 hours on 3 days, likely impacting sleep onset.",
  ],
  suggestions:[
    { id:"1", category:"sleep", priority:"high", title:"Earlier wind-down routine",
      description:"Sleep duration averaged 6.2h this week, below your 8h goal.",
      action:"Start a wind-down routine 45 minutes before bed: dim lights, no screens, light reading.",
      impact:"Could improve sleep score by 15-20 points and boost next-day mood.", timeframe:"Starting tonight" },
    { id:"2", category:"productivity", priority:"medium", title:"Screen time boundaries",
      description:"Screen time exceeded 7h on 3 days this week.",
      action:"Use app timers to cap recreational screen time to 2h/day after work.",
      impact:"Reduces eye strain and improves sleep onset speed.", timeframe:"This week" },
    { id:"3", category:"mental_wellness", priority:"medium", title:"Midweek stress check-in",
      description:"Mood scans showed elevated stress on Wed/Thu.",
      action:"Block 15 minutes on Wednesday afternoons for a walk or meditation.",
      impact:"Proactive stress management prevents burnout accumulation.", timeframe:"Next Wednesday" },
    { id:"4", category:"exercise", priority:"low", title:"Maintain your momentum",
      description:"Exercise frequency improved 30% — fantastic progress!",
      action:"Keep the current routine; consider adding one more rest-day stretch session.",
      impact:"Sustains gains while preventing overtraining.", timeframe:"Ongoing" },
  ],
  scores:{ overall:74, trend:"improving", healthScore:76, productivityScore:81, mentalWellnessScore:66, sleepScore:62, dietScore:79 },
  disclaimer:"This is AI-generated wellness guidance, not medical advice. Consult a healthcare professional for medical concerns.",
}

function SuggestionCard({ s, index }:{ s:Suggestion; index:number }) {
  const [open,setOpen]=useState(false)
  const Icon = ICONS[s.category] ?? Sparkles
  const color = SUGGESTION_CATEGORY_COLORS[s.category] ?? "#7C3AED"
  return (
    <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:index*0.07 }}
      style={{ borderRadius:12,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",overflow:"hidden",marginBottom:9 }}>
      <div onClick={()=>setOpen(!open)} style={{ display:"flex",alignItems:"center",gap:11,padding:"13px 15px",cursor:"pointer" }}>
        <div style={{ width:34,height:34,borderRadius:10,background:`${color}18`,border:`1px solid ${color}28`,
          display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Icon size={16} color={color}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13,fontWeight:500 }}>{s.title}</div>
          <div style={{ fontSize:12,color:"var(--text-muted)",marginTop:1 }}>{s.description}</div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <span style={{ fontSize:10,padding:"3px 7px",borderRadius:5,fontWeight:600,
            background: s.priority==="high"?"rgba(239,68,68,0.15)":s.priority==="medium"?"rgba(245,158,11,0.15)":"rgba(124,58,237,0.15)",
            color: s.priority==="high"?"#FCA5A5":s.priority==="medium"?"#FCD34D":"#C4B5FD" }}>{s.priority}</span>
          {open?<ChevronUp size={13} color="var(--text-muted)"/>:<ChevronDown size={13} color="var(--text-muted)"/>}
        </div>
      </div>
      {open&&(
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",padding:"13px 15px",paddingLeft:60 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:13 }}>
            <div>
              <div style={{ fontSize:10,color:"var(--text-muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em" }}>Action</div>
              <div style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.5 }}>{s.action}</div>
            </div>
            <div>
              <div style={{ fontSize:10,color:"var(--text-muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em" }}>Impact</div>
              <div style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.5 }}>{s.impact}</div>
            </div>
          </div>
          <div style={{ marginTop:9,display:"flex",gap:6,alignItems:"center" }}>
            <span style={{ fontSize:11,color:"var(--text-muted)" }}>When:</span>
            <span style={{ fontSize:12,color,fontWeight:500 }}>{s.timeframe}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<ViewPeriod>("weekly")
  const [insight, setInsight] = useState<AIInsight|null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const load = async (p: ViewPeriod) => {
    setLoading(true)
    try { const res = await insightsApi.getLatest(p); setInsight(res.data.data) }
    catch { setInsight({ ...MOCK_INSIGHT, period:p }) }
    finally { setLoading(false) }
  }

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await insightsApi.generate(period)
      setInsight(res.data.data)
      toast.success("New insight generated!")
    } catch(err) {
      setInsight({ ...MOCK_INSIGHT, period })
      toast.success("Generated insight (demo mode)")
    } finally { setGenerating(false) }
  }

  useEffect(()=>{ load(period) },[period])

  const cards = insight ? [
    { label:"Health",          score:insight.scores.healthScore,         color:"#10B981" },
    { label:"Productivity",    score:insight.scores.productivityScore,   color:"#7C3AED" },
    { label:"Mental wellness", score:insight.scores.mentalWellnessScore, color:"#EC4899" },
    { label:"Sleep",           score:insight.scores.sleepScore,          color:"#3B82F6" },
    { label:"Diet",            score:insight.scores.dietScore,           color:"#F59E0B" },
  ] : []

  const trendIcon = insight?.scores.trend==="improving" ? <TrendingUp size={13} color="#10B981"/>
    : insight?.scores.trend==="declining" ? <TrendingDown size={13} color="#EF4444"/>
    : <Minus size={13} color="#94A3B8"/>

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1,padding:"26px 30px",overflowY:"auto" }}>
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26 }}>
            <div>
              <h1 style={{ fontSize:22,fontWeight:700,margin:"0 0 4px" }}>AI Insights</h1>
              <p style={{ color:"var(--text-secondary)",fontSize:13 }}>Personalised analysis powered by Claude AI</p>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <div style={{ display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,border:"1px solid rgba(255,255,255,0.07)" }}>
                {(["daily","weekly","monthly"] as ViewPeriod[]).map(p=>(
                  <button key={p} onClick={()=>setPeriod(p)} style={{
                    padding:"6px 13px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,
                    textTransform:"capitalize",transition:"all 0.2s",
                    background:period===p?"linear-gradient(135deg,#7C3AED,#6D28D9)":"transparent",
                    color:period===p?"white":"var(--text-secondary)" }}>{p}</button>
                ))}
              </div>
              <button onClick={generate} disabled={generating} className="btn-primary" style={{ fontSize:13 }}>
                <RefreshCw size={13} style={{ animation:generating?"spin 1s linear infinite":"none" }}/>
                {generating?"Generating…":"Generate new"}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
              {[1,2,3,4,5,6].map(i=><div key={i} className="glass-card shimmer" style={{ height:110 }}/>)}
            </div>
          ) : !insight ? (
            <div className="glass-card" style={{ padding:46,textAlign:"center",maxWidth:480,margin:"60px auto" }}>
              <Sparkles size={38} color="#7C3AED" style={{ marginBottom:14 }}/>
              <h3 style={{ fontSize:17,fontWeight:600,marginBottom:8 }}>No insight yet for {LABELS[period]}</h3>
              <p style={{ color:"var(--text-secondary)",fontSize:13,marginBottom:18 }}>
                Generate your first AI insight after logging your daily routine.
              </p>
              <button onClick={generate} className="btn-primary" style={{ margin:"0 auto" }}><Sparkles size={14}/> Generate insight</button>
            </div>
          ) : (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:18 }}>
              <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
                <div className="glass-card" style={{ padding:22,display:"flex",alignItems:"center",gap:22 }}>
                  <ScoreRing score={insight.scores.overall} size={104}/>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:7 }}>
                      {trendIcon}
                      <span style={{ fontSize:12,fontWeight:500,textTransform:"capitalize",
                        color: insight.scores.trend==="improving"?"#10B981":insight.scores.trend==="declining"?"#EF4444":"#94A3B8" }}>
                        {insight.scores.trend} trend
                      </span>
                      <span style={{ fontSize:12,color:"var(--text-muted)" }}>· {LABELS[period]}</span>
                    </div>
                    <p style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.6,margin:0 }}>{insight.summary}</p>
                  </div>
                </div>

                <div className="glass-card" style={{ padding:22 }}>
                  <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 14px" }}>Score breakdown</h3>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
                    {cards.map(({ label,score,color })=>(
                      <div key={label} style={{ textAlign:"center" }}>
                        <ScoreRing score={score} size={68} strokeWidth={5} animate={false}/>
                        <div style={{ fontSize:10,color:"var(--text-muted)",marginTop:3 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  <div className="glass-card" style={{ padding:18 }}>
                    <h3 style={{ fontSize:13,fontWeight:600,margin:"0 0 11px",color:"#10B981" }}>✓ What's going well</h3>
                    {insight.positives.map((p,i)=>(
                      <div key={i} style={{ display:"flex",gap:8,marginBottom:7,alignItems:"flex-start" }}>
                        <div style={{ width:5,height:5,borderRadius:"50%",background:"#10B981",marginTop:6,flexShrink:0 }}/>
                        <p style={{ fontSize:12,color:"var(--text-secondary)",margin:0,lineHeight:1.5 }}>{p}</p>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card" style={{ padding:18 }}>
                    <h3 style={{ fontSize:13,fontWeight:600,margin:"0 0 11px",color:"#F59E0B" }}>⚠ Focus areas</h3>
                    {insight.concerns.map((c,i)=>(
                      <div key={i} style={{ display:"flex",gap:8,marginBottom:7,alignItems:"flex-start" }}>
                        <div style={{ width:5,height:5,borderRadius:"50%",background:"#F59E0B",marginTop:6,flexShrink:0 }}/>
                        <p style={{ fontSize:12,color:"var(--text-secondary)",margin:0,lineHeight:1.5 }}>{c}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:"flex",gap:9,padding:"11px 15px",borderRadius:10,
                  background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.15)" }}>
                  <AlertCircle size={14} color="#A78BFA" style={{ flexShrink:0,marginTop:1 }}/>
                  <p style={{ fontSize:11,color:"#A78BFA",margin:0,lineHeight:1.5 }}>{insight.disclaimer}</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding:22 }}>
                <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 14px" }}>Personalised suggestions</h3>
                {insight.suggestions.length>0
                  ? insight.suggestions.map((s,i)=><SuggestionCard key={s.id} s={s} index={i}/>)
                  : <p style={{ color:"var(--text-muted)",fontSize:13 }}>No suggestions for this period.</p>}
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
