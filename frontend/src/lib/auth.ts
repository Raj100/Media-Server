import { apiService, type ApiResponse } from "./api"

interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

class AuthManager {
  private listeners: ((state: AuthState) => void)[] = []
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  }

  constructor() {
    this.initializeAuth()
  }

  private initializeAuth() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          this.setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          this.clearAuth()
        }
      } else {
        this.setState({ ...this.state, isLoading: false })
      }
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState }
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getState(): AuthState {
    return this.state
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    this.setState({ ...this.state, isLoading: true })

    const response = await apiService.login(email, password)

    if (response.success && response.data) {
      const { token, user } = response.data
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(user))

      this.setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      this.setState({ ...this.state, isLoading: false })
    }

    return response
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ token: string; user: User }>> {
    this.setState({ ...this.state, isLoading: true })

    const response = await apiService.register(email, password, name)

    if (response.success && response.data) {
      const { token, user } = response.data
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(user))

      this.setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      this.setState({ ...this.state, isLoading: false })
    }

    return response
  }

  async googleLogin(token: string): Promise<ApiResponse<{ token: string; user: User }>> {
    this.setState({ ...this.state, isLoading: true })

    const response = await apiService.googleAuth(token)

    if (response.success && response.data) {
      const { token: authToken, user } = response.data
      localStorage.setItem("auth_token", authToken)
      localStorage.setItem("user_data", JSON.stringify(user))

      this.setState({
        user,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      this.setState({ ...this.state, isLoading: false })
    }

    return response
  }

  logout() {
    this.clearAuth()
  }

  private clearAuth() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")

    this.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  isAdmin(): boolean {
    return this.state.user?.role === "admin"
  }
}

// Export singleton instance
export const authManager = new AuthManager()

// Export types
export type { User, AuthState }
