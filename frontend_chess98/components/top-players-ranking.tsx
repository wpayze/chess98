"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import Link from "next/link";
import { userService } from "@/services/user-service";
import { useEffect, useState } from "react";
import { TopPlayer } from "@/models/user";

// Function to get title color
const getTitleColor = (title: string) => {
  switch (title) {
    case "GM":
    case "GP":
      return "text-yellow-500";
    case "PI":
    case "IM":
      return "text-blue-400";
    case "FP":
    case "FM":
      return "text-green-400";
    default:
      return "text-slate-400";
  }
};

export default function TopPlayersRanking() {
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<Record<string, TopPlayer[]>>({
    blitz: [],
    rapid: [],
    bullet: [],
  });

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const data = await userService.getTopPlayers();
        setTopPlayers(data);
      } catch (err) {
        console.error("Error fetching top players", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent flex items-center justify-center">
        <Award className="mr-2 h-6 w-6" />
        Top Players
      </h2>

      <Card className="shadow-lg border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <Tabs defaultValue="blitz">
            <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md mx-auto">
              <TabsTrigger value="blitz">Blitz</TabsTrigger>
              <TabsTrigger value="rapid">Rapid</TabsTrigger>
              <TabsTrigger value="bullet">Bullet</TabsTrigger>
            </TabsList>

            {Object.entries(topPlayers).map(([category, players]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="py-3 px-4 text-left font-medium text-slate-300">
                          #
                        </th>
                        <th className="py-3 px-4 text-left font-medium text-slate-300">
                          Player
                        </th>
                        <th className="py-3 px-4 text-right font-medium text-slate-300">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player, index) => (
                        <tr
                          key={player.id}
                          className={
                            index % 2 === 0
                              ? "bg-slate-800/30"
                              : "bg-slate-800/50"
                          }
                        >
                          <td className="py-3 px-4 font-medium">
                            {index === 0 ? (
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-500/20 text-yellow-500">
                                1
                              </span>
                            ) : index === 1 ? (
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-400">
                                2
                              </span>
                            ) : index === 2 ? (
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-700">
                                3
                              </span>
                            ) : (
                              index + 1
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {player.title && (
                                <span
                                  className={`mr-2 text-xs font-bold ${getTitleColor(
                                    player.title
                                  )}`}
                                >
                                  {player.title}
                                </span>
                              )}
                              <Link
                                href={`/profile/${player.username}`}
                                className="hover:text-indigo-400 transition-colors"
                              >
                                {player.username}
                              </Link>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-indigo-400">
                            {player.rating}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* <div className="mt-4 text-center">
            <Link
              href="/leaderboard"
              className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center justify-center"
            >
              View Full Leaderboard <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
