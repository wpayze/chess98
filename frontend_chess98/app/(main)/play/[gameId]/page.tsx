"use client";

import React, { useCallback, useMemo } from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { gameService } from "@/services/game-service";
import { Game } from "@/models/play";
import { useAuthStore } from "@/store/auth-store";
import { gameplayService } from "@/services/gameplay-service";
import GameStatus from "@/components/game/game-status";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

export default function PlayPage() {
  const params = useParams();
  const isMobile = useIsMobile();
  const gameId = params?.gameId as string;

  const { user } = useAuthStore();

  const gameObjRef = useRef<any>(null);

  // State for the game
  const [fen, setFen] = useState<string | null>(null);
  const [chessModule, setChessModule] = useState<any>(null);
  const [gameStatus, setGameStatus] = useState("active"); // active, canceled, finished
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: "system", message: "Connecting to game server..." },
  ]);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  // Opponent loading state
  const [isOpponentReady, setIsOpponentReady] = useState(false);

  // Add these state variables after the other state declarations
  const [showResignConfirmation, setShowResignConfirmation] = useState(false);
  const [showDrawConfirmation, setShowDrawConfirmation] = useState(false);

  // Function to add system messages to chat
  const addSystemMessage = (message: string) => {
    setChatMessages((prev) => [...prev, { sender: "system", message }]);
  };

  // Moves history
  const [moves, setMoves] = useState<
    Array<{ white: string; black: string | null }>
  >([]);

  // Timer state
  const [whiteTime, setWhiteTime] = useState(0);
  const [blackTime, setBlackTime] = useState(0);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [inCheckSquare, setInCheckSquare] = useState<string | null>(null);

  const [whiteRatingChange, setWhiteRatingChange] = useState(0);
  const [blackRatingChange, setBlackRatingChange] = useState(0);
  const [lastMoveFrom, setLastMoveFrom] = useState<string | null>(null);
  const [lastMoveTo, setLastMoveTo] = useState<string | null>(null);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const promotionDataRef = useRef<{
    from: string;
    to: string;
    piece: string;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  //Data
  const [currentPlayerColor, setCurrentPlayerColor] = useState<
    "white" | "black" | null
  >(null);
  const [currentPlayerData, setCurrentPlayerData] = useState<
    Game["white_player"] | Game["black_player"] | null
  >(null);
  const [opponentPlayerData, setOpponentPlayerData] = useState<
    Game["white_player"] | Game["black_player"] | null
  >(null);

  const [isUserReady, setIsUserReady] = useState(false);

  function checkIfInCheck(game: any) {
    if (game.inCheck()) {
      const turnColor = game.turn();
      const kingSquare = findKingSquare(game, turnColor);
      setInCheckSquare(kingSquare);
    } else {
      setInCheckSquare(null);
    }
  }

  useEffect(() => {
    if (user) {
      setIsUserReady(true);
    }
  }, [user]);

  // Initialize chess.js on the client side only
  useEffect(() => {
    const loadChessJs = async () => {
      try {
        const chessModule = await import("chess.js");
        setChessModule(chessModule);
      } catch (error) {
        console.error("Error loading chess.js:", error);
      }
    };

    loadChessJs();
  }, []);

  useEffect(() => {
    if (!game || !user) return;

    gameplayService.connect(game.id, user.id, {
      onWaitingForOpponent: () => {
        setIsOpponentReady(false);
        addSystemMessage("Waiting for opponent to join...");
      },
      onGameReady: (data) => {
        setIsOpponentReady(true);
        setFen(data.initial_fen);
        setWhiteTime(data.your_time);
        setBlackTime(data.opponent_time);
        setIsWhiteTurn(data.turn === "white");
        addSystemMessage("Opponent has joined the game.");
        addSystemMessage("Game started. Good luck!");

        if (chessModule) {
          const Chess = chessModule.Chess;
          gameObjRef.current = new Chess(data.initial_fen);
        }
      },
      onReconnected: () => {
        setGameStarted(true);
        addSystemMessage("You reconnected to the game.");
      },
      onMoveMade: (data) => {
        if (!gameStarted) setGameStarted(true);

        setFen(data.fen);
        setWhiteTime(data.white_time);
        setBlackTime(data.black_time);
        setIsWhiteTurn(data.turn === "white");

        if (gameObjRef.current) {
          gameObjRef.current.load(data.fen);
          checkIfInCheck(gameObjRef.current);
        } else if (chessModule) {
          console.warn("Reloaded chess module");
          const Chess = chessModule.Chess;
          gameObjRef.current = new Chess(data.fen);
          checkIfInCheck(gameObjRef.current);
        }

        const from = data.uci?.substring(0, 2);
        const to = data.uci?.substring(2, 4);
        setLastMoveFrom(from);
        setLastMoveTo(to);

        // Update moves
        setMoves((prev) => {
          const newMoves = [...prev];

          if (data.turn === "black") {
            newMoves.push({ white: data.san, black: null });
          } else {
            if (newMoves.length > 0) {
              newMoves[newMoves.length - 1].black = data.san;
            }
          }
          return newMoves;
        });

        console.log("Move made:", data.san, "UCI:", data.uci);
      },
      onGameOver: (data) => {
        setGameStatus("finished");

        let resultText = "";
        let customMessage = "";

        if (data.result === "draw") {
          resultText = `Game drawn by ${terminationToText(data.termination)}`;
          customMessage = resultText;
        } else if (data.termination === "timeout") {
          const winner = data.result === "white_win" ? "White" : "Black";
          const loser = winner === "White" ? "Black" : "White";
          resultText = `${winner} wins by timeout`;
          customMessage = `${loser}'s time has run out. ${winner} wins!`;
        } else {
          const winner = data.result === "white_win" ? "White" : "Black";
          resultText = `${winner} wins by ${terminationToText(
            data.termination
          )}`;
          customMessage = resultText;
        }

        if (
          data.white_rating_change !== undefined &&
          data.white_rating_change !== null
        ) {
          setWhiteRatingChange(data.white_rating_change);
        }
        if (
          data.black_rating_change !== undefined &&
          data.black_rating_change !== null
        ) {
          setBlackRatingChange(data.black_rating_change);
        }

        setGameResult(resultText);
        addSystemMessage(customMessage);
      },
      onChatMessage: ({ from, message }) => {
        setChatMessages((prev) => [...prev, { sender: from, message }]);
      },
      onDrawOfferReceived: ({ from }) => {
        console.log({ from, user });
        if (from === user.id) return;

        setDrawOffered(true);
        addSystemMessage("Opponent offered a draw.");
      },
      onDrawOfferDeclined: ({ from }) => {
        addSystemMessage("Draw declined.");
      },
    });

    return () => {
      gameplayService.disconnect();
    };
  }, [game, user]);

  useEffect(() => {
    if (!gameId || !isUserReady) return;

    const fetchGame = async () => {
      try {
        const fetchedGame = await gameService.getGameById(gameId);
        setGame(fetchedGame);

        const [baseMinutesStr] = fetchedGame.time_control.split("+");
        const baseMinutes = parseInt(baseMinutesStr, 10);
        const initialTimeInSeconds = baseMinutes * 60;

        setWhiteTime(initialTimeInSeconds);
        setBlackTime(initialTimeInSeconds);

        const { white_player, black_player } = fetchedGame;

        if (user?.id === white_player.id) {
          setCurrentPlayerColor("white");
          setCurrentPlayerData(white_player);
          setOpponentPlayerData(black_player);
        } else if (user?.id === black_player.id) {
          setCurrentPlayerColor("black");
          setCurrentPlayerData(black_player);
          setOpponentPlayerData(white_player);
        } else {
          console.warn("User is not a participant in this game.");
        }
      } catch (error) {
        console.error("Failed to fetch game:", error);
      }
    };

    fetchGame();
  }, [gameId, isUserReady]);

  // Timer effect - only run when game has started
  useEffect(() => {
    if (!gameStarted || gameStatus !== "active") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = setInterval(() => {
      if (isWhiteTurn) {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            gameplayService.sendTimeoutCheck();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            gameplayService.sendTimeoutCheck();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    timerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [gameStarted, gameStatus, isWhiteTurn]);

  function terminationToText(reason: string) {
    switch (reason) {
      case "checkmate":
        return "CheckMate";
      case "resignation":
        return "Resignation";
      case "timeout":
        return "TimeOut";
      case "draw_agreement":
        return "Draw Agreement";
      case "stalemate":
        return "StaleMate";
      case "insufficient_material":
        return "Insufficient Material";
      case "fifty_move_rule":
        return "50-move rule";
      case "threefold_repetition":
        return "threefold repetition";
      default:
        return reason;
    }
  }

  function handleSquareClick(square: string) {
    const game = gameObjRef.current;
    if (!game || gameStatus !== "active") return;

    const playerColor = currentPlayerColor === "white" ? "w" : "b";
    const pieceAtSquare = game.get(square);

    console.log({ pieceAtSquare });

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setSelectedPiece(null);
      return;
    }

    if (!selectedSquare) {
      if (pieceAtSquare?.color === playerColor) {
        setSelectedSquare(square);
        setSelectedPiece(
          `${pieceAtSquare.color}${pieceAtSquare.type.toUpperCase()}`
        );
      }
      return;
    }

    if (pieceAtSquare?.color === playerColor) {
      setSelectedSquare(square);
      setSelectedPiece(
        `${pieceAtSquare.color}${pieceAtSquare.type.toUpperCase()}`
      );
      return;
    }

    if (selectedPiece) {
      const isPromotion =
        selectedPiece[1] === "P" &&
        ((currentPlayerColor === "white" && square[1] === "8") ||
          (currentPlayerColor === "black" && square[1] === "1"));

      if (isPromotion) {
        promotionDataRef.current = {
          from: selectedSquare,
          to: square,
          piece: selectedPiece,
        };
        console.log("OPEN PROMOTION!");
        setIsPromotionDialogOpen(true);
        return;
      }

      handleMove(selectedSquare, square, selectedPiece);
    }
  }

  function safeMove(
    game: any,
    from: string,
    to: string,
    promotion: string
  ): any | null {
    const legalMoves = game.moves({ square: from, verbose: true });
    const found = legalMoves.find((m: any) => m.to === to);

    if (!found) return null;

    const move = game.move({
      from,
      to,
      promotion,
    });

    return move ?? null;
  }

  function handleMove(
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ): boolean {
    const game = gameObjRef.current;
    if (!game || !chessModule || !isOpponentReady || !game) {
      console.error(
        "Chess module, game object not loaded, or opponent not ready"
      );
      return false;
    }

    const pieceColor = piece[0]; // "w" or "b"
    const isWhitePiece = pieceColor === "w";
    const isPlayerWhite = currentPlayerColor === "white";

    if ((isWhitePiece && !isPlayerWhite) || (!isWhitePiece && isPlayerWhite)) {
      console.warn("Attempted to move opponent's piece");
      return false;
    }

    try {
      const promotionChar = piece[1].toLowerCase();
      const move = safeMove(game, sourceSquare, targetSquare, promotionChar);

      if (!move) {
        debugger;
        console.log("No move: ", move);
        return false;
      }

      setFen(game.fen());

      const uci = `${sourceSquare}${targetSquare}${move.promotion || ""}`;
      gameplayService.sendMove(uci);

      setSelectedSquare(null);
      setSelectedPiece(null);

      return true;
    } catch (err) {
      console.error("Move error:", err);
      return false;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    return handleMove(sourceSquare, targetSquare, piece);
  }

  function findKingSquare(game: any, color: "w" | "b"): string | null {
    const board = game.board();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = board[row][col];
        if (square && square.type === "k" && square.color === color) {
          const file = "abcdefgh"[col];
          const rank = `${8 - row}`;
          return `${file}${rank}`;
        }
      }
    }

    return null;
  }

  const declineDraw = () => {
    setDrawOffered(false);
    addSystemMessage("Draw declined.");
    gameplayService.sendDrawDecline();
  };

  // Replace the handleResign function with this:
  const openResignConfirmation = () => {
    if (gameStatus !== "active") return;
    setShowResignConfirmation(true);
  };

  const confirmResign = () => {
    if (gameStatus !== "active" || !isOpponentReady) return;
    gameplayService.sendResign();
    setShowResignConfirmation(false);
  };

  const openDrawConfirmation = () => {
    if (gameStatus !== "active") return;
    setShowDrawConfirmation(true);
  };

  const offerDraw = () => {
    if (gameStatus !== "active" || !isOpponentReady) return;
    gameplayService.sendDrawOffer();
    addSystemMessage("You offered a Draw.");
    setShowDrawConfirmation(false);
  };

  function renderClock({
    time,
    isCurrentPlayerTurn,
    isOpponent,
    isMobile = false,
  }: {
    time: number;
    isCurrentPlayerTurn: boolean;
    isOpponent: boolean;
    isMobile?: boolean;
  }) {
    const isLowTime = time <= 60;
    const isCritical = time <= 5;

    const baseClasses = [
      "font-mono font-bold text-center mb-1 px-4 py-2 rounded-lg transition-all duration-300",
      isLowTime &&
        "text-red-500 border border-red-500 shadow-md shadow-red-500/30",
      isCritical && "animate-pulse",
      isCurrentPlayerTurn &&
        !isLowTime &&
        "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent border border-indigo-500/40 shadow-md shadow-indigo-500/30",
      !isCurrentPlayerTurn && !isLowTime && "text-white/80",
      isOpponent ? "text-4xl md:text-5xl" : "text-4xl md:text-5xl",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${isMobile ?? "p-3"} flex flex-col items-center`}>
        <div className={baseClasses}>{formatTime(time)}</div>
      </div>
    );
  }

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getMinutesAgo = (isoTime: string | undefined) => {
    if (!isoTime) return "";

    const start = new Date(isoTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    return diffMin <= 0
      ? "just now"
      : `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  };

  const sendMessage = (message: string) => {
    if (!currentPlayerData?.username) return;
    if (!message) return;

    gameplayService.sendChatMessageWebSocket(
      currentPlayerData.username,
      message
    );
  };

  function renderRatingChangeByColor(
    isWhite: boolean,
    whiteRatingChange: number | null,
    blackRatingChange: number | null
  ) {
    const raw = isWhite ? whiteRatingChange : blackRatingChange;
    const ratingChange = Number(raw);

    if (!Number.isFinite(ratingChange)) return null;

    const isPositive = ratingChange > 0;
    const isZero = ratingChange === 0;

    const className = isZero
      ? "text-slate-400"
      : isPositive
      ? "text-green-400"
      : "text-red-400";

    const sign = isPositive ? "+" : "";

    return (
      <span className={`ml-1 text-xs ${className}`}>
        ({sign}
        {ratingChange})
      </span>
    );
  }

  const boardStyles = useMemo(() => {
    return {
      ...(inCheckSquare && {
        [inCheckSquare]: {
          backgroundColor: "rgba(239, 68, 68, 0.6)",
          boxShadow: "inset 0 0 0 3px rgba(220, 38, 38, 0.8)",
        },
      }),
      ...(selectedSquare && {
        [selectedSquare]: {
          backgroundColor: "rgba(255, 215, 0, 0.4)",
        },
      }),
      ...(lastMoveFrom && {
        [lastMoveFrom]: {
          backgroundColor: "rgba(144, 238, 144, 0.25)",
        },
      }),
      ...(lastMoveTo && {
        [lastMoveTo]: {
          backgroundColor: "rgba(144, 238, 144, 0.25)",
        },
      }),
    };
  }, [inCheckSquare, selectedSquare, lastMoveFrom, lastMoveTo]);

  const isCurrentPlayerTurn =
    (currentPlayerColor === "white" && isWhiteTurn) ||
    (currentPlayerColor === "black" && !isWhiteTurn);

  if (
    !game ||
    !user ||
    !currentPlayerData ||
    !opponentPlayerData ||
    !currentPlayerColor
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex flex-col">
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left sidebar - Chat */}
        <div
          className={`${
            showChat ? "h-64 md:h-auto md:w-64" : "h-0 md:w-0"
          } bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-r border-slate-700 transition-all duration-300 ease-in-out overflow-hidden md:overflow-visible ${
            showChat
              ? "opacity-100 translate-y-0 md:translate-x-0"
              : "opacity-0 -translate-y-full md:-translate-x-full"
          }`}
        >
          {" "}
          <div className="p-3 border-b border-slate-700">
            <div className="text-sm text-indigo-300 mb-1">{`${
              game?.time_control
            } • Rated • ${
              game?.time_control_str
                ? game?.time_control_str.charAt(0).toUpperCase() +
                  game.time_control_str.slice(1)
                : ""
            }`}</div>
            <div className="text-xs text-indigo-400">{`Started ${getMinutesAgo(
              game?.start_time
            )}`}</div>

            <div className="mt-3 flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full bg-${
                  currentPlayerColor == "white" ? "white" : "black"
                }`}
              ></div>
              <div className="text-sm">
                {`${currentPlayerData?.username} (${
                  currentPlayerData?.profile?.ratings[
                    game?.time_control_str ?? "blitz"
                  ]
                })`}{" "}
                {gameStatus !== "active" &&
                  renderRatingChangeByColor(
                    currentPlayerColor === "white",
                    whiteRatingChange,
                    blackRatingChange
                  )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full bg-${
                  currentPlayerColor == "white" ? "black" : "white"
                }`}
              ></div>
              <div className="text-sm">
                {`${opponentPlayerData?.username} (${
                  opponentPlayerData?.profile?.ratings[
                    game?.time_control_str ?? "blitz"
                  ]
                })`}
                {gameStatus !== "active" &&
                  renderRatingChangeByColor(
                    currentPlayerColor !== "white",
                    whiteRatingChange,
                    blackRatingChange
                  )}
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
            {/* 
          <button className="flex-1 py-2 text-center text-sm hover:bg-slate-800/30 transition-colors">
            Notes
          </button>
          */}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className="mb-1.5 text-xs">
                {msg.sender === "system" ? (
                  <div className="italic text-indigo-400 text-[11px]">
                    {msg.message}
                  </div>
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
                e.preventDefault();

                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem(
                  "chatInput"
                ) as HTMLInputElement;

                const message = input.value.trim();
                if (message) {
                  sendMessage(message);
                  input.value = "";
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

        {/* Botones moviles de resign y draw */}
        {isMobile && (
          <>
            <div className="flex justify-center gap-3">
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
              {gameStatus !== "active" && (
                <Link
                  href={`/game/${gameId}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-indigo-600/80 hover:to-purple-700/80 text-white h-8 px-3"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  <span className="text-xs">Analyze</span>
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center">
              {renderClock({
                time: currentPlayerColor === "white" ? blackTime : whiteTime,
                isCurrentPlayerTurn: !isCurrentPlayerTurn,
                isOpponent: true,
                isMobile: true,
              })}
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-sm">{opponentPlayerData?.username}</div>
              </div>
            </div>
          </>
        )}

        {/* Chess board - Center */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Toggle chat button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`fixed md:top-1/2 bottom-4 md:bottom-auto md:transform md:-translate-y-1/2 transition-all duration-300 z-10 p-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-md md:rounded-r-md shadow-md ${
              showChat ? "left-4 md:left-[256px]" : "left-4 md:left-0"
            }`}
          >
            {showChat ? (
              <ChevronLeft className="h-4 w-4 text-white hidden md:block" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white hidden md:block" />
            )}
          </button>

          {/* Chess board */}
          <div className="w-full max-w-[min(95vw,600px)] h-[min(95vw,600px)] md:w-[min(80vh,600px)] md:h-[min(80vh,600px)] mx-auto rounded-lg overflow-hidden shadow-lg relative">
            {chessModule && fen ? (
              <ChessboardComponent
                id="BasicBoard"
                arePremovesAllowed={true}
                clearPremovesOnRightClick={true}
                animationDuration={200}
                position={fen}
                onPieceDrop={onDrop}
                onSquareClick={handleSquareClick}
                boardOrientation={
                  currentPlayerColor === "black" ? "black" : "white"
                }
                customBoardStyle={{
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                }}
                customDarkSquareStyle={{ backgroundColor: "#4a5568" }}
                customLightSquareStyle={{ backgroundColor: "#cbd5e0" }}
                showBoardNotation={true}
                customSquareStyles={boardStyles}
                promotionDialogVariant={"modal"}
                showPromotionDialog={isPromotionDialogOpen}
                onPromotionPieceSelect={(piece, from, to) => {
                  if (promotionDataRef.current) {
                    // Fue click-to-move
                    const selectedPiece = promotionDataRef.current.piece;
                    const refFrom = promotionDataRef.current.from;
                    const refTo = promotionDataRef.current.to;
                    promotionDataRef.current = null;
                    setIsPromotionDialogOpen(false);
                    return handleMove(refFrom, refTo, piece ?? "");
                  }

                  if (!piece || !from || !to) return false;
                  handleMove(from, to, piece);
                  return true;
                }}
              />
            ) : (
              <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                {/* Fallback static board */}
                {Array.from({ length: 8 }).map((_, rowIndex) =>
                  Array.from({ length: 8 }).map((_, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const squareColor = isLight ? "bg-gray-300" : "bg-gray-600";

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`${squareColor} relative`}
                      ></div>
                    );
                  })
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
                  <p className="text-slate-300">
                    Your opponent is connecting to the game...
                  </p>
                </div>
              </div>
            )}

            {/* Add transparent overlay to block interaction when game is over */}
            {gameStatus === "finished" && (
              <div
                className="absolute inset-0 z-10"
                style={{ pointerEvents: "all" }}
              ></div>
            )}
          </div>
        </div>

        {/* Right sidebar - Game info */}
        <div className="w-full md:w-72 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-t md:border-t-0 md:border-l border-slate-700">
          {" "}
          {/* Top player (opponent) */}
          {!isMobile && (
            <div className="p-3 flex flex-col items-center">
              {renderClock({
                time: currentPlayerColor === "white" ? blackTime : whiteTime,
                isCurrentPlayerTurn: !isCurrentPlayerTurn,
                isOpponent: true,
              })}

              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-sm">{opponentPlayerData?.username}</div>
              </div>
            </div>
          )}
          {/* Moves list */}
          <div className="hidden md:block flex-1 overflow-y-auto border-y border-slate-700 max-h-40 md:max-h-none">
            <div className="text-center py-1.5 text-xs font-medium bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              Moves
            </div>
            <div className="grid grid-cols-3 text-xs">
              <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                #
              </div>
              <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                White
              </div>
              <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                Black
              </div>

              {moves.length === 0 ? (
                <div className="col-span-3 py-2 text-center text-xs text-slate-400">
                  No moves yet
                </div>
              ) : (
                moves.map((move, index) => (
                  <React.Fragment key={index}>
                    <div className="py-1 px-2 text-center border-t border-slate-700/50">
                      {index + 1}
                    </div>
                    <div className="py-1 px-2 text-center border-t border-slate-700/50">
                      {move.white}
                    </div>
                    <div className="py-1 px-2 text-center border-t border-slate-700/50">
                      {move.black || ""}
                    </div>
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
              gameplayService.sendDrawAccept();
            }}
            onDeclineDraw={declineDraw}
          />
          {/* Bottom player (current player) */}
          <div className="p-3 flex flex-col items-center">
            {renderClock({
              time: currentPlayerColor === "white" ? whiteTime : blackTime,
              isCurrentPlayerTurn,
              isOpponent: false,
              isMobile: isMobile,
            })}

            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="text-sm">{currentPlayerData?.username}</div>
            </div>

            <div className="flex justify-center gap-3">
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
              {gameStatus !== "active" && (
                <Link
                  href={`/game/${gameId}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 hover:from-indigo-600/80 hover:to-purple-700/80 text-white h-8 px-3"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  <span className="text-xs">Analyze</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resign confirmation dialog */}
      <AlertDialog
        open={showResignConfirmation}
        onOpenChange={setShowResignConfirmation}
      >
        <AlertDialogContent className="bg-slate-800 border border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              Resign Game?
            </AlertDialogTitle>
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
      <AlertDialog
        open={showDrawConfirmation}
        onOpenChange={setShowDrawConfirmation}
      >
        <AlertDialogContent className="bg-slate-800 border border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              Offer Draw?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to offer a draw? If accepted, the game will
              end as a draw.
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
  );
}
