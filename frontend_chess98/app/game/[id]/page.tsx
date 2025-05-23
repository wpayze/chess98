"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Activity,
  Download,
  Flag,
  RotateCcw,
  Clock,
} from "lucide-react";
import dynamic from "next/dynamic";
import { gameService } from "@/services/game-service";
import type { Game } from "@/models/play";
import { StockfishService } from "@/services/stockfish-service";
import { Square } from "react-chessboard/dist/chessboard/types";
import { SimpleEvaluationBar } from "@/components/simple-evaluation-bar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettingsStore } from "@/store/settings-store";
import { getBoardColors } from "@/utils/boardTheme";
import { getCustomPieces } from "@/utils/pieces";

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

// Define a type for our processed moves
interface ProcessedMove {
  moveNumber: number;
  white: {
    notation: string;
    fen: string;
    move: string;
  };
  black?: {
    notation: string;
    fen: string;
    move: string;
  } | null;
}

export default function GameViewPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const boardContainerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [fen, setFen] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms between moves
  const [playbackInterval, setPlaybackInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [boardHeight, setBoardHeight] = useState(0);
  const [processedMoves, setProcessedMoves] = useState<ProcessedMove[]>([]);
  const [chessModule, setChessModule] = useState<any>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stockfishService, setStockfishService] =
    useState<StockfishService | null>(null);

  const [currentEvaluation, setCurrentEvaluation] = useState<number>(0);
  const [currentDepth, setCurrentDepth] = useState<number | null>(null);
  const [mateIn, setMateIn] = useState<number | null>(null);

  const [engineLoading, setEngineLoading] = useState(true);
  const [engineName, setEngineName] = useState("");
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white"
  );

  const currentMoveIndexRef = useRef(0);
  const fenRef = useRef<string>("");

  const isMobile = useIsMobile();
  const chosenDepth = isMobile ? 25 : 30;

  const { settings } = useSettingsStore()
  const boardColors = getBoardColors(settings?.board_theme || "default")
  const pieces = getCustomPieces(settings?.piece_set || "default")

  useEffect(() => {
    currentMoveIndexRef.current = currentMoveIndex;
  }, [currentMoveIndex]);

  useEffect(() => {
    if (fen) {
      fenRef.current = fen;
    }
  }, [fen]);

  const [bestArrow, setBestArrow] = useState<[Square, Square] | null>(null);

  // Load chess.js
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
    const sfService = new StockfishService();
    setEngineName(sfService.getScriptPath());
    setEngineLoading(true);

    sfService.setOnEngineSwitch(() => {
      setEngineName(sfService.getScriptPath());
    });

    sfService.setOnMessageCallback((message) => {
      if (message.includes("uciok")) {
        setEngineLoading(false);
      }

      if (!message.startsWith("info")) return;
      setEngineLoading(false);

      const parsed = parseEvaluation(message);
      const currentFen = fenRef.current;
      if (!parsed || !currentFen.includes(" ")) return;

      let turn = "w";
      if (currentFen && currentFen.includes(" ")) {
        const parts = currentFen.split(" ");
        if (parts.length >= 2) {
          turn = parts[1];
        }
      }

      // Ajustar score según turno
      const adjustedScore = turn === "b" ? -parsed.score : parsed.score;

      if (parsed.scoreType === "mate") {
        setMateIn(adjustedScore); // positivo: da mate, negativo: recibe mate
        setCurrentEvaluation(adjustedScore > 0 ? 100 : -100); // barra al máximo
      } else {
        setMateIn(null);
        setCurrentEvaluation(adjustedScore);
      }

      // Extraer profundidad
      const match = message.match(/depth (\d+)/);
      if (match) {
        setCurrentDepth(parseInt(match[1], 10));
      }

      // Flecha de mejor jugada
      if (parsed.bestMove && parsed.bestMove.length >= 4) {
        const from = parsed.bestMove.slice(0, 2) as Square;
        const to = parsed.bestMove.slice(2, 4) as Square;
        setBestArrow([from, to]);
      }
    });

    setStockfishService(sfService);

    return () => {
      sfService.terminate();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const analyze = async () => {
      if (!isAnalyzing || !stockfishService) return;
      try {
        setCurrentEvaluation(0);
        setMateIn(null);
        setCurrentDepth(null);
        await stockfishService.restartAnalysis(fen, chosenDepth);
        if (!isCancelled) {
          setBestArrow(null);
        }
      } catch (err) {
        console.error("Error during analysis:", err);
      }
    };

    const timeout = setTimeout(() => {
      analyze();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [fen]);

  const handleToggleAnalyze = () => {
    if (!stockfishService) return;

    if (isAnalyzing) {
      stockfishService.stopAnalysis();
      setBestArrow(null);
      setIsAnalyzing(false);
    } else {
      stockfishService.startAnalysis(fen, chosenDepth);
      setIsAnalyzing(true);
    }
  };

  const handleRotateBoard = () => {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  function parseEvaluation(message: string): {
    scoreType: "cp" | "mate";
    score: number;
    bestMove?: string;
    pv?: string[];
  } | null {
    if (!message.startsWith("info")) return null;

    const scoreMatch = message.match(/score (cp|mate) (-?\d+)/);
    const bestMoveMatch = message.match(/pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
    const pvMatch = message.match(/pv ((?:[a-h][1-8][a-h][1-8][qrbn]? ?)+)/);

    if (!scoreMatch) return null;

    const [_, type, value] = scoreMatch;
    const numericValue = parseInt(value, 10);

    const score = type === "cp" ? numericValue / 100 : numericValue;

    return {
      scoreType: type as "cp" | "mate",
      score,
      bestMove: bestMoveMatch?.[1],
      pv: pvMatch?.[1]?.trim().split(" "),
    };
  }

  const isValidPgn = (pgn: string): boolean => {
    return /\d+\.\s*[a-zA-Z]/.test(pgn);
  };

  const convertLineMovesToPgn = (rawMoves: string): string => {
    const moves = rawMoves.split(/\s+|\n/).filter(Boolean);
    let pgn = "";
    for (let i = 0; i < moves.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const white = moves[i];
      const black = moves[i + 1] ?? "";
      pgn += `${moveNumber}. ${white} ${black} `;
    }
    return pgn.trim();
  };

  // Process PGN into moves with FEN positions
  const processPgn = (pgn: string, initialFen: string) => {
    if (!chessModule) return [];

    try {
      const Chess = chessModule.Chess;
      const chess = initialFen ? new Chess(initialFen) : new Chess();

      // Verificar formato y convertir si es necesario
      const cleanRawPgn = pgn.trim();
      const normalizedPgn = isValidPgn(cleanRawPgn)
        ? cleanRawPgn
        : convertLineMovesToPgn(cleanRawPgn);

      // Limpiar comentarios, anotaciones, etc.
      const cleanPgn = normalizedPgn
        .replace(/\{[^}]*\}/g, "") // Quitar comentarios
        .replace(/\$\d+/g, "") // Quitar anotaciones NAG
        .trim();

      // Separar en jugadas por número (1. e4 e5 2. Nf3 Nc6 ...)
      const moveTexts = cleanPgn.split(/\d+\./).filter(Boolean);
      const processedMoves: ProcessedMove[] = [];
      let moveNumber = 1;

      for (const moveText of moveTexts) {
        const parts = moveText.trim().split(/\s+/).filter(Boolean);

        if (parts.length > 0) {
          const whiteMove = parts[0];
          const blackMove = parts.length > 1 ? parts[1] : null;

          const whiteFenBefore = chess.fen();
          const validWhiteMove = chess.move(whiteMove, { sloppy: true });

          if (!validWhiteMove) continue;

          const whiteFenAfter = chess.fen();

          const move: ProcessedMove = {
            moveNumber,
            white: {
              notation: whiteMove,
              fen: whiteFenAfter,
              move: validWhiteMove.san,
            },
          };

          if (blackMove) {
            const blackFenBefore = chess.fen();
            const validBlackMove = chess.move(blackMove, { sloppy: true });

            if (validBlackMove) {
              const blackFenAfter = chess.fen();

              move.black = {
                notation: blackMove,
                fen: blackFenAfter,
                move: validBlackMove.san,
              };
            }
          }

          processedMoves.push(move);
          moveNumber++;
        }
      }

      return processedMoves;
    } catch (error) {
      console.error("Error processing PGN:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      try {
        const gameData: Game = await gameService.getGameById(gameId);
        setGame(gameData);
        setFen(
          gameData.initial_fen ||
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        );
      } catch (error) {
        console.error("Error loading game:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();

    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [gameId]);

  // Process PGN when game and chess.js are loaded
  useEffect(() => {
    if (game && chessModule && game.pgn) {
      const moves = processPgn(game.pgn, game.initial_fen);
      setProcessedMoves(moves);
    }
  }, [game, chessModule]);

  useEffect(() => {
    if (!boardContainerRef.current) return;

    const updateBoardHeight = () => {
      if (boardContainerRef.current) {
        const height = boardContainerRef.current.offsetHeight;
        setBoardHeight(height);
      }
    };

    updateBoardHeight();

    const resizeObserver = new ResizeObserver(updateBoardHeight);
    resizeObserver.observe(boardContainerRef.current);

    return () => {
      if (boardContainerRef.current) {
        resizeObserver.unobserve(boardContainerRef.current);
      }
    };
  }, [isLoading]);

  // Handle move navigation
  const goToMove = (index: number) => {
    if (!game || processedMoves.length === 0) return;

    // Calculate the actual move (white or black)
    const moveCount =
      processedMoves.length * 2 -
      (processedMoves[processedMoves.length - 1].black ? 0 : 1);

    // Ensure index is within bounds
    if (index < 0) index = 0;
    if (index > moveCount) index = moveCount;

    setCurrentMoveIndex(index);

    // If index is 0, show initial position
    if (index === 0) {
      setFen(
        game.initial_fen ||
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      );
      return;
    }

    // Calculate which move to show
    const moveNumber = Math.floor((index - 1) / 2);
    const isWhiteMove = index % 2 === 1;

    if (isWhiteMove) {
      setFen(processedMoves[moveNumber].white.fen);
    } else {
      if (processedMoves[moveNumber].black) {
        setFen(processedMoves[moveNumber].black!.fen);
      }
    }
  };

  const goToNext = () => {
    goToMove(currentMoveIndex + 1);
  };

  const goToPrevious = () => {
    goToMove(currentMoveIndex - 1);
  };

  const goToStart = () => {
    goToMove(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [goToPrevious, goToNext])

  const goToEnd = () => {
    if (!game || processedMoves.length === 0) return;
    const moveCount =
      processedMoves.length * 2 -
      (processedMoves[processedMoves.length - 1]?.black ? 0 : 1);
    goToMove(moveCount);
  };

  // Handle auto playback
  const togglePlayback = () => {
    if (isPlaying) {
      // Stop playback
      if (playbackInterval) {
        clearTimeout(playbackInterval);
        setPlaybackInterval(null);
      }
      setIsPlaying(false);
    } else {
      // Start playback
      setIsPlaying(true);

      // Create a recursive function that uses the ref for current position
      const playNextMove = () => {
        // Use the ref to get the current position
        const nextMoveIndex = currentMoveIndexRef.current + 1;

        // Calculate the total number of moves
        const moveCount =
          processedMoves.length * 2 -
          (processedMoves[processedMoves.length - 1]?.black ? 0 : 1);

        // Check if we've reached the end
        if (nextMoveIndex > moveCount) {
          setIsPlaying(false);
          return;
        }

        // Go to the next move
        goToMove(nextMoveIndex);

        // Schedule the next move
        const timeout = setTimeout(playNextMove, playbackSpeed);
        setPlaybackInterval(timeout as unknown as NodeJS.Timeout);
      };

      // Start the playback
      playNextMove();
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleOnDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (!chessModule) return false;

    const Chess = chessModule.Chess;
    const chess = new Chess(fen);

    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    if (move) {
      setFen(chess.fen());
      return true;
    }

    return false;
  };

  // Handle PGN download
  const handleDownloadPgn = () => {
    if (!game || processedMoves.length === 0) return;

    // Fecha formateada
    const date = new Date(game.start_time).toISOString().split("T")[0];

    // Cabecera PGN estándar
    const header = [
      `[Event "Online Game"]`,
      `[Site "Chess98"]`,
      `[Date "${date}"]`,
      `[White "${game.white_player.username}"]`,
      `[Black "${game.black_player.username}"]`,
      `[Result "*"]`,
      game.opening ? `[Opening "${game.opening}"]` : "",
      game.time_control ? `[TimeControl "${game.time_control}"]` : "",
      "",
    ]
      .filter(Boolean)
      .join("\n");

    let moveText = "";
    for (const move of processedMoves) {
      moveText += `${move.moveNumber}. ${move.white.move} `;
      if (move.black?.move) {
        moveText += `${move.black.move} `;
      }
    }

    moveText += "*";

    const fullPgn = `${header}\n${moveText.trim()}`;

    const blob = new Blob([fullPgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${game.white_player.username}_vs_${game.black_player.username}_${date}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <Card className="w-full max-w-md border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Game Not Found</CardTitle>
            <CardDescription>
              We couldn't find the game you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-slate-300 mb-6">
              The game with ID "{gameId}" doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate result text
  const getResultText = () => {
    if (!game.result) return "Game in progress";

    if (game.result === "white_win") return "White wins";
    if (game.result === "black_win") return "Black wins";
    if (game.result === "draw") return "Draw";

    return "Unknown result";
  };

  // Calculate termination text
  const getTerminationText = () => {
    if (!game.termination) return "";

    const resultText =
      game.result === "white_win"
        ? `${game.white_player.username} won by`
        : game.result === "black_win"
          ? `${game.black_player.username} won by`
          : "Game ended in a draw by";

    return `${resultText} ${game.termination}`;
  };

  const formatEvaluation = () => {
    if (mateIn !== null) return `Mate in ${mateIn}`;
    return `${currentEvaluation > 0 ? "+" : ""}${currentEvaluation.toFixed(2)}`;
  };

  const PlayerHeader = ({ color }: { color: "white" | "black" }) => {
    const isWhite = color === "white";
    const player = isWhite ? game.white_player : game.black_player;
    const rating = isWhite ? game.white_rating : game.black_rating;
    const ratingChange = isWhite
      ? game.white_rating_change
      : game.black_rating_change;

    return (
      <div
        className={`flex items-center justify-between mt-4`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`rounded-full ${isWhite
                ? "w-3 h-3 bg-white"
                : "w-3 h-3 bg-black"
              }`}
          ></div>
          <div
            className={`font-medium text-white`}
          >
            {player.username}
          </div>
          <Badge
            className={`bg-amber-500/10 border-amber-500/20 text-amber-400`}
          >
            {rating}
          </Badge>
          {ratingChange !== 0 && ratingChange !== null && (
            <span
              className={`${ratingChange > 0 ? "text-green-400" : "text-red-400"
                }`}
            >
              {ratingChange > 0 ? "+" : ""}
              {ratingChange}
            </span>
          )}
        </div>
      </div>
    );
  };

  const arrowButtonsSize = isMobile ? "h-10 w-10" : "h-8 w-8";
  const arrowIconsSize = isMobile ? "h-5 w-5" : "h-3 w-3";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-4 pb-8 flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <div className="mb-4">
          <button
            onClick={() => router.push("/games")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Go to Recent Games</span>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              <Link
                href={`/profile/${game.white_player.username}`}
                className="hover:underline"
              >
                {game.white_player.username}
              </Link>{" "}
              vs{" "}
              <Link
                href={`/profile/${game.black_player.username}`}
                className="hover:underline"
              >
                {game.black_player.username}
              </Link>
            </h1>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-slate-700 text-slate-300">
                {game.time_control}
              </Badge>
              {game.opening && (
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                  {game.opening}
                </Badge>
              )}
              <span className="text-sm text-slate-400">
                {formatDate(game.start_time)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4">
            {/* Barra */}
            <div className="w-full max-w-[120px]">
              <SimpleEvaluationBar score={currentEvaluation} className="h-12" />
            </div>

            {/* Texto */}
            <div className="flex-1">
              {engineLoading && isAnalyzing ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading engine...</span>
                </div>
              ) : (
                <>
                  <div
                    className={`text-xl font-bold`}
                  >
                    {formatEvaluation()}
                  </div>

                  <div className="text-xs text-slate-400">
                    Depth: {currentDepth ?? "-"} | Engine: {engineName}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Chessboard */}
          <div className="lg:col-span-8">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <PlayerHeader color={boardOrientation == "white" ? "black" : "white"} />

                <div
                  ref={boardContainerRef}
                  className="w-full aspect-square max-w-[min(100%,calc(100vh-20rem))] mx-auto mb-2 flex-1"
                >
                  <ChessboardComponent
                    id="GameViewer"
                    position={fen}
                    boardOrientation={boardOrientation}
                    customBoardStyle={{
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                    }}
                    customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
                    customLightSquareStyle={{ backgroundColor: boardColors.light }}
                    customPieces={pieces}
                    customArrows={bestArrow ? [bestArrow] : []}
                    arePiecesDraggable={true}
                    onPieceDrop={handleOnDrop}
                  />
                </div>

                <PlayerHeader color={boardOrientation == "white" ? "white" : "black"} />

                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-0 ${arrowButtonsSize}`}
                    onClick={goToStart}
                    disabled={currentMoveIndex === 0}
                  >
                    <SkipBack className={arrowIconsSize} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-0 ${arrowButtonsSize}`}
                    onClick={goToPrevious}
                    disabled={currentMoveIndex === 0}
                  >
                    <ChevronLeft className={arrowIconsSize} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-0 ${arrowButtonsSize}`}
                    onClick={togglePlayback}
                    disabled={processedMoves.length === 0}
                  >
                    {isPlaying ? (
                      <Pause className={arrowIconsSize} />
                    ) : (
                      <Play className={arrowIconsSize} />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-0 ${arrowButtonsSize}`}
                    onClick={goToNext}
                    disabled={
                      processedMoves.length === 0 ||
                      currentMoveIndex >=
                      processedMoves.length * 2 -
                      (processedMoves[processedMoves.length - 1]?.black
                        ? 0
                        : 1)
                    }
                  >
                    <ChevronRight className={arrowIconsSize} />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-slate-700 bg-slate-800/50 hover:bg-slate-700 p-0 ${arrowButtonsSize}`}
                    onClick={goToEnd}
                    disabled={
                      processedMoves.length === 0 ||
                      currentMoveIndex >=
                      processedMoves.length * 2 -
                      (processedMoves[processedMoves.length - 1]?.black
                        ? 0
                        : 1)
                    }
                  >
                    <SkipForward className={arrowIconsSize} />
                  </Button>
                </div>

                <div className="flex justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                    onClick={handleRotateBoard}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                    onClick={handleDownloadPgn}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PGN
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs h-7"
                    onClick={handleToggleAnalyze}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Analyze {isAnalyzing ? "Stop" : ""}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Moves list */}
          <div className="lg:col-span-4">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 h-full flex flex-col">
              <CardHeader className="p-3">
                <CardTitle className="text-white text-base">
                  Game Moves
                </CardTitle>
                <CardDescription className="text-xs">
                  {game.opening || "Unknown Opening"} • {game.time_control}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 flex-1 flex flex-col">
                <div className="grid grid-cols-3 text-xs mb-1">
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                    #
                  </div>
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                    White
                  </div>
                  <div className="bg-slate-800/50 py-1 px-2 text-center font-medium">
                    Black
                  </div>
                </div>

                <div
                  className="overflow-y-auto flex-1 mb-3"
                  style={{
                    maxHeight: boardHeight ? `${boardHeight * 0.6}px` : "auto",
                  }}
                >
                  {processedMoves.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      No moves available
                    </div>
                  ) : (
                    processedMoves.map((move, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 text-xs hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="py-1 px-2 text-center border-t border-slate-700/50">
                          {move.moveNumber}
                        </div>
                        <div
                          className={`py-1 px-2 text-center border-t border-slate-700/50 cursor-pointer ${currentMoveIndex === index * 2 + 1
                              ? "bg-indigo-500/20 font-medium"
                              : ""
                            }`}
                          onClick={() => goToMove(index * 2 + 1)}
                        >
                          {move.white.notation}
                        </div>
                        <div
                          className={`py-1 px-2 text-center border-t border-slate-700/50 cursor-pointer ${move.black && currentMoveIndex === index * 2 + 2
                              ? "bg-indigo-500/20 font-medium"
                              : ""
                            }`}
                          onClick={() => move.black && goToMove(index * 2 + 2)}
                        >
                          {move.black ? move.black.notation : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="mb-3 bg-slate-700/50 flex-grow-0" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      {game.time_control}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">
                      {getResultText()}
                    </span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-slate-800/50 rounded-md flex-grow-0">
                  <h3 className="text-xs font-medium text-white mb-1">
                    Game Result
                  </h3>
                  <p className="text-xs text-slate-400">
                    {getTerminationText()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
