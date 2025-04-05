import { ApiService } from "./api-service"
import type { Profile } from "@/models/profile"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class ProfileService extends ApiService {
  /**
   * Get profile by username
   */
  async getProfileByUsername(username: string): Promise<Profile> {
    const endpoint = replacePathParams(ENDPOINTS.PROFILE_BY_USERNAME, { username })
    return this.fetchPublic<Profile>(endpoint)
  }
}

export const profileService = new ProfileService()
