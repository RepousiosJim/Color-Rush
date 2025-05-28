'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'hint'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  badge?: string | number
  tooltip?: string
  loading?: boolean
  pulse?: boolean
  glow?: boolean
  soundEffect?: boolean
}

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    icon,
    badge,
    tooltip,
    loading = false,
    pulse = false,
    glow = false,
    soundEffect = true,
    children,
    onClick,
    ...props
  }, ref) => {
    
    const buttonVariants = {
      primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
      secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-xl",
      success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl",
      warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl",
      danger: "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl",
      hint: "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
    }

    const sizeVariants = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add click sound effect
      if (soundEffect) {
        // You can implement sound here if needed
        console.log('🔊 Button click sound')
      }
      
      onClick?.(e)
    }

    const buttonContent = (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Button
          ref={ref}
          onClick={handleClick}
          disabled={loading || props.disabled}
          className={cn(
            "relative overflow-hidden font-semibold transition-all duration-200 border-0",
            buttonVariants[variant],
            sizeVariants[size],
            pulse && "animate-pulse",
            glow && "shadow-2xl",
            loading && "cursor-not-allowed opacity-70",
            className
          )}
          {...props}
        >
          {/* Glow effect */}
          {glow && (
            <div className="absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 opacity-75 blur-md" />
          )}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
          
          <div className="relative flex items-center justify-center gap-2">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : icon && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            
            {children && (
              <span className="flex-1">{children}</span>
            )}
            
            {badge && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white border-white/30"
              >
                {badge}
              </Badge>
            )}
          </div>
        </Button>
        
        {/* Pulse rings for special effects */}
        {pulse && (
          <>
            <motion.div
              className="absolute inset-0 rounded-md bg-current opacity-25"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.25, 0.1, 0.25]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-md bg-current opacity-15"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.05, 0.15]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </>
        )}
      </motion.div>
    )

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-black/90 text-white border-white/20">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return buttonContent
  }
)

GameButton.displayName = "GameButton"

export { GameButton }

// Specialized button variants for common game actions
export const RestartButton = forwardRef<HTMLButtonElement, Omit<GameButtonProps, 'variant' | 'icon'>>(
  (props, ref) => (
    <GameButton
      ref={ref}
      variant="warning"
      icon="🔄"
      tooltip="Restart the current game"
      {...props}
    />
  )
)

export const HintButton = forwardRef<HTMLButtonElement, Omit<GameButtonProps, 'variant' | 'icon'>>(
  (props, ref) => (
    <GameButton
      ref={ref}
      variant="hint"
      icon="💡"
      tooltip="Get a helpful hint"
      pulse
      {...props}
    />
  )
)

export const PauseButton = forwardRef<HTMLButtonElement, Omit<GameButtonProps, 'variant' | 'icon'> & { isPaused?: boolean }>(
  ({ isPaused, ...props }, ref) => (
    <GameButton
      ref={ref}
      variant="secondary"
      icon={isPaused ? "▶️" : "⏸️"}
      tooltip={isPaused ? "Resume game" : "Pause game"}
      {...props}
    />
  )
)

export const MenuButton = forwardRef<HTMLButtonElement, Omit<GameButtonProps, 'variant' | 'icon'>>(
  (props, ref) => (
    <GameButton
      ref={ref}
      variant="secondary"
      icon="🏠"
      tooltip="Return to main menu"
      {...props}
    />
  )
)

export const NextLevelButton = forwardRef<HTMLButtonElement, Omit<GameButtonProps, 'variant' | 'icon'>>(
  (props, ref) => (
    <GameButton
      ref={ref}
      variant="success"
      icon="🚀"
      tooltip="Continue to next level"
      glow
      {...props}
    />
  )
) 