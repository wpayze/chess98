import type React from "react"
import { Navbar } from "@/components/navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-3.5rem)]">{children}</div>
    </>
  )
}

