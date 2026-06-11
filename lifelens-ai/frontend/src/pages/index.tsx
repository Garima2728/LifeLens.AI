import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAppStore } from "../store"

export default function Home() {
  const router = useRouter()
  const isAuthenticated = useAppStore(s => s.isAuthenticated)
  useEffect(() => {
    router.replace(isAuthenticated ? "/dashboard" : "/auth/login")
  }, [isAuthenticated, router])
  return null
}
