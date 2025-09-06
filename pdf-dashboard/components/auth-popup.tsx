"use client"

import { useAuth } from "@/context/AuthContext"
import { GoogleLoginButton } from "@/components/google-login-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Shield, FileText, Zap } from "lucide-react"

interface AuthPopupProps {
  isOpen: boolean
  onClose?: () => void
}

export function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const { isAuthenticated } = useAuth()

  if (!isOpen || isAuthenticated) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative w-full max-w-2xl mx-4">
        <Card className="border-0 bg-white shadow-none">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Please sign in with Google to access the Take Off analysis features.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white">
                <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-gray-900">Take Off Analysis</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Upload and analyze Take Off documents
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-gray-900">AI Insights</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Get intelligent Take Off insights
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-white">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm text-gray-900">Secure Access</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Your data is protected and private
                </p>
              </div>
            </div>

            {/* Login Section */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Sign in to continue</h3>
                <p className="text-sm text-gray-600">
                  Use your Google account to access all features
                </p>
              </div>
              
              <div className="flex justify-center">
                <GoogleLoginButton />
              </div>
              
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                By signing in, you agree to our terms of service and privacy policy. 
                We only access the minimum required permissions for Take Off analysis.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
