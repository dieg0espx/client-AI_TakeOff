"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Download, Share, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResultsProps {
  fileName: string
  result: any
  onReset: () => void
}

export function AnalysisResults({ fileName, result, onReset }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      await navigator.clipboard.writeText(resultText)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Analysis results have been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
    const blob = new Blob([resultText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(".pdf", "")}_analysis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: "Analysis results are being downloaded.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        await navigator.share({
          title: `Analysis of ${fileName}`,
          text: resultText,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      handleCopy()
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Analysis Complete
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{fileName}</span>
                <Badge variant="secondary" className="text-xs">
                  PDF Document
                </Badge>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={onReset}>
                Upload New File
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>



      {/* Analysis Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 bg-transparent">
              <motion.div animate={{ scale: copied ? 1.1 : 1 }} transition={{ duration: 0.1 }}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </motion.div>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="bg-muted/30 rounded-lg p-6 max-h-96 overflow-y-auto border">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-foreground">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* Gradient overlay for better readability */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted/30 to-transparent pointer-events-none rounded-b-lg" />
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Analysis generated on {new Date().toLocaleDateString()}</span>
            <span>
              {typeof result === 'string' 
                ? `${result.split(" ").length} words • ${result.split("\n").length} lines`
                : `${JSON.stringify(result).split(" ").length} words • ${JSON.stringify(result).split("\n").length} lines`
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
