"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from "next/dynamic"
import { useAuthStore } from "@/store/auth-store"
import { useSettingsStore } from "@/store/settings-store"
import { Settings } from "@/models/setings"
import { getBoardColors } from "@/utils/boardTheme"
import { getCustomPieces } from "@/utils/pieces"
import { Save } from "lucide-react"
import { Button } from "../ui/button"

const ChessboardComponent = dynamic(() => import("react-chessboard").then(mod => mod.Chessboard), { ssr: false })

export function GeneralTab() {
  const { user } = useAuthStore()
  const { settings, fetchSettings, updateSettings } = useSettingsStore()

  // Estado temporal para los selects
  const [localBoardTheme, setLocalBoardTheme] = useState("default")
  const [localPieceSet, setLocalPieceSet] = useState("default")

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      await updateSettings(user.id, {
        board_theme: localBoardTheme,
        piece_set: localPieceSet,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar settings al montar
  useEffect(() => {
    if (user?.id) {
      fetchSettings(user.id)
    }
  }, [user])

  // Inicializar estados locales una vez que settings esté listo
  useEffect(() => {
    if (settings) {
      setLocalBoardTheme(settings.board_theme || "default")
      setLocalPieceSet(settings.piece_set || "default")
    }
  }, [settings])

  const boardColors = getBoardColors(localBoardTheme)
  const pieces = getCustomPieces(localPieceSet)

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
              <Select value="es" onValueChange={() => { }}>
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
              <Select
                value={localBoardTheme}
                onValueChange={(value) => setLocalBoardTheme(value)}
              >
                <SelectTrigger id="board-style" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a board style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wood">Wood</SelectItem>
                  <SelectItem value="green">Tournament Green</SelectItem>
                  <SelectItem value="blue">Ocean Blue</SelectItem>
                  <SelectItem value="marble">Marble</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="piece-style">Piece Style</Label>
              <Select
                value={localPieceSet}
                onValueChange={(value) => setLocalPieceSet(value)}
              >
                <SelectTrigger id="piece-style" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Select a piece style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (CBurnett)</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                  <SelectItem value="cardinal">Cardinal</SelectItem>
                  <SelectItem value="cburnett">CBurnett</SelectItem>
                  <SelectItem value="fresca">Fresca</SelectItem>
                  <SelectItem value="icpieces">IC Pieces</SelectItem>
                  <SelectItem value="maestro">Maestro</SelectItem>
                  <SelectItem value="merida">Merida</SelectItem>
                  <SelectItem value="mpchess">MP Chess</SelectItem>
                  <SelectItem value="pixel">Pixel</SelectItem>
                  <SelectItem value="tatiana">Tatiana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
                customDarkSquareStyle={{ backgroundColor: boardColors.dark }}
                customLightSquareStyle={{ backgroundColor: boardColors.light }}
                customPieces={pieces}
                arePiecesDraggable={false}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Preview of your selected board and piece style</p>
          </div>
        </div>
        {/* Add Save Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-slate-700">
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
