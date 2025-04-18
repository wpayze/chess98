"use client"

import { useState, useEffect } from "react"

interface SimpleEvaluationBarProps {
  score?: number
  depth?: number
  className?: string
}

export function SimpleEvaluationBar({ score = 0, className = "" }: SimpleEvaluationBarProps) {
  const [percentage, setPercentage] = useState(50)

  useEffect(() => {
    const cappedScore = Math.max(-5, Math.min(5, score))
    const newPercentage = 50 + cappedScore * 10
    setPercentage(newPercentage)
  }, [score])

  return (
    <div className={`relative w-full h-8 bg-black overflow-hidden rounded-md ${className}`}>
      <div
        className="absolute top-0 left-0 w-full bg-white transition-all duration-300 ease-out"
        style={{ height: `${percentage}%` }}
      />
    </div>
  )
}

