"use client"

import { useAuthStore } from "@/store/auth-store"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function AuthStatus() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth/login">
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 border-none">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block">
        <p className="text-sm font-medium text-white">{user?.username}</p>
        <p className="text-xs text-slate-400">{user?.email}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

