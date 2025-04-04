import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check API health
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5003/api"
    const response = await fetch(`${apiUrl}/health`)
    
    if (!response.ok) {
      throw new Error('API health check failed')
    }

    return NextResponse.json(
      { status: 'healthy', api: 'connected' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}