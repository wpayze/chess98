"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronLeft, ChevronRight, Search, Filter, Clock, Trophy } from "lucide-react"

// Import mock data
import mockGamesData from "@/data/games.json"

import { MiniChessboard } from "@/components/mini-chessboard"
import { GameSummary } from "@/models/game"


export default function UserGamesPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [games, setGames] = useState<GameSummary[]>([])
  const [filteredGames, setFilteredGames] = useState<GameSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 10
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [timeControlFilter, setTimeControlFilter] = useState("all")
  const [resultFilter, setResultFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    // Simulate API call to fetch games data
    const fetchGames = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Convert dates from strings to Date objects in games data
        const gamesWithDates = mockGamesData.map((game) => ({
          ...game,
          date: new Date(game.date),
        })) as GameSummary[]

        setGames(gamesWithDates)
      } catch (error) {
        console.error("Error fetching games:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [username])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...games]

    // Apply search filter
    if (searchTerm) {
      result = result.filter((game) => game.opponent.username.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply time control filter
    if (timeControlFilter !== "all") {
      result = result.filter((game) => game.timeControl === timeControlFilter)
    }

    // Apply result filter
    if (resultFilter !== "all") {
      result = result.filter((game) => game.result === resultFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === "rating") {
        return sortOrder === "desc" ? b.opponent.rating - a.opponent.rating : a.opponent.rating - b.opponent.rating
      } else if (sortBy === "moves") {
        return sortOrder === "desc" ? b.moves - a.moves : a.moves - b.moves
      }
      return 0
    })

    setFilteredGames(result)
    setTotalPages(Math.ceil(result.length / gamesPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [games, searchTerm, timeControlFilter, resultFilter, sortBy, sortOrder])

  // Get current games for pagination
  const indexOfLastGame = currentPage * gamesPerPage
  const indexOfFirstGame = indexOfLastGame - gamesPerPage
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame)

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading games...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8 overflow-y-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/profile/${username}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {username}'s Games
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Filters */}
        <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Filter and sort games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search opponent"
                  className="pl-10 bg-slate-800/50 border-slate-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <Select value={timeControlFilter} onValueChange={setTimeControlFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Time Control" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time Controls</SelectItem>
                    <SelectItem value="bullet">Bullet</SelectItem>
                    <SelectItem value="blitz">Blitz</SelectItem>
                    <SelectItem value="rapid">Rapid</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={resultFilter} onValueChange={setResultFilter}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Result" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="win">Wins</SelectItem>
                    <SelectItem value="loss">Losses</SelectItem>
                    <SelectItem value="draw">Draws</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <div className="flex items-center">
                      <Filter className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Sort By" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="rating">Opponent Rating</SelectItem>
                    <SelectItem value="moves">Number of Moves</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <div className="flex items-center">
                      <ChevronRight className="h-4 w-4 mr-2 text-slate-400" />
                      <SelectValue placeholder="Order" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games List */}
        <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Game History</CardTitle>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {filteredGames.length} Games
              </Badge>
            </div>
            <CardDescription>
              Showing {indexOfFirstGame + 1}-{Math.min(indexOfLastGame, filteredGames.length)} of {filteredGames.length}{" "}
              games
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentGames.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No games found matching your filters.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                  onClick={() => {
                    setSearchTerm("")
                    setTimeControlFilter("all")
                    setResultFilter("all")
                    setSortBy("date")
                    setSortOrder("desc")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentGames.map((game) => (
                  <Link href={`/game/${game.id}`} key={game.id}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-full min-h-[40px] rounded-l-lg ${
                            game.result === "win"
                              ? "bg-green-500"
                              : game.result === "loss"
                                ? "bg-red-500"
                                : "bg-slate-500"
                          }`}
                        ></div>

                        {/* Add the mini chessboard */}
                        <MiniChessboard
                          fen={game.finalPosition || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}
                          size={80}
                          className="hidden md:block"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">vs {game.opponent.username}</span>
                            <Badge className="bg-slate-700 text-slate-300">{game.timeControl}</Badge>
                            <span className="text-xs text-slate-400">
                              {game.playerColor === "white" ? "White" : "Black"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-slate-400">{formatDate(game.date)}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{game.moves} moves</span>
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
                              {game.endReason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <span className="text-slate-300 mr-2">{game.opponent.rating}</span>
                          <span
                            className={`text-sm font-medium ${
                              game.ratingChange > 0
                                ? "text-green-400"
                                : game.ratingChange < 0
                                  ? "text-red-400"
                                  : "text-slate-400"
                            }`}
                          >
                            {game.ratingChange > 0 ? "+" : ""}
                            {game.ratingChange}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current
                        let pageToShow
                        if (totalPages <= 5) {
                          pageToShow = i + 1
                        } else if (currentPage <= 3) {
                          pageToShow = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageToShow = totalPages - 4 + i
                        } else {
                          pageToShow = currentPage - 2 + i
                        }

                        if (
                          pageToShow === 1 ||
                          pageToShow === totalPages ||
                          (pageToShow >= currentPage - 1 && pageToShow <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageToShow}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(pageToShow)
                                }}
                                isActive={currentPage === pageToShow}
                              >
                                {pageToShow}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        } else if (pageToShow === 2 || pageToShow === totalPages - 1) {
                          return (
                            <PaginationItem key={pageToShow}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return null
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

