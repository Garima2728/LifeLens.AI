import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import type { Emotion, DayScores } from "./types"

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const formatDate = (d: string|Date, fmt="MMM d, yyyy") =>
  format(typeof d==="string" ? parseISO(d) : d, fmt)

export const getTodayString = () => format(new Date(), "yyyy-MM-dd")

export function getEmotionColor(e: Emotion): string {
  return { happy:"#10B981", neutral:"#94A3B8", sad:"#3B82F6",
           angry:"#EF4444", stressed:"#F59E0B", surprised:"#8B5CF6" }[e] ?? "#94A3B8"
}

export function getEmotionEmoji(e: string): string {
  return { happy:"😊", neutral:"😐", sad:"😢", angry:"😠", stressed:"😰", surprised:"😲" }[e] ?? "😐"
}

export function getScoreColor(s: number): string {
  if (s>=80) return "#10B981"; if (s>=60) return "#F59E0B"
  if (s>=40) return "#FB923C"; return "#EF4444"
}

export function getScoreLabel(s: number): string {
  if (s>=85) return "Excellent"; if (s>=70) return "Good"
  if (s>=55) return "Fair"; if (s>=40) return "Needs Work"; return "Critical"
}

export const SUGGESTION_CATEGORY_COLORS: Record<string,string> = {
  health:"#10B981", sleep:"#3B82F6", productivity:"#7C3AED",
  mental_wellness:"#EC4899", diet:"#F59E0B", exercise:"#06B6D4",
}

export const MOCK_CHART_DATA = Array.from({length:14},(_,i)=>{
  const d=new Date(); d.setDate(d.getDate()-(13-i))
  return {
    date: format(d,"yyyy-MM-dd"), label: format(d,"MMM d"),
    mood: Math.round(50+Math.random()*40), health: Math.round(50+Math.random()*40),
    productivity: Math.round(45+Math.random()*45), sleep: Math.round(55+Math.random()*35),
    diet: Math.round(50+Math.random()*40),
  }
})
