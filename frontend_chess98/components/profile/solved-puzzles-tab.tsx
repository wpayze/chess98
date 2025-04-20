import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { MiniChessboard } from "@/components/mini-chessboard"
import Link from "next/link"
import { formatDate } from "@/utils/timeFormats"
import { PuzzleSolveListResponse } from "@/models/puzzle"
import { useEffect, useState } from "react"
import { puzzleService } from "@/services/puzzle-service"

interface SolvedPuzzlesTabProps {
  username: string
}

export function SolvedPuzzlesTab({ username }: SolvedPuzzlesTabProps) {

  const [userSolves, setUserSolves] = useState<PuzzleSolveListResponse>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userSolves = await puzzleService.getPuzzleSolvesByUsername(
          username, true, 1, 5);
        setUserSolves(userSolves);

      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const { data } = userSolves || {}

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Solved Puzzles</CardTitle>
        <CardDescription>Recent puzzles solved by {username}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!data || data.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No puzzles solved yet</div>
          ) : (
            data.map((solve) => (
              <Link href={`/exercises/${solve.puzzle.id}`} key={solve.id}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-full min-h-[40px] rounded-l-lg ${(solve.rating_delta ?? 0) > 0
                        ? "bg-green-500"
                        : (solve.rating_delta ?? 0) < 0
                          ? "bg-red-500"
                          : "bg-slate-500"
                        }`}
                    ></div>

                    <MiniChessboard fen={solve.puzzle.fen} size={80} className="hidden md:block" />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">Puzzle #{solve.puzzle.id}</span>
                        {solve.puzzle.themes && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {solve.puzzle.themes[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <span className="text-slate-400">{formatDate(solve.solved_at.toString())}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">Puzzle rating: {solve.puzzle.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      <span className="text-slate-300 mr-2">{solve.rating_before}</span>
                      <span
                        className={`text-sm font-medium ${(solve?.rating_delta ?? 0) > 0
                          ? "text-green-400"
                          : (solve?.rating_delta ?? 0) < 0
                            ? "text-red-400"
                            : "text-slate-400"
                          }`}
                      >
                        ({(solve?.rating_delta ?? 0) > 0 ? "+" : ""}
                        {(solve?.rating_delta ?? 0)})
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
                  </div>
                </div>
              </Link>
            ))
          )}

          {!data || data.length > 0 && (
            <div className="flex justify-center mt-4">
              <Link href={`/puzzles/${username}`}>
                <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  View All Puzzles
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
