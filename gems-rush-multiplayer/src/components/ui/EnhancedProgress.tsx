'use client'

import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface EnhancedProgressProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  showValues?: boolean
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  glowing?: boolean
  className?: string
}

export default function EnhancedProgress({
  value,
  max = 100,
  label,
  showPercentage = false,
  showValues = false,
  variant = 'default',
  size = 'md',
  animated = true,
  glowing = false,
  className
}: EnhancedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-600',
          glow: 'shadow-green-500/50',
          text: 'text-green-400'
        }
      case 'warning':
        return {
          bg: 'from-yellow-500 to-orange-500',
          glow: 'shadow-yellow-500/50',
          text: 'text-yellow-400'
        }
      case 'danger':
        return {
          bg: 'from-red-500 to-pink-600',
          glow: 'shadow-red-500/50',
          text: 'text-red-400'
        }
      default:
        return {
          bg: 'from-purple-500 to-blue-600',
          glow: 'shadow-purple-500/50',
          text: 'text-purple-400'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2'
      case 'lg':
        return 'h-6'
      default:
        return 'h-4'
    }
  }

  const colors = getVariantColors()

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and Values */}
      {(label || showPercentage || showValues) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="text-white font-medium">{label}</span>
          )}
          
          <div className="flex items-center gap-2">
            {showValues && (
              <span className="text-purple-200">
                {formatNumber(value)} / {formatNumber(max)}
              </span>
            )}
            {showPercentage && (
              <span className={cn("font-bold", colors.text)}>
                {percentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(
            "bg-white/10 backdrop-blur-sm",
            getSizeClasses()
          )}
        />
        
        {/* Enhanced Fill */}
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r",
            colors.bg,
            glowing && colors.glow
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1 : 0,
            ease: "easeOut"
          }}
        />

        {/* Animated Shimmer */}
        {animated && percentage > 0 && (
          <motion.div
            className="absolute top-0 left-0 h-full w-full rounded-full overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                translateX: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
            />
          </motion.div>
        )}

        {/* Glow Effect */}
        {glowing && percentage > 0 && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-r opacity-50 blur-sm -z-10",
              colors.bg
            )}
            style={{ width: `${percentage}%` }}
            animate={{
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Milestone Markers */}
        {max > 0 && (
          <>
            {[25, 50, 75].map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 w-0.5 h-full bg-white/30"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </>
        )}

        {/* Completion Celebration */}
        {percentage >= 100 && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  transform: 'translateY(-50%)'
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  y: [0, -20, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Completion Message */}
      {percentage >= 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-green-400 font-bold text-sm">
            ✨ Complete! ✨
          </span>
        </motion.div>
      )}
    </div>
  )
} 