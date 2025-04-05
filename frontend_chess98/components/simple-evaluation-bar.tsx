"use client"

import { useState, useEffect } from "react"

interface SimpleEvaluationBarProps {
  score?: number
  depth?: number
  className?: string
}

export function SimpleEvaluationBar({ score = 0, depth = 10, className = "" }: SimpleEvaluationBarProps) {
  // Convert score to percentage (0-100) for the bar
  // Score is in pawns, where positive is good for white, negative for black
  const [percentage, setPercentage] = useState(50)

  useEffect(() => {
    const cappedScore = Math.max(-5, Math.min(5, score))
    const newPercentage = 50 + cappedScore * 10
    setPercentage(newPercentage)
  }, [score])

  // Format the score for display
  const formatScore = () => {
    // Check if it's a mate score (usually represented as a very large number)
    if (Math.abs(score) >= 100) {
      return score > 0 ? "M+" : "M-"
    }

    // Regular score with sign
    return score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1)
  }

  // Determine text color based on score
  const getTextColor = () => {
    if (score > 0.5) return "text-white"
    if (score < -0.5) return "text-black"
    return "text-slate-200"
  }

  return (
    <div className={`relative w-full h-8 bg-black overflow-hidden rounded-md ${className}`}>
      {/* White's advantage (top portion) */}
      <div
        className="absolute top-0 left-0 w-full bg-white transition-all duration-300 ease-out"
        style={{ height: `${percentage}%` }}
      />
    </div>
  )
}

