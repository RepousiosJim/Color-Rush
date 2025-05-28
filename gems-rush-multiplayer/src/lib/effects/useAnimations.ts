import { useEffect, useRef, useCallback, useState } from 'react'
import { gameAnimations, GameAnimations, MatchGroup, CascadeAnimation, PowerUpEffect, GemPosition } from './GameAnimations'
import { animationQueue } from './AnimationQueue'

export interface UseAnimationsReturn {
  // Animation functions
  animateMatches: (matches: MatchGroup[], cascadeLevel?: number) => Promise<void>
  animateGemFalls: (fallData: Array<{ from: GemPosition; to: GemPosition; distance: number }>) => Promise<void>
  animatePowerUpActivation: (powerUp: PowerUpEffect) => Promise<void>
  animateCascade: (cascade: CascadeAnimation) => Promise<void>
  showHint: (positions: GemPosition[]) => Promise<void>
  
  // Control functions
  pauseAnimations: () => void
  resumeAnimations: () => void
  clearAnimations: () => void
  
  // Status
  getAnimationStatus: () => {
    queueLength: number
    parallelGroups: number
    activeAnimations: number
    timelines: number
    isProcessing: boolean
  }
  
  // Event handlers
  onAnimationComplete: (callback: (data: any) => void) => () => void
  onAnimationError: (callback: (data: any) => void) => () => void
}

export const useAnimations = (): UseAnimationsReturn => {
  const animationsRef = useRef<GameAnimations>(gameAnimations)
  const listenersRef = useRef<Array<{ event: string; callback: Function }>>([])

  // Cleanup function
  const cleanup = useCallback(() => {
    // Remove all registered listeners
    listenersRef.current.forEach(({ event, callback }) => {
      animationQueue.off(event, callback)
    })
    listenersRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Animation functions with error handling
  const animateMatches = useCallback(async (matches: MatchGroup[], cascadeLevel: number = 0): Promise<void> => {
    try {
      return await animationsRef.current.animateMatches(matches, cascadeLevel)
    } catch (error) {
      console.error('Error animating matches:', error)
      throw error
    }
  }, [])

  const animateGemFalls = useCallback(async (fallData: Array<{
    from: GemPosition
    to: GemPosition
    distance: number
  }>): Promise<void> => {
    try {
      return await animationsRef.current.animateGemFalls(fallData)
    } catch (error) {
      console.error('Error animating gem falls:', error)
      throw error
    }
  }, [])

  const animatePowerUpActivation = useCallback(async (powerUp: PowerUpEffect): Promise<void> => {
    try {
      return await animationsRef.current.animatePowerUpActivation(powerUp)
    } catch (error) {
      console.error('Error animating power-up:', error)
      throw error
    }
  }, [])

  const animateCascade = useCallback(async (cascade: CascadeAnimation): Promise<void> => {
    try {
      return await animationsRef.current.animateCascade(cascade)
    } catch (error) {
      console.error('Error animating cascade:', error)
      throw error
    }
  }, [])

  const showHint = useCallback(async (positions: GemPosition[]): Promise<void> => {
    try {
      return await animationsRef.current.showHint(positions)
    } catch (error) {
      console.error('Error showing hint:', error)
      throw error
    }
  }, [])

  // Control functions
  const pauseAnimations = useCallback(() => {
    animationsRef.current.pauseAnimations()
  }, [])

  const resumeAnimations = useCallback(() => {
    animationsRef.current.resumeAnimations()
  }, [])

  const clearAnimations = useCallback(() => {
    animationsRef.current.clearAnimations()
  }, [])

  // Status function
  const getAnimationStatus = useCallback(() => {
    return animationsRef.current.getAnimationStatus()
  }, [])

  // Event handler setup
  const onAnimationComplete = useCallback((callback: (data: any) => void) => {
    const listener = { event: 'animation:completed', callback }
    listenersRef.current.push(listener)
    animationQueue.on('animation:completed', callback)
    
    // Return cleanup function
    return () => {
      animationQueue.off('animation:completed', callback)
      const index = listenersRef.current.findIndex(l => l.callback === callback)
      if (index > -1) {
        listenersRef.current.splice(index, 1)
      }
    }
  }, [])

  const onAnimationError = useCallback((callback: (data: any) => void) => {
    const listener = { event: 'animation:error', callback }
    listenersRef.current.push(listener)
    animationQueue.on('animation:error', callback)
    
    // Return cleanup function
    return () => {
      animationQueue.off('animation:error', callback)
      const index = listenersRef.current.findIndex(l => l.callback === callback)
      if (index > -1) {
        listenersRef.current.splice(index, 1)
      }
    }
  }, [])

  return {
    animateMatches,
    animateGemFalls,
    animatePowerUpActivation,
    animateCascade,
    showHint,
    pauseAnimations,
    resumeAnimations,
    clearAnimations,
    getAnimationStatus,
    onAnimationComplete,
    onAnimationError
  }
}

// Hook for specific animation events
export const useAnimationEvents = () => {
  const eventsRef = useRef<{ [key: string]: Function[] }>({})

  const addEventListener = useCallback((event: string, callback: Function) => {
    if (!eventsRef.current[event]) {
      eventsRef.current[event] = []
    }
    eventsRef.current[event].push(callback)
    animationQueue.on(event, callback)

    return () => {
      animationQueue.off(event, callback)
      if (eventsRef.current[event]) {
        const index = eventsRef.current[event].findIndex(cb => cb === callback)
        if (index > -1) {
          eventsRef.current[event].splice(index, 1)
        }
      }
    }
  }, [])

  const removeEventListener = useCallback((event: string, callback: Function) => {
    animationQueue.off(event, callback)
    if (eventsRef.current[event]) {
      const index = eventsRef.current[event].findIndex(cb => cb === callback)
      if (index > -1) {
        eventsRef.current[event].splice(index, 1)
      }
    }
  }, [])

  const removeAllListeners = useCallback(() => {
    Object.entries(eventsRef.current).forEach(([event, callbacks]) => {
      callbacks.forEach(callback => {
        animationQueue.off(event, callback)
      })
    })
    eventsRef.current = {}
  }, [])

  useEffect(() => {
    return removeAllListeners
  }, [removeAllListeners])

  return {
    addEventListener,
    removeEventListener,
    removeAllListeners
  }
}

// Hook for animation queue monitoring
export const useAnimationQueue = () => {
  const [status, setStatus] = useState({
    queueLength: 0,
    parallelGroups: 0,
    activeAnimations: 0,
    timelines: 0,
    isProcessing: false
  })

  useEffect(() => {
    const updateStatus = () => {
      setStatus(animationQueue.getQueueStatus())
    }

    // Update initially
    updateStatus()

    // Listen for queue changes - these return void, so we'll handle cleanup differently
    animationQueue.on('queue:started', updateStatus)
    animationQueue.on('queue:completed', updateStatus)
    animationQueue.on('animation:queued', updateStatus)
    animationQueue.on('parallel:queued', updateStatus)
    animationQueue.on('animation:completed', updateStatus)
    animationQueue.on('parallel:completed', updateStatus)

    // Update every second as a fallback
    const interval = setInterval(updateStatus, 1000)

    return () => {
      clearInterval(interval)
      animationQueue.off('queue:started', updateStatus)
      animationQueue.off('queue:completed', updateStatus)
      animationQueue.off('animation:queued', updateStatus)
      animationQueue.off('parallel:queued', updateStatus)
      animationQueue.off('animation:completed', updateStatus)
      animationQueue.off('parallel:completed', updateStatus)
    }
  }, [])

  return status
} 