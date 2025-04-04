"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
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

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

export default function PlayPage() {
  const router = useRouter();

  const params = useParams();
  const gameId = params?.gameId as string;

  const { user } = useAuthStore();

  // State for the game
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  ); // Initial position
  const [chessModule, setChessModule] = useState<any>(null);
  const [gameObj, setGameObj] = useState<any>(null);
  const [gameStatus, setGameStatus] = useState("active"); // active, canceled, finished
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  const [turn, setTurn] = useState("w"); // w for white, b for black
  const [chatMessages, setChatMessages] = useState([
    { sender: "system", message: "Connecting to game server..." },
  ]);
  const [game, setGame] = useState<Game | null>(null);

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
        const Chess = chessModule.Chess;
        const game = new Chess();
        setGameObj(game);
        console.log("Chess.js loaded successfully");
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
        addSystemMessage("Opponent has joined the game.");
        addSystemMessage("Game started. Good luck!");
      },
      onMoveMade: (data) => {
        if (!gameStarted) setGameStarted(true);

        setFen(data.fen);
        setWhiteTime(data.white_time);
        setBlackTime(data.black_time);
        setTurn(data.turn === "white" ? "w" : "b");
        setIsWhiteTurn(data.turn === "white");

        // Update chess.js game state
        if (chessModule) {
          const Chess = chessModule.Chess;
          const updatedGame = new Chess(data.fen);
          setGameObj(updatedGame);
        }

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
        setGameStatus("finished")
      
        let resultText = ""
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
          resultText = `${winner} wins by ${terminationToText(data.termination)}`;
          customMessage = resultText;
        }

        setGameResult(resultText)
        addSystemMessage(customMessage)
      },
      onChatMessage: ({ from, message }) => {
        setChatMessages((prev) => [...prev, { sender: from, message }]);
      },
      
      onDrawOfferReceived: ({ from }) => {
        addSystemMessage("Opponent offered a draw.");
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
            gameplayService.sendTimeoutCheck()
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            gameplayService.sendTimeoutCheck()
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

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    if (!gameObj || !chessModule || !isOpponentReady || !game) {
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
      const Chess = chessModule.Chess;
      const gameCopy = new Chess(gameObj.fen());

      let promotionChar = piece[1].toLowerCase();

      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: promotionChar,
      });

      if (!move) {
        console.warn("Illegal move:", sourceSquare, targetSquare);
        return false;
      }

      setGameObj(gameCopy);
      setFen(gameCopy.fen());

      // Send move to server
      const uci = `${sourceSquare}${targetSquare}${move.promotion || ""}`
      gameplayService.sendMove(uci);

      return true;
    } catch (err) {
      console.error("Move error:", err);
      return false;
    }
  }

  // Replace the handleResign function with this:
  const openResignConfirmation = () => {
    if (gameStatus !== "active") return;
    setShowResignConfirmation(true);
  };

  const confirmResign = () => {
    if (gameStatus !== "active" || !isOpponentReady) return;
    gameplayService.sendResign();
    setShowResignConfirmation(false)
  };

  const openDrawConfirmation = () => {
    if (gameStatus !== "active") return;
    setShowDrawConfirmation(true);
  };

  const offerDraw = () => {
    if (gameStatus !== "active" || !isOpponentReady) return;
    gameplayService.sendDrawOffer();
    setShowDrawConfirmation(false);
  };

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
    gameplayService.sendChatMessageWebSocket(currentPlayerData.username, message);
  };

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
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Chat */}
        <div
          className={`w-64 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-r border-slate-700 transition-all duration-300 ease-in-out ${
            showChat
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-full w-0"
          }`}
        >
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
              <div className="text-sm">{`${currentPlayerData?.username} (${
                currentPlayerData?.profile?.ratings[
                  game?.time_control_str ?? "blitz"
                ]
              })`}</div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full bg-${
                  currentPlayerColor == "white" ? "black" : "white"
                }`}
              ></div>
              <div className="text-sm">{`${opponentPlayerData?.username} (${
                opponentPlayerData?.profile?.ratings[
                  game?.time_control_str ?? "blitz"
                ]
              })`}</div>
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
                const input = form.elements.namedItem("chatInput") as HTMLInputElement;
              
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

        {/* Chess board - Center */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Toggle chat button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`fixed top-1/2 transform -translate-y-1/2 transition-all duration-300 z-10 p-1 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-r-md shadow-md ${
              showChat ? "left-[256px]" : "left-0"
            }`}
          >
            {showChat ? (
              <ChevronLeft className="h-4 w-4 text-white" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white" />
            )}
          </button>

          {/* Chess board */}
          <div className="w-[min(80vh,600px)] h-[min(80vh,600px)] rounded-lg overflow-hidden shadow-lg relative">
            {chessModule ? (
              <ChessboardComponent
                id="BasicBoard"
                arePremovesAllowed={true}
                clearPremovesOnRightClick={true}
                animationDuration={200}
                position={fen}
                onPieceDrop={gameStatus === "active" ? onDrop : () => false}
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
        <div className="w-72 bg-gradient-to-b from-slate-800/90 to-slate-900/90 text-white flex flex-col border-l border-slate-700">
          {/* Top player (opponent) */}
          <div className="p-3 flex flex-col items-center">
            <div
              className={`text-5xl font-mono font-bold text-center mb-1 ${
                !isCurrentPlayerTurn
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                  : "text-white/80"
              }`}
            >
              {currentPlayerColor == "white"
                ? formatTime(blackTime)
                : formatTime(whiteTime)}
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="text-sm">{opponentPlayerData?.username}</div>
            </div>
          </div>

          {/* Moves list */}
          <div className="flex-1 overflow-y-auto border-y border-slate-700">
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
          <div className="p-2 text-center">
            {gameStatus === "finished" ? (
              <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50">
                <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  Game Over
                </div>
                <div className="text-white">{gameResult}</div>
                <Button
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 mt-3 text-xs h-8"
                  onClick={() => router.push("/")}
                >
                  Return to Home
                </Button>
              </div>
            ) : (
              <div className="text-sm text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold px-4">
                {!isOpponentReady
                  ? "Waiting for opponent"
                  : !gameStarted
                  ? "Make a move to start the game"
                  : gameStatus === "canceled"
                  ? "Game canceled"
                  : ""}
              </div>
            )}
          </div>

          {/* Bottom player (current player) */}
          <div className="p-3 flex flex-col items-center">
            <div
              className={`text-5xl font-mono font-bold text-center mb-1 ${
                isCurrentPlayerTurn
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                  : "text-white/80"
              }`}
            >
              {currentPlayerColor == "white"
                ? formatTime(whiteTime)
                : formatTime(blackTime)}
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="text-sm">{currentPlayerData?.username}</div>
            </div>

            <div className="flex justify-center gap-3">
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
