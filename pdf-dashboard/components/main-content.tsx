"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfUpload } from "@/components/pdf-upload"
import { AnalysisResults } from "./analysis-results"
import { PreviousTakeoffs } from "./previous-takeoffs"
import { useAuth } from "@/context/AuthContext"
import { AuthPopup } from "@/components/auth-popup"

interface MainContentProps {
  activeSection: string
}

type ProcessingState = "upload" | "results"

export function MainContent({ activeSection }: MainContentProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>("upload")
  const [analysisResults, setAnalysisResults] = useState<{ fileName: string; result: any; company?: string; jobsite?: string } | null>(null)
  const { isAuthenticated } = useAuth()

  const handleFileUpload = (file: File, uploadResponse: { id: string; status: string; message: string; company?: string; jobsite?: string }) => {
    // File upload completed - navigate to results
    console.log("File uploaded successfully:", file.name, uploadResponse)
    setAnalysisResults({
      fileName: file.name,
      result: uploadResponse,
      company: uploadResponse.company,
      jobsite: uploadResponse.jobsite
    })
    setProcessingState("results")
  }

  const handleReset = () => {
    setAnalysisResults(null)
    setProcessingState("upload")
  }

  const renderDashboardContent = () => {
    if (processingState === "results" && analysisResults) {
      return (
        <AnalysisResults 
          fileName={analysisResults.fileName}
          result={analysisResults.result}
          onReset={handleReset}
          company={analysisResults.company}
          jobsite={analysisResults.jobsite}
        />
      )
    }
    return <PdfUpload onFileUpload={handleFileUpload} />
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Take Off</h1>
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
              <h1 className="text-3xl font-bold tracking-tight">Previous Take Offs</h1>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? "View and manage your previously processed PDF documents and their analysis results."
                  : "Sign in to view your previous take-offs."
                }
              </p>
            </div>

            {isAuthenticated ? (
              <PreviousTakeoffs limit={20} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground text-center">
                    Please sign in to view your previous take-offs.
                  </p>
                </CardContent>
              </Card>
            )}
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
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 md:p-8 max-w-7xl">{renderContent()}</div>
      </main>
      <AuthPopup isOpen={!isAuthenticated} />
    </>
  )
}
