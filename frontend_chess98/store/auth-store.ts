import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, LoginRequest, User, RegisterRequest } from "@/models/auth"
import { authService } from "@/services/auth-service"

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<User | null>
  logout: () => void
  clearError: () => void
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
          console.log({error})
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

      clearError: () => {
        set({ error: null })
      }
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

