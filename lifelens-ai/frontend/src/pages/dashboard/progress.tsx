import { useState } from "react"
import { motion } from "framer-motion"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts"
import Sidebar from "../../components/ui/Sidebar"
import ScoreRing from "../../components/ui/ScoreRing"
import { MOCK_CHART_DATA } from "../../lib/utils"
import type { ViewPeriod } from "../../lib/types"

const MONTHLY = Array.from({length:30},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(29-i))
  return { date:d.toISOString().split("T")[0], label:d.getDate().toString(),
    overall:Math.round(50+Math.random()*40),
    screenTime:Math.round(2+Math.random()*6),
    exercise:Math.round(Math.random()*60) }
})

function CTooltip({ active,payload,label }: any) {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:"rgba(9,18,36,0.95)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 12px",fontSize:12 }}>
      <p style={{ color:"var(--text-secondary)",marginBottom:4 }}>{label}</p>
      {payload.map((p:any)=>(
        <div key={p.dataKey} style={{ display:"flex",gap:6,alignItems:"center" }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:p.color }}/>
          <span style={{ color:"var(--text-muted)",textTransform:"capitalize" }}>{p.dataKey}:</span>
          <span style={{ color:"var(--text-primary)",fontWeight:500 }}>{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const [period,setPeriod]=useState<ViewPeriod>("monthly")

  const avgOverall = Math.round(MONTHLY.reduce((a,b)=>a+b.overall,0)/MONTHLY.length)
  const avgScreen  = (MONTHLY.reduce((a,b)=>a+b.screenTime,0)/MONTHLY.length).toFixed(1)
  const totalExercise = MONTHLY.reduce((a,b)=>a+b.exercise,0)

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-primary)" }}>
      <Sidebar/>
      <main style={{ flex:1,padding:"26px 30px",overflowY:"auto" }}>
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26 }}>
            <div>
              <h1 style={{ fontSize:22,fontWeight:700,margin:"0 0 4px" }}>Progress</h1>
              <p style={{ color:"var(--text-secondary)",fontSize:13 }}>Long-term trends across all wellness dimensions</p>
            </div>
            <div style={{ display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:10,padding:3,border:"1px solid rgba(255,255,255,0.07)" }}>
              {(["weekly","monthly"] as ViewPeriod[]).map(p=>(
                <button key={p} onClick={()=>setPeriod(p)} style={{
                  padding:"6px 13px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,
                  textTransform:"capitalize",transition:"all 0.2s",
                  background:period===p?"linear-gradient(135deg,#7C3AED,#6D28D9)":"transparent",
                  color:period===p?"white":"var(--text-secondary)" }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display:"grid",gridTemplateColumns:"180px 1fr 1fr",gap:18,marginBottom:18 }}>
            <div className="glass-card" style={{ padding:22,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
              <ScoreRing score={avgOverall} size={110}/>
              <p style={{ fontSize:12,color:"var(--text-secondary)",marginTop:8 }}>30-day average</p>
            </div>
            <div className="glass-card" style={{ padding:22,display:"flex",flexDirection:"column",justifyContent:"center" }}>
              <p style={{ fontSize:12,color:"var(--text-muted)",marginBottom:6 }}>Avg. screen time</p>
              <p style={{ fontSize:32,fontWeight:700,color:"#7C3AED",margin:0 }}>{avgScreen}h<span style={{ fontSize:14,color:"var(--text-muted)" }}>/day</span></p>
              <p style={{ fontSize:11,color:"var(--text-muted)",marginTop:4 }}>Goal: under 6h/day</p>
            </div>
            <div className="glass-card" style={{ padding:22,display:"flex",flexDirection:"column",justifyContent:"center" }}>
              <p style={{ fontSize:12,color:"var(--text-muted)",marginBottom:6 }}>Total exercise (30d)</p>
              <p style={{ fontSize:32,fontWeight:700,color:"#10B981",margin:0 }}>{totalExercise}<span style={{ fontSize:14,color:"var(--text-muted)" }}> min</span></p>
              <p style={{ fontSize:11,color:"var(--text-muted)",marginTop:4 }}>~{Math.round(totalExercise/30)} min/day average</p>
            </div>
          </div>

          {/* Overall score trend */}
          <div className="glass-card" style={{ padding:22,marginBottom:18 }}>
            <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Overall wellness score — 30 days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY} margin={{ left:-10,right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="label" tick={{ fill:"#64748B",fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis domain={[0,100]} tick={{ fill:"#64748B",fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CTooltip/>}/>
                <Line type="monotone" dataKey="overall" stroke="#7C3AED" strokeWidth={2.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Screen time vs exercise */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18 }}>
            <div className="glass-card" style={{ padding:22 }}>
              <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Screen time (hours/day)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={MONTHLY.slice(-14)} margin={{ left:-10,right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="label" tick={{ fill:"#64748B",fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#64748B",fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CTooltip/>}/>
                  <Bar dataKey="screenTime" fill="#7C3AED" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card" style={{ padding:22 }}>
              <h3 style={{ fontSize:14,fontWeight:600,margin:"0 0 16px" }}>Exercise (minutes/day)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={MONTHLY.slice(-14)} margin={{ left:-10,right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="label" tick={{ fill:"#64748B",fontSize:10 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#64748B",fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CTooltip/>}/>
                  <Bar dataKey="exercise" fill="#10B981" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
