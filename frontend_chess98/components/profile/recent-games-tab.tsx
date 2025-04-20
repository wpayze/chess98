import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { MiniChessboard } from "@/components/mini-chessboard"
import type { GameSummary } from "@/models/game"
import { formatDate } from "@/utils/timeFormats"

interface RecentGamesTabProps {
  username: string
  games: GameSummary[]
}

export function RecentGamesTab({ username, games }: RecentGamesTabProps) {
  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Recent Games</CardTitle>
        <CardDescription>Last {Math.min(games.length, 5)} games played</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No games played yet</div>
          ) : (
            games.map((game) => (
              <Link href={`/game/${game.id}`} key={game.id}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-full min-h-[40px] rounded-l-lg ${
                        game.result === "win" ? "bg-green-500" : game.result === "loss" ? "bg-red-500" : "bg-slate-500"
                      }`}
                    ></div>

                    {/* Mini chessboard */}
                    <MiniChessboard
                      fen={game.final_position || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
                      size={80}
                      className="hidden md:block"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">vs {game.opponent.username}</span>
                        <Badge className="bg-slate-700 text-slate-300">{game.time_control_str}</Badge>
                        <span className="text-xs text-slate-400">
                          {game.player_color === "white" ? "White" : "Black"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-slate-400">{formatDate(game.date)}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{game.time_control}</span>
                        <span className="text-slate-500">•</span>
                        <span
                          className={`${
                            game.result === "win"
                              ? "text-green-400"
                              : game.result === "loss"
                                ? "text-red-400"
                                : "text-slate-400"
                          }`}
                        >
                          {game.result === "win" ? "Won" : game.result === "loss" ? "Lost" : "Draw"} by{" "}
                          {game.end_reason}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-slate-300 mr-2">{game.opponent.rating}</span>
                      <span
                        className={`text-sm font-medium ${
                          game.rating_change > 0
                            ? "text-green-400"
                            : game.rating_change < 0
                              ? "text-red-400"
                              : "text-slate-400"
                        }`}
                      >
                        ({game.rating_change > 0 ? "+" : ""}
                        {game.rating_change})
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
                  </div>
                </div>
              </Link>
            ))
          )}

          {games.length > 0 && (
            <div className="flex justify-center mt-4">
              <Link href={`/games/${username}`}>
                <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  View All Games
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
