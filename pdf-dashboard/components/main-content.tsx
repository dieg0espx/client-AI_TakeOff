"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfUpload } from "@/components/pdf-upload"
import { LoadingStates } from "@/components/loading-states"
import { AnalysisResults } from "@/components/analysis-results"
import { useAuth } from "@/context/AuthContext"
import { GoogleLoginButton } from "@/components/google-login-button"

interface MainContentProps {
  activeSection: string
}

type ProcessingState = "upload" | "loading" | "results"

export function MainContent({ activeSection }: MainContentProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>("upload")
  const [currentFile, setCurrentFile] = useState<string>("")
  const [currentUploadId, setCurrentUploadId] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [serverResult, setServerResult] = useState<any>(null)
  const { isAuthenticated } = useAuth()

  const handleFileUpload = (file: File, uploadResponse: { id: string; status: string; message: string }) => {
    setCurrentFile(file.name)
    setCurrentUploadId(uploadResponse.id)
    setServerResult(uploadResponse)
    setProcessingState("results")
  }

  const handleLoadingComplete = (result: string) => {
    setAnalysisResult(result)
    setProcessingState("results")
  }

  const handleReset = () => {
    setProcessingState("upload")
    setCurrentFile("")
    setCurrentUploadId("")
    setAnalysisResult("")
    setServerResult(null)
  }

  const renderDashboardContent = () => {
    if (!isAuthenticated) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in with Google to access the PDF analysis features.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GoogleLoginButton />
          </CardContent>
        </Card>
      )
    }

    switch (processingState) {
      case "upload":
        return <PdfUpload onFileUpload={handleFileUpload} />

      case "loading":
        return <LoadingStates fileName={currentFile} uploadId={currentUploadId} onComplete={handleLoadingComplete} />

      case "results":
        return <AnalysisResults fileName={currentFile} result={serverResult} onReset={handleReset} />

      default:
        return <PdfUpload onFileUpload={handleFileUpload} />
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? "Upload and analyze your PDF documents with AI-powered insights."
                  : "Sign in to access PDF analysis features."
                }
              </p>
            </div>

            {renderDashboardContent()}
          </div>
        )

      case "history":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">History</h1>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? "View your previously analyzed PDF documents and results."
                  : "Sign in to view your analysis history."
                }
              </p>
            </div>

            {!isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please sign in to view your analysis history.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <GoogleLoginButton />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>Your recent PDF analysis sessions will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No analysis history yet. Upload a PDF to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "webhooks":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
              <p className="text-muted-foreground">
                Monitor real-time webhook data from your server on port 1234.
              </p>
            </div>
            <WebhookDisplay />
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? "Configure your dashboard preferences and analysis options."
                  : "Sign in to access settings."
                }
              </p>
            </div>

            {!isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please sign in to access settings.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <GoogleLoginButton />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your dashboard experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Settings panel will be implemented with additional features.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 md:p-8 max-w-7xl">{renderContent()}</div>
    </main>
  )
}
