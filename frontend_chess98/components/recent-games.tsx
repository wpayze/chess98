"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { RecentGame } from "@/models/dto/recent-games-dto";
import { userService } from "@/services/user-service";

// Format date to relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

// Replace the getResultBadge function with this PGN-style result function
const getPgnResult = (result: string) => {
  if (result === "draw") {
    return { text: "½-½", className: "bg-yellow-500/20 text-yellow-400" };
  }

  if (result === "white_win") {
    return {
      text: "1-0",
      className:
        "bg-white text-slate-900 font-semibold border border-slate-200",
    };
  }

  return {
    text: "0-1",
    className: "bg-slate-900 text-white font-semibold border border-slate-700",
  };
};

// Add the getTitleColor function from the TopPlayersRanking component
const getTitleColor = (title: string | null) => {
  if (!title) return "";

  switch (title) {
    case "GM":
    case "GP":
      return "text-yellow-500";
    case "IM":
    case "PI":
      return "text-blue-400";
    case "FM":
    case "FP":
      return "text-green-400";
    default:
      return "text-slate-400";
  }
};

export default function RecentGames() {
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await userService.getRecentGames(1, 3);
        setRecentGames(res.games);
      } catch (err) {
        console.error("Failed to fetch recent games:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
        <Trophy className="mr-2 h-6 w-6" />
        Last Games Played
      </h2>

      <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-3">
          {recentGames.map((game) => (
            <Link
              key={game.game_id}
              href={`/game/${game.game_id}`}
              className="block p-3 rounded-md bg-slate-800/50 hover:bg-slate-800/80 transition-colors border border-slate-700/50 hover:border-indigo-500/30"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    <span className="text-amber-400">
                      ({game.white_player.rating})
                    </span>{" "}
                    {game.white_player.title && (
                      <span
                        className={`text-xs font-bold mr-1 ${getTitleColor(
                          game.white_player.title
                        )}`}
                      >
                        {game.white_player.title}
                      </span>
                    )}
                    {game.white_player.username} vs{" "}
                    {game.black_player.title && (
                      <span
                        className={`text-xs font-bold mr-1 ${getTitleColor(
                          game.black_player.title
                        )}`}
                      >
                        {game.black_player.title}
                      </span>
                    )}
                    {game.black_player.username}{" "}
                    <span className="text-amber-400">
                      ({game.black_player.rating})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {game.time_control} • {game.time_control_str}
                    </span>
                  </div>
                </div>
                <Badge className={getPgnResult(game.result || "").className}>
                  {getPgnResult(game.result || "").text}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-400">
                  {formatRelativeTime(game.date)}
                </div>
                <div className="text-xs text-indigo-400 flex items-center">
                  View <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </div>
            </Link>
          ))}

          {/* <div className="text-center pt-2 pb-2">
            <Link
              href="/games"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center"
            >
              View All Games <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
