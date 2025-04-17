"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Activity, Flag, RotateCcw } from "lucide-react"
import { useParams } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { gameService } from "@/services/game-service"
import type { Game } from "@/models/play"
import { useAuthStore } from "@/store/auth-store"
import { gameplayService } from "@/services/gameplay-service"
import GameStatus from "@/components/game/game-status"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import { playSound } from "@/services/sounds-service"
import { SOUNDS } from "@/constants/sounds"
import { formatTime, getMinutesAgo } from "@/utils/timeFormats"
import { MobileBottomBar } from "@/components/game/mobile-bottom-bar"
import { MobileChat } from "@/components/game/mobile-chat"
import { Chess98Board, Chess98BoardHandle } from "@/components/chess98-board"

export default function PlayPage() {
  const params = useParams()
  const isMobile = useIsMobile()
  const gameId = params?.gameId as string

  const { user } = useAuthStore()

  const boardRef = useRef<Chess98BoardHandle>(null)

  // State for the game
  const [fen, setFen] = useState<string | null>(null)
  const [gameStatus, setGameStatus] = useState("active") // active, canceled, finished
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(!isMobile) // Show chat by default on desktop, hide on mobile
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([{ sender: "system", message: "Connecting to game server..." }])
  const [game, setGame] = useState<Game | null>(null)

  // Opponent loading state
  const [isOpponentReady, setIsOpponentReady] = useState(false)

  // Add these state variables after the other state declarations
  const [showResignConfirmation, setShowResignConfirmation] = useState(false)
  const [showDrawConfirmation, setShowDrawConfirmation] = useState(false)

  // Function to add system messages to chat
  const addSystemMessage = (message: string) => {
    setChatMessages((prev) => [...prev, { sender: "system", message }])
  }

  // Moves history
  const [moves, setMoves] = useState<Array<{ white: string; black: string | null }>>([])

  // Timer state
  const [whiteTime, setWhiteTime] = useState(0)
  const [blackTime, setBlackTime] = useState(0)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [drawOffered, setDrawOffered] = useState(false)

  const [whiteRatingChange, setWhiteRatingChange] = useState(0)
  const [blackRatingChange, setBlackRatingChange] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  //Data
  const [currentPlayerColor, setCurrentPlayerColor] = useState<"white" | "black" | null>(null)
  const [currentPlayerData, setCurrentPlayerData] = useState<Game["white_player"] | Game["black_player"] | null>(null)
  const [opponentPlayerData, setOpponentPlayerData] = useState<Game["white_player"] | Game["black_player"] | null>(null)

  const [isUserReady, setIsUserReady] = useState(false)

  useEffect(() => {
    if (user) {
      setIsUserReady(true)
    }
  }, [user])

  useEffect(() => {
    if (!game || !user) return

    gameplayService.connect(game.id, user.id, {
      onWaitingForOpponent: () => {
        setIsOpponentReady(false)
        addSystemMessage("Waiting for opponent to join...")
      },
      onGameReady: (data) => {
        playSound(SOUNDS.GAME_START)

        setIsOpponentReady(true)
        setFen(data.initial_fen)
        setWhiteTime(data.your_time)
        setBlackTime(data.opponent_time)
        setIsWhiteTurn(data.turn === "white")
        addSystemMessage("Opponent has joined the game.")
        addSystemMessage("Game started. Good luck!")
      },
      onReconnected: () => {
        setGameStarted(true)
        addSystemMessage("You reconnected to the game.")
      },
      onMoveMade: (data) => {
        if (!gameStarted || !data.fen) setGameStarted(true)

        setWhiteTime(data.white_time)
        setBlackTime(data.black_time)
        setIsWhiteTurn(data.turn === "white")
        const from = data.uci?.substring(0, 2)
        const to = data.uci?.substring(2, 4)

        boardRef.current?.applyExternalMove({ from, to, fen: data.fen, turn: data.turn === "white" ? "w" : "b" })

        // Update moves
        setMoves((prev) => {
          const newMoves = [...prev]

          if (data.turn === "black") {
            newMoves.push({ white: data.san, black: null })
          } else {
            if (newMoves.length > 0) {
              newMoves[newMoves.length - 1].black = data.san
            }
          }
          return newMoves
        })
      },
      onGameOver: (data) => {
        setGameStatus("finished")
        playSound(SOUNDS.GAME_END)

        let resultText = ""
        let customMessage = ""

        if (data.result === "draw") {
          resultText = `Game drawn by ${terminationToText(data.termination)}`
          customMessage = resultText
        } else if (data.termination === "timeout") {
          const winner = data.result === "white_win" ? "White" : "Black"
          const loser = winner === "White" ? "Black" : "White"
          resultText = `${winner} wins by timeout`
          customMessage = `${loser}'s time has run out. ${winner} wins!`
        } else {
          const winner = data.result === "white_win" ? "White" : "Black"
          resultText = `${winner} wins by ${terminationToText(data.termination)}`
          customMessage = resultText
        }

        if (data.white_rating_change !== undefined && data.white_rating_change !== null) {
          setWhiteRatingChange(data.white_rating_change)
        }
        if (data.black_rating_change !== undefined && data.black_rating_change !== null) {
          setBlackRatingChange(data.black_rating_change)
        }

        setGameResult(resultText)
        addSystemMessage(customMessage)
      },
      onChatMessage: ({ from, message }) => {
        setChatMessages((prev) => [...prev, { sender: from, message }])
      },
      onDrawOfferReceived: ({ from }) => {
        console.log({ from, user })
        if (from === user.id) return

        setDrawOffered(true)
        addSystemMessage("Opponent offered a draw.")
        //playSound(SOUNDS.DRAW_OFFER)
      },
      onDrawOfferDeclined: ({ from }) => {
        addSystemMessage("Draw declined.")
      },
    })

    return () => {
      gameplayService.disconnect()
    }
  }, [game, user])

  useEffect(() => {
    if (!gameId || !isUserReady) return

    const fetchGame = async () => {
      try {
        const fetchedGame = await gameService.getGameById(gameId)
        setGame(fetchedGame)

        const [baseMinutesStr] = fetchedGame.time_control.split("+")
        const baseMinutes = Number.parseInt(baseMinutesStr, 10)
        const initialTimeInSeconds = baseMinutes * 60

        setWhiteTime(initialTimeInSeconds)
        setBlackTime(initialTimeInSeconds)

        const { white_player, black_player } = fetchedGame

        if (user?.id === white_player.id) {
          setCurrentPlayerColor("white")
          setCurrentPlayerData(white_player)
          setOpponentPlayerData(black_player)
        } else if (user?.id === black_player.id) {
          setCurrentPlayerColor("black")
          setCurrentPlayerData(black_player)
          setOpponentPlayerData(black_player)
        } else {
          console.warn("User is not a participant in this game.")
        }
      } catch (error) {
        console.error("Failed to fetch game:", error)
      }
    }

    fetchGame()
  }, [gameId, isUserReady, user])

  // Timer effect - only run when game has started
  useEffect(() => {
    if (!gameStarted || gameStatus !== "active") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const interval = setInterval(() => {
      if (isWhiteTurn) {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            gameplayService.sendTimeoutCheck()
            return 0
          }
          return prev - 1
        })
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            gameplayService.sendTimeoutCheck()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    timerRef.current = interval

    return () => {
      clearInterval(interval)
    }
  }, [gameStarted, gameStatus, isWhiteTurn])

  function terminationToText(reason: string) {
    switch (reason) {
      case "checkmate":
        return "CheckMate"
      case "resignation":
        return "Resignation"
      case "timeout":
        return "TimeOut"
      case "draw_agreement":
        return "Draw Agreement"
      case "stalemate":
        return "StaleMate"
      case "insufficient_material":
        return "Insufficient Material"
      case "fifty_move_rule":
        return "50-move rule"
      case "threefold_repetition":
        return "threefold repetition"
      default:
        return reason
    }
  }

  const declineDraw = () => {
    setDrawOffered(false)
    addSystemMessage("Draw declined.")
    gameplayService.sendDrawDecline()
  }

  const openResignConfirmation = () => {
    if (gameStatus !== "active") return
    setShowResignConfirmation(true)
  }

  const confirmResign = () => {
    if (gameStatus !== "active" || !isOpponentReady) return
    gameplayService.sendResign()
    setShowResignConfirmation(false)
  }

  const openDrawConfirmation = () => {
    if (gameStatus !== "active") return
    setShowDrawConfirmation(true)
  }

  const offerDraw = () => {
    if (gameStatus !== "active" || !isOpponentReady) return
    gameplayService.sendDrawOffer()
    addSystemMessage("You offered a Draw.")
    setShowDrawConfirmation(false)
  }

  const sendMessage = (message: string) => {
    if (!currentPlayerData?.username) return
    if (!message) return

    gameplayService.sendChatMessageWebSocket(currentPlayerData.username, message)
  }

  const isCurrentPlayerTurn =
    (currentPlayerColor === "white" && isWhiteTurn) || (currentPlayerColor === "black" && !isWhiteTurn)

  if (!game || !user || !currentPlayerData || !opponentPlayerData || !currentPlayerColor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Game info for mobile chat
  const gameInfo = {
    timeControl: game.time_control,
    timeControlStr: game.time_control_str || "",
    startTime: game.start_time,
    currentPlayer: {
      username: currentPlayerData.username,
      rating: currentPlayerData.profile?.ratings?.[game.time_control_str || "blitz"] || 0,
    },
    opponent: {
      username: opponentPlayerData.username,
      rating: opponentPlayerData.profile?.ratings?.[game.time_control_str || "blitz"] || 0,
    },
    gameStatus: gameStatus,
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex flex-col">
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left sidebar - Chat (desktop only) */}
        {!isMobile && (
          <div
            className={`${
              showChat ? "w-64" : "w-0"
            } bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-r border-slate-700 transition-all duration-300 ease-in-out overflow-hidden ${
              showChat ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
            }`}
          >
            <div className="p-3 border-b border-slate-700">
              <div className="text-sm text-indigo-300 mb-1">{`${game?.time_control} • Rated • ${
                game?.time_control_str
                  ? game?.time_control_str.charAt(0).toUpperCase() + game.time_control_str.slice(1)
                  : ""
              }`}</div>
              <div className="text-xs text-indigo-400">{`Started ${getMinutesAgo(game?.start_time)}`}</div>

              <div className="mt-3 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${currentPlayerColor == "white" ? "white" : "black"}`}></div>
                <div className="text-sm">
                  {`${currentPlayerData?.username} (${
                    currentPlayerData?.profile?.ratings[game?.time_control_str ?? "blitz"]
                  })`}{" "}
                  {gameStatus !== "active" &&
                    renderRatingChangeByColor(currentPlayerColor === "white", whiteRatingChange, blackRatingChange)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-${currentPlayerColor == "white" ? "black" : "white"}`}></div>
                <div className="text-sm">
                  {`${opponentPlayerData?.username} (${
                    opponentPlayerData?.profile?.ratings[game?.time_control_str ?? "blitz"]
                  })`}
                  {gameStatus !== "active" &&
                    renderRatingChangeByColor(currentPlayerColor !== "white", whiteRatingChange, blackRatingChange)}
                </div>
              </div>

              <div className="mt-3 text-center py-1 border-y border-slate-700/50">
                {gameStatus === "canceled"
                  ? "Game canceled"
                  : gameStatus === "finished"
                    ? "Game finished"
                    : "Game in progress"}
              </div>
            </div>
            <div className="flex border-b border-slate-700">
              <button className="w-full py-2 text-center text-sm bg-gradient-to-r from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/30 hover:to-purple-600/30 transition-colors">
                Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className="mb-1.5 text-xs">
                  {msg.sender === "system" ? (
                    <div className="italic text-indigo-400 text-[11px]">{msg.message}</div>
                  ) : (
                    <div className="text-[11px]">
                      <span className="font-bold">{msg.sender}: </span>
                      <span>{msg.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-slate-700">
              <form
                onSubmit={(e) => {
                  e.preventDefault()

                  const form = e.target as HTMLFormElement
                  const input = form.elements.namedItem("chatInput") as HTMLInputElement

                  const message = input.value.trim()
                  if (message) {
                    sendMessage(message)
                    input.value = ""
                  }
                }}
                className="flex gap-1"
              >
                <input
                  name="chatInput"
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 px-2 py-1 text-xs rounded"
                >
                  Send
                </button>
              </form>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => sendMessage("Hi!")}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-600/30 hover:to-purple-600/30 py-1 text-xs rounded border border-slate-700"
                >
                  HI
                </button>
                <button
                  onClick={() => sendMessage("Good luck!")}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-600/30 hover:to-purple-600/30 py-1 text-xs rounded border border-slate-700"
                >
                  GL
                </button>
                <button
                  onClick={() => sendMessage("Have fun!")}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-600/30 hover:to-purple-600/30 py-1 text-xs rounded border border-slate-700"
                >
                  HF
                </button>
                <button
                  onClick={() => sendMessage("You too!")}
                  className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-indigo-600/30 hover:to-purple-600/30 py-1 text-xs rounded border border-slate-700"
                >
                  U2
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main game area */}
        <div className="flex-1 flex flex-col items-center justify-between py-4 px-2 md:px-4 relative">
          {/* Opponent's clock (top) */}
          <div className="w-full flex justify-center mb-2">
            <div className="flex flex-col items-center">
              <div
                className={`font-mono font-bold text-center mb-1 px-4 py-2 rounded-lg transition-all duration-300 text-4xl md:text-5xl
                  ${(currentPlayerColor === "white" ? blackTime : whiteTime) <= 60 ? "text-red-500 border border-red-500 shadow-md shadow-red-500/30" : ""}
                  ${(currentPlayerColor === "white" ? blackTime : whiteTime) <= 5 ? "animate-pulse" : ""}
                  ${
                    !isCurrentPlayerTurn && (currentPlayerColor === "white" ? blackTime : whiteTime) > 60
                      ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent border border-indigo-500/40 shadow-md shadow-indigo-500/30"
                      : "text-white/80 border border-transparent"
                  }`}
              >
                {formatTime(currentPlayerColor === "white" ? blackTime : whiteTime)}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-sm">{opponentPlayerData?.username}</div>
              </div>
            </div>
          </div>

          {/* Chess board (center) */}
          <div className="w-full max-w-[min(95vw,600px)] h-[min(95vw,600px)] md:w-[min(80vh,600px)] md:h-[min(80vh,600px)] mx-auto rounded-lg overflow-hidden shadow-lg relative">
            {fen ? (
              <Chess98Board
                ref={boardRef}
                initialFen={fen}
                playerColor={currentPlayerColor === "black" ? "b" : "w"}
                orientation={currentPlayerColor === "black" ? "black" : "white"}
                onMove={(move) => {
                  if (!move) return
                  gameplayService.sendMove(move.uci)
                }}
              />
            ) : (
              <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                {/* Fallback static board */}
                {Array.from({ length: 8 }).map((_, rowIndex) =>
                  Array.from({ length: 8 }).map((_, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0
                    const squareColor = isLight ? "bg-gray-300" : "bg-gray-600"

                    return <div key={`${rowIndex}-${colIndex}`} className={`${squareColor} relative`}></div>
                  }),
                )}
              </div>
            )}

            {/* Blocking overlay when opponent is not ready */}
            {!isOpponentReady && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                <div className="text-center p-6 bg-slate-800/90 rounded-lg shadow-xl border border-indigo-500/30">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    Waiting for opponent
                  </h3>
                  <p className="text-slate-300">Your opponent is connecting to the game...</p>
                </div>
              </div>
            )}

            {/* Add transparent overlay to block interaction when game is over */}
            {gameStatus === "finished" && (
              <div className="absolute inset-0 z-10" style={{ pointerEvents: "all" }}></div>
            )}
          </div>

          {/* Player's clock (bottom) */}
          <div className="w-full flex justify-center mt-2 mb-16 md:mb-2">
            <div className="flex flex-col items-center">
              <div
                className={`font-mono font-bold text-center mb-1 px-4 py-2 rounded-lg transition-all duration-300 text-4xl md:text-5xl
                  ${(currentPlayerColor === "white" ? whiteTime : blackTime) <= 60 ? "text-red-500 border border-red-500 shadow-md shadow-red-500/30" : ""}
                  ${(currentPlayerColor === "white" ? whiteTime : blackTime) <= 5 ? "animate-pulse" : ""}
                  ${
                    isCurrentPlayerTurn && (currentPlayerColor === "white" ? whiteTime : blackTime) > 60
                      ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent border border-indigo-500/40 shadow-md shadow-indigo-500/30"
                      : "text-white/80 border border-transparent"
                  }`}
              >
                {formatTime(currentPlayerColor === "white" ? whiteTime : blackTime)}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-sm">{currentPlayerData?.username}</div>
              </div>
            </div>
          </div>

          {/* Draw offer alert for mobile */}
          {isMobile && drawOffered && (
            <div className="fixed inset-x-0 bottom-16 z-20 px-4">
              <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50 mb-2">
                <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  Draw Offered
                </div>
                <div className="text-white">Your opponent has offered a draw. Do you accept?</div>
                <div className="flex justify-center space-x-2 mt-3">
                  <Button
                    className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-xs h-8"
                    onClick={() => {
                      gameplayService.sendDrawAccept()
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600 text-xs h-8"
                    onClick={declineDraw}
                    variant="outline"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Game status for desktop */}
          {!isMobile && gameStatus !== "active" && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="py-4 px-6 bg-slate-800/90 rounded-lg border border-slate-700/50 shadow-xl">
                <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Game Over
                </div>
                <div className="text-white text-center mb-4">{gameResult}</div>
                <div className="flex justify-center">
                  <Link href={`/game/${gameId}`}>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                      <Activity className="h-4 w-4 mr-2" />
                      Analyze Game
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Game status for mobile */}
          {isMobile && gameStatus !== "active" && (
            <div className="fixed inset-x-0 bottom-16 z-20 px-4">
              <div className="py-3 px-4 bg-slate-800/90 rounded-lg border border-slate-700/50 shadow-xl">
                <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  Game Over
                </div>
                <div className="text-white text-center text-sm mb-3">{gameResult}</div>
                <div className="flex justify-center">
                  <Link href={`/game/${gameId}`}>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar - Game info (desktop only) */}
        {!isMobile && (
          <div className="w-72 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-l border-slate-700">
            {/* Moves list */}
            <div className="flex-1 overflow-y-auto border-y border-slate-700">
              <div className="text-center py-1.5 text-xs font-medium bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                Moves
              </div>
              <div className="grid grid-cols-3 text-xs">
                <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">#</div>
                <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">White</div>
                <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">Black</div>

                {moves.length === 0 ? (
                  <div className="col-span-3 py-2 text-center text-xs text-slate-400">No moves yet</div>
                ) : (
                  moves.map((move, index) => (
                    <React.Fragment key={index}>
                      <div className="py-1 px-2 text-center border-t border-slate-700/50">{index + 1}</div>
                      <div className="py-1 px-2 text-center border-t border-slate-700/50">{move.white}</div>
                      <div className="py-1 px-2 text-center border-t border-slate-700/50">{move.black || ""}</div>
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>

            {/* Game status */}
            <GameStatus
              gameStatus={gameStatus}
              gameResult={gameResult}
              isOpponentReady={isOpponentReady}
              gameStarted={gameStarted}
              drawOffered={drawOffered}
              onAcceptDraw={() => {
                gameplayService.sendDrawAccept()
              }}
              onDeclineDraw={declineDraw}
            />

            {/* Action buttons */}
            <div className="p-3 flex justify-center gap-3">
              {gameStatus === "active" && (
                <>
                  <Button
                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-red-600/80 hover:to-red-700/80 text-white"
                    size="sm"
                    onClick={openResignConfirmation}
                    disabled={gameStatus !== "active" || !isOpponentReady}
                    variant="outline"
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    <span className="text-xs">Resign</span>
                  </Button>
                  <Button
                    className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-indigo-600/80 hover:to-purple-700/80 text-white"
                    size="sm"
                    onClick={openDrawConfirmation}
                    disabled={gameStatus !== "active" || !isOpponentReady}
                    variant="outline"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    <span className="text-xs">Draw</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom bar */}
      {isMobile && (
        <MobileBottomBar
          gameStatus={gameStatus}
          isOpponentReady={isOpponentReady}
          onOpenChat={() => setShowMobileChat(true)}
          onOpenResignConfirmation={openResignConfirmation}
          onOpenDrawConfirmation={openDrawConfirmation}
        />
      )}

      {/* Mobile full-screen chat */}
      {isMobile && showMobileChat && (
        <MobileChat
          messages={chatMessages}
          onSendMessage={sendMessage}
          onClose={() => setShowMobileChat(false)}
          gameInfo={gameInfo}
        />
      )}

      {/* Resign confirmation dialog */}
      <AlertDialog open={showResignConfirmation} onOpenChange={setShowResignConfirmation}>
        <AlertDialogContent className="bg-slate-800 border border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">Resign Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to resign? This will count as a loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResign}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Resign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draw confirmation dialog */}
      <AlertDialog open={showDrawConfirmation} onOpenChange={setShowDrawConfirmation}>
        <AlertDialogContent className="bg-slate-800 border border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">Offer Draw?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to offer a draw? If accepted, the game will end as a draw.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={offerDraw}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
            >
              Offer Draw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  // Helper function for rating changes
  function renderRatingChangeByColor(
    isWhite: boolean,
    whiteRatingChange: number | null,
    blackRatingChange: number | null,
  ) {
    const raw = isWhite ? whiteRatingChange : blackRatingChange
    const ratingChange = Number(raw)

    if (!Number.isFinite(ratingChange)) return null

    const isPositive = ratingChange > 0
    const isZero = ratingChange === 0

    const className = isZero ? "text-slate-400" : isPositive ? "text-green-400" : "text-red-400"

    const sign = isPositive ? "+" : ""

    return (
      <span className={`ml-1 text-xs ${className}`}>
        ({sign}
        {ratingChange})
      </span>
    )
  }
}
