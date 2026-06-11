"use client"
import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { MeshDistortMaterial, Sphere } from "@react-three/drei"
import * as THREE from "three"
import type { Emotion } from "../../lib/types"

const COLORS: Record<string,[string,string]> = {
  happy:    ["#10B981","#34D399"], neutral: ["#7C3AED","#A78BFA"],
  sad:      ["#3B82F6","#60A5FA"], angry:   ["#EF4444","#F87171"],
  stressed: ["#F59E0B","#FCD34D"],surprised:["#EC4899","#F472B6"],
}

function OrbMesh({ emotion, score }: { emotion:Emotion; score:number }) {
  const ref = useRef<THREE.Mesh>(null)
  const colors = COLORS[emotion] ?? COLORS.neutral
  const speeds: Record<string,number> = { happy:0.8,neutral:0.4,sad:0.3,angry:1.4,stressed:1.2,surprised:1.0 }
  const distort = 0.2 + (1-score/100)*0.4

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.x = Math.sin(t*0.3)*0.2
    ref.current.rotation.y = t*0.4
  })

  return (
    <Sphere ref={ref} args={[1.2,64,64]}>
      <MeshDistortMaterial color={colors[0]} distort={distort}
        speed={speeds[emotion]??0.5} roughness={0.2} metalness={0.1}/>
    </Sphere>
  )
}

function Particles({ emotion }: { emotion:Emotion }) {
  const ref = useRef<THREE.Points>(null)
  const colors = COLORS[emotion] ?? COLORS.neutral
  const count = 50
  const [pos, col] = useMemo(() => {
    const p = new Float32Array(count*3), c = new Float32Array(count*3)
    const c1 = new THREE.Color(colors[0]), c2 = new THREE.Color(colors[1])
    for (let i=0;i<count;i++) {
      const rad=1.9+Math.random()*1.1, th=Math.random()*Math.PI*2, ph=Math.random()*Math.PI
      p[i*3]=rad*Math.sin(ph)*Math.cos(th); p[i*3+1]=rad*Math.sin(ph)*Math.sin(th); p[i*3+2]=rad*Math.cos(ph)
      const cc=Math.random()>.5?c1:c2; c[i*3]=cc.r; c[i*3+1]=cc.g; c[i*3+2]=cc.b
    }
    return [p,c]
  }, [colors])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime()*0.1
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3}/>
        <bufferAttribute attach="attributes-color"    count={count} array={col} itemSize={3}/>
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.75}/>
    </points>
  )
}

interface Props { emotion?:Emotion; score?:number; size?:number }
export default function MoodOrb({ emotion="neutral", score=70, size=200 }: Props) {
  return (
    <div style={{ width:size, height:size }}>
      <Canvas camera={{ position:[0,0,4], fov:45 }}>
        <ambientLight intensity={0.3}/>
        <pointLight position={[10,10,10]} intensity={1}/>
        <pointLight position={[-10,-10,-10]} intensity={0.4} color="#7C3AED"/>
        <OrbMesh emotion={emotion} score={score}/>
        <Particles emotion={emotion}/>
      </Canvas>
    </div>
  )
}
