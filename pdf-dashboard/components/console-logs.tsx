"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConsoleLogsProps {
  uploadId?: string | null
}

export function ConsoleLogs({ uploadId }: ConsoleLogsProps) {
  // Static state for console logs (WebSocket removed)
  const isConnected = true
  const isConnecting = false
  const error = null
  const logs: Array<{id: string, type: string, message: string, timestamp: Date}> = []
  const progress: {step: string, current: number, total: number, percentage: number} | null = null
  const connect = () => {}
  const disconnect = () => {}
  const clearLogs = () => {}
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logs])

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      case 'progress': return '📊'
      default: return 'ℹ️'
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      case 'progress': return 'text-blue-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            Processing Logs
            {isConnected && (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {isConnecting && (
              <Badge variant="outline" className="text-xs">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Connecting
              </Badge>
            )}
            {!isConnected && !isConnecting && uploadId && (
              <Badge variant="destructive" className="text-xs">
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {uploadId && (
              <>
                {!isConnected && !isConnecting && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={connect}
                    className="h-7 text-xs"
                  >
                    Connect
                  </Button>
                )}
                {isConnected && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={disconnect}
                    className="h-7 text-xs"
                  >
                    Disconnect
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearLogs}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        {/* Progress section removed - WebSocket functionality disabled */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea ref={scrollAreaRef} className="h-32 w-full rounded-md border p-4">
          <div className="text-xs font-mono space-y-1">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">
                {uploadId ? 'Waiting for logs...' : 'Ready to process PDF'}
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`flex items-start gap-2 ${getLogColor(log.type)}`}>
                  <span className="flex-shrink-0">{getLogIcon(log.type)}</span>
                  <span className="flex-1">{log.message}</span>
                  <span className="text-muted-foreground/60 text-[10px] flex-shrink-0">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
