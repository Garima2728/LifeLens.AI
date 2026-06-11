import Link from "next/link"
import { useRouter } from "next/router"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, ClipboardList, Smile, Lightbulb,
  Award, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight,
  Flame, TrendingUp,
} from "lucide-react"
import { useAppStore } from "../../store"

const NAV = [
  { href:"/dashboard",           icon:LayoutDashboard, label:"Dashboard"    },
  { href:"/dashboard/tracker",   icon:ClipboardList,   label:"Daily Log"    },
  { href:"/dashboard/emotion",   icon:Smile,           label:"Mood Scan"    },
  { href:"/dashboard/insights",  icon:Lightbulb,       label:"AI Insights"  },
  { href:"/dashboard/habits",    icon:Flame,           label:"Habits"       },
  { href:"/dashboard/progress",  icon:TrendingUp,      label:"Progress"     },
  { href:"/dashboard/badges",    icon:Award,           label:"Achievements" },
  { href:"/dashboard/settings",  icon:Settings,        label:"Settings"     },
]

export default function Sidebar() {
  const router = useRouter()
  const { user, sidebarOpen, toggleSidebar, logout } = useAppStore()

  return (
    <motion.aside animate={{ width: sidebarOpen ? 230 : 66 }} transition={{ duration:0.3, ease:"easeInOut" }}
      style={{ height:"100vh", position:"sticky", top:0, flexShrink:0, overflow:"hidden",
        background:"rgba(9,18,36,0.92)", borderRight:"1px solid rgba(255,255,255,0.06)",
        backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", zIndex:50 }}>

      {/* Logo */}
      <div style={{ padding:"18px 14px", display:"flex", alignItems:"center", gap:10,
        borderBottom:"1px solid rgba(255,255,255,0.06)", minHeight:66 }}>
        <div style={{ width:36, height:36, borderRadius:11, flexShrink:0,
          background:"linear-gradient(135deg,#7C3AED,#3B82F6)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 0 18px rgba(124,58,237,0.45)" }}>
          <Sparkles size={17} color="white"/>
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}>
              <div className="gradient-text" style={{ fontSize:15, fontWeight:700 }}>LifeLens AI</div>
              <div style={{ fontSize:11, color:"var(--text-muted)" }}>Wellness Coach</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", gap:2, overflowY:"auto" }}>
        {NAV.map(({ href, icon:Icon, label }) => {
          const active = router.pathname === href
          return (
            <Link key={href} href={href} style={{ textDecoration:"none" }}>
              <motion.div whileHover={{ x:2 }} whileTap={{ scale:0.97 }}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 11px", borderRadius:9,
                  cursor:"pointer", minHeight:40, transition:"all 0.2s",
                  background: active ? "rgba(124,58,237,0.2)" : "transparent",
                  border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent" }}>
                <Icon size={17} color={active?"#A78BFA":"var(--text-muted)"} style={{ flexShrink:0 }}/>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      transition={{ duration:0.12 }}
                      style={{ fontSize:13, fontWeight: active?500:400, whiteSpace:"nowrap",
                        color: active?"#C4B5FD":"var(--text-secondary)" }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 6px" }}>
        {user && (
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 11px",
            borderRadius:9, marginBottom:6, background:"rgba(255,255,255,0.03)" }}>
            <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#7C3AED,#EC4899)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize:10, color:"var(--text-muted)", display:"flex", alignItems:"center", gap:3 }}>
                    <Flame size={10} color="#F59E0B"/> {user.streak}d · {user.points}pts
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        <button onClick={logout}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 11px", borderRadius:9,
            background:"transparent", border:"none", cursor:"pointer", width:"100%", transition:"all 0.2s" }}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(239,68,68,0.1)")}
          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
          <LogOut size={15} color="#EF4444" style={{ flexShrink:0 }}/>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ fontSize:12, color:"#EF4444", whiteSpace:"nowrap" }}>Sign Out</motion.span>
            )}
          </AnimatePresence>
        </button>
        <button onClick={toggleSidebar}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%",
            padding:"6px 0", marginTop:4, background:"none", border:"none", cursor:"pointer",
            color:"var(--text-muted)", borderRadius:8, transition:"color 0.2s" }}
          onMouseEnter={e=>(e.currentTarget.style.color="var(--text-secondary)")}
          onMouseLeave={e=>(e.currentTarget.style.color="var(--text-muted)")}>
          {sidebarOpen ? <ChevronLeft size={15}/> : <ChevronRight size={15}/>}
        </button>
      </div>
    </motion.aside>
  )
}
