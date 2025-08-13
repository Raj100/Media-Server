"use client"

import { useState, useEffect } from "react"
import { authManager, type AuthState } from "@/lib/auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState())

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState)
    return unsubscribe
  }, [])

  return {
    ...authState,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    googleLogin: authManager.googleLogin.bind(authManager),
    logout: authManager.logout.bind(authManager),
    isAdmin: authManager.isAdmin.bind(authManager),
  }
}
