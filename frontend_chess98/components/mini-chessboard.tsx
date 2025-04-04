"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), { ssr: false })

interface MiniChessboardProps {
  fen: string
  className?: string
  size?: number
}

export function MiniChessboard({ fen, className = "", size = 120 }: MiniChessboardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder with the right dimensions until the component mounts
    return <div className={`bg-slate-800 rounded-md ${className}`} style={{ width: size, height: size }} />
  }

  return (
    <div className={`${className}`} style={{ width: size, height: size }}>
      <ChessboardComponent
        id={`mini-board-${Math.random().toString(36).substring(2, 9)}`}
        position={fen}
        boardWidth={size}
        customBoardStyle={{
          borderRadius: "0.375rem",
          overflow: "hidden",
        }}
        customDarkSquareStyle={{ backgroundColor: "#4a5568" }}
        customLightSquareStyle={{ backgroundColor: "#cbd5e0" }}
        boardOrientation="white"
        areArrowsAllowed={false}
        arePiecesDraggable={false}
        animationDuration={0}
      />
    </div>
  )
}

