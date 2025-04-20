import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Award, CheckCircle, CircleDot, Trophy, XCircle } from "lucide-react"
import { formatDate } from "@/utils/timeFormats"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
}

interface AchievementsTabProps {
  achievements: Achievement[]
  wins: number
  losses: number
  draws: number
}

export function AchievementsTab({ achievements = [], wins, losses, draws }: AchievementsTabProps) {
  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Achievements</CardTitle>
        <CardDescription>Earned achievements and badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
              <div className="p-2 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="font-medium text-white">{achievement.name}</div>
                <div className="text-sm text-slate-400">{achievement.description}</div>
                <div className="text-xs text-slate-500 mt-1">Earned on {formatDate(achievement.earnedAt.toString())}</div>
              </div>
            </div>
          ))}

          {/* Example locked achievements */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 opacity-60">
            <div className="p-2 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
              <Award className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <div className="font-medium text-white">Endgame Expert</div>
              <div className="text-sm text-slate-400">Win 50 games in the endgame phase</div>
              <div className="text-xs text-slate-500 mt-1">Progress: 32/50</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 opacity-60">
            <div className="p-2 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
              <Award className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <div className="font-medium text-white">Opening Scholar</div>
              <div className="text-sm text-slate-400">Play 20 different openings</div>
              <div className="text-xs text-slate-500 mt-1">Progress: 14/20</div>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-slate-700/50" />

        <div>
          <h3 className="text-lg font-medium text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm text-slate-400">Wins</div>
                <div className="text-xl font-bold text-white">{wins}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <XCircle className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-sm text-slate-400">Losses</div>
                <div className="text-xl font-bold text-white">{losses}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <CircleDot className="h-5 w-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-400">Draws</div>
                <div className="text-xl font-bold text-white">{draws}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
