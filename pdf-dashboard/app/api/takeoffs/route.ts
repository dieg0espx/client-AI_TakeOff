import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const id = searchParams.get('id')

    // Use the production PHP endpoints
    const phpUrl = id 
      ? `https://ai-takeoff.ttfconstruction.com/read.php?id=${id}`
      : `https://ai-takeoff.ttfconstruction.com/read-all.php?limit=${limit}`
    
    const response = await fetch(phpUrl)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch take-offs' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching take-offs:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
