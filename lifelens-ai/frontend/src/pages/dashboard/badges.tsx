import { motion } from "framer-motion"
import { useAppStore } from "../../store"
import Sidebar from "../../components/ui/Sidebar"

const BADGES = [
  { id:"1", name:"First Steps",       desc:"Logged your first daily routine",     icon:"🌱", rarity:"common",    earned:true  },
  { id:"2", name:"Week Warrior",      desc:"7-day logging streak",                icon:"🔥", rarity:"common",    earned:true  },
  { id:"3", name:"Early Bird",        desc:"Woke before 7am for 5 days",          icon:"🐦", rarity:"rare",      earned:true  },
  { id:"4", name:"Hydration Hero",    desc:"Hit water goal 7 days straight",      icon:"💧", rarity:"rare",      earned:false },
  { id:"5", name:"Mindfulness Master",desc:"Completed 10 mood scans",             icon:"🧘", rarity:"epic",      earned:false },
  { id:"6", name:"Consistency King",  desc:"30-day logging streak",               icon:"👑", rarity:"epic",      earned:false },
  { id:"7", name:"Wellness Guru",     desc:"Maintained 80+ overall score for a month", icon:"🏆", rarity:"legendary", earned:false },
  { id:"8", name:"Social Butterfly",  desc:"High social interaction 7 days running", icon:"🦋", rarity:"rare",  earned:false },
  { id:"9", name:"Marathon Mind",     desc:"100 total exercise sessions logged",  icon:"🏃", rarity:"legendary", earned:false },
]

const RARITY_COLORS: Record<string,string> = {
  common:"#94A3B8", rare:"#3B82F6", epic:"#7C3AED", legendary:"#F59E0B",
}

export default function BadgesPage() {
  const user = useAppStore(s=>s.user)
  const earned = BADGES.filter(b=>b.earned).length

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1,padding:"26px 30px",overflowY:"auto" }}>
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26 }}>
            <div>
              <h1 style={{ fontSize:22,fontWeight:700,margin:"0 0 4px" }}>Achievements</h1>
              <p style={{ color:"var(--text-secondary)",fontSize:13 }}>{earned} of {BADGES.length} badges earned</p>
            </div>
            <div className="glass-card" style={{ padding:"12px 20px",textAlign:"center" }}>
              <div style={{ fontSize:24,fontWeight:700,color:"#F59E0B" }}>{user?.points ?? 340}</div>
              <div style={{ fontSize:11,color:"var(--text-muted)" }}>total points</div>
            </div>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
            {BADGES.map((b,i)=>{
              const color = RARITY_COLORS[b.rarity]
              return (
                <motion.div key={b.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                  className="glass-card" style={{ padding:22,textAlign:"center", opacity:b.earned?1:0.45,
                    border: b.earned?`1px solid ${color}40`:"1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize:42,marginBottom:10, filter:b.earned?"none":"grayscale(1)" }}>{b.icon}</div>
                  <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 4px" }}>{b.name}</h3>
                  <p style={{ fontSize:12,color:"var(--text-muted)",marginBottom:10,lineHeight:1.4 }}>{b.desc}</p>
                  <span style={{ fontSize:10,padding:"3px 10px",borderRadius:20,fontWeight:600,textTransform:"uppercase",
                    letterSpacing:"0.05em", background:`${color}18`, border:`1px solid ${color}30`, color }}>
                    {b.rarity}
                  </span>
                  {b.earned && (
                    <div style={{ marginTop:10, fontSize:11, color:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                      ✓ Earned
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
