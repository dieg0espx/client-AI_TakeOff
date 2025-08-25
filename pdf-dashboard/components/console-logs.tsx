"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ConsoleLogs() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Processing Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full rounded-md border p-4">
          <div className="text-xs font-mono text-muted-foreground">
            <div>✅ Ready to process PDF</div>
            <div>📁 File selected and validated</div>
            <div>⏳ Waiting for upload...</div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
