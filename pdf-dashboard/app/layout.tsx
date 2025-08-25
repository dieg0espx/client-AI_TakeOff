import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleOAuthProviderWrapper } from "@/components/google-oauth-provider"
import { AuthProvider } from "@/context/AuthContext"

export const metadata: Metadata = {
  title: "PDF Analysis Dashboard",
  description: "Professional PDF analysis and processing dashboard",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <GoogleOAuthProviderWrapper>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  )
}
