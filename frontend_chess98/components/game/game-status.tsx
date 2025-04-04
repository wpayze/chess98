import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface GameOverCardProps {
  gameResult: string | null;
  onReturnHome: () => void;
}

const GameOverCard: React.FC<GameOverCardProps> = ({
  gameResult,
  onReturnHome,
}) => (
  <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50">
    <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
      Game Over
    </div>
    <div className="text-white">{gameResult}</div>
    <Button
      className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 mt-3 text-xs h-8"
      onClick={onReturnHome}
    >
      Return to Home
    </Button>
  </div>
);

interface StatusMessageProps {
  isOpponentReady: boolean;
  gameStarted: boolean;
  gameStatus: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  isOpponentReady,
  gameStarted,
  gameStatus,
}) => {
  let message = "";
  if (!isOpponentReady) {
    message = "Waiting for opponent";
  } else if (!gameStarted) {
    message = "Make a move to start the game";
  } else if (gameStatus === "canceled") {
    message = "Game canceled";
  }

  return (
    <div className="text-sm text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-semibold px-4">
      {message}
    </div>
  );
};

interface DrawOfferedCardProps {
  onAccept: () => void;
  onDecline: () => void;
}

const DrawOfferedCard: React.FC<DrawOfferedCardProps> = ({
  onAccept,
  onDecline,
}) => (
  <div className="py-2 px-3 bg-slate-800/70 rounded-md border border-slate-700/50 mb-2">
    <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
      Draw Offered
    </div>
    <div className="text-white">
      Your opponent has offered a draw. Do you accept?
    </div>
    <div className="flex justify-center space-x-2 mt-3">
      <Button
        className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-xs h-8"
        onClick={onAccept}
      >
        Accept
      </Button>
      <Button
        className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600 text-xs h-8"
        onClick={onDecline}
        variant="outline"
      >
        Decline
      </Button>
    </div>
  </div>
);

interface GameStatusProps {
  gameStatus: string;
  gameResult: string | null;
  isOpponentReady: boolean;
  gameStarted: boolean;
  drawOffered?: boolean;
  onAcceptDraw?: () => void;
  onDeclineDraw?: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({
  gameStatus,
  gameResult,
  isOpponentReady,
  gameStarted,
  drawOffered = false,
  onAcceptDraw,
  onDeclineDraw,
}) => {
  const router = useRouter();

  return (
    <div className="p-2 text-center">
      {gameStatus === "finished" ? (
        <GameOverCard
          gameResult={gameResult}
          onReturnHome={() => router.push("/")}
        />
      ) : (
        <>
          {drawOffered && onAcceptDraw && onDeclineDraw && (
            <DrawOfferedCard
              onAccept={onAcceptDraw}
              onDecline={onDeclineDraw}
            />
          )}
          <StatusMessage
            isOpponentReady={isOpponentReady}
            gameStarted={gameStarted}
            gameStatus={gameStatus}
          />
        </>
      )}
    </div>
  );
};

export default GameStatus;
