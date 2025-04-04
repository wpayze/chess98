export interface User {
  id: string
  email: string
  username: string
  passwordHash: string // Never expose this in client
  isEmailVerified: boolean
  status: "active" | "suspended" | "banned"
  role: "user" | "moderator" | "admin"
  createdAt: Date
  lastLoginAt: Date
  authProviders: {
    google?: {
      id: string
      email: string
    }
    // Add other auth providers as needed
  }
  // Security settings
  twoFactorEnabled: boolean
  // Relationships
  profileId: string // Reference to Profile
}

// Profile Model - Chess-specific information and social data
export interface Profile {
  id: string
  userId: string // Reference to User
  displayName: string
  bio: string
  country: string
  avatar: string
  // Chess-specific data
  ratings: {
    bullet: number
    blitz: number
    rapid: number
    classical: number
    puzzle: number
  }
  stats: {
    totalGames: number
    wins: number
    losses: number
    draws: number
    winRate: number
    // Achievements
    achievements: Achievement[]
    // Titles (e.g., GM, IM, FM)
    title?: "GM" | "IM" | "FM" | "CM" | "NM" | "GP" | null
  }
  // Social
  friends: string[] // Array of profile IDs
  following: string[] // Array of profile IDs
  followers: string[] // Array of profile IDs
  // Preferences
  preferences: {
    boardTheme: string
    pieceSet: string
    moveConfirmation: boolean
    soundEnabled: boolean
    autoPromoteToQueen: boolean
    showLegalMoves: boolean
  }
  // Activity
  lastActive: Date
  memberSince: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: Date
}

// Friend model for profile display
export interface FriendSummary {
  id: string
  username: string
  avatar: string
  rating: number // Best rating
  status: "online" | "playing" | "offline"
  lastActive: Date
}

