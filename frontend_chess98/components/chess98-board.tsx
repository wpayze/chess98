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
        const [highlightedSquares, setHighlightedSquares] = useState<Record<string, React.CSSProperties>>({});
        const [legalMovesHighlight, setLegalMovesHighlight] = useState<Set<string>>(new Set());

        const { settings } = useSettingsStore()

        const boardColors = getBoardColors(settings?.board_theme || "default")
        const pieces = getCustomPieces(settings?.piece_set || "default")

        useEffect(() => {
            const newGame = new Chess(initialFen);
            gameRef.current = newGame;

            const turn = newGame.turn();
            const kingSquare = findKingSquare(newGame, turn);
            setInCheckSquare(newGame.inCheck() && kingSquare ? (kingSquare as Square) : null);
        }, [initialFen]);

        const handleMove = (from: string, to: string, promotion?: string) => {
            let move = null;
            setLegalMovesHighlight(new Set());

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
            setHighlightedSquares({});

            if (turn !== playerColor) return;

            if (selectedSquare === square) {
                setSelectedSquare(null);
                setLegalMovesHighlight(new Set());
                return;
            }

            if (!selectedSquare || piece?.color === playerColor) {
                if (piece?.color === playerColor) {
                    setSelectedSquare(square);

                    const moves = gameRef.current.moves({ square, verbose: true });
                    const newHighlights = new Set<string>();
                    moves.forEach((move) => newHighlights.add(move.to));

                    setLegalMovesHighlight(newHighlights);
                }
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

        const handlePieceDragEnd = (piece: string, sourceSquare: Square) => {
            setLegalMovesHighlight(new Set());
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

        const handleSquareRightClick = (square: Square) => {
            setHighlightedSquares((prev) => {
                const newHighlights = { ...prev };
                if (newHighlights[square]) {
                    delete newHighlights[square];
                } else {
                    newHighlights[square] = { backgroundColor: boardColors.highlightedSquare };
                }
                return newHighlights;
            });
        };

        const handlePieceDragBegin = (piece: string, sourceSquare: Square) => {
            const color = piece[0]; // "w" o "b"

            if (color !== playerColor) return;

            const moves = gameRef.current.moves({ square: sourceSquare, verbose: true });
            const newHighlights = new Set<string>();
            moves.forEach((move) => newHighlights.add(move.to));

            setLegalMovesHighlight(newHighlights);
        };

        const getSquareStyles = () => {
            const styles: Record<string, React.CSSProperties> = {};

            const addBackgroundLayer = (square: string, layer: string) => {
                if (!styles[square]) styles[square] = {};
                styles[square].background = styles[square].background
                    ? `${styles[square].background}, ${layer}`
                    : layer;
            };

            // Círculo para jugadas legales
            legalMovesHighlight.forEach((square) => {
                addBackgroundLayer(square, 'radial-gradient(circle, rgba(0,0,0,0.3) 20%, transparent 20%)');
            });

            // Highlight manual por right-click
            Object.entries(highlightedSquares).forEach(([square, style]) => {
                if (style.backgroundColor) {
                    addBackgroundLayer(square, style.backgroundColor);
                }
            });

            // Resaltados de eventos
            const overlayBackground = (square: Square | null, overlayColor: string) => {
                if (!square) return;
                addBackgroundLayer(square, overlayColor);
            };

            overlayBackground(selectedSquare, boardColors.selectedHighlight);
            overlayBackground(lastMoveFrom, boardColors.moveHighlight);
            overlayBackground(lastMoveTo, boardColors.moveHighlight);
            overlayBackground(inCheckSquare, boardColors.checkHighlight);

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
                        onSquareRightClick={handleSquareRightClick}
                        onPieceDragBegin={handlePieceDragBegin}
                        onPieceDragEnd={handlePieceDragEnd}
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
