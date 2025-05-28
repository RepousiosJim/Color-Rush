'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Game Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Always log errors for debugging
    this.logErrorToService(error, errorInfo)
    
    // Call the onError callback if provided (for backward compatibility)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Create comprehensive error report
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      env: process.env.NODE_ENV
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🐛 Error Boundary - Detailed Report')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Full Report:', errorReport)
      console.groupEnd()
    }

    // In production, send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      console.error('Application Error:', errorReport)
      
      // Here you would send to your error tracking service
      // Example: Sentry.captureException(error, { extra: errorInfo })
      
      // For now, we'll use a simple fetch to a hypothetical error endpoint
      if (typeof fetch !== 'undefined') {
        fetch('/api/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport)
        }).catch(err => {
          console.error('Failed to send error report:', err)
        })
      }
    }
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1
      })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReportBug = () => {
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Create mailto link for bug report
    const subject = encodeURIComponent('Gems Rush Game Error Report')
    const body = encodeURIComponent(`
Error Report:
${JSON.stringify(errorReport, null, 2)}

Please describe what you were doing when this error occurred:
[User can add details here]
    `)
    
    window.open(`mailto:support@gemsrush.com?subject=${subject}&body=${body}`)
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="min-h-screen bg-gradient-to-br from-red-900/20 via-gray-900 to-purple-900/20 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-lg w-full shadow-2xl"
            >
              {/* Error Icon */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="text-6xl mb-4"
                >
                  💥
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-300 text-sm">
                  The game encountered an unexpected error
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="bg-red-900/20 rounded-lg p-4 mb-6 border border-red-500/30"
                >
                  <h3 className="text-red-300 font-semibold mb-2 text-sm">
                    Error Details (Dev Mode)
                  </h3>
                  <code className="text-red-200 text-xs block whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error.message}
                  </code>
                </motion.div>
              )}

              {/* Recovery Options */}
              <div className="space-y-3">
                {this.state.retryCount < this.maxRetries && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔃</span>
                  Reload Game
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReportBug}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🐛</span>
                  Report Bug
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>🏠</span>
                  Return to Main Menu
                </motion.button>
              </div>

              {/* Retry Count Display */}
              {this.state.retryCount > 0 && (
                <div className="mt-4 text-center text-xs text-gray-400">
                  Retry attempts: {this.state.retryCount} / {this.maxRetries}
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-300 font-semibold text-sm mb-2">💡 Troubleshooting Tips</h4>
                <ul className="text-blue-200 text-xs space-y-1">
                  <li>• Try refreshing your browser</li>
                  <li>• Clear your browser cache</li>
                  <li>• Check your internet connection</li>
                  <li>• Update your browser to the latest version</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary 