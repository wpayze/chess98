import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, LoginRequest, User, RegisterRequest } from "@/models/auth"
import { authService } from "@/services/auth-service"

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<User | null>
  logout: () => void
  refreshToken: () => Promise<void>
  clearError: () => void
  hasRole: (role: string | string[]) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null })

          const data = await authService.login(credentials)

          set({
            user: data.user,
            accessToken: data.access_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
          })
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null })

          const user = await authService.register(userData)

          // Note: Some APIs automatically log in the user after registration
          // If your API doesn't, you might need to call login separately

          set({ isLoading: false })
          return user
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
          })
          return null
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshToken: async () => {
        try {
          const { accessToken } = get()
          if (!accessToken) return

          const data = await authService.refreshToken(accessToken)
          set({ accessToken: data.access_token })
        } catch (error) {
          // If refresh fails, log the user out
          get().logout()
        }
      },

      clearError: () => {
        set({ error: null })
      },

      hasRole: (role: string | string[]) => {
        const { user } = get()
        if (!user) return false

        if (Array.isArray(role)) {
          return role.includes(user.role)
        }

        return user.role === role
      },
    }),
    {
      name: "chess98-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

