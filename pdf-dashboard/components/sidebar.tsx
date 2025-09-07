"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { GoogleLoginButton } from "@/components/google-login-button"
import { useAuth } from "@/context/AuthContext"
import { LayoutDashboard, History, Settings, Menu, X, LogOut } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

const navigationItems = [
  {
    id: "dashboard",
    label: "New Take Off",
    icon: LayoutDashboard,
  },
  {
    id: "history",
    label: "Previous Take Offs",
    icon: History,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]

export function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, setAccessToken } = useAuth()

  const handleLogout = () => {
    setAccessToken(null)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-sidebar-foreground">PDF Dashboard</h1>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    setActiveSection(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-3">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full justify-start gap-3"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <GoogleLoginButton />
            )}
            <p className="text-xs text-sidebar-foreground/60 text-center">PDF Analysis Dashboard v1.0</p>
          </div>
        </div>
      </div>
    </>
  )
}
