"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  UserPlus,
  BarChart2,
  Edit,
  Lightbulb,
} from "lucide-react";

// Import types
import type { FriendSummary } from "@/models/user";
import { useAuthStore } from "@/store/auth-store";

import { GameSummary } from "@/models/game";
import { gameService } from "@/services/game-service";
import { formatDate } from "@/utils/timeFormats";
import { profileService } from "@/services/profile-service";
import { Profile } from "@/models/profile";
import { RecentGamesTab } from "@/components/profile/recent-games-tab";
import { FriendsTab } from "@/components/profile/friends-tab";
import { AchievementsTab } from "@/components/profile/achievements-tab";
import { SolvedPuzzlesTab } from "@/components/profile/solved-puzzles-tab";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentGames, setRecentGames] = useState<GameSummary[]>([]);
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is the current user's profile
  const { user } = useAuthStore();
  const isOwnProfile = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const gameResponse = await gameService.getGameByUsername(
          username,
          1,
          5
        );
        const profileResponse = await profileService.getProfileByUsername(
          username
        );

        setProfile(profileResponse);
        setRecentGames(gameResponse.games);

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
        ]);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]); // Only depend on username, not on any state variables

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center">
        <Card className="w-full max-w-md border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
          <CardHeader>
            <CardTitle className="text-white">Profile Not Found</CardTitle>
            <CardDescription>
              We couldn't find a user with that username
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <User className="w-16 h-16 text-slate-500 mb-4" />
            <p className="text-slate-300 mb-6">
              The user "{username}" doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
                <AvatarImage
                  src={profile.avatar_url ?? ""}
                  alt={profile.display_name}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white">
                  {profile.display_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-slate-800"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  {profile.display_name}
                </h1>
                {profile.title && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 self-center">
                    {profile.title}
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
                  Member since {formatDate(profile.member_since)}
                </div>
                <div className="flex items-center text-sm text-slate-300">
                  <Activity className="w-4 h-4 mr-1 text-slate-400" />
                  {profile.total_games} games played
                </div>
              </div>

              <p className="text-slate-300 mb-4">{profile.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {!isOwnProfile && (
                  <>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Challenge
                    </Button>
                  </>
                )}
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
                  <span className="text-xl font-bold text-white">
                    {profile.total_games}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-lg">
                  <span className="text-sm text-slate-400">Win %</span>
                  <span className="text-xl font-bold text-white">
                    {profile.total_games > 0
                      ? `${((profile.wins / profile.total_games) * 100).toFixed(
                        1
                      )}%`
                      : "0%"}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-lg">
                  <span className="text-sm text-slate-400">Best</span>
                  <span className="text-xl font-bold text-white">
                    {Math.max(
                      profile.ratings.bullet,
                      profile.ratings.blitz,
                      profile.ratings.rapid,
                      profile.ratings.classical
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-slate-300">{profile.wins} W</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-slate-300">{profile.losses} L</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-slate-500 mr-1"></div>
                  <span className="text-slate-300">{profile.draws} D</span>
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
                  <div className="text-xs text-slate-400 mt-1">
                    Tactical training
                  </div>
                </div>
              </CardContent>
            </Card>
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
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">
                    Classical
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                    {profile.ratings.classical}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for Games, Friends, Achievements */}
       {/* Tabs for Games, Friends, Achievements, and Solved Puzzles */}
       <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Recent Games</span>
            </TabsTrigger>
            <TabsTrigger value="puzzles" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>Solved Puzzles</span>
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
            <RecentGamesTab username={username} games={recentGames} />
          </TabsContent>

          {/* Solved Puzzles Tab */}
          <TabsContent value="puzzles">
            <SolvedPuzzlesTab username={username} />
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends">
            <FriendsTab username={username} friends={friends} followingCount={0} followersCount={0} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsTab achievements={[]} wins={profile.wins} losses={profile.losses} draws={profile.draws} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
