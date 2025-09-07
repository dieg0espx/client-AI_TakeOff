"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, FileText, Building, MapPin, Eye, Download } from "lucide-react"
import { format } from "date-fns"

interface TakeOffData {
  id: string
  file_name: string
  file_size: number
  company?: string
  jobsite?: string
  blue_x_shapes: number
  red_squares: number
  pink_shapes: number
  green_rectangles: number
  status: string
  created_at: string
  step4_results_url?: string
  step5_results_url?: string
  step6_results_url?: string
  step7_results_url?: string
  step8_results_url?: string
}

interface PreviousTakeoffsProps {
  limit?: number
}

interface TakeOffsResponse {
  success: boolean
  data: TakeOffData[]
  count: number
  total?: number
  limit?: number
  offset?: number
  hasMore?: boolean
  message?: string
}

export function PreviousTakeoffs({ limit = 20 }: PreviousTakeoffsProps) {
  const [takeoffs, setTakeoffs] = useState<TakeOffData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)

  useEffect(() => {
    fetchTakeoffs()
  }, [limit])

  const fetchTakeoffs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the Next.js API route
      const response = await fetch(`/api/takeoffs?limit=${limit}`)
      const data: TakeOffsResponse = await response.json()
      
      if (data.success) {
        setTakeoffs(data.data)
        setTotalCount(data.total || data.count)
      } else {
        setError(data.message || 'Failed to fetch take-offs')
      }
    } catch (err) {
      setError('Network error occurred while fetching take-offs')
      console.error('Error fetching takeoffs:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalDetections = (takeoff: TakeOffData) => {
    return takeoff.blue_x_shapes + takeoff.red_squares + takeoff.pink_shapes + takeoff.green_rectangles
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* <h2 className="text-2xl font-bold tracking-tight">Previous Take Offs</h2> */}
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">

          <Button variant="outline" size="sm" onClick={fetchTakeoffs}>
            Retry
          </Button>
        </div>
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {takeoffs.length} of {totalCount} total
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchTakeoffs}>
            Refresh
          </Button>
        </div>
      </div>

      {takeoffs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Previous Take Offs</h3>
            <p className="text-muted-foreground text-center">
              You haven't processed any PDFs yet. Upload your first document to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {takeoffs.map((takeoff) => (
            <Card key={takeoff.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {/* Step 4 Results Image */}
              {takeoff.step4_results_url && (
                <div className="aspect-video w-full overflow-hidden -mt-6 ">
                  <img 
                    src={takeoff.step4_results_url} 
                    alt={`Analysis results for ${takeoff.file_name}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 "
                  />
                </div>
              )}
              <CardHeader >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate" title={takeoff.file_name}>
                      {takeoff.file_name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(takeoff.file_size)}
                    </CardDescription>
                  </div>
                  {/* <Badge className={`text-xs ${getStatusColor(takeoff.status)}`}>
                    {takeoff.status}
                  </Badge> */}
                </div>
              </CardHeader>
              <hr className="w-[90%] mx-auto -my-3" />
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Company and Jobsite */}
                  {(takeoff.company || takeoff.jobsite) && (
                    <div className="space-y-1">
                      {takeoff.company && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{takeoff.company}</span>
                        </div>
                      )}
                      {takeoff.jobsite && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{takeoff.jobsite}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detection Counts */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Blue X:</span>
                      <span className="font-medium">{takeoff.blue_x_shapes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Red Squares:</span>
                      <span className="font-medium">{takeoff.red_squares}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pink Shapes:</span>
                      <span className="font-medium">{takeoff.pink_shapes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Green Rect:</span>
                      <span className="font-medium">{takeoff.green_rectangles}</span>
                    </div>
                  </div>

                  {/* Total Detections */}
                  {/* <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total Detections:</span>
                      <span className="font-bold text-primary">{getTotalDetections(takeoff)}</span>
                    </div>
                  </div> */}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(takeoff.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {takeoff.step8_results_url && (
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
