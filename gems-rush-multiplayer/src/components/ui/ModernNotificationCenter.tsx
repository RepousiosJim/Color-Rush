'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import ModernGamePanel from './ModernGamePanel'

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement'
  duration: number
  timestamp: number
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface ModernNotificationCenterProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  maxVisible?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center'
  className?: string
}

const ModernNotificationCenter = ({
  notifications,
  onRemove,
  maxVisible = 5,
  position = 'top-right',
  className = ''
}: ModernNotificationCenterProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const getNotificationConfig = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-emerald-500/20 to-green-500/20',
          border: 'border-emerald-400/50',
          icon: '✅',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }
      case 'warning':
        return {
          bg: 'from-amber-500/20 to-yellow-500/20',
          border: 'border-amber-400/50',
          icon: '⚠️',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]'
        }
      case 'error':
        return {
          bg: 'from-red-500/20 to-rose-500/20',
          border: 'border-red-400/50',
          icon: '❌',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
        }
      case 'achievement':
        return {
          bg: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-400/50',
          icon: '🏆',
          glow: 'shadow-[0_0_20px_rgba(147,51,234,0.3)]'
        }
      default:
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-400/50',
          icon: 'ℹ️',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
        }
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
      default:
        return 'top-4 right-4'
    }
  }

  const visibleNotifications = notifications.slice(0, maxVisible)
  const hiddenCount = Math.max(0, notifications.length - maxVisible)

  return (
    <div className={`fixed ${getPositionStyles()} z-50 space-y-3 max-w-sm w-full ${className}`}>
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((notification, index) => {
          const config = getNotificationConfig(notification.type)
          const isHovered = hoveredId === notification.id
          
          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ 
                opacity: 0, 
                x: position.includes('right') ? 300 : -300,
                scale: 0.8,
                rotateY: position.includes('right') ? 45 : -45
              }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: 1,
                rotateY: 0
              }}
              exit={{ 
                opacity: 0, 
                x: position.includes('right') ? 300 : -300,
                scale: 0.8,
                rotateY: position.includes('right') ? 45 : -45,
                transition: { duration: 0.2 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                delay: index * 0.05
              }}
              onMouseEnter={() => setHoveredId(notification.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative group"
            >
              <ModernGamePanel
                variant="glass"
                blur="md"
                glow={isHovered}
                interactive={true}
                className={`
                  bg-gradient-to-r ${config.bg} ${config.border} ${isHovered ? config.glow : ''}
                  transition-all duration-300 cursor-pointer
                  hover:scale-[1.02] transform-gpu
                `}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <motion.span 
                        className="text-lg"
                        animate={isHovered ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {notification.icon || config.icon}
                      </motion.span>
                      
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    {/* Close Button */}
                    <motion.button
                      onClick={() => onRemove(notification.id)}
                      className="text-white/60 hover:text-white/90 transition-colors p-1 rounded-full hover:bg-white/10"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <span className="text-xs">✕</span>
                    </motion.button>
                  </div>
                  
                  {/* Action Button */}
                  {notification.action && (
                    <motion.button
                      onClick={notification.action.onClick}
                      className="w-full mt-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {notification.action.label}
                    </motion.button>
                  )}
                  
                  {/* Progress Bar */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white/30 to-white/60 rounded-b-lg"
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: notification.duration / 1000, ease: "linear" }}
                    onAnimationComplete={() => onRemove(notification.id)}
                  />
                </div>
              </ModernGamePanel>
              
              {/* Hover Effect Particles */}
              {isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [-10, -20, -30]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        delay: i * 0.1,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
        
        {/* Overflow Indicator */}
        {hiddenCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <ModernGamePanel
              variant="glass"
              blur="sm"
              className="px-3 py-2 bg-white/10 border-white/20"
            >
              <p className="text-white/70 text-xs">
                +{hiddenCount} more notification{hiddenCount !== 1 ? 's' : ''}
              </p>
            </ModernGamePanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ModernNotificationCenter 