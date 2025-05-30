'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dynamicContentManager, DailyEvent } from '@/lib/game/DynamicContentSystem'

interface DailyEventBannerProps {
  currentEvent: DailyEvent | null
  onEventClick?: () => void
  variant?: 'full' | 'compact' | 'minimal'
  position?: 'top' | 'bottom' | 'sidebar'
}

const DailyEventBanner: React.FC<DailyEventBannerProps> = ({
  currentEvent,
  onEventClick,
  variant = 'compact',
  position = 'sidebar'
}) => {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!currentEvent) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = currentEvent.endTime - now
      
      if (remaining <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [currentEvent])

  if (!currentEvent || !isVisible) {
    return null
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-green-500/80 to-green-600/80'
      case 'rare': return 'from-blue-500/80 to-blue-600/80'
      case 'epic': return 'from-purple-500/80 to-purple-600/80'
      case 'legendary': return 'from-yellow-500/80 to-orange-500/80'
      default: return 'from-gray-500/80 to-gray-600/80'
    }
  }

  const getEventEmoji = (type: string) => {
    switch (type) {
      case 'double_coins': return '🪙'
      case 'gem_rush': return '💎'
      case 'power_up_party': return '⚡'
      case 'energy_boost': return '🔋'
      case 'streak_saver': return '🛡️'
      case 'combo_master': return '🔥'
      default: return '🎉'
    }
  }

  // Minimal notification (small corner indicator)
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`relative bg-gradient-to-r ${getRarityColor(currentEvent.rarity)} backdrop-blur-sm 
                   rounded-full p-3 cursor-pointer shadow-lg border border-white/20`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-xl">{getEventEmoji(currentEvent.type)}</div>
        
        {/* Pulse effect for active events */}
        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse opacity-50"></div>
        
        {/* Expanded tooltip */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full right-0 mb-2 w-64 bg-black/90 backdrop-blur-sm 
                         rounded-xl p-3 border border-white/20 text-white shadow-xl z-50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getEventEmoji(currentEvent.type)}</span>
                <h4 className="font-bold text-sm">{currentEvent.name}</h4>
              </div>
              <p className="text-xs text-gray-300 mb-2">{currentEvent.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-orange-300">⏰ {timeRemaining}</span>
                <span className="text-purple-300">{currentEvent.rarity.toUpperCase()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Compact notification (sidebar style)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ x: position === 'sidebar' ? 300 : 0, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: position === 'sidebar' ? 300 : 0, opacity: 0 }}
        className={`relative bg-gradient-to-r ${getRarityColor(currentEvent.rarity)} backdrop-blur-sm 
                   rounded-xl p-3 cursor-pointer shadow-lg border border-white/20 max-w-sm`}
        onClick={onEventClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(false)
          }}
          className="absolute top-1 right-1 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center 
                     text-white/60 hover:text-white/90 hover:bg-black/50 transition-all"
        >
          ×
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="text-2xl">{getEventEmoji(currentEvent.type)}</div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold text-sm truncate">{currentEvent.name}</h4>
            <p className="text-white/80 text-xs leading-tight">{currentEvent.description}</p>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-orange-300 text-xs">⏰ {timeRemaining}</span>
              {currentEvent.multiplier && (
                <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded">
                  {currentEvent.multiplier}x
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sparkle effect for legendary events */}
        {currentEvent.rarity === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            <div className="animate-pulse absolute top-1 right-8 text-yellow-300 text-xs">✨</div>
            <div className="animate-pulse absolute bottom-1 left-1 text-yellow-300 text-xs" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
        )}
      </motion.div>
    )
  }

  // Full notification (original style, but improved)
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className={`relative bg-gradient-to-r ${getRarityColor(currentEvent.rarity)} backdrop-blur-sm 
                 rounded-xl p-4 cursor-pointer shadow-lg border border-white/20`}
      onClick={onEventClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsVisible(false)
        }}
        className="absolute top-2 right-2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center 
                   text-white/60 hover:text-white/90 hover:bg-black/50 transition-all"
      >
        ×
      </button>

      <div className="flex items-center justify-between pr-10">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getEventEmoji(currentEvent.type)}</div>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-lg">{currentEvent.name}</h3>
              <span className="text-white/60 text-sm">{currentEvent.rarity.toUpperCase()}</span>
            </div>
            <p className="text-white/90 text-sm">{currentEvent.description}</p>
            
            {/* Event Benefits */}
            <div className="flex gap-2 mt-1">
              {currentEvent.multiplier && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {currentEvent.multiplier}x Multiplier
                </span>
              )}
              {currentEvent.bonus && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  +{currentEvent.bonus} Bonus
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-white/80 text-xs uppercase tracking-wide">Time Left</div>
          <div className="text-white font-mono text-lg">{timeRemaining}</div>
        </div>
      </div>

      {/* Sparkle effect for legendary events */}
      {currentEvent.rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="animate-pulse absolute top-2 right-12 text-yellow-300">✨</div>
          <div className="animate-pulse absolute bottom-2 left-2 text-yellow-300" style={{ animationDelay: '0.5s' }}>✨</div>
          <div className="animate-pulse absolute top-1/2 left-1/2 text-yellow-300" style={{ animationDelay: '1s' }}>⭐</div>
        </div>
      )}
    </motion.div>
  )
}

export default DailyEventBanner 