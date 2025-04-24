export class ApiService {
  protected apiUrl: string

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  /**
   * Make an authenticated API request
   */
  protected async fetchWithAuth<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Make a public API request (no auth)
   */
  protected async fetchPublic<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
 * PATCH público (sin autenticación)
 */
  protected async patchPublic<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.fetchPublic<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH autenticado (requiere JWT)
   */
  protected async patchPrivate<T>(endpoint: string, data: any, token?: string, options: RequestInit = {}): Promise<T> {
    const jwt = token || localStorage.getItem("access_token"); // fallback
    if (!jwt) throw new Error("No token found");

    return this.fetchWithAuth<T>(endpoint, jwt, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

