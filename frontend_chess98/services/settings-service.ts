import { Settings, SettingsPatch } from "@/models/setings";
import { ApiService } from "./api-service";
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints";

class SettingsService extends ApiService {
  /**
   * Obtener settings por ID de usuario
   */
  async getSettingsByUserId(userId: string): Promise<Settings> {
    const endpoint = replacePathParams(ENDPOINTS.SETTINGS_BY_USER_ID, { user_id: userId });
    return this.fetchPublic<Settings>(endpoint);
  }

  /**
   * Actualizar settings por ID de usuario
   */
  async updateSettings(userId: string, data: SettingsPatch): Promise<Settings> {
    const endpoint = replacePathParams(ENDPOINTS.SETTINGS_BY_USER_ID, { user_id: userId });
    return this.patchPublic<Settings>(endpoint, data);
  }
}

// Exporta instancia única
export const settingsService = new SettingsService();
