"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface GameTimerProps {
  initialTime: number // in seconds
  isRunning: boolean
  increment: number // in seconds
  className?: string
}

export function GameTimer({ initialTime, isRunning, increment, className }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
    } else if (!isRunning && interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  // Add a function to add increment
  const addIncrement = () => {
    if (increment > 0) {
      setTimeLeft((prev) => prev + increment)
    }
  }

  // Format time as mm:ss
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`

  // Determine color based on time left
  let timeColor = "text-white"
  if (timeLeft < 30) timeColor = "text-red-400"
  else if (timeLeft < 60) timeColor = "text-amber-400"

  // Expose the addIncrement function
  return (
    <div className={cn("text-xl font-mono font-bold px-3 py-1 rounded-md", timeColor, className)}>{formattedTime}</div>
  )
}

