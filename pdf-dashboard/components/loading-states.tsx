"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Brain, Sparkles, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface LoadingStatesProps {
  fileName: string
  uploadId: string
  onComplete: (result: string) => void
}

const loadingSteps = [
  {
    id: "reading",
    label: "Reading file...",
    description: "Processing your PDF document",
    icon: FileText,
    duration: 2000,
  },
  {
    id: "analyzing",
    label: "Analyzing...",
    description: "Extracting content and structure",
    icon: Brain,
    duration: 3000,
  },
  {
    id: "generating",
    label: "Generating response...",
    description: "Creating AI-powered insights",
    icon: Sparkles,
    duration: 2500,
  },
]

export function LoadingStates({ fileName, uploadId, onComplete }: LoadingStatesProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)

  useEffect(() => {
    if (currentStep >= loadingSteps.length) {
      // Get the actual analysis result from the server
      const fetchAnalysisResult = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'
          const response = await fetch(`${apiUrl}/AI-Takeoff/${uploadId}`)
          
          if (response.ok) {
            const data = await response.json()
            onComplete(data.result || "Analysis completed successfully")
          } else {
            onComplete("Analysis completed. Please check the results.")
          }
        } catch (error) {
          console.error("Error fetching analysis result:", error)
          onComplete("Analysis completed. Please check the results.")
        }
      }

      fetchAnalysisResult()
      return
    }

    const currentStepData = loadingSteps[currentStep]
    const stepStartTime = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - stepStartTime
      const stepProgressValue = Math.min((elapsed / currentStepData.duration) * 100, 100)
      const totalProgress = (currentStep * 100 + stepProgressValue) / loadingSteps.length

      setStepProgress(stepProgressValue)
      setProgress(totalProgress)

      if (stepProgressValue >= 100) {
        if (currentStep < loadingSteps.length - 1) {
          setTimeout(() => {
            setCurrentStep((prev) => prev + 1)
            setStepProgress(0)
          }, 300)
        } else {
          setTimeout(() => setCurrentStep((prev) => prev + 1), 300)
        }
      } else {
        requestAnimationFrame(updateProgress)
      }
    }

    requestAnimationFrame(updateProgress)
  }, [currentStep, fileName, onComplete])

  return (
    <Card className="border-2 border-primary/20 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Brain className="h-5 w-5 text-primary" />
          </motion.div>
          Processing PDF Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">{fileName}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {loadingSteps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const isUpcoming = index > currentStep

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 ${
                  isActive ? "bg-primary/5 border border-primary/20" : isCompleted ? "bg-muted/30" : "bg-muted/10"
                }`}
              >
                <div
                  className={`rounded-full p-2 transition-colors duration-200 ${
                    isCompleted ? "bg-green-500/10" : isActive ? "bg-primary/10" : "bg-muted/50"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.div key="completed" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        animate={
                          isActive
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }
                            : {}
                        }
                        transition={{
                          duration: 1.5,
                          repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                          ease: "easeInOut",
                        }}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            isActive ? "text-primary" : isUpcoming ? "text-muted-foreground" : "text-muted-foreground"
                          }`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex-1">
                  <p
                    className={`font-medium text-sm ${
                      isActive ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className={`text-xs ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                    {step.description}
                  </p>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-2"
                    >
                      <Progress value={stepProgress} className="h-1" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
