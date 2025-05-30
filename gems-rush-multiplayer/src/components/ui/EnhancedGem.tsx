'use client'

import { motion } from 'framer-motion'
import { Gem } from '@/types/game'
import { GEM_TYPES, GEM_COLORS } from '@/lib/game/constants'
import { cn } from '@/lib/utils'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'
import { useMemo } from 'react'

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
  
  const { 
    quality, 
    shouldAnimate, 
    shouldShowEffects, 
    getOptimizedAnimation,
    enableHardwareAcceleration
  } = usePerformanceOptimization()
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg'
  }

  const getSizeValues = () => {
    const sizes = {
      sm: { icon: 'text-lg', border: 2, radius: 8 },
      md: { icon: 'text-xl', border: 3, radius: 12 },
      lg: { icon: 'text-2xl', border: 4, radius: 16 }
    }
    return sizes[size]
  }

  const sizeVals = getSizeValues()

  // Optimized gem visuals based on performance
  const getOptimizedGemVisuals = useMemo(() => {
    if (!gem || !GEM_TYPES[gem.type]) return null
    
    const gemConfig = GEM_TYPES[gem.type]
    const colors = GEM_COLORS[gem.type]
    
    // Use professional visual icon for high quality, fallback to emoji for lower quality
    const displayIcon = quality === 'ultra' || quality === 'high' ? 
      gemConfig.visualIcon : gemConfig.icon
    
    // Simplify visual complexity based on performance
    const simplifiedPattern = quality === 'minimal' || quality === 'low' ? 'solid' : gemConfig.pattern
    
    return {
      config: { ...gemConfig, pattern: simplifiedPattern },
      colors,
      shape: gemConfig.shape,
      pattern: simplifiedPattern,
      displayIcon,
      // NEW: Professional visual metrics
      readabilityScore: gemConfig.gameplayReadability,
      uniquenessScore: gemConfig.uniqueness
    }
  }, [gem, quality])

  // Generate shape-specific CSS classes
  const getShapeClasses = (shape: string) => {
    if (quality === 'minimal') return 'rounded-lg' // Fallback for performance
    
    const shapeMap = {
      circle: 'rounded-full',
      square: 'rounded-lg',
      diamond: 'rounded-lg',
      hexagon: quality === 'low' ? 'rounded-lg' : 'hexagon-clip',
      star: quality === 'low' ? 'rounded-lg' : 'star-clip',
      triangle: quality === 'low' ? 'rounded-lg' : 'triangle-clip',
      octagon: quality === 'low' ? 'rounded-lg' : 'octagon-clip'
    }
    return shapeMap[shape as keyof typeof shapeMap] || 'rounded-lg'
  }

  // Enhanced pattern background with professional gradients
  const getOptimizedPatternBackground = (pattern: string, colors: any) => {
    // Use simple gradients for lower performance
    if (quality === 'minimal') {
      return {
        background: colors.primary,
        boxShadow: 'none'
      }
    }
    
    if (quality === 'low') {
      return {
        background: colors.premiumGradient,
        boxShadow: `0 0 5px ${colors.glow}`
      }
    }

    // Full complexity with professional effects for higher performance
    switch (pattern) {
      case 'solid':
        return {
          background: colors.premiumGradient,
          boxShadow: `inset 0 0 20px ${colors.shadow}, 0 0 15px ${colors.glow}, 0 2px 8px ${colors.edgeHighlight}50`
        }
      case 'gradient':
        return {
          background: colors.premiumGradient,
          boxShadow: `inset 0 0 15px ${colors.shadow}, 0 0 10px ${colors.glow}, inset 0 2px 4px ${colors.edgeHighlight}60`
        }
      case 'radial':
        return {
          background: `radial-gradient(circle at 30% 30%, ${colors.coreGlow} 0%, ${colors.primary} 40%, ${colors.secondary} 100%)`,
          boxShadow: `inset 0 0 20px ${colors.shadow}, 0 0 15px ${colors.glow}, 0 0 25px ${colors.coreGlow}40`
        }
      case 'crystalline':
        return {
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 30%, ${colors.edgeHighlight}40 50%, ${colors.secondary} 70%, ${colors.tertiary} 100%)`,
          boxShadow: `inset 0 0 15px ${colors.shadow}, 0 0 20px ${colors.glow}, inset 0 4px 8px ${colors.edgeHighlight}80`
        }
      case 'swirl':
        return {
          background: `conic-gradient(from 45deg, ${colors.primary} 0%, ${colors.secondary} 25%, ${colors.tertiary} 50%, ${colors.secondary} 75%, ${colors.primary} 100%)`,
          boxShadow: `inset 0 0 15px ${colors.shadow}, 0 0 18px ${colors.glow}, 0 0 30px ${colors.coreGlow}30`
        }
      default:
        return {
          background: colors.premiumGradient,
          boxShadow: `inset 0 0 15px ${colors.shadow}, 0 0 10px ${colors.glow}`
        }
    }
  }

  const getStateOverlay = () => {
    if (isSelected) {
      return {
        background: 'rgba(255, 215, 0, 0.3)',
        borderColor: '#FFD700',
        boxShadow: quality === 'minimal' ? 'none' : '0 0 30px rgba(255, 215, 0, 0.8)'
      }
    }
    if (isHinted) {
      return {
        background: 'rgba(59, 130, 246, 0.4)',
        borderColor: '#3B82F6',
        boxShadow: quality === 'minimal' ? 'none' : '0 0 35px rgba(59, 130, 246, 0.9), inset 0 0 20px rgba(59, 130, 246, 0.3)'
      }
    }
    if (isAdjacent) {
      return {
        background: 'rgba(34, 197, 94, 0.2)',
        borderColor: '#22C55E',
        boxShadow: quality === 'minimal' ? 'none' : '0 0 20px rgba(34, 197, 94, 0.6)'
      }
    }
    return {}
  }

  const getAnimationVariant = () => {
    if (!shouldAnimate) return 'static'
    if (isMatched) return 'matched'
    if (isSelected) return 'selected'
    if (isHinted) return 'hinted'
    if (isAdjacent) return 'adjacent'
    return 'default'
  }

  // Optimized animation variants based on performance
  const gemVariants = useMemo(() => {
    const baseVariants = {
      static: { scale: 1, rotate: 0, opacity: 1, y: 0 },
      default: { scale: 1, rotate: 0, opacity: 1, y: 0 },
      selected: getOptimizedAnimation({
        scale: [1, 1.05, 1.02],
        transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
      }),
      hinted: getOptimizedAnimation({
        scale: [1, 1.08, 1],
        opacity: [1, 0.7, 1],
        transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
      }),
      adjacent: { scale: 1.02, opacity: 1 },
      matched: getOptimizedAnimation({
        scale: [1, 1.2, 0],
        opacity: [1, 0.5, 0],
        transition: { duration: 0.6, ease: "easeOut" }
      })
    }
    return baseVariants
  }, [getOptimizedAnimation])

  if (!gem) {
    return (
      <div className={cn(
        "flex items-center justify-center border-2 border-dashed border-gray-400/30 bg-gray-200/10 rounded-lg",
        sizeClasses[size]
      )} />
    )
  }

  const visuals = getOptimizedGemVisuals
  if (!visuals) return null

  const patternStyle = getOptimizedPatternBackground(visuals.pattern, visuals.colors)
  const stateOverlay = getStateOverlay()

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center font-bold overflow-hidden border-2",
        sizeClasses[size],
        getShapeClasses(visuals.shape),
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        // Only add hover effects for higher performance
        quality !== 'minimal' && !disabled ? "hover:scale-105 active:scale-95 transition-transform duration-200" : ""
      )}
      style={{
        ...patternStyle,
        borderColor: stateOverlay.borderColor || visuals.config.border,
        ...stateOverlay
      }}
      variants={gemVariants}
      animate={getAnimationVariant()}
      whileHover={shouldAnimate && !disabled ? { 
        scale: 1.04,
        filter: quality === 'ultra' ? 'brightness(1.2)' : 'brightness(1.1)'
      } : {}}
      whileTap={shouldAnimate && !disabled ? { scale: 0.96 } : {}}
      onMouseEnter={(e) => {
        if (quality === 'ultra') {
          enableHardwareAcceleration(e.currentTarget)
        }
      }}
    >
      {/* Simplified geometric overlay only for medium+ performance */}
      {shouldShowEffects && visuals.shape === 'diamond' && (
        <div 
          className="absolute inset-1"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${visuals.colors.accent}30 50%, transparent 70%)`,
            borderRadius: '6px'
          }}
        />
      )}

      {/* Central gem content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Main gem icon */}
        <div 
          className={cn(
            "font-bold transition-all duration-200",
            sizeVals.icon
          )}
          style={{ 
            color: visuals.colors.contrast,
            textShadow: visuals.colors.contrast === '#FFFFFF' ? 
              '1px 1px 3px rgba(0,0,0,0.8)' : 
              '1px 1px 2px rgba(255,255,255,0.8)',
            filter: quality === 'minimal' ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
          }}
        >
          {visuals.displayIcon}
        </div>

        {/* Symbol overlay only for medium+ performance */}
        {quality !== 'minimal' && quality !== 'low' && (
          <div 
            className="absolute text-xs opacity-60"
            style={{ 
              color: visuals.colors.accent,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {visuals.config.symbol}
          </div>
        )}
      </div>

      {/* Shine effect only for ultra performance */}
      {quality === 'ultra' && shouldShowEffects && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0"
          animate={{
            opacity: [0, 0.4, 0],
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Simplified pattern effects only for high+ performance */}
      {shouldShowEffects && quality === 'ultra' && visuals.pattern === 'pulse' && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-40"
          style={{ 
            background: `radial-gradient(circle, ${visuals.colors.glow}15 0%, transparent 60%)` 
          }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  )
} 