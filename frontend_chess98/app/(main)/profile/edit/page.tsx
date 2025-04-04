"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, MapPin, Save, ChevronLeft, Upload, AlertCircle, CheckCircle, Shield, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/store/auth-store"

// Import types
import type { Profile } from "@/models/user"

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [country, setCountry] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")

  // Preferences state
  const [boardTheme, setBoardTheme] = useState("wood")
  const [pieceSet, setPieceSet] = useState("standard")
  const [moveConfirmation, setMoveConfirmation] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoPromoteToQueen, setAutoPromoteToQueen] = useState(true)
  const [showLegalMoves, setShowLegalMoves] = useState(true)

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true)
  const [gameHistoryVisibility, setGameHistoryVisibility] = useState(true)
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [allowFriendRequests, setAllowFriendRequests] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch profile data
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock profile data
        const mockProfile: Profile = {
          id: "1",
          userId: "1",
          displayName: user?.username || "ChessMaster123",
          bio: "Chess enthusiast and coffee lover. Playing since 2015.",
          country: "United States",
          avatar: "/placeholder.svg?height=200&width=200",
          ratings: {
            bullet: 1850,
            blitz: 1752,
            rapid: 1805,
            classical: 1920,
            puzzle: 2100,
          },
          stats: {
            totalGames: 1243,
            wins: 623,
            losses: 498,
            draws: 122,
            winRate: 50.1,
            achievements: [
              {
                id: "1",
                name: "Checkmate Master",
                description: "Win 100 games by checkmate",
                icon: "trophy",
                earnedAt: new Date("2023-01-15"),
              },
              {
                id: "2",
                name: "Blitz Specialist",
                description: "Reach 1700 rating in Blitz",
                icon: "zap",
                earnedAt: new Date("2022-11-03"),
              },
            ],
            title: null,
          },
          friends: ["2", "3", "4"],
          following: ["2", "3", "4", "5", "6"],
          followers: ["2", "3", "7", "8"],
          preferences: {
            boardTheme: "wood",
            pieceSet: "standard",
            moveConfirmation: true,
            soundEnabled: true,
            autoPromoteToQueen: true,
            showLegalMoves: true,
          },
          lastActive: new Date(),
          memberSince: new Date("2020-06-12"),
        }

        setProfile(mockProfile)

        // Set form values
        setDisplayName(mockProfile.displayName)
        setBio(mockProfile.bio)
        setCountry(mockProfile.country)
        setEmail(user?.email || "user@example.com")
        setAvatar(mockProfile.avatar)

        // Set preferences
        setBoardTheme(mockProfile.preferences.boardTheme)
        setPieceSet(mockProfile.preferences.pieceSet)
        setMoveConfirmation(mockProfile.preferences.moveConfirmation)
        setSoundEnabled(mockProfile.preferences.soundEnabled)
        setAutoPromoteToQueen(mockProfile.preferences.autoPromoteToQueen)
        setShowLegalMoves(mockProfile.preferences.showLegalMoves)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setSaveError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      // In a real app, this would be an API call to update the profile
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update local profile state
      if (profile) {
        const updatedProfile = {
          ...profile,
          displayName,
          bio,
          country,
          preferences: {
            ...profile.preferences,
            boardTheme,
            pieceSet,
            moveConfirmation,
            soundEnabled,
            autoPromoteToQueen,
            showLegalMoves,
          },
        }
        setProfile(updatedProfile)
      }

      setSaveSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setSaveError("Failed to save profile changes")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8 overflow-y-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Profile</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal Info</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <form onSubmit={handleSaveProfile}>
                  <CardHeader>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                    <CardDescription>Update your personal details and profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {saveSuccess && (
                      <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Profile updated successfully!</AlertDescription>
                      </Alert>
                    )}

                    {saveError && (
                      <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{saveError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-32 h-32 border-4 border-indigo-500/30">
                          <AvatarImage src={avatar} alt={displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white">
                            {displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-sm"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Avatar
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-sm font-medium">
                            Username
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="username"
                              value={user?.username || ""}
                              className="pl-10 bg-slate-800/50 border-slate-700"
                              disabled
                            />
                          </div>
                          <p className="text-xs text-slate-400">Username cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="display-name" className="text-sm font-medium">
                            Display Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="display-name"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="pl-10 bg-slate-800/50 border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-slate-800/50 border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-sm font-medium">
                            Country
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Select value={country} onValueChange={setCountry}>
                              <SelectTrigger id="country" className="pl-10 bg-slate-800/50 border-slate-700">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="France">France</SelectItem>
                                <SelectItem value="Spain">Spain</SelectItem>
                                <SelectItem value="Italy">Italy</SelectItem>
                                <SelectItem value="Japan">Japan</SelectItem>
                                <SelectItem value="Brazil">Brazil</SelectItem>
                                <SelectItem value="India">India</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm font-medium">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="bg-slate-800/50 border-slate-700 min-h-[100px]"
                          />
                          <p className="text-xs text-slate-400">
                            Brief description for your profile. Maximum 200 characters.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-slate-700 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                      onClick={() => router.push("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
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
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <form onSubmit={handleSaveProfile}>
                  <CardHeader>
                    <CardTitle className="text-white">Game Preferences</CardTitle>
                    <CardDescription>Customize your chess experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {saveSuccess && (
                      <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Preferences updated successfully!</AlertDescription>
                      </Alert>
                    )}

                    {saveError && (
                      <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{saveError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="board-theme" className="text-sm font-medium">
                          Board Theme
                        </Label>
                        <Select value={boardTheme} onValueChange={setBoardTheme}>
                          <SelectTrigger id="board-theme" className="bg-slate-800/50 border-slate-700">
                            <SelectValue placeholder="Select a board theme" />
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
                        <Label htmlFor="piece-set" className="text-sm font-medium">
                          Piece Set
                        </Label>
                        <Select value={pieceSet} onValueChange={setPieceSet}>
                          <SelectTrigger id="piece-set" className="bg-slate-800/50 border-slate-700">
                            <SelectValue placeholder="Select a piece set" />
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

                      <Separator className="my-4 bg-slate-700/50" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="move-confirmation" className="text-base">
                              Move Confirmation
                            </Label>
                            <p className="text-sm text-slate-400">Confirm moves before they are submitted</p>
                          </div>
                          <Switch
                            id="move-confirmation"
                            checked={moveConfirmation}
                            onCheckedChange={setMoveConfirmation}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sound-enabled" className="text-base">
                              Sound Effects
                            </Label>
                            <p className="text-sm text-slate-400">Enable sound effects during gameplay</p>
                          </div>
                          <Switch id="sound-enabled" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="auto-promote" className="text-base">
                              Auto-Promote to Queen
                            </Label>
                            <p className="text-sm text-slate-400">Automatically promote pawns to queens</p>
                          </div>
                          <Switch
                            id="auto-promote"
                            checked={autoPromoteToQueen}
                            onCheckedChange={setAutoPromoteToQueen}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="show-legal-moves" className="text-base">
                              Show Legal Moves
                            </Label>
                            <p className="text-sm text-slate-400">Highlight legal moves when a piece is selected</p>
                          </div>
                          <Switch id="show-legal-moves" checked={showLegalMoves} onCheckedChange={setShowLegalMoves} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-slate-700 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                      onClick={() => router.push("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
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
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <form onSubmit={handleSaveProfile}>
                  <CardHeader>
                    <CardTitle className="text-white">Privacy Settings</CardTitle>
                    <CardDescription>Control your privacy and visibility preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {saveSuccess && (
                      <Alert className="bg-green-900/20 border-green-900/50 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Privacy settings updated successfully!</AlertDescription>
                      </Alert>
                    )}

                    {saveError && (
                      <Alert className="bg-red-900/20 border-red-900/50 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{saveError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="profile-visibility" className="text-base">
                            Profile Visibility
                          </Label>
                          <p className="text-sm text-slate-400">Make your profile visible to other users</p>
                        </div>
                        <Switch
                          id="profile-visibility"
                          checked={profileVisibility}
                          onCheckedChange={setProfileVisibility}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="game-history-visibility" className="text-base">
                            Game History Visibility
                          </Label>
                          <p className="text-sm text-slate-400">Allow others to view your game history</p>
                        </div>
                        <Switch
                          id="game-history-visibility"
                          checked={gameHistoryVisibility}
                          onCheckedChange={setGameHistoryVisibility}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="online-status" className="text-base">
                            Online Status
                          </Label>
                          <p className="text-sm text-slate-400">Show when you're online</p>
                        </div>
                        <Switch id="online-status" checked={onlineStatus} onCheckedChange={setOnlineStatus} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="friend-requests" className="text-base">
                            Friend Requests
                          </Label>
                          <p className="text-sm text-slate-400">Allow friend requests from other users</p>
                        </div>
                        <Switch
                          id="friend-requests"
                          checked={allowFriendRequests}
                          onCheckedChange={setAllowFriendRequests}
                        />
                      </div>

                      <Separator className="my-4 bg-slate-700/50" />

                      <div className="space-y-2">
                        <Label htmlFor="email-notifications" className="text-base">
                          Email Notifications
                        </Label>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="email-game-invites" />
                            <Label htmlFor="email-game-invites" className="text-sm text-slate-300">
                              Game invites
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="email-friend-requests" />
                            <Label htmlFor="email-friend-requests" className="text-sm text-slate-300">
                              Friend requests
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="email-tournaments" />
                            <Label htmlFor="email-tournaments" className="text-sm text-slate-300">
                              Tournament notifications
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="email-newsletter" />
                            <Label htmlFor="email-newsletter" className="text-sm text-slate-300">
                              Newsletter and updates
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-slate-700 pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                      onClick={() => router.push("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
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
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

