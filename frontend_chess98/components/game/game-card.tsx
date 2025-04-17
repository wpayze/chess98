import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Clock } from "lucide-react"

// Define the interface for the game data
export interface GameCardProps {
  game_id: string
  white_player: {
    username: string
    rating: number
    title?: string | null
  }
  black_player: {
    username: string
    rating: number
    title?: string | null
  }
  result?: string | null
  time_control: string
  time_control_str: string
  date: string
}

// Format date to relative time
export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

// PGN-style result function
export const getPgnResult = (result: string) => {
  if (result === "draw") {
    return { text: "½-½", className: "bg-yellow-500/20 text-yellow-400" }
  }

  if (result === "white_win") {
    return {
      text: "1-0",
      className: "bg-white text-slate-900 font-semibold border border-slate-200",
    }
  }

  return {
    text: "0-1",
    className: "bg-slate-900 text-white font-semibold border border-slate-700",
  }
}

// Get title color
export const getTitleColor = (title: string | null) => {
  if (!title) return ""

  switch (title) {
    case "GM":
    case "GP":
      return "text-yellow-500"
    case "IM":
    case "PI":
      return "text-blue-400"
    case "FM":
    case "FP":
      return "text-green-400"
    default:
      return "text-slate-400"
  }
}

export default function GameCard({
  game_id,
  white_player,
  black_player,
  result,
  time_control,
  time_control_str,
  date,
}: GameCardProps) {
  return (
    <Link
      href={`/game/${game_id}`}
      className="block p-3 rounded-md bg-slate-800/50 hover:bg-slate-800/80 transition-colors border border-slate-700/50 hover:border-indigo-500/30"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="text-sm font-medium mb-1">
            <span className="text-amber-400">({white_player.rating})</span>{" "}
            {white_player.title && (
              <span className={`text-xs font-bold mr-1 ${getTitleColor(white_player.title)}`}>
                {white_player.title}
              </span>
            )}
            {white_player.username} vs{" "}
            {black_player.title && (
              <span className={`text-xs font-bold mr-1 ${getTitleColor(black_player.title)}`}>
                {black_player.title}
              </span>
            )}
            {black_player.username} <span className="text-amber-400">({black_player.rating})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>
              {time_control} • {time_control_str}
            </span>
          </div>
        </div>
        <Badge className={getPgnResult(result || "").className}>{getPgnResult(result || "").text}</Badge>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-xs text-slate-400">{formatRelativeTime(date)}</div>
        <div className="text-xs text-indigo-400 flex items-center">
          View <ChevronRight className="h-3 w-3 ml-0.5" />
        </div>
      </div>
    </Link>
  )
}
