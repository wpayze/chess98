import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Flag, MessageSquare } from "lucide-react"
import type { FriendSummary } from "@/models/user"

interface FriendsTabProps {
  username: string
  friends: FriendSummary[]
  followingCount?: number
  followersCount?: number
}

export function FriendsTab({ username, friends, followingCount = 0, followersCount = 0 }: FriendsTabProps) {
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
    <Card className="border-slate-800 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Friends</CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
              {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">{followingCount} Following</Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{followersCount} Followers</Badge>
          </div>
        </div>
        <CardDescription>Friends and connections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No friends yet</div>
          ) : (
            friends.map((friend) => (
              <Link href={`/profile/${friend.username}`} key={friend.id}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-slate-700">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.username} />
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
            ))
          )}

          {friends.length > 0 && (
            <div className="flex justify-center mt-4">
              <Link href={`/friends/${username}`}>
                <Button variant="outline" className="border-slate-700 bg-slate-800/50 hover:bg-slate-700">
                  View All Friends
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
