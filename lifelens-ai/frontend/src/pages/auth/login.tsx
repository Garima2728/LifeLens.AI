import { useState } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { Eye, EyeOff, Sparkles, Mail, Lock, User } from "lucide-react"
import { authApi, getErrorMessage } from "../../lib/api"
import { useAppStore } from "../../store"

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
})
const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Min 2 characters"),
})
type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function AuthPage() {
  const router = useRouter()
  const { setUser, setAuthenticated } = useAppStore()
  const [isLogin, setIsLogin] = useState(true)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState:{ errors }, reset } =
    useForm<RegisterForm>({ resolver: zodResolver(isLogin ? loginSchema : registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const res = isLogin
        ? await authApi.login({ email:data.email, password:data.password })
        : await authApi.register({ name:data.name, email:data.email, password:data.password })
      const { user, tokens } = res.data.data
      localStorage.setItem("ll_token", tokens.accessToken)
      setUser(user); setAuthenticated(true)
      toast.success(isLogin ? "Welcome back!" : `Welcome, ${user.name}!`)
      router.push("/dashboard")
    } catch(err) {
      toast.error(getErrorMessage(err))
    } finally { setLoading(false) }
  }

  const demoLogin = async () => {
    setLoading(true)
    try {
      const res = await authApi.login({ email:"demo@lifelens.ai", password:"demo123" })
      const { user, tokens } = res.data.data
      localStorage.setItem("ll_token", tokens.accessToken)
      setUser(user); setAuthenticated(true)
      router.push("/dashboard")
    } catch {
      // Offline demo fallback
      const demo: any = {
        id:"demo", email:"demo@lifelens.ai", name:"Alex (Demo)", streak:7, points:340,
        badges:[], goals:["Better sleep","More exercise"],
        lifestyle:{ activityLevel:"moderate", dietType:"omnivore", sleepGoal:8, workHoursGoal:8, exerciseGoal:30 },
        createdAt: new Date().toISOString(),
      }
      setUser(demo); setAuthenticated(true)
      toast.success("Running in demo mode")
      router.push("/dashboard")
    } finally { setLoading(false) }
  }

  const blobStyle = (w:number,h:number,bg:string,top:string,left:string): React.CSSProperties => ({
    position:"absolute", width:w, height:h, background:bg, borderRadius:"50%",
    filter:"blur(70px)", pointerEvents:"none", top, left,
  })

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"var(--bg-primary)", position:"relative", overflow:"hidden" }}>
      <div style={blobStyle(400,400,"rgba(124,58,237,0.15)","8%","15%")} />
      <div style={blobStyle(300,300,"rgba(59,130,246,0.12)","55%","65%")} />
      <div style={blobStyle(200,200,"rgba(236,72,153,0.10)","30%","70%")} />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        style={{ width:"100%", maxWidth:420, padding:"0 20px", position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <motion.div animate={{ rotate:[0,8,-8,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}
            style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:64, height:64, borderRadius:20, marginBottom:14,
              background:"linear-gradient(135deg,#7C3AED,#3B82F6)",
              boxShadow:"0 0 40px rgba(124,58,237,0.5)" }}>
            <Sparkles size={28} color="white" />
          </motion.div>
          <h1 className="gradient-text" style={{ fontSize:26, fontWeight:800, margin:0 }}>LifeLens AI</h1>
          <p style={{ color:"var(--text-secondary)", fontSize:14, marginTop:6 }}>
            Your intelligent wellness companion
          </p>
        </div>

        <div className="glass-card" style={{ padding:28 }}>
          {/* Tab */}
          <div style={{ display:"flex", background:"rgba(255,255,255,0.04)", borderRadius:11,
            padding:3, marginBottom:24, border:"1px solid rgba(255,255,255,0.07)" }}>
            {["Log In","Sign Up"].map((label,i) => (
              <button key={label} onClick={()=>{ setIsLogin(i===0); reset() }}
                style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", cursor:"pointer",
                  fontSize:13, fontWeight:500, transition:"all 0.2s",
                  background: (isLogin ? i===0 : i===1) ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "transparent",
                  color: (isLogin ? i===0 : i===1) ? "white" : "var(--text-secondary)",
                  boxShadow: (isLogin ? i===0 : i===1) ? "0 4px 14px rgba(124,58,237,0.3)" : "none" }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize:13, color:"var(--text-secondary)", display:"block", marginBottom:5 }}>Full name</label>
                <div style={{ position:"relative" }}>
                  <User size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                  <input {...register("name")} placeholder="Alex Johnson" className="input-glass" style={{ paddingLeft:36 }} />
                </div>
                {errors.name && <p style={{ color:"#EF4444", fontSize:12, marginTop:3 }}>{errors.name.message}</p>}
              </div>
            )}
            <div>
              <label style={{ fontSize:13, color:"var(--text-secondary)", display:"block", marginBottom:5 }}>Email</label>
              <div style={{ position:"relative" }}>
                <Mail size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                <input {...register("email")} type="email" placeholder="you@example.com" className="input-glass" style={{ paddingLeft:36 }} />
              </div>
              {errors.email && <p style={{ color:"#EF4444", fontSize:12, marginTop:3 }}>{errors.email.message}</p>}
            </div>
            <div>
              <label style={{ fontSize:13, color:"var(--text-secondary)", display:"block", marginBottom:5 }}>Password</label>
              <div style={{ position:"relative" }}>
                <Lock size={15} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                <input {...register("password")} type={showPwd?"text":"password"} placeholder="••••••••"
                  className="input-glass" style={{ paddingLeft:36, paddingRight:36 }} />
                <button type="button" onClick={()=>setShowPwd(!showPwd)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)" }}>
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p style={{ color:"#EF4444", fontSize:12, marginTop:3 }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width:"100%", justifyContent:"center", marginTop:4 }}>
              {loading
                ? <><span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white",animation:"spin 0.8s linear infinite",display:"inline-block" }}/> Processing...</>
                : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"18px 0" }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
            <span style={{ fontSize:12, color:"var(--text-muted)" }}>or</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }}/>
          </div>
          <button onClick={demoLogin} className="btn-ghost" style={{ width:"100%", justifyContent:"center" }}>
            <Sparkles size={14} color="#7C3AED" /> Try Demo Mode
          </button>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:"var(--text-muted)", marginTop:16, lineHeight:1.6 }}>
          This tool provides wellness suggestions, not medical advice.<br/>
          Consult a healthcare professional for medical concerns.
        </p>
      </motion.div>
    </div>
  )
}
