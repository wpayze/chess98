"use client"

import { Button } from "@/components/ui/button"
import { Flag, RotateCcw, MessageSquare } from "lucide-react"

interface MobileBottomBarProps {
  gameStatus: string
  isOpponentReady: boolean
  onOpenChat: () => void
  onOpenResignConfirmation: () => void
  onOpenDrawConfirmation: () => void
}

export function MobileBottomBar({
  gameStatus,
  isOpponentReady,
  onOpenChat,
  onOpenResignConfirmation,
  onOpenDrawConfirmation,
}: MobileBottomBarProps) {
  const isGameActive = gameStatus === "active" && isOpponentReady

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-700 p-2 flex justify-around items-center md:hidden z-10">
      <Button
        variant="outline"
        size="sm"
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:bg-slate-700 text-white"
        onClick={onOpenChat}
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        <span className="text-xs">Chat</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-red-600/80 hover:to-red-700/80 text-white"
        onClick={onOpenResignConfirmation}
        disabled={!isGameActive}
      >
        <Flag className="h-4 w-4 mr-1" />
        <span className="text-xs">Resign</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-indigo-600/80 hover:to-purple-700/80 text-white"
        onClick={onOpenDrawConfirmation}
        disabled={!isGameActive}
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        <span className="text-xs">Draw</span>
      </Button>
    </div>
  )
}
