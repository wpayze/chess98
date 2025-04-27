import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Square } from "react-chessboard/dist/chessboard/types";
import { playSound } from "@/services/sounds-service";
import { SOUNDS } from "@/constants/sounds";
import { useSettingsStore } from "@/store/settings-store";
import { getBoardColors } from "@/utils/boardTheme";
import { getCustomPieces } from "@/utils/pieces";
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react";
import { BoardFeedback } from "@/models/board";

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
    applyPuzzleMove: (move: { from: string; to: string }) => void;
    applyFeedback: (feedback: BoardFeedback) => void;
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
        const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
        const [lastMoveFrom, setLastMoveFrom] = useState<Square | null>(null);
        const [lastMoveTo, setLastMoveTo] = useState<Square | null>(null);
        const [inCheckSquare, setInCheckSquare] = useState<Square | null>(null);
        const promotionDataRef = useRef<{ from: string; to: string } | null>(null);
        const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
        const [moveFeedback, setMoveFeedback] = useState<BoardFeedback | null>(null)
        const gameRef = useRef(new Chess(initialFen || "start"));
        const [fen, setFen] = useState<string>(initialFen || gameRef.current.fen());

        const { settings } = useSettingsStore()

        useEffect(() => {
            const newGame = new Chess(initialFen);
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
                setFen(gameRef.current.fen());
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
            setFen(fen);
            setLastMoveFrom(from as Square);
            setLastMoveTo(to as Square);

            const currentTurn = gameRef.current.turn();
            const kingSquare = findKingSquare(gameRef.current, currentTurn);
            setInCheckSquare(gameRef.current.inCheck() && kingSquare ? (kingSquare as Square) : null);
        };

        const applyPuzzleMove = ({
            from,
            to,
        }: {
            from: string
            to: string
        }): void => {
            try {
                const move = gameRef.current.move({ from, to, promotion: "q" })

                if (move) {
                    setFen(gameRef.current.fen());
                    handleMoveSound(gameRef.current, move)
                    setLastMoveFrom(from as Square)
                    setLastMoveTo(to as Square)
                    const currentTurn = gameRef.current.turn()
                    const kingSquare = findKingSquare(gameRef.current, currentTurn)
                    setInCheckSquare(gameRef.current.inCheck() && kingSquare ? (kingSquare as Square) : null)
                }
            } catch (err) {
                console.warn("[applyPuzzleMove] Simulated move failed", { from, to, err })
            }
        }

        //Feedback
        useEffect(() => {
            if (moveFeedback) {
                const timer = setTimeout(() => {
                    setMoveFeedback(null)
                }, 2000)

                return () => clearTimeout(timer)
            }
        }, [moveFeedback])

        const applyFeedback = (feedback: BoardFeedback) => {
            setMoveFeedback(feedback);
        };

        useImperativeHandle(ref, () => ({
            applyExternalMove,
            applyPuzzleMove,
            applyFeedback
        }));

        const boardColors = getBoardColors(settings?.board_theme || "default")
        const pieces = getCustomPieces(settings?.piece_set || "default")

        return (
            <div className="relative">
                <div className="aspect-square">
                    <Chessboard
                        id="Chess98Board"
                        position={fen}
                        onSquareClick={handleSquareClick}
                        onPieceDrop={handlePieceDrop}
                        boardOrientation={orientation}
                        arePiecesDraggable={true}
                        customSquareStyles={getSquareStyles()}
                        customBoardStyle={{ borderRadius: "0.5rem", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)" }}
                        customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
                        customLightSquareStyle={{ backgroundColor: boardColors.light }}
                        customPieces={pieces}
                        promotionDialogVariant={"modal"}
                        arePremovesAllowed={true}
                        clearPremovesOnRightClick={true}
                        animationDuration={200}
                        showBoardNotation={true}
                        showPromotionDialog={isPromotionDialogOpen}
                        onPromotionPieceSelect={handlePromotionPieceSelect}
                    />
                </div>
                <AnimatePresence>
                    {moveFeedback && (
                        <motion.div
                            className={`absolute inset-0 flex items-center justify-center bg-opacity-70 rounded-md ${moveFeedback === "correct" ? "bg-green-900" : "bg-red-900"
                                }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`p-6 rounded-full ${moveFeedback === "correct" ? "bg-green-500" : "bg-red-500"}`}
                            >
                                {moveFeedback === "correct" ? (
                                    <Check className="h-16 w-16 text-white" />
                                ) : (
                                    <X className="h-16 w-16 text-white" />
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    });
