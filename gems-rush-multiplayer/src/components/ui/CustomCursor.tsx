'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CustomCursorProps {
  gameState?: 'playing' | 'paused' | 'completed' | 'failed'
  isHoveringGem?: boolean
  isHoveringButton?: boolean
  selectedGemType?: string
  isHintActive?: boolean
}

export default function CustomCursor({
  gameState = 'playing',
  isHoveringGem = false,
  isHoveringButton = false,
  selectedGemType,
  isHintActive = false
}: CustomCursorProps) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Gem type to emoji mapping
  const gemEmojis: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    earth: '🌍',
    air: '💨',
    lightning: '⚡',
    nature: '🌿',
    magic: '🔮'
  }

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    document.addEventListener('mousemove', updateCursor)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Hide default cursor
    document.body.style.cursor = 'none'

    return () => {
      document.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.body.style.cursor = 'auto'
    }
  }, [])

  const getCursorContent = () => {
    if (selectedGemType && gemEmojis[selectedGemType]) {
      return gemEmojis[selectedGemType]
    }
    
    if (isHoveringGem) {
      return '✨'
    }
    
    if (isHoveringButton) {
      return '👆'
    }
    
    if (isHintActive) {
      return '💡'
    }
    
    return '🔮'
  }

  const getCursorVariant = () => {
    if (isClicking) return 'clicking'
    if (isHoveringGem) return 'hovering-gem'
    if (isHoveringButton) return 'hovering-button'
    if (selectedGemType) return 'carrying-gem'
    if (isHintActive) return 'hint-mode'
    return 'default'
  }

  const cursorVariants = {
    default: {
      scale: 1,
      rotate: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(147, 51, 234, 0.8)',
    },
    clicking: {
      scale: 0.8,
      rotate: 0,
      backgroundColor: 'rgba(239, 68, 68, 0.9)',
      borderColor: 'rgba(239, 68, 68, 1)',
    },
    'hovering-gem': {
      scale: 1.2,
      rotate: 0,
      backgroundColor: 'rgba(34, 197, 94, 0.9)',
      borderColor: 'rgba(34, 197, 94, 1)',
    },
    'hovering-button': {
      scale: 1.1,
      rotate: 0,
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
      borderColor: 'rgba(59, 130, 246, 1)',
    },
    'carrying-gem': {
      scale: 1.3,
      rotate: [0, 5, -5, 0],
      backgroundColor: 'rgba(245, 158, 11, 0.9)',
      borderColor: 'rgba(245, 158, 11, 1)',
    },
    'hint-mode': {
      scale: 1.1,
      rotate: 0,
      backgroundColor: 'rgba(168, 85, 247, 0.9)',
      borderColor: 'rgba(168, 85, 247, 1)',
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          transform: `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        {/* Main cursor */}
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          variants={cursorVariants}
          animate={getCursorVariant()}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            rotate: {
              repeat: selectedGemType ? Infinity : 0,
              duration: 2,
              ease: "linear"
            }
          }}
        >
          {/* Outer ring */}
          <div
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
            style={{
              backgroundColor: cursorVariants[getCursorVariant() as keyof typeof cursorVariants].backgroundColor,
              borderColor: cursorVariants[getCursorVariant() as keyof typeof cursorVariants].borderColor,
            }}
          >
            <span className="text-sm select-none">
              {getCursorContent()}
            </span>
          </div>

          {/* Ripple effect for clicking */}
          {isClicking && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Hint pulse effect */}
          {isHintActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-400"
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeOut"
              }}
            />
          )}
        </motion.div>

        {/* Trailing dots for gem carrying */}
        {selectedGemType && (
          <>
            <motion.div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: -15,
                top: -15,
              }}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: 0.1
              }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                left: -25,
                top: -25,
              }}
              animate={{
                scale: [0.6, 1, 0.6],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: 0.2
              }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 