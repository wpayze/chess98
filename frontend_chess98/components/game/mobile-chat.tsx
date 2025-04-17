"use client"

import { Button } from "@/components/ui/button"
import { X, Send } from "lucide-react"
import { useState } from "react"

interface MobileChatProps {
  messages: Array<{ sender: string; message: string }>
  onSendMessage: (message: string) => void
  onClose: () => void
  gameInfo: {
    timeControl: string
    timeControlStr: string
    startTime: string
    currentPlayer: {
      username: string
      rating: number
    }
    opponent: {
      username: string
      rating: number
    }
    gameStatus: string
  }
}

export function MobileChat({ messages, onSendMessage, onClose, gameInfo }: MobileChatProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleQuickMessage = (text: string) => {
    onSendMessage(text)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 z-50 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <div className="text-sm text-indigo-300 mb-1">
            {`${gameInfo.timeControl} • Rated • ${
              gameInfo.timeControlStr
                ? gameInfo.timeControlStr.charAt(0).toUpperCase() + gameInfo.timeControlStr.slice(1)
                : ""
            }`}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-400">
              {gameInfo.currentPlayer.username} vs {gameInfo.opponent.username}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            {msg.sender === "system" ? (
              <div className="italic text-indigo-400 text-xs">{msg.message}</div>
            ) : (
              <div className="text-sm">
                <span className="font-bold">{msg.sender}: </span>
                <span className="text-slate-300">{msg.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick messages */}
      <div className="p-2 border-t border-slate-700 grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
          onClick={() => handleQuickMessage("Hi!")}
        >
          Hi!
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
          onClick={() => handleQuickMessage("Good luck!")}
        >
          Good luck!
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
          onClick={() => handleQuickMessage("Have fun!")}
        >
          Have fun!
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-xs"
          onClick={() => handleQuickMessage("You too!")}
        >
          You too!
        </Button>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend()
            }
          }}
        />
        <Button
          onClick={handleSend}
          className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
