"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Loader2, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2,
  Heart,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHealthWebSocket } from "@/hooks/use-health-websocket"

interface HealthFloatingWindowProps {
  className?: string
}

export function HealthFloatingWindow({ className = "" }: HealthFloatingWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    isConnected, 
    isConnecting, 
    error, 
    messages, 
    lastHealthStatus,
    clearMessages 
  } = useHealthWebSocket()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unhealthy': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'unhealthy': return 'text-red-500'
      case 'warning': return 'text-yellow-500'
      default: return 'text-muted-foreground'
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'health': return <Heart className="h-3 w-3" />
      case 'status': return <Activity className="h-3 w-3" />
      case 'metrics': return <Activity className="h-3 w-3" />
      default: return <Info className="h-3 w-3" />
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'health': return 'text-green-500'
      case 'status': return 'text-blue-500'
      case 'metrics': return 'text-purple-500'
      default: return 'text-muted-foreground'
    }
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <Card className="w-80 shadow-lg border-2 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-primary" />
              File Processing Monitor
              <div className="flex items-center gap-1">
                {isConnecting && (
                  <Badge variant="outline" className="text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Connecting
                  </Badge>
                )}
                {isConnected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Badge variant="secondary" className="text-xs">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  </motion.div>
                )}
                {!isConnected && !isConnecting && (
                  <Badge variant="destructive" className="text-xs">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Health Status */}
          {lastHealthStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs"
            >
              {getStatusIcon(lastHealthStatus)}
              <span className={getStatusColor(lastHealthStatus)}>
                Status: {lastHealthStatus}
              </span>
            </motion.div>
          )}
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 space-y-3">
                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs"
                  >
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Messages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium">Messages</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMessages}
                      className="h-5 w-5 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="h-32 overflow-y-auto border rounded p-2 bg-muted/20">
                    <div className="space-y-1 text-xs font-mono">
                      {messages.length === 0 ? (
                        <div className="text-muted-foreground text-center py-4">
                          {isConnected ? 'Waiting for messages...' : 'Not connected'}
                        </div>
                      ) : (
                        <AnimatePresence>
                          {messages.slice(-10).map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className={`flex items-start gap-2 ${getMessageColor(message.type)}`}
                            >
                              {/* <span className="flex-shrink-0 mt-0.5">
                                {getMessageIcon(message.type)}
                              </span> */}
                              <span className="flex-1 break-words">{message.message}</span>
                              <span className="text-muted-foreground/60 text-[10px] flex-shrink-0">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                      {/* Invisible element to scroll to */}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>

                {/* Connection Info */}
                <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  <p><strong>WebSocket:</strong> ws://localhost:5001/File-processing</p>
                  <p><strong>Messages:</strong> {messages.length} received</p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
