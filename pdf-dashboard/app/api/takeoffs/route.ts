import { NextRequest, NextResponse } from 'next/server'

// Database configuration
const DB_CONFIG = {
  host: 'localhost',
  database: 'u969084943_ai_takeOff',
  username: 'u969084943_admin',
  password: 'Construction2020?'
}

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
