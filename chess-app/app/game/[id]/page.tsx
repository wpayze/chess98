"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Share,
  Download,
  Flag,
  RotateCcw,
  Clock,
} from "lucide-react"
import dynamic from "next/dynamic"

// Import game data
import gameData from "@/data/game.json"

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), { ssr: false })

export default function GameViewPage() {
  const params = useParams()
  const gameId = params.id as string
  const boardContainerRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [game, setGame] = useState<any>(null)
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [fen, setFen] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1000) // ms between moves
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null)
  const [boardHeight, setBoardHeight] = useState(0)

  useEffect(() => {
    // In a real app, this would fetch the game data from an API
    const loadGame = async () => {
      setIsLoading(true)
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Use the imported game data
        setGame(gameData)

        // Set initial position
        if (gameData.moves && gameData.moves.length > 0) {
          setFen(gameData.moves[0].white.fen)
        }
      } catch (error) {
        console.error("Error loading game:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGame()

    // Cleanup function to clear any intervals
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval)
      }
    }
  }, [gameId])

  // Update board height when the board container resizes
  useEffect(() => {
    if (!boardContainerRef.current) return

    const updateBoardHeight = () => {
      if (boardContainerRef.current) {
        const height = boardContainerRef.current.offsetHeight
        setBoardHeight(height)
      }
    }

    // Initial measurement
    updateBoardHeight()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateBoardHeight)
    resizeObserver.observe(boardContainerRef.current)

    return () => {
      if (boardContainerRef.current) {
        resizeObserver.unobserve(boardContainerRef.current)
      }
    }
  }, [isLoading])

  // Handle move navigation
  const goToMove = (index: number) => {
    if (!game || !game.moves) return

    // Calculate the actual move (white or black)
    const moveCount = game.moves.length * 2 - (game.moves[game.moves.length - 1].black ? 0 : 1)

    // Ensure index is within bounds
    if (index < 0) index = 0
    if (index > moveCount) index = moveCount

    setCurrentMoveIndex(index)

    // Calculate which move to show
    const moveNumber = Math.floor(index / 2)
    const isWhiteMove = index % 2 === 0

    if (isWhiteMove) {
      setFen(game.moves[moveNumber].white.fen)
    } else {
      setFen(game.moves[moveNumber].black.fen)
    }
  }

  const goToNext = () => {
    goToMove(currentMoveIndex + 1)
  }

  const goToPrevious = () => {
    goToMove(currentMoveIndex - 1)
  }

  const goToStart = () => {
    goToMove(0)
  }

  const goToEnd = () => {
    if (!game || !game.moves) return
    const moveCount = game.moves.length * 2 - (game.moves[game.moves.length - 1].black ? 0 : 1)
    goToMove(moveCount)
  }

  // Handle auto playback
  const togglePlayback = () => {
    if (isPlaying) {
      // Stop playback
      if (playbackInterval) {
        clearInterval(playbackInterval)
        setPlaybackInterval(null)
      }
      setIsPlaying(false)
    } else {
      // Start playback
      const interval = setInterval(() => {
        goToMove(currentMoveIndex + 1)

        // Check if we've reached the end
        const moveCount = game.moves.length * 2 - (game.moves[game.moves.length - 1].black ? 0 : 1)
        if (currentMoveIndex >= moveCount - 1) {
          clearInterval(interval)
          setPlaybackInterval(null)
          setIsPlaying(false)
        }
      }, playbackSpeed)

      setPlaybackInterval(interval)
      setIsPlaying(true)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
          <p className="mt-4 text-lg text-slate-300">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <Card className="w-full max-w-md border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Game Not Found</CardTitle>
            <CardDescription>We couldn't find the game you're looking for</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-slate-300 mb-6">The game with ID "{gameId}" doesn't exist or has been removed.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-4 pb-8 flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <div className="mb-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {game.white.username} vs {game.black.username}
            </h1>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-slate-700 text-slate-300">{game.timeControl}</Badge>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">{game.opening}</Badge>
              <span className="text-sm text-slate-400">{formatDate(game.date)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Chessboard */}
          <div className="lg:col-span-8">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-black border border-white/20"></div>
                    <div className="font-medium text-white text-sm">{game.black.username}</div>
                    <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-xs">
                      {game.black.rating}
                    </Badge>
                    {game.blackRatingChange !== 0 && (
                      <span className={`text-xs ${game.blackRatingChange > 0 ? "text-green-400" : "text-red-400"}`}>
                        {game.blackRatingChange > 0 ? "+" : ""}
                        {game.blackRatingChange}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  ref={boardContainerRef}
                  className="w-full aspect-square max-w-[min(100%,calc(100vh-20rem))] mx-auto mb-2 flex-1"
                >
                  <ChessboardComponent
                    id="GameViewer"
                    position={fen}
                    boardOrientation="white"
                    customBoardStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                    }}
                    customDarkSquareStyle={{ backgroundColor: "#4a5568" }}
                    customLightSquareStyle={{ backgroundColor: "#cbd5e0" }}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                    <div className="font-medium text-white">{game.white.username}</div>
                    <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400">{game.white.rating}</Badge>
                    {game.whiteRatingChange !== 0 && (
                      <span className={game.whiteRatingChange > 0 ? "text-green-400" : "text-red-400"}>
                        {game.whiteRatingChange > 0 ? "+" : ""}
                        {game.whiteRatingChange}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={goToStart}
                    disabled={currentMoveIndex === 0}
                  >
                    <SkipBack className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={goToPrevious}
                    disabled={currentMoveIndex === 0}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={goToNext}
                    disabled={
                      currentMoveIndex >= game.moves.length * 2 - (game.moves[game.moves.length - 1].black ? 0 : 1)
                    }
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 w-8 p-0"
                    onClick={goToEnd}
                    disabled={
                      currentMoveIndex >= game.moves.length * 2 - (game.moves[game.moves.length - 1].black ? 0 : 1)
                    }
                  >
                    <SkipForward className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PGN
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Moves list */}
          <div className="lg:col-span-4">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 h-full flex flex-col">
              <CardHeader className="p-3">
                <CardTitle className="text-white text-base">Game Moves</CardTitle>
                <CardDescription className="text-xs">
                  {game.opening} • {game.timeControl}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1 flex flex-col">
                <div className="grid grid-cols-3 text-xs mb-1">
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">#</div>
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">White</div>
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">Black</div>
                </div>

                <div
                  className="overflow-y-auto flex-1 mb-3"
                  style={{
                    maxHeight: boardHeight ? `${boardHeight * 0.6}px` : "auto",
                  }}
                >
                  {game.moves.map((move: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 text-xs hover:bg-slate-700/30 transition-colors">
                      <div className="py-1 px-2 text-center border-t border-slate-700/50">{move.moveNumber}</div>
                      <div
                        className={`py-1 px-2 text-center border-t border-slate-700/50 cursor-pointer ${
                          currentMoveIndex === index * 2 ? "bg-indigo-500/20 font-medium" : ""
                        }`}
                        onClick={() => goToMove(index * 2)}
                      >
                        {move.white.notation}
                      </div>
                      <div
                        className={`py-1 px-2 text-center border-t border-slate-700/50 cursor-pointer ${
                          currentMoveIndex === index * 2 + 1 ? "bg-indigo-500/20 font-medium" : ""
                        }`}
                        onClick={() => goToMove(index * 2 + 1)}
                      >
                        {move.black ? move.black.notation : ""}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-3 bg-slate-700/50 flex-grow-0" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{game.timeControl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      {game.result === "1-0" ? "White wins" : game.result === "0-1" ? "Black wins" : "Draw"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-slate-800/50 rounded-md flex-grow-0">
                  <h3 className="text-xs font-medium text-white mb-1">Game Result</h3>
                  <p className="text-xs text-slate-400">
                    {game.result === "1-0"
                      ? `${game.white.username} won by ${game.termination}`
                      : game.result === "0-1"
                        ? `${game.black.username} won by ${game.termination}`
                        : `Game ended in a draw by ${game.termination}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

