import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Construction, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function ExercisesPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-slate-900/20 py-8 overflow-y-auto">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Chess Exercises
        </h1>
        <p className="text-center text-muted-foreground mb-8">Improve your chess skills with these exercises</p>

        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Construction className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-white">Coming Soon</CardTitle>
              </div>
              <CardDescription>Our exercises section is currently under development</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Exercise Module in Development</h3>
                <p className="text-slate-400 max-w-md mb-6">
                  We're working hard to bring you a comprehensive collection of chess exercises, puzzles, and learning
                  materials. Check back soon for tactical puzzles, endgame studies, opening principles, and more!
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                    Return to Home
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

