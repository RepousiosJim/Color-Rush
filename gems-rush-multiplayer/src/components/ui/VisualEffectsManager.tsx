'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

// Performance-aware effect types
export interface VisualEffect {
  id: string
  type: 'particle' | 'glow' | 'shake' | 'flash' | 'combo'
  position?: { x: number; y: number }
  x?: number
  y?: number
  intensity: number
  duration: number
  priority: 'low' | 'medium' | 'high'
  timestamp: number
}

interface VisualEffectsState {
  activeEffects: VisualEffect[]
  maxEffects: number
  settings: {
    enableParticles: boolean
    enableGlow: boolean
    enableShake: boolean
    effectIntensity: 'minimal' | 'low' | 'medium' | 'high' | 'ultra'
  }
}

type VisualEffectsAction = 
  | { type: 'ADD_EFFECT'; effect: VisualEffect }
  | { type: 'REMOVE_EFFECT'; id: string }
  | { type: 'CLEAR_EFFECTS' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<VisualEffectsState['settings']> }
  | { type: 'SET_MAX_EFFECTS'; maxEffects: number }

const initialState: VisualEffectsState = {
  activeEffects: [],
  maxEffects: 20,
  settings: {
    enableParticles: true,
    enableGlow: true,
    enableShake: true,
    effectIntensity: 'high'
  }
}

const visualEffectsReducer = (state: VisualEffectsState, action: VisualEffectsAction): VisualEffectsState => {
  switch (action.type) {
    case 'ADD_EFFECT': {
      const { effect } = action
      const now = Date.now()
      
      // Remove expired effects first
      const activeEffects = state.activeEffects.filter(e => 
        now - e.timestamp < e.duration
      )
      
      // Performance-based effect limiting
      if (activeEffects.length >= state.maxEffects) {
        // Remove lowest priority effects first
        const sortedEffects = [...activeEffects].sort((a, b) => {
          const priorityOrder = { low: 0, medium: 1, high: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
        sortedEffects.splice(0, 1) // Remove oldest low-priority effect
        return {
          ...state,
          activeEffects: [...sortedEffects, effect]
        }
      }
      
      return {
        ...state,
        activeEffects: [...activeEffects, effect]
      }
    }
    
    case 'REMOVE_EFFECT':
      return {
        ...state,
        activeEffects: state.activeEffects.filter(e => e.id !== action.id)
      }
      
    case 'CLEAR_EFFECTS':
      return {
        ...state,
        activeEffects: []
      }
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings }
      }
      
    case 'SET_MAX_EFFECTS':
      return {
        ...state,
        maxEffects: action.maxEffects
      }
      
    default:
      return state
  }
}

const VisualEffectsContext = createContext<{
  state: VisualEffectsState
  addEffect: (effect: Omit<VisualEffect, 'id' | 'timestamp'>) => void
  removeEffect: (id: string) => void
  clearEffects: () => void
  updateSettings: (settings: Partial<VisualEffectsState['settings']>) => void
} | null>(null)

export const VisualEffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(visualEffectsReducer, initialState)
  const { quality, shouldShowEffects, shouldShowParticles, frameRate } = usePerformanceOptimization()

  // Adjust max effects based on performance
  useEffect(() => {
    const maxEffectsByQuality = {
      minimal: 2,
      low: 5,
      medium: 10,
      high: 15,
      ultra: 25
    }
    
    const maxEffects = maxEffectsByQuality[quality] || 10
    dispatch({ type: 'SET_MAX_EFFECTS', maxEffects })
    
    // Update settings based on performance
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      settings: {
        enableParticles: shouldShowParticles,
        enableGlow: shouldShowEffects,
        enableShake: quality !== 'minimal',
        effectIntensity: quality
      }
    })
  }, [quality, shouldShowEffects, shouldShowParticles])

  // Cleanup expired effects periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now()
      dispatch({ 
        type: 'CLEAR_EFFECTS' 
      })
      
      // Only keep recent effects
      state.activeEffects.forEach(effect => {
        if (now - effect.timestamp < effect.duration) {
          dispatch({ type: 'ADD_EFFECT', effect })
        }
      })
    }, 1000)

    return () => clearInterval(cleanup)
  }, [state.activeEffects])

  const addEffect = useCallback((effect: Omit<VisualEffect, 'id' | 'timestamp'>) => {
    // Performance check - skip if too many effects or low performance
    if (!shouldShowEffects && effect.type !== 'combo') return
    if (!shouldShowParticles && effect.type === 'particle') return
    
    const newEffect: VisualEffect = {
      ...effect,
      id: `${effect.type}-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      // Reduce intensity based on performance
      intensity: effect.intensity * (quality === 'minimal' ? 0.3 : 
                                   quality === 'low' ? 0.5 : 
                                   quality === 'medium' ? 0.7 : 1),
      // Reduce duration for low performance
      duration: effect.duration * (quality === 'minimal' ? 0.5 : 
                                 quality === 'low' ? 0.7 : 1)
    }
    
    dispatch({ type: 'ADD_EFFECT', effect: newEffect })
  }, [shouldShowEffects, shouldShowParticles, quality])

  const removeEffect = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EFFECT', id })
  }, [])

  const clearEffects = useCallback(() => {
    dispatch({ type: 'CLEAR_EFFECTS' })
  }, [])

  const updateSettings = useCallback((settings: Partial<VisualEffectsState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings })
  }, [])

  const contextValue = useMemo(() => ({
    state,
    addEffect,
    removeEffect,
    clearEffects,
    updateSettings
  }), [state, addEffect, removeEffect, clearEffects, updateSettings])

  return (
    <VisualEffectsContext.Provider value={contextValue}>
      {children}
      <VisualEffectsRenderer />
    </VisualEffectsContext.Provider>
  )
}

export const useVisualEffects = () => {
  const context = useContext(VisualEffectsContext)
  if (!context) {
    throw new Error('useVisualEffects must be used within a VisualEffectsProvider')
  }
  return context
}

// Simplified effects renderer for better performance
const VisualEffectsRenderer: React.FC = () => {
  const { state } = useVisualEffects()
  const { quality } = usePerformanceOptimization()

  // Skip rendering if minimal performance
  if (quality === 'minimal') return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {state.activeEffects.map(effect => (
        <EffectComponent key={effect.id} effect={effect} />
      ))}
    </div>
  )
}

const EffectComponent: React.FC<{ effect: VisualEffect }> = ({ effect }) => {
  const { quality } = usePerformanceOptimization()
  
  // Simplified effect rendering based on performance
  const getEffectStyle = () => {
    // Handle both position object and direct x/y properties
    const x = effect.position?.x ?? effect.x ?? 0
    const y = effect.position?.y ?? effect.y ?? 0
    
    const baseStyle = {
      position: 'absolute' as const,
      left: x,
      top: y,
      pointerEvents: 'none' as const,
      zIndex: 1000
    }

    switch (effect.type) {
      case 'particle':
        return {
          ...baseStyle,
          width: 4 * effect.intensity,
          height: 4 * effect.intensity,
          background: quality === 'ultra' ? 
            'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' :
            'rgba(255,255,255,0.6)',
          borderRadius: '50%',
          animation: quality === 'low' ? 
            'none' : 
            `particleFloat ${effect.duration}ms ease-out forwards`
        }
      
      case 'glow':
        return {
          ...baseStyle,
          width: 20 * effect.intensity,
          height: 20 * effect.intensity,
          background: quality === 'ultra' ?
            'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)' :
            'rgba(255,215,0,0.3)',
          borderRadius: '50%',
          filter: quality === 'minimal' ? 'none' : `blur(${2 * effect.intensity}px)`
        }
      
      case 'combo':
        return {
          ...baseStyle,
          color: 'white',
          fontSize: `${12 + 4 * effect.intensity}px`,
          fontWeight: 'bold',
          textShadow: quality === 'minimal' ? 'none' : '2px 2px 4px rgba(0,0,0,0.8)',
          animation: quality === 'low' ? 
            'none' : 
            `comboFloat ${effect.duration}ms ease-out forwards`
        }
      
      default:
        return baseStyle
    }
  }

  return <div style={getEffectStyle()}>{effect.type === 'combo' ? 'COMBO!' : ''}</div>
}

// Performance-aware helper functions
export const createParticleEffect = (x: number, y: number, intensity: number = 1): Omit<VisualEffect, 'id' | 'timestamp'> => ({
  type: 'particle',
  position: { x, y },
  intensity,
  duration: 1000,
  priority: 'low'
})

export const createGlowEffect = (x: number, y: number, intensity: number = 1): Omit<VisualEffect, 'id' | 'timestamp'> => ({
  type: 'glow',
  position: { x, y },
  intensity,
  duration: 800,
  priority: 'medium'
})

export const createComboEffect = (x: number, y: number, intensity: number = 1): Omit<VisualEffect, 'id' | 'timestamp'> => ({
  type: 'combo',
  position: { x, y },
  intensity,
  duration: 1500,
  priority: 'high'
})

// Performance-aware effect triggers
export const useOptimizedEffects = () => {
  const { state, updateSettings } = useVisualEffects()
  const { quality, shouldShowEffects } = usePerformanceOptimization()
  
  useEffect(() => {
    // Auto-adjust settings based on performance
    if (quality === 'minimal' || quality === 'low') {
      updateSettings({
        enableParticles: false,
        enableGlow: false,
        enableShake: false,
        effectIntensity: quality
      })
    } else if (shouldShowEffects) {
      updateSettings({
        enableParticles: quality === 'ultra',
        enableGlow: true,
        enableShake: true,
        effectIntensity: quality
      })
    }
  }, [quality, shouldShowEffects, updateSettings])

  return state.settings
} 