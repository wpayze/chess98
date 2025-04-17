"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import GameCard from "@/components/game/game-card"
import { userService } from "@/services/user-service"

// Define the interface for the game data
interface Game {
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

export default function GamesPage() {
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)

    // API Pagination
    const [apiPage, setApiPage] = useState(1)
    const gamesPerApiPage = 5 // Number of games fetched per API call

    // UI Pagination (for filtered results)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Fetch games when apiPage changes
    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true)
            try {
                const res = await userService.getRecentGames(apiPage, gamesPerApiPage)
                setGames(res.games)
                setTotalPages(res.total_pages)
                setCurrentPage(res.page)
            } catch (err) {
                console.error("Failed to fetch games:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchGames()
    }, [apiPage])

    const currentGames = games

    // Change page
    const goToPage = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
          setApiPage(pageNumber)
        }
      }

    if (loading && games.length === 0) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Home</span>
                    </Link>

                    <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
                        <Trophy className="mr-2 h-6 w-6" />
                        Recent Games
                    </h1>
                    <p className="text-center text-slate-400 mb-8">Browse through recently played games</p>
                </div>

                <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white">All Games</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        {currentGames.length > 0 ? (
                            currentGames.map((game) => (
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
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">No games found</div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0 border-slate-700"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show 5 pages at most, centered around current page
                                    let pageNum
                                    if (totalPages <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNum)}
                                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? "bg-gradient-to-r from-indigo-600 to-purple-700" : "border-slate-700"
                                                }`}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0 border-slate-700"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
