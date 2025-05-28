'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  type: 'sparkle' | 'star' | 'gem' | 'energy' | 'cascade'
}

interface ParticleSystemProps {
  active?: boolean
  intensity?: 'low' | 'medium' | 'high'
  type?: 'ambient' | 'match' | 'cascade' | 'celebration'
  position?: { x: number; y: number }
  className?: string
}

const ParticleSystem = ({ 
  active = true, 
  intensity = 'medium',
  type = 'ambient',
  position,
  className = ''
}: ParticleSystemProps) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  const particleConfigs = {
    ambient: {
      count: intensity === 'low' ? 15 : intensity === 'medium' ? 25 : 40,
      spawnRate: 0.3,
      colors: ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'],
      types: ['sparkle', 'star'] as const
    },
    match: {
      count: intensity === 'low' ? 20 : intensity === 'medium' ? 35 : 50,
      spawnRate: 0.8,
      colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
      types: ['gem', 'energy'] as const
    },
    cascade: {
      count: intensity === 'low' ? 30 : intensity === 'medium' ? 50 : 80,
      spawnRate: 1.2,
      colors: ['#A855F7', '#EC4899', '#F97316', '#EAB308'],
      types: ['cascade', 'energy'] as const
    },
    celebration: {
      count: intensity === 'low' ? 40 : intensity === 'medium' ? 70 : 100,
      spawnRate: 2.0,
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      types: ['star', 'sparkle', 'gem'] as const
    }
  }

  const config = particleConfigs[type]

  const createParticle = (x?: number, y?: number): Particle => {
    const container = containerRef.current
    if (!container) {
      return {
        id: '',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        size: 0,
        color: '#8B5CF6',
        type: 'sparkle'
      }
    }

    const rect = container.getBoundingClientRect()
    const spawnX = x ?? (position?.x || Math.random() * rect.width)
    const spawnY = y ?? (position?.y || Math.random() * rect.height)

    return {
      id: Math.random().toString(36).substring(2, 11),
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1,
      maxLife: Math.random() * 60 + 40,
      size: Math.random() * 4 + 2,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      type: config.types[Math.floor(Math.random() * config.types.length)]
    }
  }

  const updateParticles = () => {
    setParticles(prev => {
      const container = containerRef.current
      if (!container) return prev

      const rect = container.getBoundingClientRect()
      
      // Update existing particles
      const updated = prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 1/particle.maxLife,
        vy: particle.vy + 0.02 // gravity
      })).filter(particle => 
        particle.life > 0 && 
        particle.x > -50 && 
        particle.x < rect.width + 50 &&
        particle.y > -50 && 
        particle.y < rect.height + 50
      )

      // Add new particles
      if (active && updated.length < config.count && Math.random() < config.spawnRate * 0.02) {
        updated.push(createParticle())
      }

      return updated
    })
  }

  useEffect(() => {
    if (!active) {
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
  }, [active, type, intensity, updateParticles])

  const getParticleEmoji = (particleType: Particle['type']) => {
    switch (particleType) {
      case 'sparkle': return '✨'
      case 'star': return '⭐'
      case 'gem': return '💎'
      case 'energy': return '⚡'
      case 'cascade': return '🔥'
      default: return '✨'
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute text-xs select-none"
            style={{
              left: particle.x,
              top: particle.y,
              color: particle.color,
              fontSize: `${particle.size}px`,
              filter: `brightness(${particle.life + 0.5}) blur(${(1 - particle.life) * 0.5}px)`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: particle.life,
              scale: 0.5 + (particle.life * 0.5),
              rotate: particle.life * 360
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            {getParticleEmoji(particle.type)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ParticleSystem 