// utils/chessboard.tsx
import React, { JSX } from "react";

type PieceKey =
    | "wP" | "wN" | "wB" | "wR" | "wQ" | "wK"
    | "bP" | "bN" | "bB" | "bR" | "bQ" | "bK";

type CustomPieceProps = {
    squareWidth: number;
    isDragging?: boolean;
    square?: string;
};

/**
 * Genera piezas personalizadas para react-chessboard.
 */
export function getCustomPieces(
    style: string
): Record<PieceKey, (props: CustomPieceProps) => JSX.Element> {
    const resolvedStyle = style === "default" ? "cburnett" : style;

    const pieces: Record<PieceKey, (props: CustomPieceProps) => JSX.Element> = {} as any;

    const pieceKeys: PieceKey[] = [
        "wP", "wN", "wB", "wR", "wQ", "wK",
        "bP", "bN", "bB", "bR", "bQ", "bK",
    ];

    pieceKeys.forEach((key) => {
        pieces[key] = ({ squareWidth }) => (
            <img
                src={`/piece/${resolvedStyle}/${key}.svg`}
                alt={key}
                width={squareWidth}
                height={squareWidth}
                style={{ objectFit: "contain", pointerEvents: "none" }}
                draggable={false}
            />
        );
    });

    return pieces;
}