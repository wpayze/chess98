import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90">
        {children}
    </div>
  )
}

