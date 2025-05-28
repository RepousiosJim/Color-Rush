'use client'

import { motion } from 'framer-motion'
import { Gem } from '@/types/game'
import { GEM_TYPES } from '@/lib/game/constants'
import { cn } from '@/lib/utils'

interface EnhancedGemProps {
  gem: Gem | null
  row: number
  col: number
  isSelected?: boolean
  isAdjacent?: boolean
  isHinted?: boolean
  isMatched?: boolean
  onClick: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function EnhancedGem({
  gem,
  row,
  col,
  isSelected = false,
  isAdjacent = false,
  isHinted = false,
  isMatched = false,
  onClick,
  disabled = false,
  size = 'md'
}: EnhancedGemProps) {
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  }

  const getGemColors = (gemType: string) => {
    const colorMap = {
      fire: 'from-red-500 to-orange-600 shadow-red-500/50',
      water: 'from-blue-500 to-cyan-600 shadow-blue-500/50',
      earth: 'from-amber-600 to-yellow-700 shadow-amber-600/50',
      air: 'from-sky-400 to-blue-500 shadow-sky-400/50',
      lightning: 'from-yellow-400 to-orange-500 shadow-yellow-400/50',
      nature: 'from-green-500 to-emerald-600 shadow-green-500/50',
      magic: 'from-purple-500 to-violet-600 shadow-purple-500/50'
    }
    return colorMap[gemType as keyof typeof colorMap] || 'from-gray-500 to-gray-600 shadow-gray-500/50'
  }

  const getStateColors = () => {
    if (isSelected) {
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-400 shadow-yellow-400/70'
    }
    if (isHinted) {
      return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-400 shadow-blue-400/70'
    }
    if (isAdjacent) {
      return 'bg-gradient-to-br from-green-400 to-green-600 border-green-400 shadow-green-400/50'
    }
    if (gem) {
      return `bg-gradient-to-br ${getGemColors(gem.type)} border-white/30`
    }
    return 'bg-white/10 border-white/20'
  }

  const getAnimationVariant = () => {
    if (isSelected) return 'selected'
    if (isHinted) return 'hinted'
    if (isAdjacent) return 'adjacent'
    if (isMatched) return 'matched'
    return 'default'
  }

  const gemVariants = {
    default: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      borderWidth: 2,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    selected: {
      scale: 1.1,
      rotate: [0, 2, -2, 0],
      opacity: 1,
      borderWidth: 3,
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)'
    },
    hinted: {
      scale: [1, 1.05, 1],
      rotate: 0,
      opacity: [1, 0.8, 1],
      borderWidth: 3,
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)'
    },
    adjacent: {
      scale: 1.02,
      rotate: 0,
      opacity: 1,
      borderWidth: 2,
      boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)'
    },
    matched: {
      scale: [1, 1.2, 0],
      rotate: [0, 180, 360],
      opacity: [1, 0.7, 0],
      borderWidth: 2,
      boxShadow: '0 0 25px rgba(255, 255, 255, 0.8)'
    }
  }

  const getParticleColor = (gemType: string) => {
    const particleColors = {
      fire: '#ef4444',
      water: '#3b82f6',
      earth: '#f59e0b',
      air: '#06b6d4',
      lightning: '#eab308',
      nature: '#10b981',
      magic: '#8b5cf6'
    }
    return particleColors[gemType as keyof typeof particleColors] || '#ffffff'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-lg border-2 flex items-center justify-center font-bold transition-all duration-200 overflow-hidden",
        sizeClasses[size],
        getStateColors(),
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105 active:scale-95"
      )}
      variants={gemVariants}
      animate={getAnimationVariant()}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        rotate: {
          repeat: isSelected ? Infinity : 0,
          duration: 2,
          ease: "easeInOut"
        },
        scale: {
          repeat: isHinted ? Infinity : 0,
          duration: 1.5,
          ease: "easeInOut"
        }
      }}
      whileHover={!disabled ? { 
        scale: 1.05,
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
        <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full" />
      </div>

      {/* Gem Content */}
      {gem && (
        <span className="relative z-10 drop-shadow-sm">
          {GEM_TYPES[gem.type].emoji}
        </span>
      )}

      {/* Shimmer Effect */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
          animate={{ translateX: ['100%', '100%', '-100%', '-100%'] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.5, 0.8, 1]
          }}
        />
      )}

      {/* Selection Glow */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-yellow-400/30"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Hint Pulse */}
      {isHinted && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-blue-400"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.9, 1.05, 0.9]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Adjacent Highlight */}
      {isAdjacent && (
        <div className="absolute inset-0 rounded-lg bg-green-400/20 border border-green-400/50" />
      )}

      {/* Particle Effects for Matches */}
      {isMatched && gem && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{ backgroundColor: getParticleColor(gem.type) }}
              initial={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: 0,
                scale: 0,
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 80
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-6 left-0 text-xs text-white/60">
          {row},{col}
        </div>
      )}
    </motion.button>
  )
} 