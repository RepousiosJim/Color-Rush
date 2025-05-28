'use client'

import React, { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Gem, GemType } from '@/types/game'
import EnhancedGemEffects from './EnhancedGemEffects'
import ComboTextDisplay from './ComboTextDisplay'
import { PowerUpGem, PowerUpType } from './PowerUpIndicators'
import { useTheme } from './ThemeCustomization'

export interface VisualEffect {
  id: string
  type: 'gem_match' | 'combo_text' | 'power_up' | 'cascade' | 'achievement'
  position: { x: number; y: number }
  data: any
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
}

export interface VisualEffectsState {
  activeEffects: VisualEffect[]
  comboLevel: number
  totalScore: number
  matchedGems: Gem[]
  activePowerUps: PowerUpGem[]
  settings: {
    enableParticles: boolean
    enableAnimations: boolean
    effectIntensity: 'low' | 'medium' | 'high'
    enableAdvancedEffects: boolean
    enableSoundEffects: boolean
  }
}

interface VisualEffectsContextType {
  state: VisualEffectsState
  addEffect: (effect: Omit<VisualEffect, 'id'>) => void
  removeEffect: (id: string) => void
  triggerComboEffect: (combo: number, score: number, position: { x: number; y: number }, gemTypes?: GemType[]) => void
  triggerGemMatchEffect: (gems: Gem[], matchType: 'normal' | 'cascade' | 'power') => void
  triggerPowerUpEffect: (powerUp: PowerUpGem, effectType: 'charge' | 'activate' | 'ready') => void
  updateSettings: (settings: Partial<VisualEffectsState['settings']>) => void
  clearAllEffects: () => void
}

const VisualEffectsContext = createContext<VisualEffectsContextType | undefined>(undefined)

export const useVisualEffects = () => {
  const context = useContext(VisualEffectsContext)
  if (!context) {
    throw new Error('useVisualEffects must be used within a VisualEffectsProvider')
  }
  return context
}

interface VisualEffectsProviderProps {
  children: ReactNode
  boardElement?: HTMLElement | null
}

export const VisualEffectsProvider = ({ children, boardElement }: VisualEffectsProviderProps) => {
  const effectIdCounter = useRef(0)
  const activeEffects = useRef<VisualEffect[]>([])
  const { currentTheme } = useTheme()

  const [state, setState] = React.useState<VisualEffectsState>({
    activeEffects: [],
    comboLevel: 0,
    totalScore: 0,
    matchedGems: [],
    activePowerUps: [],
    settings: {
      enableParticles: true,
      enableAnimations: true,
      effectIntensity: 'medium',
      enableAdvancedEffects: true,
      enableSoundEffects: true
    }
  })

  // Generate unique effect ID
  const generateEffectId = useCallback(() => {
    return `effect-${++effectIdCounter.current}-${Date.now()}`
  }, [])

  // Get board position from element
  const getBoardPosition = useCallback(() => {
    if (!boardElement) {
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }
    const rect = boardElement.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }, [boardElement])

  // Add new visual effect
  const addEffect = useCallback((effect: Omit<VisualEffect, 'id'>) => {
    const newEffect: VisualEffect = {
      ...effect,
      id: generateEffectId(),
      duration: effect.duration || 2000,
      intensity: effect.intensity || state.settings.effectIntensity
    }

    activeEffects.current.push(newEffect)
    setState(prev => ({
      ...prev,
      activeEffects: [...activeEffects.current]
    }))

    // Auto-remove effect after duration
    if (newEffect.duration && newEffect.duration > 0) {
      setTimeout(() => {
        removeEffect(newEffect.id)
      }, newEffect.duration)
    }
  }, [state.settings.effectIntensity])

  // Remove visual effect
  const removeEffect = useCallback((id: string) => {
    activeEffects.current = activeEffects.current.filter(effect => effect.id !== id)
    setState(prev => ({
      ...prev,
      activeEffects: [...activeEffects.current]
    }))
  }, [])

  // Trigger combo effect
  const triggerComboEffect = useCallback((
    combo: number, 
    score: number, 
    position: { x: number; y: number }, 
    gemTypes: GemType[] = []
  ) => {
    if (!state.settings.enableAnimations) return

    // Determine combo variant based on level
    let variant: 'standard' | 'rainbow' | 'explosive' | 'divine' = 'standard'
    if (combo >= 8) variant = 'divine'
    else if (combo >= 6) variant = 'explosive'
    else if (combo >= 4) variant = 'rainbow'

    addEffect({
      type: 'combo_text',
      position,
      data: {
        comboLevel: combo,
        score,
        gemTypes,
        variant,
        showParticles: state.settings.enableParticles
      },
      duration: Math.min(3000, 1500 + combo * 200), // Longer duration for higher combos
      intensity: combo >= 5 ? 'high' : combo >= 3 ? 'medium' : 'low'
    })

    // Update state
    setState(prev => ({
      ...prev,
      comboLevel: Math.max(prev.comboLevel, combo),
      totalScore: prev.totalScore + score
    }))
  }, [state.settings, addEffect])

  // Trigger gem match effect
  const triggerGemMatchEffect = useCallback((
    gems: Gem[], 
    matchType: 'normal' | 'cascade' | 'power' = 'normal'
  ) => {
    if (!state.settings.enableAnimations || gems.length === 0) return

    gems.forEach((gem, index) => {
      // Calculate position for each gem (this would need board reference)
      const basePosition = getBoardPosition()
      const position = {
        x: basePosition.x + (index - gems.length / 2) * 50,
        y: basePosition.y + (Math.random() - 0.5) * 100
      }

      addEffect({
        type: 'gem_match',
        position,
        data: {
          gem,
          matchType,
          gemCount: gems.length,
          enableParticles: state.settings.enableParticles
        },
        duration: matchType === 'power' ? 1500 : matchType === 'cascade' ? 1000 : 800,
        intensity: matchType === 'power' ? 'high' : 'medium'
      })
    })

    // Update matched gems state
    setState(prev => ({
      ...prev,
      matchedGems: [...prev.matchedGems, ...gems]
    }))

    // Clear matched gems after animation
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        matchedGems: prev.matchedGems.filter(g => !gems.some(mg => mg.id === g.id))
      }))
    }, 1000)
  }, [state.settings, addEffect, getBoardPosition])

  // Trigger power-up effect
  const triggerPowerUpEffect = useCallback((
    powerUp: PowerUpGem, 
    effectType: 'charge' | 'activate' | 'ready'
  ) => {
    if (!state.settings.enableAnimations) return

    const position = getBoardPosition() // This would be more specific per power-up

    addEffect({
      type: 'power_up',
      position,
      data: {
        powerUp,
        effectType,
        enableParticles: state.settings.enableParticles,
        enableSoundEffects: state.settings.enableSoundEffects
      },
      duration: effectType === 'activate' ? 2000 : effectType === 'ready' ? 1000 : 500,
      intensity: effectType === 'activate' ? 'high' : 'medium'
    })

    // Update power-ups state
    setState(prev => ({
      ...prev,
      activePowerUps: prev.activePowerUps.some(p => p.id === powerUp.id)
        ? prev.activePowerUps.map(p => p.id === powerUp.id ? powerUp : p)
        : [...prev.activePowerUps, powerUp]
    }))
  }, [state.settings, addEffect, getBoardPosition])

  // Update visual settings
  const updateSettings = useCallback((newSettings: Partial<VisualEffectsState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }))
  }, [])

  // Clear all effects
  const clearAllEffects = useCallback(() => {
    activeEffects.current = []
    setState(prev => ({
      ...prev,
      activeEffects: [],
      matchedGems: [],
      activePowerUps: []
    }))
  }, [])

  // Clean up effects when theme changes
  useEffect(() => {
    // Optional: Clear effects when theme changes for better visual transition
  }, [currentTheme])

  const contextValue: VisualEffectsContextType = {
    state,
    addEffect,
    removeEffect,
    triggerComboEffect,
    triggerGemMatchEffect,
    triggerPowerUpEffect,
    updateSettings,
    clearAllEffects
  }

  return (
    <VisualEffectsContext.Provider value={contextValue}>
      {children}
      
      {/* Render active visual effects */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence mode="popLayout">
          {state.activeEffects.map(effect => {
            switch (effect.type) {
              case 'combo_text':
                return (
                  <ComboTextDisplay
                    key={effect.id}
                    comboLevel={effect.data.comboLevel}
                    score={effect.data.score}
                    gemTypes={effect.data.gemTypes}
                    position={effect.position}
                    showParticles={effect.data.showParticles}
                    duration={effect.duration}
                    variant={effect.data.variant}
                    onComplete={() => removeEffect(effect.id)}
                  />
                )
              
              case 'gem_match':
                return (
                  <div
                    key={effect.id}
                    className="absolute"
                    style={{
                      left: effect.position.x,
                      top: effect.position.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <EnhancedGemEffects
                      gem={effect.data.gem}
                      isMatched={true}
                      effectIntensity={effect.intensity}
                      enableAdvancedEffects={state.settings.enableAdvancedEffects}
                      onEffectComplete={() => removeEffect(effect.id)}
                    />
                  </div>
                )
              
              default:
                return null
            }
          })}
        </AnimatePresence>
      </div>
    </VisualEffectsContext.Provider>
  )
}

// Utility hooks for specific visual effects
export const useComboEffects = () => {
  const { triggerComboEffect } = useVisualEffects()
  return triggerComboEffect
}

export const useGemMatchEffects = () => {
  const { triggerGemMatchEffect } = useVisualEffects()
  return triggerGemMatchEffect
}

export const usePowerUpEffects = () => {
  const { triggerPowerUpEffect } = useVisualEffects()
  return triggerPowerUpEffect
}

// Performance-aware effect triggers
export const useOptimizedEffects = () => {
  const { state, updateSettings } = useVisualEffects()
  
  useEffect(() => {
    // Reduce effects on low-performance devices
    const isLowPerformance = navigator.hardwareConcurrency <= 2
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (isLowPerformance || prefersReducedMotion) {
      updateSettings({
        enableParticles: false,
        effectIntensity: 'low',
        enableAdvancedEffects: false
      })
    }
  }, [updateSettings])

  return state.settings
} 