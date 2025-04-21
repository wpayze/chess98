"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"

// Dynamically import chess.js and react-chessboard with no SSR
const ChessboardComponent = dynamic(() => import("react-chessboard").then((mod) => mod.Chessboard), { ssr: false })

export function GeneralTab() {
  const [language, setLanguage] = useState("es")
  const [boardStyle, setBoardStyle] = useState("wood")
  const [pieceStyle, setPieceStyle] = useState("standard")

  return (
    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">General Settings</CardTitle>
        <CardDescription>Customize your chess experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="board-style">Board Style</Label>
              <Select value={boardStyle} onValueChange={setBoardStyle}>
                <SelectTrigger id="board-style" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a board style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wood">Wood</SelectItem>
                  <SelectItem value="green">Tournament Green</SelectItem>
                  <SelectItem value="blue">Ocean Blue</SelectItem>
                  <SelectItem value="marble">Marble</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="piece-style">Piece Style</Label>
              <Select value={pieceStyle} onValueChange={setPieceStyle}>
                <SelectTrigger id="piece-style" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a piece style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="neo">Neo</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                  <SelectItem value="cburnett">CBurnett</SelectItem>
                  <SelectItem value="chess24">Chess24</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chessboard Preview */}
          <div className="flex flex-col items-center">
            <Label className="mb-2">Board Preview</Label>
            <div className="w-full max-w-[300px] aspect-square">
              <ChessboardComponent
                id="settings-board-preview"
                position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                boardOrientation="white"
                customBoardStyle={{
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                }}
                customDarkSquareStyle={{ backgroundColor: "#4a5568" }}
                customLightSquareStyle={{ backgroundColor: "#cbd5e0" }}
                arePiecesDraggable={false}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Preview of your selected board and piece style</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
