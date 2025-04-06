"use server";

import TimeControls from "@/components/time-controls-matchmaking";
import TopPlayersRanking from "@/components/top-players-ranking";

export default async function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-slate-900/20 py-8 flex flex-col">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Quick Matching
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Select a time control to begin your game
        </p>

        <TimeControls />
        <TopPlayersRanking />
      </div>

      <div className="mt-auto pt-8 pb-4 text-center">
        <p className="text-sm text-slate-400">
          Made by{" "}
          <a
            href="https://wilfredopaiz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:from-indigo-500 hover:to-purple-600 transition-colors"
          >
            Wilfredo Paiz
          </a>
        </p>
      </div>
    </main>
  );
}
