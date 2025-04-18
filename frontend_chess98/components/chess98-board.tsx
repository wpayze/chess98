import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { playSound } from "@/services/sounds-service";
import { SOUNDS } from "@/constants/sounds";

function handleMoveSound(game: any, move: any) {
    if (!move) return;
    if (game.inCheck()) {
        playSound(SOUNDS.CHECK);
    } else if (move.flags.includes("k") || move.flags.includes("q")) {
        playSound(SOUNDS.CASTLE);
    } else if (move.flags.includes("c")) {
        playSound(SOUNDS.CAPTURE);
    } else {
        playSound(SOUNDS.MOVE);
    }
}

function findKingSquare(game: any, color: "w" | "b"): string | null {
    const board = game.board();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = board[row][col];
            if (square && square.type === "k" && square.color === color) {
                const file = "abcdefgh"[col];
                const rank = `${8 - row}`;
                return `${file}${rank}`;
            }
        }
    }
    return null;
}

export interface Chess98BoardHandle {
    applyExternalMove: (move: { from: string; to: string; fen: string; turn: "w" | "b" }) => void;
}

interface Chess98BoardProps {
    initialFen?: string;
    orientation?: "white" | "black";
    playerColor: "w" | "b";
    onMove?: (data: {
        from: string;
        to: string;
        fen: string;
        uci: string;
        turn: "w" | "b";
    }) => void;
}

export const Chess98Board = forwardRef<Chess98BoardHandle, Chess98BoardProps>(
    function Chess98Board({ initialFen, orientation = "white", playerColor, onMove }, ref) {
        const [game, setGame] = useState(() => new Chess(initialFen || "start"));
        const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
        const [lastMoveFrom, setLastMoveFrom] = useState<Square | null>(null);
        const [lastMoveTo, setLastMoveTo] = useState<Square | null>(null);
        const [inCheckSquare, setInCheckSquare] = useState<Square | null>(null);
        const promotionDataRef = useRef<{ from: string; to: string } | null>(null);
        const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);

        const [, r] = useState(0);

        const triggerBoardUpdate = () => {
            r(n => n + 1);
        };

        const gameRef = useRef(game);

        useEffect(() => {
            const newGame = new Chess(initialFen);
            setGame(newGame);
            gameRef.current = newGame;

            const turn = newGame.turn();
            const kingSquare = findKingSquare(newGame, turn);
            setInCheckSquare(newGame.inCheck() && kingSquare ? (kingSquare as Square) : null);
        }, [initialFen]);

        const handleMove = (from: string, to: string, promotion?: string) => {
            let move = null;
            try {
                move = gameRef.current.move({ from, to, promotion: promotion ?? "q" });
            } catch (err) {
                console.warn("Move error:", err);
                return false;
            }

            const turn = gameRef.current.turn();
            const uci = `${from}${to}${move?.promotion ?? ""}`;

            if (move) {
                handleMoveSound(gameRef.current, move);
                setSelectedSquare(null);
                setLastMoveFrom(move.from);
                setLastMoveTo(move.to);

                const kingSquare = findKingSquare(gameRef.current, turn);
                setInCheckSquare(gameRef.current.inCheck() && kingSquare ? (kingSquare as Square) : null);

                onMove?.({
                    from: move.from,
                    to: move.to,
                    fen: gameRef.current.fen(),
                    uci,
                    turn
                });
                return true;
            } else {
                setSelectedSquare(null);
                return false;
            }
        };

        const handleSquareClick = (square: Square) => {
            const piece = gameRef.current.get(square);
            const turn = gameRef.current.turn();
            if (turn !== playerColor) return;

            if (selectedSquare === square) {
                setSelectedSquare(null);
                return;
            }

            if (!selectedSquare) {
                if (piece?.color === playerColor) {
                    setSelectedSquare(square);
                }
                return;
            }

            if (piece?.color === playerColor) {
                setSelectedSquare(square);
                return;
            }

            const movingPiece = gameRef.current.get(selectedSquare);
            const isPromotion =
                movingPiece?.type === "p" &&
                ((movingPiece.color === "w" && square[1] === "8") ||
                    (movingPiece.color === "b" && square[1] === "1"));

            if (isPromotion) {
                promotionDataRef.current = { from: selectedSquare, to: square };
                setIsPromotionDialogOpen(true);
                return;
            }

            handleMove(selectedSquare, square);
        };

        const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
            const currentTurn = gameRef.current.turn();
            if (currentTurn !== playerColor) return false;
            if (piece[0] !== playerColor) return false;

            const movingPiece = gameRef.current.get(sourceSquare as Square);

            const isPromotion =
                movingPiece?.type === "p" &&
                ((movingPiece.color === "w" && targetSquare[1] === "8") ||
                    (movingPiece.color === "b" && targetSquare[1] === "1"));

            // Si es promoción por drop, intentamos inferir a qué pieza fue
            const promotion = isPromotion ? piece[1].toLowerCase() : undefined;

            return handleMove(sourceSquare, targetSquare, promotion);
        };

        const handlePromotionPieceSelect = (piece?: string, from?: string, to?: string) => {
            if (!piece) return false;

            const promotion = piece.length > 1 ? piece[1].toLowerCase() : piece.toLowerCase();

            if (promotionDataRef.current) {
                const refFrom = promotionDataRef.current.from;
                const refTo = promotionDataRef.current.to;
                promotionDataRef.current = null;
                setIsPromotionDialogOpen(false);
                return handleMove(refFrom, refTo, promotion);
            }

            if (!from || !to) return false;
            return handleMove(from, to, promotion);
        }

        const getSquareStyles = () => {
            const styles: Record<string, React.CSSProperties> = {};

            if (selectedSquare) {
                styles[selectedSquare] = { backgroundColor: "rgba(0,0,255,0.3)" };
            }
            if (lastMoveFrom) {
                styles[lastMoveFrom] = { backgroundColor: "rgba(144, 238, 144, 0.25)" };
            }
            if (lastMoveTo) {
                styles[lastMoveTo] = { backgroundColor: "rgba(144, 238, 144, 0.25)" };
            }
            if (inCheckSquare) {
                styles[inCheckSquare] = {
                    backgroundColor: "rgba(239, 68, 68, 0.6)",
                    boxShadow: "inset 0 0 0 3px rgba(220, 38, 38, 0.8)",
                };
            }

            return styles;
        };

        //Funciones externas
        const applyExternalMove = ({ from, to, fen, turn }: { from: string; to: string; fen: string; turn: "w" | "b"; }) => {
            const isOpponentMove = turn === playerColor;

            if (isOpponentMove) {
                try {
                    const tempMove = gameRef.current.move({ from, to, promotion: "q" });

                    if (tempMove) {
                        handleMoveSound(gameRef.current, tempMove);
                    }
                } catch (err) {
                    console.warn("[applyExternalMove] Simulated move failed", { from, to, err });
                }
            }

            gameRef.current.load(fen);

            setLastMoveFrom(from as Square);
            setLastMoveTo(to as Square);

            const currentTurn = gameRef.current.turn();
            const kingSquare = findKingSquare(gameRef.current, currentTurn);
            setInCheckSquare(gameRef.current.inCheck() && kingSquare ? (kingSquare as Square) : null);

            triggerBoardUpdate();
        };

        useImperativeHandle(ref, () => ({
            applyExternalMove,
        }));

        return (
            <Chessboard
                id="Chess98Board"
                position={game.fen()}
                onSquareClick={handleSquareClick}
                onPieceDrop={handlePieceDrop}
                boardOrientation={orientation}
                arePiecesDraggable={true}
                customSquareStyles={getSquareStyles()}
                customBoardStyle={{ borderRadius: "0.5rem", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)" }}
                customDarkSquareStyle={{ backgroundColor: "#4a5568" }}
                customLightSquareStyle={{ backgroundColor: "#cbd5e0" }}
                promotionDialogVariant={"modal"}
                arePremovesAllowed={true}
                clearPremovesOnRightClick={true}
                animationDuration={200}
                showBoardNotation={true}
                showPromotionDialog={isPromotionDialogOpen}
                onPromotionPieceSelect={handlePromotionPieceSelect}
            />
        );
    });
