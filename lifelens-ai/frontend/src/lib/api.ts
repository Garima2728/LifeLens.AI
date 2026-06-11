import axios, { AxiosError } from "axios"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
})

api.interceptors.request.use(cfg => {
  const t = typeof window!=="undefined" && localStorage.getItem("ll_token")
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(r => r, (err: AxiosError) => {
  if (err.response?.status===401 && typeof window!=="undefined") {
    localStorage.removeItem("ll_token")
    window.location.href="/auth/login"
  }
  return Promise.reject(err)
})

export const authApi = {
  login:    (p:{email:string;password:string}) => api.post("/auth/login", p),
  register: (p:{name:string;email:string;password:string;age?:number}) => api.post("/auth/register", p),
  me:       () => api.get("/auth/me"),
  logout:   () => api.post("/auth/logout"),
}

export const logsApi = {
  create:       (d:any)         => api.post("/logs", d),
  getByDate:    (date:string)   => api.get(`/logs/date/${date}`),
  getRecent:    (days=30)       => api.get(`/logs/recent?days=${days}`),
  update:       (id:string,d:any)=>api.put(`/logs/${id}`, d),
  getChartData: (period:string) => api.get(`/logs/chart?period=${period}`),
}

export const insightsApi = {
  generate:   (period:string) => api.post("/insights/generate", { period }),
  getLatest:  (period:string) => api.get(`/insights/latest?period=${period}`),
  getHistory: ()              => api.get("/insights/history"),
}

export const emotionApi = {
  analyze:        (image:string)  => api.post("/emotion/analyze", { image }),
  saveSummary:    (d:any)         => api.post("/emotion/summary", d),
  getHistory:     (days=14)       => api.get(`/emotion/history?days=${days}`),
}

export const userApi = {
  update:     (d:any)         => api.put("/users/me", d),
  getStats:   ()              => api.get("/users/stats"),
  updateGoals:(goals:string[])=> api.put("/users/me/goals", { goals }),
}

export function getErrorMessage(err:unknown):string {
  if (axios.isAxiosError(err)) return err.response?.data?.message||err.message||"Something went wrong"
  if (err instanceof Error)    return err.message
  return "An unexpected error occurred"
}
