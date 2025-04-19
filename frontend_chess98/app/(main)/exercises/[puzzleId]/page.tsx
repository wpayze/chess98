"use client"

import { useEffect, useRef, useState } from "react"
import { profileService } from "@/services/profile-service"
import { puzzleService } from "@/services/puzzle-service"

import type { Puzzle } from "@/models/puzzle"
import type { Profile } from "@/models/profile"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Target,
  HelpCircle,
  Eye,
  SkipForward,
  Check,
  X,
  Trophy,
} from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { Chess98Board, Chess98BoardHandle } from "@/components/chess98-board"
import { useParams, useRouter } from "next/navigation"

export default function ExercisesPage() {
  const params = useParams()
  const router = useRouter()

  const puzzleId = params?.puzzleId as string | undefined
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [initialFen, setInitialFen] = useState<string | null>(null)
  const [moveIndex, setMoveIndex] = useState(0)
  const [moveSequence, setMoveSequence] = useState<string[]>([])

  const { user } = useAuthStore()

  const boardRef = useRef<Chess98BoardHandle>(null)
  const hasLoadedRef = useRef(false)

  const [moveFeedback, setMoveFeedback] = useState<"correct" | "wrong" | null>(null)
  const [isPuzzleComplete, setIsPuzzleComplete] = useState(false)
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white")
  const [ratingChange, setRatingChange] = useState(0)

  useEffect(() => {
    if (hasLoadedRef.current) return

    const loadPuzzle = async () => {
      if (!user) return;
      hasLoadedRef.current = true;

      try {
        const profileData = await profileService.getProfileByUsername(user.username);
        setProfile(profileData);

        let puzzleToLoad: string | null = null;

        if (puzzleId) {
          puzzleToLoad = puzzleId;
        } else {
          puzzleToLoad = profileData.active_puzzle_id;

          if (!puzzleToLoad) {
            const refreshed = await puzzleService.refreshPuzzle({ user_id: profileData.user_id });
            puzzleToLoad = refreshed.new_puzzle_id;
          }
        }

        const puzzleData = await puzzleService.getPuzzleById(puzzleToLoad);
        setPuzzle(puzzleData);
        setInitialFen(puzzleData.fen);
        setMoveSequence(puzzleData.moves);

        const turn = puzzleData.fen?.includes(" w ") ? "black" : "white";
        setPlayerColor(turn);

        if (puzzleData.moves.length > 0) {
          const firstMove = puzzleData.moves[0];
          const from = firstMove.slice(0, 2);
          const to = firstMove.slice(2, 4);

          setTimeout(() => {
            boardRef.current?.applyPuzzleMove({ from, to });
          }, 500);

          setMoveIndex(1);
        }
      } catch (error) {
        console.error("❌ Error loading puzzle:", error);
      }
    };

    loadPuzzle()
  }, [user])

  const handlePlayerMove = async (move: { from: string; to: string, uci: string }) => {
    if (!move || !puzzle || !profile) return;

    const expectedMove = moveSequence[moveIndex];

    if (move.uci === expectedMove) {
      // ✅ Jugada correcta
      const newIndex = moveIndex + 1;

      if (newIndex < moveSequence.length) {
        const opponentMove = moveSequence[newIndex];
        const from = opponentMove.slice(0, 2);
        const to = opponentMove.slice(2, 4);

        setTimeout(() => {
          boardRef.current?.applyPuzzleMove({ from, to });
          setMoveIndex(newIndex + 1);
        }, 500);
      } else {
        // 🎉 Puzzle completo
        setMoveFeedback("correct");
        setIsPuzzleComplete(true);

        const result = await puzzleService.solvePuzzle(puzzle.id, {
          user_id: profile.user_id,
          success: true,
        });

        setRatingChange(result.rating_delta);
        setTimeout(() => {
          navigate("/exercises");
        }, 1000); // Navigate after 2 seconds
        console.log("✅ Puzzle resuelto con éxito", result);
      }
    } else {
      // ❌ Jugada incorrecta
      setMoveFeedback("wrong");
      setIsPuzzleComplete(true);

      const result = await puzzleService.solvePuzzle(puzzle.id, {
        user_id: profile.user_id,
        success: false,
      });

      setRatingChange(result.rating_delta);
      console.log("❌ Puzzle fallado");
    }
  };

  const navigate = (targetPath: string, replace = false) => {
    const currentPath = window.location.pathname
    if (currentPath === targetPath) {
      window.location.reload()
    } else {
      replace ? router.replace(targetPath) : router.push(targetPath)
    }
  }


  const userRating = profile?.ratings?.puzzle ?? 0
  const timesPlayed = puzzle?.times_played ?? 0
  const exerciseRating = puzzle?.rating ?? 0

  if (!initialFen || !puzzle || !profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading puzzle...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-4 overflow-y-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
                    <Target className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Exercise #{puzzle?.id ?? "..."}</h2>
                    <p className="text-sm text-slate-400">Exercise Rating: {exerciseRating}</p>
                    <p className="text-sm text-slate-400">Played {timesPlayed} times</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/50 text-center">
                  <p className="text-sm text-slate-400 mb-1">Your Rating</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {userRating}
                  </div>
                  {isPuzzleComplete && (
                    <div className={`text-sm mt-1 ${ratingChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {ratingChange > 0 ? "+" : ""}
                      {ratingChange === 0 ? "No change" : ratingChange}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {moveFeedback && (
              <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                <CardContent className="p-4">
                  {moveFeedback === "correct" && (
                    <div className="flex items-center text-green-400">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-medium">Correct move! Well done.</span>
                    </div>
                  )}

                  {moveFeedback === "wrong" && (
                    <div className="flex items-center text-red-400">
                      <X className="h-5 w-5 mr-2" />
                      <span className="font-medium">Incorrect move.</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {moveFeedback === "wrong" && (
              <>
                <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  <CardContent className="p-4">
                    <p className="text-sm text-slate-300 mb-3">Want to try this puzzle again?</p>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                      onClick={() => navigate(`/exercises/${puzzle?.id}`)}
                    >
                      RETRY
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                  <CardContent className="p-4">
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                      onClick={() => navigate("/exercises")}
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Go to Next Exercise
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* {isPuzzleComplete && (
              // <Card className="border-slate-800 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500/30">
              //   <CardContent className="p-4">
              //     <div className="flex items-center text-indigo-400">
              //       <Trophy className="h-5 w-5 mr-2" />
              //       <span className="font-medium">Puzzle Completed!</span>
              //     </div>
              //   </CardContent>
              // </Card>
            )} */}





            {/* <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-300 mb-3">To get personalized exercises:</p>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                  REGISTER
                </Button>
              </CardContent>
            </Card> */}

            {/* <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-300">
                  Exercises help you improve your tactical vision and calculation skills.
                </p>
              </CardContent>
            </Card> */}
          </div>

          {/* Chessboard */}
          <div className="lg:col-span-9">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardContent className="p-4">
                <div className="w-full max-w-[600px] mx-auto">
                  <div className="aspect-square">
                    {initialFen ? (
                      <Chess98Board
                        ref={boardRef}
                        initialFen={initialFen}
                        playerColor={playerColor === "white" ? "w" : "b"}
                        orientation={playerColor}
                        onMove={handlePlayerMove}
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
                  </div>
                  <div className={`mt-4 p-4 ${playerColor === "white" ? "bg-slate-800/50" : "bg-white"} rounded-md border border-slate-700/50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {playerColor === "white" ? (
                            <div className="w-8 h-8 rounded-full bg-white"></div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-black border border-slate-600"></div>
                          )}
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${playerColor === "white" ? "text-white" : "text-black"}`}>Your turn</h3>
                          <p className={`text-sm ${playerColor === "white" ? "text-slate-300" : "text-black"}`}>
                            Find the best move for {playerColor === "white" ? "white" : "black"}.
                          </p>
                        </div>
                      </div>

                      {/* <div className="flex gap-2">
                        <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          GET A HINT
                        </Button>
                        <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                          <Eye className="h-4 w-4 mr-2" />
                          SEE SOLUTION
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
