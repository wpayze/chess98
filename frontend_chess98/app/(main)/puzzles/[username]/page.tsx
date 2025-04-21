"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Lightbulb, CheckCircle, Trophy } from "lucide-react"
import { MiniChessboard } from "@/components/mini-chessboard"
import { formatDate } from "@/utils/timeFormats"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PuzzleSolveListResponse, PuzzleSolveStatsResponse, PuzzleSolveStatus } from "@/models/puzzle"
import { puzzleService } from "@/services/puzzle-service"

export default function UserPuzzlesPage() {
    const params = useParams()
    const username = params.username as string

    // State
    const [userSolves, setUserSolves] = useState<PuzzleSolveListResponse>();
    const [puzzleStats, setPuzzleStats] = useState<PuzzleSolveStatsResponse>()

    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [onlyRated, setOnlyRated] = useState(true)

    useEffect(() => {
        const fetchPuzzles = async () => {
            setIsLoading(true);
            try {
                const userSolves = await puzzleService.getPuzzleSolvesByUsername(
                    username, onlyRated, currentPage, 10);

                setUserSolves(userSolves)
                setTotalPages(userSolves.total_pages)
                setCurrentPage(userSolves.page)

            } catch (error) {
                console.error("Error fetching puzzles:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPuzzles();
    }, [username, onlyRated, currentPage]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userStats = await puzzleService.getPuzzleStatsByUsername(
                    username);
                setPuzzleStats(userStats)
            } catch (error) {
                console.error("Error fetching stats:", error);
            } 
        };
        fetchStats();
    }, []);

    const { data: currentPuzzles } = userSolves || {}

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link
                        href={`/profile/${username}`}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back to Profile</span>
                    </Link>

                    <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
                        <Lightbulb className="mr-2 h-6 w-6" />
                        {username}'s Puzzles
                    </h1>
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400">Viewing puzzle history for {username}</p>
                        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg px-4 py-2 border border-indigo-800/50">
                            <span className="text-indigo-300 font-medium">Puzzle Rating: </span>
                            <span className="text-white font-bold">{puzzleStats?.current_user_rating}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total Puzzles</p>
                                <p className="text-2xl font-bold text-white">{puzzleStats?.total}</p>
                            </div>
                            <div className="p-3 rounded-full bg-indigo-500/20">
                                <Lightbulb className="h-5 w-5 text-indigo-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Solve Percentage</p>
                                <p className="text-2xl font-bold text-white">{puzzleStats?.solve_percentage}%</p>
                            </div>
                            <div className="p-3 rounded-full bg-green-500/20">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Highest Rated Solve</p>
                                <p className="text-2xl font-bold text-white">{puzzleStats?.highest_solved_rating}</p>
                            </div>
                            <div className="p-3 rounded-full bg-amber-500/20">
                                <Trophy className="h-5 w-5 text-amber-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                                <Lightbulb className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle className="text-white">Solved Puzzles</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="onlyRated"
                                checked={onlyRated}
                                onCheckedChange={(checked) => setOnlyRated(checked as boolean)}
                            />
                            <Label htmlFor="onlyRated" className="text-sm text-slate-300">
                                Only Rated
                            </Label>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : currentPuzzles?.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <p>No puzzles found</p>
                                </div>
                            ) : (
                                currentPuzzles?.map((solve) => (
                                    <Link href={`/exercises/${solve.puzzle.id}`} key={solve.id}>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-2 h-full min-h-[40px] rounded-l-lg ${solve.status === PuzzleSolveStatus.SOLVED
                                                        ? "bg-green-500"
                                                        : solve.status === PuzzleSolveStatus.FAILED
                                                            ? "bg-red-500"
                                                            : "bg-gray-400"
                                                        }`}
                                                ></div>

                                                {/* Mini chessboard showing puzzle position */}
                                                <MiniChessboard fen={solve.puzzle.fen} size={80} className="hidden md:block" />

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-white">Puzzle #{solve.puzzle.id}</span>
                                                        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                                                            {solve.puzzle.themes[0]}
                                                        </Badge>
                                                        <Badge
                                                            className={`
                                                                    ${solve.status === PuzzleSolveStatus.SOLVED
                                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                                    : solve.status === PuzzleSolveStatus.FAILED
                                                                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                                                                        : "bg-gray-400/20 text-gray-400 border-gray-400/30"
                                                                }
                                                                    hidden md:inline-flex
                                                                `}
                                                        >
                                                            {solve.status === PuzzleSolveStatus.SOLVED
                                                                ? "Solved"
                                                                : solve.status === PuzzleSolveStatus.FAILED
                                                                    ? "Failed"
                                                                    : "Skipped"}
                                                        </Badge>
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
                                                        className={`text-sm font-medium ${(solve.rating_delta ?? 0) > 0
                                                            ? "text-green-400"
                                                            : (solve.rating_delta ?? 0) < 0
                                                                ? "text-red-400"
                                                                : "text-slate-400"
                                                            }`}
                                                    >
                                                        ({(solve.rating_delta ?? 0) > 0 ? "+" : ""}
                                                        {(solve.rating_delta ?? 0)})
                                                    </span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pt-4 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
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
                                            onClick={() => setCurrentPage(pageNum)}
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
                                    onClick={() => setCurrentPage(currentPage + 1)}
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
