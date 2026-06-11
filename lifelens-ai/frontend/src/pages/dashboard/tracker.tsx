import { useState } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Plus, Trash2, Clock, Utensils, Activity, Users, Save } from "lucide-react"
import Sidebar from "../../components/ui/Sidebar"
import { logsApi, getErrorMessage } from "../../lib/api"
import { getTodayString } from "../../lib/utils"

const mealSchema = z.object({
  type: z.enum(["breakfast","lunch","dinner","snack"]),
  time: z.string(),
  description: z.string().min(1,"Describe your meal"),
  quality: z.enum(["excellent","good","fair","poor"]),
})
const schema = z.object({
  wakeTime: z.string().min(1,"Required"),
  sleepTime: z.string().min(1,"Required"),
  workHours: z.number().min(0).max(18),
  studyHours: z.number().min(0).max(12),
  screenTime: z.number().min(0).max(18),
  exerciseMinutes: z.number().min(0).max(300),
  exerciseType: z.string().optional(),
  meals: z.array(mealSchema).min(1,"Add at least one meal"),
  socialInteraction: z.enum(["none","minimal","moderate","high"]),
  waterIntake: z.number().min(0).max(6),
  stressLevel: z.number().min(1).max(10),
  notes: z.string().optional(),
})
type LogForm = z.infer<typeof schema>

const STEPS = ["Schedule","Activity","Nutrition","Lifestyle","Review"]
const inp: React.CSSProperties = {
  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
  color:"var(--text-primary)", borderRadius:10, padding:"10px 14px",
  fontSize:14, width:"100%", outline:"none", fontFamily:"inherit",
}
const lbl: React.CSSProperties = { fontSize:13, color:"var(--text-secondary)", display:"block", marginBottom:5, fontWeight:500 }
const row: React.CSSProperties = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }

export default function Tracker() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, control, watch, formState:{ errors } } = useForm<LogForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      workHours:8, studyHours:0, screenTime:4, exerciseMinutes:30,
      waterIntake:2, stressLevel:5, socialInteraction:"moderate",
      meals:[{ type:"breakfast", time:"08:00", description:"", quality:"good" }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name:"meals" })

  const onSubmit = async (data: LogForm) => {
    setSaving(true)
    try {
      await logsApi.create({ ...data, date:getTodayString() })
      toast.success("Daily log saved! Generating insights…")
      setTimeout(() => router.push("/dashboard"), 900)
    } catch(err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1, padding:"26px 30px", overflowY:"auto" }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px" }}>Daily routine log</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:13, marginBottom:28 }}>
            Track your day so AI can generate personalised wellness insights
          </p>

          {/* Step bar */}
          <div style={{ display:"flex", alignItems:"center", marginBottom:32 }}>
            {STEPS.map((s,i)=>(
              <div key={s} style={{ display:"flex", alignItems:"center", flex:i<STEPS.length-1?1:"none" }}>
                <button onClick={()=>setStep(i)}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                    background:"none", border:"none", cursor:"pointer" }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:13,fontWeight:600,transition:"all 0.2s",
                    background: i<step?"#7C3AED":i===step?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.05)",
                    border:`2px solid ${i<=step?"#7C3AED":"rgba(255,255,255,0.1)"}`,
                    color: i<step?"white":i===step?"#A78BFA":"var(--text-muted)" }}>
                    {i<step?"✓":i+1}
                  </div>
                  <span style={{ fontSize:11, color:i===step?"#A78BFA":"var(--text-muted)", fontWeight:i===step?500:400 }}>{s}</span>
                </button>
                {i<STEPS.length-1&&<div style={{ flex:1,height:2,margin:"0 4px",marginBottom:18,
                  background:i<step?"#7C3AED":"rgba(255,255,255,0.07)",borderRadius:1 }}/>}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <motion.div key={step} initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.25 }}
              className="glass-card" style={{ padding:28, maxWidth:680 }}>

              {/* Step 0 – Schedule */}
              {step===0&&(
                <div>
                  <h2 style={{ fontSize:16,fontWeight:600,margin:"0 0 18px",display:"flex",alignItems:"center",gap:8 }}>
                    <Clock size={17} color="#7C3AED"/> Sleep schedule
                  </h2>
                  <div style={row}>
                    <div><label style={lbl}>Wake-up time</label>
                      <input {...register("wakeTime")} type="time" style={inp}/>
                      {errors.wakeTime&&<p style={{ color:"#EF4444",fontSize:12,marginTop:3 }}>{errors.wakeTime.message}</p>}
                    </div>
                    <div><label style={lbl}>Bedtime</label>
                      <input {...register("sleepTime")} type="time" style={inp}/>
                    </div>
                  </div>
                  <div style={row}>
                    <div><label style={lbl}>Work hours</label>
                      <input {...register("workHours",{valueAsNumber:true})} type="number" min={0} max={18} style={inp}/>
                    </div>
                    <div><label style={lbl}>Study hours</label>
                      <input {...register("studyHours",{valueAsNumber:true})} type="number" min={0} max={12} style={inp}/>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 – Activity */}
              {step===1&&(
                <div>
                  <h2 style={{ fontSize:16,fontWeight:600,margin:"0 0 18px",display:"flex",alignItems:"center",gap:8 }}>
                    <Activity size={17} color="#10B981"/> Physical activity
                  </h2>
                  <div style={row}>
                    <div><label style={lbl}>Exercise (minutes)</label>
                      <input {...register("exerciseMinutes",{valueAsNumber:true})} type="number" min={0} max={300} style={inp}/>
                    </div>
                    <div><label style={lbl}>Exercise type</label>
                      <input {...register("exerciseType")} placeholder="running, yoga, gym…" style={inp}/>
                    </div>
                  </div>
                  <div>
                    <label style={{ ...lbl, display:"flex", justifyContent:"space-between" }}>
                      <span>Screen time</span>
                      <span style={{ color:"#A78BFA" }}>{watch("screenTime")}h</span>
                    </label>
                    <input {...register("screenTime",{valueAsNumber:true})} type="range" min={0} max={16} step={0.5}
                      style={{ width:"100%", accentColor:"#7C3AED" }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-muted)",marginTop:3 }}>
                      <span>0h</span><span>8h</span><span>16h</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 – Nutrition */}
              {step===2&&(
                <div>
                  <h2 style={{ fontSize:16,fontWeight:600,margin:"0 0 18px",display:"flex",alignItems:"center",gap:8 }}>
                    <Utensils size={17} color="#F59E0B"/> Nutrition log
                  </h2>
                  {fields.map((f,idx)=>(
                    <div key={f.id} style={{ padding:14,borderRadius:10,marginBottom:12,
                      background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                        <span style={{ fontSize:13,fontWeight:500,color:"#F59E0B" }}>Meal {idx+1}</span>
                        {fields.length>1&&<button type="button" onClick={()=>remove(idx)}
                          style={{ background:"none",border:"none",cursor:"pointer",color:"#EF4444" }}>
                          <Trash2 size={13}/>
                        </button>}
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10 }}>
                        <div><label style={lbl}>Type</label>
                          <select {...register(`meals.${idx}.type`)} style={{ ...inp,cursor:"pointer" }}>
                            {["breakfast","lunch","dinner","snack"].map(t=><option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div><label style={lbl}>Time</label>
                          <input {...register(`meals.${idx}.time`)} type="time" style={inp}/>
                        </div>
                        <div><label style={lbl}>Quality</label>
                          <select {...register(`meals.${idx}.quality`)} style={{ ...inp,cursor:"pointer" }}>
                            {["excellent","good","fair","poor"].map(q=><option key={q} value={q}>{q}</option>)}
                          </select>
                        </div>
                      </div>
                      <div><label style={lbl}>What did you eat?</label>
                        <input {...register(`meals.${idx}.description`)}
                          placeholder="oatmeal with fruits, salad with chicken…" style={inp}/>
                        {errors.meals?.[idx]?.description&&
                          <p style={{ color:"#EF4444",fontSize:12,marginTop:3 }}>{errors.meals[idx]?.description?.message}</p>}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={()=>append({ type:"snack",time:"15:00",description:"",quality:"good" })}
                    className="btn-ghost" style={{ fontSize:13 }}><Plus size={13}/> Add meal</button>
                  <div style={{ marginTop:16 }}>
                    <label style={{ ...lbl,display:"flex",justifyContent:"space-between" }}>
                      <span>Water intake</span><span style={{ color:"#60A5FA" }}>{watch("waterIntake")}L</span>
                    </label>
                    <input {...register("waterIntake",{valueAsNumber:true})} type="range" min={0} max={5} step={0.25}
                      style={{ width:"100%",accentColor:"#3B82F6" }}/>
                  </div>
                </div>
              )}

              {/* Step 3 – Lifestyle */}
              {step===3&&(
                <div>
                  <h2 style={{ fontSize:16,fontWeight:600,margin:"0 0 18px",display:"flex",alignItems:"center",gap:8 }}>
                    <Users size={17} color="#EC4899"/> Lifestyle & wellbeing
                  </h2>
                  <div style={{ marginBottom:20 }}>
                    <label style={lbl}>Social interaction today</label>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
                      {[["none","🏠","None"],["minimal","👋","Minimal"],["moderate","👥","Moderate"],["high","🎉","High"]].map(([v,e,l])=>(
                        <label key={v} style={{ cursor:"pointer" }}>
                          <input {...register("socialInteraction")} type="radio" value={v} style={{ display:"none" }}/>
                          <div style={{ padding:"10px 6px",borderRadius:10,textAlign:"center",transition:"all 0.2s",
                            background:watch("socialInteraction")===v?"rgba(236,72,153,0.2)":"rgba(255,255,255,0.04)",
                            border:`1px solid ${watch("socialInteraction")===v?"rgba(236,72,153,0.4)":"rgba(255,255,255,0.07)"}` }}>
                            <div style={{ fontSize:20,marginBottom:4 }}>{e}</div>
                            <div style={{ fontSize:11,color:watch("socialInteraction")===v?"#F9A8D4":"var(--text-muted)" }}>{l}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom:18 }}>
                    <label style={{ ...lbl,display:"flex",justifyContent:"space-between" }}>
                      <span>Stress level</span>
                      <span style={{ color:watch("stressLevel")>7?"#EF4444":watch("stressLevel")>4?"#F59E0B":"#10B981" }}>
                        {watch("stressLevel")}/10
                      </span>
                    </label>
                    <input {...register("stressLevel",{valueAsNumber:true})} type="range" min={1} max={10}
                      style={{ width:"100%",
                        accentColor:watch("stressLevel")>7?"#EF4444":watch("stressLevel")>4?"#F59E0B":"#10B981" }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-muted)",marginTop:3 }}>
                      <span>Very calm</span><span>Moderate</span><span>Very stressed</span>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Notes / reflections (optional)</label>
                    <textarea {...register("notes")} rows={4}
                      placeholder="How are you feeling? Any highlights or concerns today…"
                      style={{ ...inp,resize:"vertical" }}/>
                  </div>
                </div>
              )}

              {/* Step 4 – Review */}
              {step===4&&(
                <div>
                  <h2 style={{ fontSize:17,fontWeight:600,margin:"0 0 6px" }}>Ready to save?</h2>
                  <p style={{ color:"var(--text-secondary)",fontSize:13,marginBottom:18 }}>
                    Your AI wellness coach will analyse this data and generate personalised insights.
                  </p>
                  <div style={{ padding:14,borderRadius:10,background:"rgba(124,58,237,0.1)",
                    border:"1px solid rgba(124,58,237,0.2)",marginBottom:20 }}>
                    <p style={{ fontSize:13,color:"#C4B5FD",margin:0,lineHeight:1.6 }}>
                      Your data is used only to provide wellness suggestions. This is not medical advice.
                      We store scored summaries only — never raw video or images.
                    </p>
                  </div>
                  <button type="submit" disabled={saving} className="btn-primary"
                    style={{ width:"100%",justifyContent:"center",fontSize:15,padding:"13px 20px" }}>
                    {saving
                      ? <><span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",
                          borderTopColor:"white",animation:"spin 0.8s linear infinite",display:"inline-block" }}/>
                          Saving & analysing…</>
                      : <><Save size={15}/> Save Daily Log</>}
                  </button>
                </div>
              )}
            </motion.div>

            {step<4&&(
              <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:14 }}>
                {step>0&&<button type="button" onClick={()=>setStep(s=>s-1)} className="btn-ghost">← Back</button>}
                <button type="button" onClick={()=>setStep(s=>s+1)} className="btn-primary">Continue →</button>
              </div>
            )}
          </form>
        </motion.div>
      </main>
    </div>
  )
}
