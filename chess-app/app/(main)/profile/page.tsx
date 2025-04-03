"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// This is a simple redirect page to the current user's profile
export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // In a real app, this would check authentication and redirect to the current user's profile
    // For now, we'll just redirect to a sample profile
    router.push("/profile/Impala36")
  }, [router])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-slate-300">Redirecting to your profile...</p>
      </div>
    </div>
  )
}

