"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface AuthContextType {
  accessToken: string | null
  setAccessToken: (token: string | null, refreshToken?: string | null) => void
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<boolean>
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

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = Cookies.get('google_refresh_token')
    if (!refreshToken) {
      console.error('No refresh token available')
      return false
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const data = await response.json()
      setAccessToken(data.access_token, refreshToken)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear invalid tokens
      setAccessToken(null, null)
      return false
    }
  }

  const setAccessToken = (token: string | null, refreshToken?: string | null) => {
    setAccessTokenState(token)
    if (token) {
      Cookies.set('google_access_token', token, { expires: 1 }) // Expires in 1 day
    } else {
      Cookies.remove('google_access_token')
    }
    
    if (refreshToken) {
      Cookies.set('google_refresh_token', refreshToken, { expires: 30 }) // Refresh token lasts 30 days
    } else if (token === null) {
      Cookies.remove('google_refresh_token')
    }
  }

  const isAuthenticated = !!accessToken

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthenticated, refreshAccessToken }}>
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
