"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Download, Share, FileText, Image, BarChart3, Sparkles, Loader2 } from "lucide-react"
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
  const [rewritingText, setRewritingText] = useState(false)
  const [rewrittenText, setRewrittenText] = useState<string | null>(null)
  const [formattedText, setFormattedText] = useState<string | null>(null)
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

  const handleRewriteText = async () => {
    if (!result.extracted_text) {
      toast({
        title: "No text to rewrite",
        description: "No extracted text found in the analysis results.",
        variant: "destructive",
      })
      return
    }

    setRewritingText(true)
    try {
      const response = await fetch('/api/rewrite-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: result.extracted_text,
          fileName: fileName
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rewrite text')
      }

      const data = await response.json()
      setRewrittenText(data.rewrittenText)
      
      toast({
        title: "Text rewritten successfully",
        description: "The extracted text has been enhanced with AI.",
      })
    } catch (error) {
      console.error('Error rewriting text:', error)
      toast({
        title: "Failed to rewrite text",
        description: error instanceof Error ? error.message : "An error occurred while processing the text.",
        variant: "destructive",
      })
    } finally {
      setRewritingText(false)
    }
  }

  const handleFormatText = () => {
    const textToFormat = rewrittenText || result.extracted_text
    if (!textToFormat) {
      toast({
        title: "No text to format",
        description: "No text available for formatting.",
        variant: "destructive",
      })
      return
    }

    // Basic text formatting
    let formatted = textToFormat
      .replace(/\n\n+/g, '\n\n') // Remove excessive line breaks
      .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add line breaks after sentences
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Add paragraph breaks for better readability
    formatted = formatted
      .split('\n\n')
      .map((paragraph: string) => paragraph.trim())
      .filter((paragraph: string) => paragraph.length > 0)
      .join('\n\n')

    setFormattedText(formatted)
    
    toast({
      title: "Text formatted",
      description: "The text has been formatted for better readability.",
    })
  }

  // Check if result has the expected structure
  const hasStructuredData = result && typeof result === 'object' && 
    (result.results?.cloudinary_urls || result.results?.step_results || result.cloudinary_urls || result.step_results)

  const renderStructuredData = () => {
    if (!hasStructuredData) return null

    // Handle both nested results structure and direct structure
    const cloudinaryUrls = result.results?.cloudinary_urls || result.cloudinary_urls
    const stepResults = result.results?.step_results || result.step_results

    return (
      <div className="space-y-6">
        {/* Processing Summary */}
        {result.message && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Processing Summary
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.status && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="text-lg font-semibold text-primary capitalize">{result.status}</div>
                  </div>
                )}
                {result.pdf_size && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">PDF Size</div>
                    <div className="text-lg font-semibold text-primary">
                      {(result.pdf_size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}
                {result.svg_size && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">SVG Size</div>
                    <div className="text-lg font-semibold text-primary">
                      {(result.svg_size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                )}
                {result.id && (
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground">Task ID</div>
                    <div className="text-xs font-mono text-primary truncate" title={result.id}>
                      {result.id.slice(0, 8)}...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Text Section */}
        {result.extracted_text && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Extracted Text
                  </CardTitle>
                  <CardDescription>Raw text extracted from the PDF document</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFormatText}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Format Text
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRewriteText}
                    disabled={rewritingText}
                    className="gap-2"
                  >
                    {rewritingText ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {rewritingText ? "Rewriting..." : "Enhance with AI"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto border">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {result.extracted_text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewritten Text Section */}
        {rewrittenText && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Enhanced Analysis
                  </CardTitle>
                  <CardDescription>AI-enhanced and professional version of the extracted text</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleFormatText}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Format Text
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6 max-h-96 overflow-y-auto border">
                <div className="prose prose-sm max-w-none text-foreground">
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ 
                      fontFamily: 'inherit',
                      lineHeight: '1.6'
                    }}
                  >
                    {rewrittenText}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formatted Text Section */}
        {formattedText && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Formatted Text
              </CardTitle>
              <CardDescription>Clean, readable version with proper formatting and paragraph breaks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-lg p-6 max-h-96 overflow-y-auto border">
                <div className="prose prose-sm max-w-none text-foreground">
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ 
                      fontFamily: 'inherit',
                      lineHeight: '1.8',
                      textAlign: 'justify'
                    }}
                  >
                    {formattedText}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cloudinary URLs Section */}
        {cloudinaryUrls && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Generated Images
              </CardTitle>
              <CardDescription>AI-generated visual analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(cloudinaryUrls).map(([key, url]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={url as string} 
                        alt={key}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(url as string, '_blank')}
                    >
                      View Full Size
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step Results Section */}
        {stepResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analysis Statistics
              </CardTitle>
              <CardDescription>Shape detection and counting results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stepResults).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {value as number}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
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

      {/* Structured Data Display */}
      {hasStructuredData && renderStructuredData()}

      {/* Raw Data Display */}
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
