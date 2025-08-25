"use client"

import { GoogleOAuthProvider } from '@react-oauth/google'
import { ReactNode } from 'react'

interface GoogleOAuthProviderProps {
  children: ReactNode
}

export function GoogleOAuthProviderWrapper({ children }: GoogleOAuthProviderProps) {
  // Use the correct environment variable name for Next.js
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here'

  if (!clientId || clientId === 'your-google-client-id-here') {
    console.error('Google Client ID not found. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local file')
    return <div>Error: Google Client ID not configured</div>
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  )
}
