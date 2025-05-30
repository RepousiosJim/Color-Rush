'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ObstacleBlock } from '@/types/game'
import { obstacleBlockManager } from '@/lib/game/ObstacleBlockManager'

interface ObstacleBlockProps {
  block: ObstacleBlock
  size: number
  onClick?: () => void
  isHighlighted?: boolean
  disabled?: boolean
}

export default function ObstacleBlockComponent({
  block,
  size,
  onClick,
  isHighlighted = false,
  disabled = false
}: ObstacleBlockProps) {
  const visualData = obstacleBlockManager.getBlockVisualData(block)
  
  if (visualData.isDestroyed) {
    return null // Don't render destroyed blocks
  }

  // Color schemes for different block types
  const colorSchemes = {
    green: {
      primary: '#22C55E',
      secondary: '#16A34A',
      glow: '#4ADE80',
      damaged: '#DC2626',
      border: '#15803D'
    },
    blue: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      glow: '#60A5FA',
      damaged: '#DC2626',
      border: '#1D4ED8'
    }
  }

  const colors = colorSchemes[block.type]
  const healthPercentage = (visualData.health / visualData.maxHealth) * 100

  return (
    <AnimatePresence>
      <motion.div
        className={`relative cursor-pointer select-none ${disabled ? 'cursor-not-allowed' : ''}`}
        style={{ width: size, height: size }}
        onClick={disabled ? undefined : onClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          boxShadow: isHighlighted 
            ? `0 0 20px ${colors.glow}, 0 0 30px ${colors.glow}50`
            : `0 0 8px ${colors.primary}30`
        }}
        exit={{ 
          scale: 0, 
          opacity: 0,
          transition: { duration: 0.3 }
        }}
        whileHover={!disabled ? { 
          scale: 1.05,
          boxShadow: `0 0 15px ${colors.glow}80`
        } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Main block body */}
        <div
          className="absolute inset-0 rounded-lg border-2 overflow-hidden"
          style={{
            background: visualData.damaged 
              ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.damaged} 50%, ${colors.secondary} 100%)`
              : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderColor: colors.border,
            boxShadow: `inset 0 0 10px ${colors.primary}40`
          }}
        >
          {/* Health bar background */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            {/* Health bar fill */}
            <motion.div
              className="h-full bg-white/80"
              initial={{ width: '100%' }}
              animate={{ width: `${healthPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Block icon/emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-2xl"
              animate={{ 
                scale: visualData.damaged ? [1, 1.2, 1] : 1,
                rotate: visualData.damaged ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 0.5,
                repeat: visualData.damaged ? Infinity : 0,
                repeatType: "reverse"
              }}
            >
              {visualData.emoji}
            </motion.div>
          </div>

          {/* Orientation indicator */}
          <div className="absolute top-1 left-1">
            <div 
              className="w-3 h-1 bg-white/60 rounded"
              style={{
                transform: block.orientation === 'vertical' ? 'rotate(90deg)' : 'none',
                transformOrigin: 'center'
              }}
            />
          </div>

          {/* Damage effect overlay */}
          {visualData.damaged && (
            <motion.div
              className="absolute inset-0 bg-red-500/20"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Highlight effect */}
          {isHighlighted && (
            <motion.div
              className="absolute inset-0 border-2 border-yellow-400 rounded-lg"
              animate={{ 
                borderColor: ['#FBBF24', '#FDE047', '#FBBF24'],
                boxShadow: [
                  '0 0 10px #FBBF24',
                  '0 0 20px #FDE047',
                  '0 0 10px #FBBF24'
                ]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Destruction animation */}
          <AnimatePresence>
            {block.isDestroyed && (
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0, scale: 1 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [1, 1.5, 2]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Floating health indicator */}
        {visualData.maxHealth > 1 && (
          <div className="absolute -top-2 -right-2 min-w-5 h-5 bg-gray-800 text-white text-xs rounded-full flex items-center justify-center font-bold border border-gray-600">
            {visualData.health}
          </div>
        )}

        {/* Block type indicator (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-white/60">
            {block.type.charAt(0).toUpperCase()}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 