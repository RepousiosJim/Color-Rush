'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GemType } from '@/types/game'
import { GEM_COLORS } from '@/lib/game/constants'

interface ComboTextDisplayProps {
  comboLevel: number
  score: number
  gemTypes?: GemType[]
  position?: { x: number; y: number }
  onComplete?: () => void
  showParticles?: boolean
  duration?: number
  variant?: 'standard' | 'rainbow' | 'explosive' | 'divine'
}

interface ComboMessage {
  text: string
  color: string
  scale: number
  effects: string[]
}

export default function ComboTextDisplay({
  comboLevel,
  score,
  gemTypes = [],
  position = { x: 0, y: 0 },
  onComplete,
  showParticles = true,
  duration = 2000,
  variant = 'standard'
}: ComboTextDisplayProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [comboMessage, setComboMessage] = useState<ComboMessage | null>(null)

  // Combo level to message mapping
  const getComboMessage = (level: number): ComboMessage => {
    const messages = {
      2: { text: 'Nice!', color: '#10B981', scale: 1.0, effects: ['✨'] },
      3: { text: 'Great!', color: '#3B82F6', scale: 1.1, effects: ['⭐', '✨'] },
      4: { text: 'Awesome!', color: '#8B5CF6', scale: 1.2, effects: ['🌟', '⭐', '✨'] },
      5: { text: 'Amazing!', color: '#EC4899', scale: 1.3, effects: ['💫', '🌟', '⭐'] },
      6: { text: 'Incredible!', color: '#F59E0B', scale: 1.4, effects: ['🔥', '💫', '🌟'] },
      7: { text: 'Phenomenal!', color: '#EF4444', scale: 1.5, effects: ['⚡', '🔥', '💫'] },
      8: { text: 'Legendary!', color: '#7C3AED', scale: 1.6, effects: ['💥', '⚡', '🔥'] },
      9: { text: 'GODLIKE!', color: '#F97316', scale: 1.8, effects: ['🌈', '💥', '⚡'] },
      10: { text: 'DIVINE RUSH!', color: '#DC2626', scale: 2.0, effects: ['🔮', '🌈', '💥'] }
    }

    if (level >= 10) {
      return messages[10]
    }
    
    return messages[level as keyof typeof messages] || messages[2]
  }

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'rainbow':
        return {
          background: 'linear-gradient(45deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff0080)',
          backgroundSize: '400% 400%',
          animation: 'rainbowShift 2s ease infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }
      
      case 'explosive':
        return {
          color: '#FF4500',
          textShadow: '0 0 20px #FF4500, 0 0 40px #FF6347, 0 0 60px #FF0000',
          filter: 'drop-shadow(0 0 10px #FF4500)'
        }
      
      case 'divine':
        return {
          background: 'linear-gradient(45deg, #FFD700, #FFA500, #FFFFFF, #FFD700)',
          backgroundSize: '200% 200%',
          animation: 'divineGlow 1.5s ease infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px #FFD700)'
        }
      
      default:
        return {
          color: comboMessage?.color || '#FFFFFF',
          textShadow: `0 0 10px ${comboMessage?.color || '#FFFFFF'}`
        }
    }
  }

  // Initialize combo message
  useEffect(() => {
    if (comboLevel > 1) {
      setComboMessage(getComboMessage(comboLevel))
      setIsVisible(true)
    }
  }, [comboLevel])

  // Auto-hide after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onComplete?.(), 300)
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onComplete])

  if (!comboMessage || comboLevel < 2) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-50"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.3, 
            y: 20,
            rotate: -10
          }}
          animate={{ 
            opacity: 1, 
            scale: comboMessage.scale,
            y: 0,
            rotate: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5,
            y: -50,
            rotate: 10
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.8
          }}
        >
          {/* Main Combo Text */}
          <motion.div
            className="relative text-center"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          >
            <motion.h1
              className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider"
              style={getVariantStyles()}
              animate={variant === 'explosive' ? {
                textShadow: [
                  '0 0 20px #FF4500',
                  '0 0 40px #FF6347, 0 0 60px #FF0000',
                  '0 0 20px #FF4500'
                ]
              } : {}}
              transition={{
                duration: 0.3,
                repeat: Infinity
              }}
            >
              {comboMessage.text}
            </motion.h1>

            {/* Score Display */}
            <motion.div
              className="mt-2 text-yellow-400 font-bold text-lg sm:text-xl md:text-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              +{score.toLocaleString()}
            </motion.div>

            {/* Combo Level Indicator */}
            <motion.div
              className="mt-1 text-white/80 font-semibold text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {comboLevel}x Combo!
            </motion.div>
          </motion.div>

          {/* Effect Particles */}
          {showParticles && (
            <div className="absolute inset-0">
              {comboMessage.effects.map((effect, index) => (
                <motion.div
                  key={`${effect}-${index}`}
                  className="absolute text-2xl sm:text-3xl"
                  style={{
                    left: `${20 + index * 15}%`,
                    top: `${10 + (index % 2) * 20}%`
                  }}
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    rotate: Math.random() * 360
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    rotate: Math.random() * 720,
                    y: [-20, -40, -60]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.2 + index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {effect}
                </motion.div>
              ))}
            </div>
          )}

          {/* Gem Type Showcase */}
          {gemTypes.length > 0 && (
            <motion.div
              className="mt-4 flex justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {gemTypes.slice(0, 5).map((gemType, index) => {
                const colors = GEM_COLORS[gemType]
                return (
                  <motion.div
                    key={`${gemType}-${index}`}
                    className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center text-lg"
                    style={{
                      background: `linear-gradient(45deg, ${colors?.primary || '#8B5CF6'}, ${colors?.secondary || '#3B82F6'})`
                    }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    {/* Gem emoji would go here */}
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Radial Burst Effect */}
          {comboLevel >= 5 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    scale: [0, 3, 0],
                    opacity: [1, 0.5, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 100,
                    y: Math.sin((i / 8) * Math.PI * 2) * 100
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Screen Shake Effect Indicator */}
          {comboLevel >= 7 && (
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-full blur-xl"
              animate={{
                scale: [0, 2, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 0.5,
                delay: 0.2
              }}
            />
          )}
        </motion.div>
      )}

      {/* CSS for gradient animations */}
      <style jsx>{`
        @keyframes rainbowShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes divineGlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </AnimatePresence>
  )
} 