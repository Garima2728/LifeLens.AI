import { motion } from "framer-motion"
import { getScoreColor, getScoreLabel } from "../../lib/utils"

interface Props { score:number; size?:number; strokeWidth?:number; label?:string; animate?:boolean }

export default function ScoreRing({ score, size=120, strokeWidth=8, label, animate=true }: Props) {
  const r = (size - strokeWidth*2) / 2
  const circ = 2*Math.PI*r
  const filled = (score/100)*circ
  const color = getScoreColor(score)
  return (
    <div style={{ position:"relative", width:size, height:size, display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={animate ? { strokeDashoffset: circ-filled } : undefined}
          style={!animate ? { strokeDashoffset: circ-filled } : undefined}
          transition={{ duration:1.4, ease:"easeOut" }}/>
      </svg>
      <div style={{ textAlign:"center", zIndex:1 }}>
        <motion.div initial={animate?{opacity:0,scale:0.5}:undefined} animate={animate?{opacity:1,scale:1}:undefined}
          transition={{ delay:0.5 }}
          style={{ fontSize: size>80?26:16, fontWeight:700, color, lineHeight:1 }}>
          {Math.round(score)}
        </motion.div>
        <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>{label || getScoreLabel(score)}</div>
      </div>
    </div>
  )
}
