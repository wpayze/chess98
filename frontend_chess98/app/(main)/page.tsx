"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Zap, Hourglass, Trophy, User } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { connectToMatchmaking, disconnect } from "@/services/matchmaking-service"
import TopPlayersRanking from "@/components/top-players-ranking"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  const timeControls = [
    { name: "Bullet", icon: Zap, options: ["1+0", "1+1", "2+1"] },
    { name: "Blitz", icon: Clock, options: ["3+0", "3+2", "5+0"] },
    { name: "Rapid", icon: Hourglass, options: ["10+0", "10+5", "15+10"] },
    { name: "Classical", icon: Trophy, options: ["30+0", "30+20"] },
  ]

  const [isSearching, setIsSearching] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedTimeControl, setSelectedTimeControl] = useState("")

  const handleTimeControlClick = (timeControl: string, timeControlStr: string) => {
    setSelectedTimeControl(timeControl)
    
    if (isAuthenticated && user?.id) {
      setIsSearching(true)
  
      connectToMatchmaking(
        timeControl,
        timeControlStr,
        user.id,
        ({ game_id }) => {
          setIsSearching(false)
          router.push(`/play/${game_id}`)
        },
        () => {
          // Opcional: manejo cuando el socket se cierra
          console.log("WebSocket closed")
        }
      )
    } else {
      setShowLoginPrompt(true)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-slate-900/20 py-8 flex flex-col">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Quick Matching
        </h1>
        <p className="text-center text-muted-foreground mb-8">Select a time control to begin your game</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {timeControls.map((category) => {
            const Icon = category.icon
            return (
              <Card
                key={category.name}
                className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-white">{category.name}</CardTitle>
                  </div>
                  <CardDescription>Select time control</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {category.options.map((option) => (
                      <Button
                        key={option}
                        variant="outline"
                        className="w-full justify-start gap-2 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:from-indigo-600 hover:to-purple-700 hover:text-white transition-all duration-300"
                        onClick={() => handleTimeControlClick(option, category.name.toLowerCase())}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{option}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <TopPlayersRanking />
      </div>

      {/* Looking for match popup (only for authenticated users) */}
      {isSearching && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Looking for a match
            </h2>
            <p className="text-slate-300 mb-4">Finding an opponent for {selectedTimeControl} game...</p>
            <p className="text-sm text-slate-400 mb-6">This won't take long</p>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white"
              onClick={() => {
                disconnect()
                setIsSearching(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Login prompt popup (only for non-authenticated users) */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Log in to play
            </h2>
            <p className="text-slate-300 mb-6">You need to be logged in to play a {selectedTimeControl} game</p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-white"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                onClick={() => router.push("/auth/login")}
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-sm text-slate-400">
          Made by{" "}
          <a
            href="https://wilfredopaiz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:from-indigo-500 hover:to-purple-600 transition-colors"
          >
            Wilfredo Paiz
          </a>
        </p>
      </div>
    </main>
  )
}

