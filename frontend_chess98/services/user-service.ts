import { ApiService } from "./api-service"
import type { User, Profile } from "@/models/user"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class UserService extends ApiService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string, token: string): Promise<Profile> {
    const endpoint = replacePathParams(ENDPOINTS.USER_BY_ID, { id: userId }) + "/profile"
    return this.fetchWithAuth<Profile>(endpoint, token)
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<Profile>, token: string): Promise<Profile> {
    return this.fetchWithAuth<Profile>(ENDPOINTS.USER_PROFILE, token, {
      method: "PATCH",
      body: JSON.stringify(profileData),
    })
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const endpoint = replacePathParams(ENDPOINTS.USER_BY_USERNAME, { username })
    return this.fetchPublic<User>(endpoint)
  }

  /**
   * Get user's friends
   */
  async getUserFriends(userId: string, token: string): Promise<User[]> {
    const endpoint = replacePathParams(ENDPOINTS.USER_FRIENDS, { id: userId })
    return this.fetchWithAuth<User[]>(endpoint, token)
  }

  /**
   * Add friend
   */
  async addFriend(friendId: string, token: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(ENDPOINTS.ADD_FRIEND, token, {
      method: "POST",
      body: JSON.stringify({ friendId }),
    })
  }

  /**
   * Remove friend
   */
  async removeFriend(friendId: string, token: string): Promise<{ message: string }> {
    const endpoint = replacePathParams(ENDPOINTS.REMOVE_FRIEND, { id: friendId })
    return this.fetchWithAuth<{ message: string }>(endpoint, token, {
      method: "DELETE",
    })
  }
}

// Export a singleton instance
export const userService = new UserService()

