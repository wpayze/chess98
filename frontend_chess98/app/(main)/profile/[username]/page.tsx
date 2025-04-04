"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Trophy,
  Clock,
  Zap,
  Hourglass,
  Users,
  Activity,
  Calendar,
  Flag,
  Award,
  MapPin,
  ChevronRight,
  MessageSquare,
  UserPlus,
  BarChart2,
  CheckCircle,
  XCircle,
  CircleDot,
  Edit,
} from "lucide-react"

// Import mock data
import mockGamesData from "@/data/games.json"

// Import types
import type { Profile, GameSummary, FriendSummary } from "@/models/user"
import { useAuthStore } from "@/store/auth-store"

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentGames, setRecentGames] = useState<GameSummary[]>([])
  const [friends, setFriends] = useState<FriendSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check if this is the current user's profile
  const { user } = useAuthStore()
  const isOwnProfile = user?.username === username

  useEffect(() => {
    // Simulate API call to fetch profile data
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Convert dates from strings to Date objects in games data
        const gamesWithDates = mockGamesData.map((game) => ({
          ...game,
          date: new Date(game.date),
        })) as GameSummary[]

        // Mock profile data
        setProfile({
          id: "1",
          userId: "1",
          displayName: username,
          bio: "Soy GP (Gran Pato)",
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
            title: "GP",
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
        })

        // Use the mock games data
        setRecentGames(gamesWithDates)

        // Mock friends
        setFriends([
          {
            id: "2",
            username: "ChessMaster42",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 1780,
            status: "online",
            lastActive: new Date(),
          },
          {
            id: "3",
            username: "KnightRider",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 1820,
            status: "playing",
            lastActive: new Date(),
          },
          {
            id: "4",
            username: "QueenGambit",
            avatar: "/placeholder.svg?height=40&width=40",
            rating: 1795,
            status: "offline",
            lastActive: new Date("2023-03-24T14:30:00"),
          },
        ])
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [username]) // Only depend on username, not on any state variables

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

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <Card className="w-full max-w-md border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Profile Not Found</CardTitle>
            <CardDescription>We couldn't find a user with that username</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <User className="w-16 h-16 text-slate-500 mb-4" />
            <p className="text-slate-300 mb-6">The user "{username}" doesn't exist or has been removed.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format date to readable string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time ago
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"

    return Math.floor(seconds) + " seconds ago"
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 py-8 overflow-y-auto">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-indigo-500/30">
                <AvatarImage src={profile.avatar} alt={profile.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white">
                  {profile.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-slate-800"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {profile.displayName}
                </h1>
                {profile.stats.title && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 self-center">
                    {profile.stats.title}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-3">
                {profile.country && (
                  <div className="flex items-center text-sm text-slate-300">
                    <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                    {profile.country}
                  </div>
                )}
                <div className="flex items-center text-sm text-slate-300">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                  Member since {formatDate(profile.memberSince)}
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <Activity className="w-4 h-4 mr-1 text-slate-400" />
                  {profile.stats.totalGames} games played
                </div>
              </div>

              <p className="text-slate-300 mb-4">{profile.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Friend
                </Button>
                <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  <Flag className="w-4 h-4 mr-2" />
                  Challenge
                </Button>
                {/* Add this Edit Profile button that only shows for the user's own profile */}
                {isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
              <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                <div className="flex flex-col items-center p-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-lg">
                  <span className="text-sm text-slate-400">Games</span>
                  <span className="text-xl font-bold text-white">{profile.stats.totalGames}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-lg">
                  <span className="text-sm text-slate-400">Win %</span>
                  <span className="text-xl font-bold text-white">{profile.stats.winRate}%</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-lg">
                  <span className="text-sm text-slate-400">Best</span>
                  <span className="text-xl font-bold text-white">
                    {Math.max(
                      profile.ratings.bullet,
                      profile.ratings.blitz,
                      profile.ratings.rapid,
                      profile.ratings.classical,
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-slate-300">{profile.stats.wins} W</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-slate-300">{profile.stats.losses} L</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-500 mr-1"></div>
                  <span className="text-slate-300">{profile.stats.draws} D</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-amber-400" />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Ratings
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Bullet</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.bullet}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">1+0, 1+1, 2+1</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Blitz</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.blitz}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">3+0, 3+2, 5+0</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Hourglass className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Rapid</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.rapid}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">10+0, 15+10</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Classical</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.classical}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">30+0, 30+20</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <BarChart2 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">Puzzles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.puzzle}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Tactical training</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for Games, Friends, Achievements */}
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Recent Games</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Friends</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </TabsTrigger>
          </TabsList>

          {/* Recent Games Tab */}
          <TabsContent value="games">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Recent Games</CardTitle>
                <CardDescription>Last {recentGames.length} games played</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentGames.map((game) => (
                    <Link href={`/game/${game.id}`} key={game.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-full min-h-[40px] rounded-l-lg ${
                              game.result === "win"
                                ? "bg-green-500"
                                : game.result === "loss"
                                  ? "bg-red-500"
                                  : "bg-slate-500"
                            }`}
                          ></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">vs {game.opponent.username}</span>
                              <Badge className="bg-slate-700 text-slate-300">{game.timeControl}</Badge>
                              <span className="text-xs text-slate-400">
                                {game.playerColor === "white" ? "White" : "Black"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <span className="text-slate-400">{formatDate(game.date)}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-slate-400">{game.moves} moves</span>
                              <span className="text-slate-500">•</span>
                              <span
                                className={`${
                                  game.result === "win"
                                    ? "text-green-400"
                                    : game.result === "loss"
                                      ? "text-red-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {game.result === "win" ? "Won" : game.result === "loss" ? "Lost" : "Draw"} by{" "}
                                {game.endReason}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            <span className="text-slate-300 mr-2">{game.opponent.rating}</span>
                            <span
                              className={`text-sm font-medium ${
                                game.ratingChange > 0
                                  ? "text-green-400"
                                  : game.ratingChange < 0
                                    ? "text-red-400"
                                    : "text-slate-400"
                              }`}
                            >
                              {game.ratingChange > 0 ? "+" : ""}
                              {game.ratingChange}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 mt-1" />
                        </div>
                      </div>
                    </Link>
                  ))}

                  <div className="flex justify-center mt-4">
                    <Link href={`/games/${profile.displayName}`}>
                      <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                        View All Games
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Friends</CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                      {profile.friends.length} Friends
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {profile.following.length} Following
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {profile.followers.length} Followers
                    </Badge>
                  </div>
                </div>
                <CardDescription>Friends and connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <Link href={`/profile/${friend.username}`} key={friend.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-slate-700">
                            <AvatarImage src={friend.avatar} alt={friend.username} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                              {friend.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{friend.username}</div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">{friend.rating}</span>
                              <span className="text-slate-500">•</span>
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    friend.status === "online"
                                      ? "bg-green-500"
                                      : friend.status === "playing"
                                        ? "bg-amber-500"
                                        : "bg-slate-500"
                                  }`}
                                ></div>
                                <span className="text-slate-400">
                                  {friend.status === "online"
                                    ? "Online"
                                    : friend.status === "playing"
                                      ? "Playing"
                                      : `Last seen ${timeAgo(friend.lastActive)}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 px-2"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 h-8 px-2"
                          >
                            <Flag className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <div className="flex justify-center mt-4">
                    <Link href={`/friends/${profile.displayName}`}>
                      <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                        View All Friends
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Achievements</CardTitle>
                <CardDescription>Earned achievements and badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.stats.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                      <div className="p-2 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                        <Trophy className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{achievement.name}</div>
                        <div className="text-sm text-slate-400">{achievement.description}</div>
                        <div className="text-xs text-slate-500 mt-1">Earned on {formatDate(achievement.earnedAt)}</div>
                      </div>
                    </div>
                  ))}

                  {/* Locked achievements */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 opacity-60">
                    <div className="p-2 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
                      <Award className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Endgame Expert</div>
                      <div className="text-sm text-slate-400">Win 50 games in the endgame phase</div>
                      <div className="text-xs text-slate-500 mt-1">Progress: 32/50</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 opacity-60">
                    <div className="p-2 rounded-full bg-gradient-to-br from-slate-500/20 to-slate-600/20 border border-slate-500/30">
                      <Award className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Opening Scholar</div>
                      <div className="text-sm text-slate-400">Play 20 different openings</div>
                      <div className="text-xs text-slate-500 mt-1">Progress: 14/20</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6 bg-slate-700/50" />

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="text-sm text-slate-400">Wins</div>
                        <div className="text-xl font-bold text-white">{profile.stats.wins}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <div>
                        <div className="text-sm text-slate-400">Losses</div>
                        <div className="text-xl font-bold text-white">{profile.stats.losses}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                      <CircleDot className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-sm text-slate-400">Draws</div>
                        <div className="text-xl font-bold text-white">{profile.stats.draws}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

