"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface AuthContextType {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  useEffect(() => {
    // Load token from cookies on mount
    const savedToken = Cookies.get('google_access_token')
    if (savedToken) {
      setAccessTokenState(savedToken)
    }
  }, [])

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token)
    if (token) {
      Cookies.set('google_access_token', token, { expires: 1 }) // Expires in 1 day
    } else {
      Cookies.remove('google_access_token')
    }
  }

  const isAuthenticated = !!accessToken

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
