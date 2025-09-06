"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, Check, Download, Share, FileText, Image as ImageIcon, BarChart3, Eye, ZoomIn, ExternalLink, Hash, Square, Circle, RectangleHorizontal, RefreshCw, Wand2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useApiClient } from "@/lib/api-client"

interface AnalysisResultsProps {
  fileName: string
  result: any
  onReset: () => void
}

interface StepResult {
  step5_blue_X_shapes: number
  step6_red_squares: number
  step7_pink_shapes: number
  step8_green_rectangles: number
}

interface CloudinaryUrls {
  step4_results: string
  step5_results: string
  step6_results: string
  step7_results: string
  step8_results: string
}

interface AnalysisData {
  id: string
  status: string
  pdf_path: string
  pdf_size: number
  svg_path: string
  svg_size: number
  message: string
  results: {
    step_results: StepResult
    cloudinary_urls: CloudinaryUrls
    extracted_text: string
  }
}

export function AnalysisResults({ fileName, result, onReset }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [rewrittenText, setRewrittenText] = useState<string | null>(null)
  const [isRewriting, setIsRewriting] = useState(false)
  const [showRewritten, setShowRewritten] = useState(false)
  const { toast } = useToast()
  const apiClient = useApiClient()

  // Parse the result data
  const analysisData: AnalysisData = typeof result === 'string' ? JSON.parse(result) : result
  const extractedText = analysisData.results.extracted_text

  // Automatically enhance text when component loads
  useEffect(() => {
    if (extractedText && !rewrittenText && !isRewriting) {
      handleRewriteText()
    }
  }, [extractedText])

  const handleCopy = async () => {
    try {
      // If we're in the text tab and have rewritten text, copy the current text being displayed
      const textToCopy = showRewritten && rewrittenText ? rewrittenText : extractedText
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied to your clipboard.",
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
    if (isRewriting) return
    
    setIsRewriting(true)
    try {
      const response = await apiClient.post('/api/rewrite-text', {
        text: extractedText,
        fileName: fileName
      }, { requireAuth: false })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rewrite text')
      }

      const data = await response.json()
      setRewrittenText(data.rewrittenText)
      setShowRewritten(true) // Show enhanced text by default
      
      toast({
        title: "Text rewritten successfully",
        description: "The extracted text has been enhanced with AI.",
      })
    } catch (error) {
      console.error('Error rewriting text:', error)
      toast({
        title: "Failed to rewrite text",
        description: error instanceof Error ? error.message : "An error occurred while rewriting the text.",
        variant: "destructive",
      })
    } finally {
      setIsRewriting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for basic formatting
    return text
      .split('\n')
      .map((line, index) => {
        // Handle bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g
        const parts = line.split(boldRegex)
        
        return (
          <div key={index} className="mb-2">
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                // This is bold text
                return <strong key={partIndex} className="font-semibold">{part}</strong>
              }
              return part
            })}
          </div>
        )
      })
  }

  const stepResults = analysisData.results.step_results
  const cloudinaryUrls = analysisData.results.cloudinary_urls

  const stepConfigs = [
    {
      key: 'step5_blue_X_shapes',
      title: 'Blue X Shapes',
      count: stepResults.step5_blue_X_shapes,
      icon: Hash,
      color: 'bg-blue-500',
      description: 'Detected X-shaped elements in blue'
    },
    {
      key: 'step6_red_squares',
      title: 'Red Squares',
      count: stepResults.step6_red_squares,
      icon: Square,
      color: 'bg-red-500',
      description: 'Detected square elements in red'
    },
    {
      key: 'step7_pink_shapes',
      title: 'Pink Shapes',
      count: stepResults.step7_pink_shapes,
      icon: Circle,
      color: 'bg-pink-500',
      description: 'Detected circular/pink elements'
    },
    {
      key: 'step8_green_rectangles',
      title: 'Green Rectangles',
      count: stepResults.step8_green_rectangles,
      icon: RectangleHorizontal,
      color: 'bg-green-500',
      description: 'Detected rectangular elements in green'
    }
  ]

  const imageSteps = [
    {
      key: 'step4_results',
      title: 'Step 4 Results',
      url: cloudinaryUrls.step4_results,
      description: 'Initial processing results'
    },
    {
      key: 'step5_results',
      title: 'Step 5 Results',
      url: cloudinaryUrls.step5_results,
      description: 'Blue X shapes detection'
    },
    {
      key: 'step6_results',
      title: 'Step 6 Results',
      url: cloudinaryUrls.step6_results,
      description: 'Red squares detection'
    },
    {
      key: 'step7_results',
      title: 'Step 7 Results',
      url: cloudinaryUrls.step7_results,
      description: 'Pink shapes detection'
    },
    {
      key: 'step8_results',
      title: 'Step 8 Results',
      url: cloudinaryUrls.step8_results,
      description: 'Green rectangles detection'
    }
  ]

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
                AI-Takeoff Analysis Complete
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{fileName}</span>
                <Badge variant="secondary" className="text-xs">
                  {formatFileSize(analysisData.pdf_size)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {analysisData.status}
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

      {/* Main Content with Accordions */}
      <Accordion type="multiple" defaultValue={["overview", "results"]} className="space-y-4">
        
        {/* Overview Accordion */}
        <AccordionItem value="overview">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Processing Overview & Summary</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Processing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">PDF Size:</span>
                    <span className="font-medium">{formatFileSize(analysisData.pdf_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">SVG Size:</span>
                    <span className="font-medium">{formatFileSize(analysisData.svg_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Processing ID:</span>
                    <span className="font-mono text-xs">{analysisData.id}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    {analysisData.message}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Quick Detection Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {stepConfigs.map((step) => {
                      const IconComponent = step.icon
                      return (
                        <div key={step.key} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${step.color}`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{step.count}</div>
                            <div className="text-xs text-muted-foreground">{step.title}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Step Results Accordion */}
        <AccordionItem value="results">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              <span>Detailed Detection Results</span>
              <Badge variant="secondary" className="ml-2">
                {stepConfigs.reduce((sum, step) => sum + step.count, 0)} total
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  AI-Powered Shape Detection Results
                </CardTitle>
                <CardDescription>
                  Detailed analysis of detected structural elements and components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stepConfigs.map((step) => {
                    const IconComponent = step.icon
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: stepConfigs.indexOf(step) * 0.1 }}
                      >
                        <Card className="border-l-4 border-l-primary/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${step.color} bg-opacity-10`}>
                                  <IconComponent className={`h-5 w-5 ${step.color.replace('bg-', 'text-')}`} />
                                </div>
                                <div>
                                  <div className="font-semibold">{step.title}</div>
                                  <div className="text-sm text-muted-foreground">{step.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{step.count}</div>
                                <div className="text-xs text-muted-foreground">detected</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Visual Analysis Accordion */}
        <AccordionItem value="images">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <span>Visual Analysis Results</span>
              <Badge variant="secondary" className="ml-2">
                {imageSteps.length} images
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Step-by-Step Processing Images
                </CardTitle>
                <CardDescription>
                  Visual documentation of the AI analysis process and detection results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {imageSteps.map((step, index) => (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square relative">
                          <img
                            src={step.url}
                            alt={step.title}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedImage(step.url)}
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedImage(step.url)}
                            >
                              <ZoomIn className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Text Analysis Accordion */}
        <AccordionItem value="text">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>
                {showRewritten && rewrittenText ? "AI-Enhanced Engineering Analysis" : "Extracted Text Analysis"}
              </span>
              {rewrittenText && (
                <Badge variant="outline" className="ml-2">
                  AI Enhanced
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {showRewritten && rewrittenText ? "Professional Engineering Analysis" : "Document Text Extraction"}
                    </CardTitle>
                    <CardDescription>
                      {showRewritten && rewrittenText 
                        ? "Comprehensive structural engineering analysis with professional formatting"
                        : "Raw text content extracted from the PDF document"
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {rewrittenText && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowRewritten(!showRewritten)}
                        className="gap-2"
                      >
                        {showRewritten ? "Show Original" : "Show Enhanced"}
                      </Button>
                    )}
                    {!rewrittenText && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRewriteText}
                        disabled={isRewriting}
                        className="gap-2"
                      >
                        <motion.div 
                          animate={{ rotate: isRewriting ? 360 : 0 }} 
                          transition={{ duration: 1, repeat: isRewriting ? Infinity : 0 }}
                        >
                          {isRewriting ? <RefreshCw className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                        </motion.div>
                        {isRewriting ? "Enhancing..." : "Enhance with AI"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                      <motion.div animate={{ scale: copied ? 1.1 : 1 }} transition={{ duration: 0.1 }}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </motion.div>
                      {copied ? "Copied!" : "Copy Text"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="bg-muted/30 rounded-lg p-6 max-h-96 overflow-y-auto border">
                    {isRewriting ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="h-5 w-5 text-primary" />
                          </motion.div>
                          <span className="text-sm text-muted-foreground">AI is enhancing the text...</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed text-foreground">
                        {renderMarkdown(showRewritten && rewrittenText ? rewrittenText : extractedText)}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none rounded-b-lg" />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {showRewritten && rewrittenText 
                      ? "Engineering analysis completed on " + new Date().toLocaleDateString()
                      : "Text extracted on " + new Date().toLocaleDateString()
                    }
                  </span>
                  <span>
                    {(showRewritten && rewrittenText ? rewrittenText : extractedText).split(" ").length} words • {(showRewritten && rewrittenText ? rewrittenText : extractedText).split("\n").length} lines
                  </span>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Analysis Result Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="p-6 pt-0">
              <img
                src={selectedImage}
                alt="Analysis result"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
