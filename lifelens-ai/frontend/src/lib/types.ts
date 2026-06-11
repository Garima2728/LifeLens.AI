export type Emotion = "happy"|"neutral"|"sad"|"angry"|"stressed"|"surprised"
export type MealType = "breakfast"|"lunch"|"dinner"|"snack"
export type DietQuality = "excellent"|"good"|"fair"|"poor"
export type ViewPeriod = "daily"|"weekly"|"monthly"

export interface User {
  id: string; email: string; name: string; age?: number
  goals: string[]; lifestyle: LifestylePreferences
  streak: number; points: number; badges: Badge[]; createdAt: string
}

export interface LifestylePreferences {
  activityLevel: "sedentary"|"light"|"moderate"|"active"|"very_active"
  dietType: string; sleepGoal: number; workHoursGoal: number; exerciseGoal: number
}

export interface Meal {
  type: MealType; time: string; description: string; quality: DietQuality; calories?: number
}

export interface DayScores {
  health: number; productivity: number; mood: number; sleep: number; diet: number; overall: number
}

export interface DailyLog {
  id: string; userId: string; date: string; wakeTime: string; sleepTime: string
  sleepDuration: number; workHours: number; studyHours: number; screenTime: number
  exerciseMinutes: number; exerciseType?: string; meals: Meal[]
  socialInteraction: "none"|"minimal"|"moderate"|"high"
  waterIntake: number; stressLevel: number; notes?: string; scores: DayScores; createdAt: string
}

export interface EmotionRecord {
  id: string; userId: string; date: string; dominantEmotion: Emotion
  emotionDistribution: Record<Emotion, number>; confidence: number; samplesCount: number; createdAt: string
}

export interface Suggestion {
  id: string; category: string; priority: "high"|"medium"|"low"
  title: string; description: string; action: string; impact: string; timeframe: string
}

export interface InsightScores {
  overall: number; trend: "improving"|"stable"|"declining"
  healthScore: number; productivityScore: number; mentalWellnessScore: number; sleepScore: number; dietScore: number
}

export interface AIInsight {
  id: string; userId: string; period: ViewPeriod; date: string
  summary: string; positives: string[]; concerns: string[]
  suggestions: Suggestion[]; scores: InsightScores; disclaimer: string
}

export interface ChartDataPoint {
  date: string; label: string; mood?: number; health?: number
  productivity?: number; sleep?: number; diet?: number; screenTime?: number; exercise?: number
}

export interface Habit {
  id: string; userId: string; name: string; category: string
  targetDays: number; currentStreak: number; longestStreak: number
  completedDates: string[]; color: string; icon: string; badges?: any[]
}

export interface Badge {
  id: string; name: string; description: string; icon: string; earnedAt: string
  rarity: "common"|"rare"|"epic"|"legendary"
}

export interface AppStore {
  user: User|null; isAuthenticated: boolean; isLoading: boolean
  currentView: ViewPeriod; sidebarOpen: boolean
  setUser: (u: User|null)=>void; setAuthenticated: (v: boolean)=>void
  setLoading: (v: boolean)=>void; setCurrentView: (v: ViewPeriod)=>void
  toggleSidebar: ()=>void; logout: ()=>void
}
