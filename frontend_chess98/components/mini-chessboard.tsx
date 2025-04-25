"use client"

import { useSettingsStore } from "@/store/settings-store"
import { getBoardColors } from "@/utils/boardTheme"
import { getCustomPieces } from "@/utils/pieces"
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
  const { settings } = useSettingsStore()
  const boardColors = getBoardColors(settings?.board_theme || "default")
  const pieces = getCustomPieces(settings?.piece_set || "default")

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
        customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
        customLightSquareStyle={{ backgroundColor: boardColors.light }}
        customPieces={pieces}
        boardOrientation="white"
        areArrowsAllowed={false}
        arePiecesDraggable={false}
        animationDuration={0}
      />
    </div>
  )
}

