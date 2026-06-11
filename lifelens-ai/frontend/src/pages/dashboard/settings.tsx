import { useState } from "react"
import { motion } from "framer-motion"
import { User, Target, Shield, Bell, Trash2, Save } from "lucide-react"
import toast from "react-hot-toast"
import Sidebar from "../../components/ui/Sidebar"
import { useAppStore } from "../../store"

const inp: React.CSSProperties = {
  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
  color:"var(--text-primary)", borderRadius:10, padding:"10px 14px",
  fontSize:14, width:"100%", outline:"none", fontFamily:"inherit",
}
const lbl: React.CSSProperties = { fontSize:13, color:"var(--text-secondary)", display:"block", marginBottom:5, fontWeight:500 }

export default function SettingsPage() {
  const user = useAppStore(s=>s.user)
  const [name, setName] = useState(user?.name ?? "")
  const [age, setAge] = useState(user?.age?.toString() ?? "")
  const [goals, setGoals] = useState((user?.goals ?? []).join(", "))
  const [sleepGoal, setSleepGoal] = useState(user?.lifestyle?.sleepGoal ?? 8)
  const [exerciseGoal, setExerciseGoal] = useState(user?.lifestyle?.exerciseGoal ?? 30)
  const [notifications, setNotifications] = useState(true)

  const save = () => toast.success("Settings saved!")

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1,padding:"26px 30px",overflowY:"auto" }}>
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} style={{ maxWidth:640 }}>
          <h1 style={{ fontSize:22,fontWeight:700,margin:"0 0 4px" }}>Settings</h1>
          <p style={{ color:"var(--text-secondary)",fontSize:13,marginBottom:26 }}>Manage your profile, goals, and privacy</p>

          {/* Profile */}
          <div className="glass-card" style={{ padding:24,marginBottom:18 }}>
            <h3 style={{ fontSize:15,fontWeight:600,margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
              <User size={16} color="#7C3AED"/> Profile
            </h3>
            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14 }}>
              <div><label style={lbl}>Full name</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
              <div><label style={lbl}>Age</label><input value={age} onChange={e=>setAge(e.target.value)} type="number" style={inp}/></div>
            </div>
            <div><label style={lbl}>Email</label><input value={user?.email??""} disabled style={{ ...inp, opacity:0.6 }}/></div>
          </div>

          {/* Goals */}
          <div className="glass-card" style={{ padding:24,marginBottom:18 }}>
            <h3 style={{ fontSize:15,fontWeight:600,margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
              <Target size={16} color="#10B981"/> Goals & targets
            </h3>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>Wellness goals (comma-separated)</label>
              <input value={goals} onChange={e=>setGoals(e.target.value)} placeholder="Better sleep, more exercise, less stress" style={inp}/>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div>
                <label style={{ ...lbl,display:"flex",justifyContent:"space-between" }}>
                  <span>Sleep goal</span><span style={{ color:"#3B82F6" }}>{sleepGoal}h</span>
                </label>
                <input type="range" min={5} max={10} step={0.5} value={sleepGoal}
                  onChange={e=>setSleepGoal(parseFloat(e.target.value))} style={{ width:"100%",accentColor:"#3B82F6" }}/>
              </div>
              <div>
                <label style={{ ...lbl,display:"flex",justifyContent:"space-between" }}>
                  <span>Exercise goal</span><span style={{ color:"#10B981" }}>{exerciseGoal} min/day</span>
                </label>
                <input type="range" min={10} max={120} step={5} value={exerciseGoal}
                  onChange={e=>setExerciseGoal(parseInt(e.target.value))} style={{ width:"100%",accentColor:"#10B981" }}/>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-card" style={{ padding:24,marginBottom:18 }}>
            <h3 style={{ fontSize:15,fontWeight:600,margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}>
              <Bell size={16} color="#F59E0B"/> Notifications
            </h3>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:13,fontWeight:500,margin:0 }}>Daily check-in reminder</p>
                <p style={{ fontSize:12,color:"var(--text-muted)",margin:0 }}>Get reminded to log your routine each evening</p>
              </div>
              <button onClick={()=>setNotifications(!notifications)}
                style={{ width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",position:"relative",
                  background: notifications?"#7C3AED":"rgba(255,255,255,0.1)",transition:"background 0.2s" }}>
                <div style={{ width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,
                  left: notifications?23:3, transition:"left 0.2s" }}/>
              </button>
            </div>
          </div>

          {/* Privacy */}
          <div className="glass-card" style={{ padding:24,marginBottom:18 }}>
            <h3 style={{ fontSize:15,fontWeight:600,margin:"0 0 12px",display:"flex",alignItems:"center",gap:8 }}>
              <Shield size={16} color="#3B82F6"/> Privacy
            </h3>
            <p style={{ fontSize:13,color:"var(--text-secondary)",lineHeight:1.6,marginBottom:14 }}>
              LifeLens AI never stores raw video or images from emotion scans — only processed scores.
              Your routine data is used solely to generate personalised wellness suggestions.
            </p>
            <button className="btn-ghost" style={{ color:"#EF4444", borderColor:"rgba(239,68,68,0.3)" }}>
              <Trash2 size={14}/> Delete all my data
            </button>
          </div>

          <button onClick={save} className="btn-primary" style={{ width:"100%",justifyContent:"center" }}>
            <Save size={15}/> Save changes
          </button>

          <p style={{ textAlign:"center",fontSize:11,color:"var(--text-muted)",marginTop:16,lineHeight:1.6 }}>
            LifeLens AI provides wellness suggestions only, not medical advice.<br/>
            Always consult a healthcare professional for medical concerns.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
