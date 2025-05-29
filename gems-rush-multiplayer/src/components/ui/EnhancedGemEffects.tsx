'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Gem, GemType } from '@/types/game'
import { GEM_TYPES, GEM_COLORS } from '@/lib/game/constants'

interface EnhancedGemEffectsProps {
  gem: Gem | null
  isSelected?: boolean
  isAdjacent?: boolean
  isHinted?: boolean
  isMatched?: boolean
  isPowerUp?: boolean
  comboLevel?: number
  onEffectComplete?: () => void
  effectIntensity?: 'low' | 'medium' | 'high'
  enableAdvancedEffects?: boolean
}

interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'sparkle' | 'energy' | 'glow' | 'trail'
}

export default function EnhancedGemEffects({
  gem,
  isSelected = false,
  isAdjacent = false,
  isHinted = false,
  isMatched = false,
  isPowerUp = false,
  comboLevel = 0,
  onEffectComplete,
  effectIntensity = 'medium',
  enableAdvancedEffects = true
}: EnhancedGemEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [glowIntensity, setGlowIntensity] = useState(0.5)
  const animationRef = useRef<number | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get gem-specific color scheme
  const getGemColorScheme = (gemType: GemType) => {
    const colors = GEM_COLORS[gemType]
    return {
      primary: colors?.primary || '#8B5CF6',
      secondary: colors?.secondary || '#3B82F6',
      glow: colors?.glow || '#A855F7',
      particles: [colors?.primary, colors?.secondary, colors?.glow].filter(Boolean)
    }
  }

  // Particle system configuration based on gem state
  const getParticleConfig = () => {
    const intensity = effectIntensity === 'high' ? 1.5 : effectIntensity === 'low' ? 0.5 : 1
    
    if (isMatched) {
      return {
        count: Math.floor(20 * intensity),
        spawnRate: 2.0 * intensity,
        types: ['sparkle', 'energy'] as const,
        velocity: { min: 2, max: 6 },
        life: { min: 30, max: 60 }
      }
    }
    
    if (isPowerUp) {
      return {
        count: Math.floor(15 * intensity),
        spawnRate: 1.5 * intensity,
        types: ['energy', 'glow'] as const,
        velocity: { min: 1, max: 3 },
        life: { min: 40, max: 80 }
      }
    }
    
    if (isSelected) {
      return {
        count: Math.floor(12 * intensity),
        spawnRate: 1.2 * intensity,
        types: ['sparkle', 'glow'] as const,
        velocity: { min: 0.5, max: 2 },
        life: { min: 20, max: 40 }
      }
    }
    
    if (isHinted) {
      return {
        count: Math.floor(8 * intensity),
        spawnRate: 0.8 * intensity,
        types: ['sparkle'] as const,
        velocity: { min: 0.3, max: 1.5 },
        life: { min: 30, max: 50 }
      }
    }
    
    return null
  }

  // Create particle based on configuration
  const createParticle = (config: ReturnType<typeof getParticleConfig>): Particle | null => {
    if (!config || !gem || !containerRef.current) return null
    
    const colorScheme = getGemColorScheme(gem.type)
    const rect = containerRef.current.getBoundingClientRect()
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: rect.width * 0.5 + (Math.random() - 0.5) * rect.width * 0.8,
      y: rect.height * 0.5 + (Math.random() - 0.5) * rect.height * 0.8,
      vx: (Math.random() - 0.5) * (config.velocity.max - config.velocity.min) + config.velocity.min,
      vy: (Math.random() - 0.5) * (config.velocity.max - config.velocity.min) + config.velocity.min,
      life: 1,
      maxLife: config.life.min + Math.random() * (config.life.max - config.life.min),
      size: 2 + Math.random() * 3,
      color: colorScheme.particles[Math.floor(Math.random() * colorScheme.particles.length)],
      type: config.types[Math.floor(Math.random() * config.types.length)]
    }
  }

  // Update particle system
  const updateParticles = () => {
    const config = getParticleConfig()
    
    setParticles(prev => {
      // Update existing particles
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1/particle.maxLife,
        vy: particle.vy + 0.01 // slight gravity
      })).filter(particle => particle.life > 0)

      // Add new particles if needed
      if (config && enableAdvancedEffects && updated.length < config.count && Math.random() < config.spawnRate * 0.1) {
        const newParticle = createParticle(config)
        if (newParticle) {
          updated.push(newParticle)
        }
      }

      return updated
    })
  }

  // Glow animation
  useEffect(() => {
    if (!enableAdvancedEffects) return

    const animateGlow = () => {
      const time = Date.now() * 0.003
      const baseIntensity = isSelected ? 0.8 : isPowerUp ? 0.6 : isHinted ? 0.4 : 0.2
      const variation = Math.sin(time) * 0.2
      setGlowIntensity(baseIntensity + variation)
    }

    const glowInterval = setInterval(animateGlow, 50)
    return () => clearInterval(glowInterval)
  }, [isSelected, isPowerUp, isHinted, enableAdvancedEffects])

  // Particle animation loop
  useEffect(() => {
    if (!enableAdvancedEffects) {
      setParticles([])
      return
    }

    const animate = () => {
      updateParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gem, isSelected, isAdjacent, isHinted, isMatched, isPowerUp, enableAdvancedEffects])

  // Clean up on match completion
  useEffect(() => {
    if (isMatched && particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles([])
        onEffectComplete?.()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isMatched, particles.length, onEffectComplete])

  if (!gem) return null

  const colorScheme = getGemColorScheme(gem.type)

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Base Glow Effect */}
      {enableAdvancedEffects && (isSelected || isPowerUp || isHinted) && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${colorScheme.glow}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: `blur(${glowIntensity * 8}px)`
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, glowIntensity, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Power-up Special Aura */}
      {isPowerUp && enableAdvancedEffects && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2"
          style={{
            borderImage: `linear-gradient(45deg, ${colorScheme.primary}, ${colorScheme.secondary}, ${colorScheme.glow}) 1`,
            boxShadow: `0 0 20px ${colorScheme.glow}`
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      )}

      {/* Combo Level Indicator */}
      {comboLevel > 1 && enableAdvancedEffects && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            scale: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
            rotate: { duration: 1, repeat: Infinity }
          }}
        >
          {comboLevel}x
        </motion.div>
      )}

      {/* Particle System */}
      <AnimatePresence>
        {enableAdvancedEffects && particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.type === 'sparkle' ? '50%' : '2px',
              filter: `brightness(${particle.life + 0.5}) ${particle.type === 'glow' ? `blur(${(1 - particle.life) * 2}px)` : ''}`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: particle.life,
              scale: particle.type === 'energy' ? [0.5, 1.5, 0.5] : 1,
              rotate: particle.type === 'sparkle' ? particle.life * 180 : 0
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              scale: particle.type === 'energy' ? { duration: 0.5, repeat: Infinity } : { duration: 0.1 },
              opacity: { duration: 0.1 }
            }}
          />
        ))}
      </AnimatePresence>

      {/* Match Explosion Effect */}
      {isMatched && enableAdvancedEffects && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${colorScheme.glow} 0%, transparent 70%)`
          }}
          initial={{ scale: 0.1, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Ripple Effect for Selection */}
      {isSelected && enableAdvancedEffects && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-lg border-2"
              style={{ borderColor: colorScheme.primary }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}
    </div>
  )
} 