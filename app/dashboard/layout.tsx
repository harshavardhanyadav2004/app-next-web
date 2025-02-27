"use client" ;

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" 
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { DashboardHeader } from "../components/dashboard/header"
import { DashboardSidebar } from "../components/dashboard/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/signin") // Redirect if not authenticated
      } else {
        setUser(user)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, auth])

  if (loading) return <p>Loading...</p> // Prevents UI flicker

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <DashboardSidebar />
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
