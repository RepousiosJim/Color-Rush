'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'

export interface PerformanceMetrics {
  frameRate: number
  memoryUsage: number
  lastUpdate: number
}

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }) as T
}

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}

// Check if reduced motion is preferred
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get optimized animation config based on performance
export const getOptimizedAnimationConfig = (baseConfig: any, frameRate: number = 60) => {
  if (prefersReducedMotion()) {
    return {
      ...baseConfig,
      duration: 0,
      transition: { duration: 0 }
    }
  }

  if (frameRate < 30) {
    return {
      ...baseConfig,
      duration: (baseConfig.duration || 0.3) * 0.5,
      transition: {
        ...baseConfig.transition,
        ease: 'linear'
      }
    }
  }

  return baseConfig
}

// Hardware acceleration utilities
export const enableHardwareAcceleration = (element: HTMLElement) => {
  element.style.transform = 'translateZ(0)'
  element.style.willChange = 'transform'
  element.style.backfaceVisibility = 'hidden'
}

export const disableHardwareAcceleration = (element: HTMLElement) => {
  element.style.transform = ''
  element.style.willChange = 'auto'
  element.style.backfaceVisibility = ''
}

// Performance optimization hook
export const usePerformanceOptimization = () => {
  const frameRateRef = useRef(60)
  const lastFrameTime = useRef(performance.now())
  const frameCount = useRef(0)

  // Measure frame rate
  useEffect(() => {
    let rafId: number

    const measureFrameRate = () => {
      const now = performance.now()
      const deltaTime = now - lastFrameTime.current
      
      frameCount.current++
      
      if (deltaTime >= 1000) {
        frameRateRef.current = Math.round((frameCount.current * 1000) / deltaTime)
        frameCount.current = 0
        lastFrameTime.current = now
      }
      
      rafId = requestAnimationFrame(measureFrameRate)
    }

    rafId = requestAnimationFrame(measureFrameRate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  const optimizedDebounce = useCallback(
    <T extends (...args: any[]) => any>(func: T, delay: number) => {
      return debounce(func, delay)
    },
    []
  )

  const optimizedThrottle = useCallback(
    <T extends (...args: any[]) => any>(func: T, limit: number) => {
      return throttle(func, limit)
    },
    []
  )

  const getOptimizedAnimation = useCallback((baseConfig: any) => {
    return getOptimizedAnimationConfig(baseConfig, frameRateRef.current)
  }, [])

  const isHighPerformance = useMemo(() => frameRateRef.current >= 55, [])
  const isReducedMotion = useMemo(() => prefersReducedMotion(), [])

  return {
    frameRate: frameRateRef.current,
    optimizedDebounce,
    optimizedThrottle,
    getOptimizedAnimation,
    isHighPerformance,
    isReducedMotion,
    enableHardwareAcceleration,
    disableHardwareAcceleration
  }
}

export default usePerformanceOptimization 