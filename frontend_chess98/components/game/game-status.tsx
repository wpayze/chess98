"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface GameStatusProps {
  gameStatus: string
  gameResult: string | null
  isOpponentReady: boolean
  gameStarted: boolean
  drawOffered: boolean
  onAcceptDraw: () => void
  onDeclineDraw: () => void
}

export default function GameStatus({
  gameStatus,
  gameResult,
  isOpponentReady,
  gameStarted,
  drawOffered,
  onAcceptDraw,
  onDeclineDraw,
}: GameStatusProps) {
  return (
    <div className="p-2 text-center">
      {gameStatus === "finished" ? (
        <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50">
          <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
            Game Over
          </div>
          <div className="text-white">{gameResult}</div>
          <Link href="/">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 mt-3 text-xs h-8">
              Return to Home
            </Button>
          </Link>
        </div>
      ) : drawOffered ? (
        <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50 mb-2">
          <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
            Draw Offered
          </div>
          <div className="text-white">Your opponent has offered a draw. Do you accept?</div>
          <div className="flex justify-center space-x-2 mt-3">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-xs h-8"
              onClick={onAcceptDraw}
            >
              Accept
            </Button>
            <Button
              className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600 text-xs h-8"
              onClick={onDeclineDraw}
              variant="outline"
            >
              Decline
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold px-4">
          {!isOpponentReady
            ? "Waiting for opponent"
            : !gameStarted
              ? "Make a move to start the game"
              : gameStatus === "canceled"
                ? "Game canceled"
                : ""}
        </div>
      )}
    </div>
  )
}
