'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GemType, PowerUp } from '@/types/game'
import { POWER_UP_TYPES, GEM_COLORS } from '@/lib/game/constants'

export type PowerUpType = 
  | 'BOMB' 
  | 'LIGHTNING' 
  | 'RAINBOW' 
  | 'ROW_CLEAR' 
  | 'COL_CLEAR' 
  | 'COLOR_BLAST' 
  | 'SHUFFLE' 
  | 'TIME_FREEZE'

export interface PowerUpGem {
  id: string
  type: GemType
  powerUpType: PowerUpType
  position: { row: number; col: number }
  chargeLevel: number // 0-100
  isActive: boolean
  isCharged: boolean
  comboLevel?: number
}

interface PowerUpIndicatorsProps {
  gem: PowerUpGem
  size?: 'sm' | 'md' | 'lg'
  showAura?: boolean
  showParticles?: boolean
  animationIntensity?: 'low' | 'medium' | 'high'
  enableSoundEffects?: boolean
  onActivate?: (powerUp: PowerUpGem) => void
  onChargeComplete?: (powerUp: PowerUpGem) => void
}

const POWER_UP_CONFIGS = {
  BOMB: {
    emoji: '💥',
    name: 'Bomb',
    colors: { primary: '#FF4757', secondary: '#FF3838', glow: '#FF6B7A' },
    aura: 'explosive',
    particles: ['spark', 'explosion'],
    chargeTime: 3000,
    soundEffect: 'bomb-charge'
  },
  LIGHTNING: {
    emoji: '⚡',
    name: 'Lightning',
    colors: { primary: '#FFBE0B', secondary: '#FB8500', glow: '#FFD60A' },
    aura: 'electric',
    particles: ['spark', 'electric'],
    chargeTime: 2500,
    soundEffect: 'lightning-charge'
  },
  RAINBOW: {
    emoji: '🌈',
    name: 'Rainbow',
    colors: { primary: '#9C27B0', secondary: '#E91E63', glow: '#F8BBD9' },
    aura: 'rainbow',
    particles: ['sparkle', 'rainbow'],
    chargeTime: 4000,
    soundEffect: 'rainbow-charge'
  },
  ROW_CLEAR: {
    emoji: '🔥',
    name: 'Row Clear',
    colors: { primary: '#FF5722', secondary: '#FF7043', glow: '#FF8A65' },
    aura: 'linear-horizontal',
    particles: ['flame', 'sweep'],
    chargeTime: 2000,
    soundEffect: 'row-charge'
  },
  COL_CLEAR: {
    emoji: '⚡',
    name: 'Column Clear',
    colors: { primary: '#2196F3', secondary: '#42A5F5', glow: '#64B5F6' },
    aura: 'linear-vertical',
    particles: ['electric', 'sweep'],
    chargeTime: 2000,
    soundEffect: 'column-charge'
  },
  COLOR_BLAST: {
    emoji: '💫',
    name: 'Color Blast',
    colors: { primary: '#9C27B0', secondary: '#AB47BC', glow: '#BA68C8' },
    aura: 'radial',
    particles: ['energy', 'blast'],
    chargeTime: 3500,
    soundEffect: 'color-charge'
  },
  SHUFFLE: {
    emoji: '🌀',
    name: 'Shuffle',
    colors: { primary: '#4CAF50', secondary: '#66BB6A', glow: '#81C784' },
    aura: 'swirl',
    particles: ['sparkle', 'swirl'],
    chargeTime: 5000,
    soundEffect: 'shuffle-charge'
  },
  TIME_FREEZE: {
    emoji: '❄️',
    name: 'Time Freeze',
    colors: { primary: '#00BCD4', secondary: '#26C6DA', glow: '#4DD0E1' },
    aura: 'freeze',
    particles: ['ice', 'crystal'],
    chargeTime: 6000,
    soundEffect: 'freeze-charge'
  }
}

export default function PowerUpIndicators({
  gem,
  size = 'md',
  showAura = true,
  showParticles = true,
  animationIntensity = 'medium',
  enableSoundEffects = true,
  onActivate,
  onChargeComplete
}: PowerUpIndicatorsProps) {
  const [isChargingAnimation, setIsChargingAnimation] = useState(false)
  const [pulseIntensity, setPulseIntensity] = useState(0.5)
  const [particleCount, setParticleCount] = useState(0)

  const config = POWER_UP_CONFIGS[gem.powerUpType]
  const gemColors = GEM_COLORS[gem.type]

  // Size configurations
  const sizeConfigs = {
    sm: { base: 'w-10 h-10', icon: 'text-lg', particle: 2 },
    md: { base: 'w-12 h-12', icon: 'text-xl', particle: 3 },
    lg: { base: 'w-16 h-16', icon: 'text-2xl', particle: 4 }
  }

  const sizeConfig = sizeConfigs[size]

  // Animation intensity scaling
  const intensityMultiplier = animationIntensity === 'high' ? 1.5 : animationIntensity === 'low' ? 0.5 : 1

  // Charging animation effect
  useEffect(() => {
    if (gem.chargeLevel > 0 && gem.chargeLevel < 100) {
      setIsChargingAnimation(true)
      
      const interval = setInterval(() => {
        setPulseIntensity(prev => (prev + 0.1) % 1)
        setParticleCount(prev => prev + 1)
      }, 100)

      return () => clearInterval(interval)
    } else {
      setIsChargingAnimation(false)
    }
  }, [gem.chargeLevel])

  // Charge completion effect
  useEffect(() => {
    if (gem.chargeLevel >= 100 && !gem.isCharged) {
      onChargeComplete?.(gem)
    }
  }, [gem.chargeLevel, gem.isCharged, onChargeComplete])

  // Get aura animation based on power-up type
  const getAuraAnimation = () => {
    switch (config.aura) {
      case 'explosive':
        return {
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 180, 360]
        }
      
      case 'electric':
        return {
          scale: [0.8, 1.2, 0.8],
          opacity: [0.4, 0.8, 0.4],
          skew: [-2, 2, -2]
        }
      
      case 'rainbow':
        return {
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
          hue: [0, 360, 0]
        }
      
      case 'linear-horizontal':
        return {
          scaleX: [0.5, 2, 0.5],
          opacity: [0.3, 0.8, 0.3]
        }
      
      case 'linear-vertical':
        return {
          scaleY: [0.5, 2, 0.5],
          opacity: [0.3, 0.8, 0.3]
        }
      
      case 'radial':
        return {
          scale: [0.5, 1.5, 0.5],
          opacity: [0.2, 0.9, 0.2]
        }
      
      case 'swirl':
        return {
          scale: [0.8, 1.2, 0.8],
          rotate: [0, 720, 0],
          opacity: [0.4, 0.8, 0.4]
        }
      
      case 'freeze':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.6, 1, 0.6],
          filter: ['blur(0px)', 'blur(2px)', 'blur(0px)']
        }
      
      default:
        return {
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }
    }
  }

  return (
    <div className={`relative ${sizeConfig.base} flex items-center justify-center`}>
      {/* Base Gem Display */}
      <motion.div
        className="absolute inset-0 rounded-lg flex items-center justify-center font-bold"
        style={{
          background: `linear-gradient(45deg, ${gemColors?.primary || '#8B5CF6'}, ${gemColors?.secondary || '#3B82F6'})`,
          border: `2px solid ${config.colors.glow}`,
          boxShadow: `0 0 ${gem.isCharged ? '20px' : '10px'} ${config.colors.glow}`
        }}
        animate={{
          boxShadow: gem.isCharged 
            ? [`0 0 10px ${config.colors.glow}`, `0 0 30px ${config.colors.glow}`, `0 0 10px ${config.colors.glow}`]
            : `0 0 10px ${config.colors.glow}`
        }}
        transition={{
          duration: 1.5 * intensityMultiplier,
          repeat: gem.isCharged ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Gem Icon */}
        <span className={`${sizeConfig.icon} z-10 relative`}>
          {config.emoji}
        </span>
      </motion.div>

      {/* Power-Up Aura */}
      {showAura && (gem.chargeLevel > 0 || gem.isCharged) && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${config.colors.primary}40 0%, ${config.colors.secondary}20 50%, transparent 70%)`,
            filter: 'blur(3px)'
          }}
          animate={getAuraAnimation()}
          transition={{
            duration: 2 * intensityMultiplier,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Charge Progress Ring */}
      {gem.chargeLevel > 0 && gem.chargeLevel < 100 && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg, ${config.colors.primary} 0%, ${config.colors.primary} ${gem.chargeLevel}%, transparent ${gem.chargeLevel}%, transparent 100%)`,
            borderRadius: '50%',
            mask: 'radial-gradient(circle, transparent 70%, black 72%, black 100%)',
            WebkitMask: 'radial-gradient(circle, transparent 70%, black 72%, black 100%)'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {/* Charging Particles */}
      {showParticles && isChargingAnimation && (
        <div className="absolute inset-0">
          <AnimatePresence>
            {[...Array(Math.min(particleCount % 8, 6))].map((_, i) => (
              <motion.div
                key={`particle-${particleCount}-${i}`}
                className={`absolute w-${sizeConfig.particle} h-${sizeConfig.particle} rounded-full`}
                style={{
                  backgroundColor: config.colors.glow,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: Math.cos((i / 6) * Math.PI * 2) * 40,
                  y: Math.sin((i / 6) * Math.PI * 2) * 40
                }}
                exit={{
                  opacity: 0,
                  scale: 0
                }}
                transition={{
                  duration: 1.5 * intensityMultiplier,
                  ease: "easeOut"
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Ready State Indicator */}
      {gem.isCharged && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
          animate={{
            scale: [1, 1.3, 1],
            boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0.7)']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-xs">✓</span>
        </motion.div>
      )}

      {/* Combo Level Multiplier */}
      {gem.comboLevel && gem.comboLevel > 1 && (
        <motion.div
          className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {gem.comboLevel}x
        </motion.div>
      )}

      {/* Activation Pulse */}
      {gem.isActive && (
        <motion.div
          className="absolute inset-0 rounded-lg border-4"
          style={{
            borderColor: config.colors.glow,
            background: 'transparent'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.3, 1],
            borderWidth: ['4px', '2px', '4px']
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Power-Up Type Label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {config.name}
        {gem.chargeLevel > 0 && gem.chargeLevel < 100 && (
          <span className="ml-2 text-yellow-400">({gem.chargeLevel}%)</span>
        )}
      </motion.div>

      {/* Special Effects for Specific Power-ups */}
      {gem.powerUpType === 'RAINBOW' && gem.isCharged && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff0080)',
            backgroundSize: '400% 400%',
            opacity: 0.3
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {gem.powerUpType === 'LIGHTNING' && gem.isCharged && (
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-lg"
          animate={{
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${config.colors.glow} 50%, transparent 70%)`,
              transform: 'rotate(45deg) scale(1.5)'
            }}
          />
        </motion.div>
      )}

      {gem.powerUpType === 'TIME_FREEZE' && gem.isCharged && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `radial-gradient(circle, ${config.colors.primary}30 0%, transparent 70%)`,
            filter: 'blur(2px)'
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  )
}

// Export power-up creation utility
export const createPowerUpGem = (
  id: string,
  type: GemType,
  powerUpType: PowerUpType,
  position: { row: number; col: number },
  comboLevel?: number
): PowerUpGem => ({
  id,
  type,
  powerUpType,
  position,
  chargeLevel: 0,
  isActive: false,
  isCharged: false,
  comboLevel
})

// Export power-up type checking utilities
export const isPowerUpGem = (gem: any): gem is PowerUpGem => {
  return gem && typeof gem === 'object' && 'powerUpType' in gem
}

export const getPowerUpConfig = (powerUpType: PowerUpType) => {
  return POWER_UP_CONFIGS[powerUpType]
} 