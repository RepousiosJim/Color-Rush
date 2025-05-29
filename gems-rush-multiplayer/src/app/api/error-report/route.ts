import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json()
    
    // Log the error server-side
    console.error('🚨 Client Error Report:', {
      timestamp: new Date().toISOString(),
      ...errorReport
    })
    
    // In a real application, you would send this to your error tracking service
    // Examples:
    // - Sentry: Sentry.captureException(new Error(errorReport.message), { extra: errorReport })
    // - LogRocket: LogRocket.captureException(new Error(errorReport.message))
    // - Rollbar: rollbar.error(errorReport.message, errorReport)
    // - Custom logging service: await logService.logError(errorReport)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error report received' 
    })
  } catch (error) {
    console.error('Failed to process error report:', error)
    
    return NextResponse.json(
      { success: false, message: 'Failed to process error report' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Error reporting endpoint - POST only' },
    { status: 405 }
  )
} 