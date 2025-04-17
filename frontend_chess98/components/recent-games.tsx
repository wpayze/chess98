"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import GameCard from "@/components/game/game-card"
import { userService } from "@/services/user-service"

// Define the interface for the game data
interface RecentGame {
  game_id: string
  white_player: {
    username: string
    rating: number
    title?: string | null
  }
  black_player: {
    username: string
    rating: number
    title?: string | null
  }
  result?: string | null
  time_control: string
  time_control_str: string
  date: string
}

export default function RecentGames() {
  const [recentGames, setRecentGames] = useState<RecentGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await userService.getRecentGames(1, 3)
        setRecentGames(res.games)
      } catch (err) {
        console.error("Failed to fetch recent games:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
        <Trophy className="mr-2 h-6 w-6" />
        Last Games Played
      </h2>

      <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-3">
          {recentGames.map((game) => (
            <GameCard
              key={game.game_id}
              game_id={game.game_id}
              white_player={game.white_player}
              black_player={game.black_player}
              result={game.result}
              time_control={game.time_control}
              time_control_str={game.time_control_str}
              date={game.date}
            />
          ))}

          <div className="text-center pt-2 pb-2">
            <Link
              href="/games"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center"
            >
              View All Games <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
