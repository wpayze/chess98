import { create } from "zustand";
import { persist } from "zustand/middleware";
import { settingsService } from "@/services/settings-service";
import { Settings } from "@/models/setings";

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  fetchSettings: (userId: string) => Promise<void>;
  updateSettings: (userId: string, updates: Settings) => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          const data = await settingsService.getSettingsByUserId(userId);
          set({ settings: data, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch settings",
          });
        }
      },

      updateSettings: async (userId: string, updates: Settings) => {
        try {
          set({ isLoading: true, error: null });
          const updated = await settingsService.updateSettings(userId, updates);
          set({ settings: updated, isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to update settings",
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "chess98-settings",
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
