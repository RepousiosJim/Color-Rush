'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Trophy, 
  Calendar, 
  Star, 
  Gift, 
  Users, 
  Settings, 
  Volume2, 
  VolumeX,
  Menu,
  X
} from 'lucide-react'

interface QuickAccessItem {
  id: string
  icon: React.ReactNode
  label: string
  action: () => void
  badge?: string
  color?: string
  disabled?: boolean
}

interface QuickAccessToolbarProps {
  onQuickPlay: () => void
  onShowLeaderboard: () => void
  onShowDailyChallenge: () => void
  onShowAchievements: () => void
  onShowShop: () => void
  onShowMultiplayer: () => void
  onShowSettings: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  dailyChallengeAvailable?: boolean
  newAchievements?: number
  isMultiplayerAvailable?: boolean
}

export default function QuickAccessToolbar({
  onQuickPlay,
  onShowLeaderboard,
  onShowDailyChallenge,
  onShowAchievements,
  onShowShop,
  onShowMultiplayer,
  onShowSettings,
  soundEnabled,
  onToggleSound,
  dailyChallengeAvailable = true,
  newAchievements = 0,
  isMultiplayerAvailable = false
}: QuickAccessToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickAccessItems: QuickAccessItem[] = [
    {
      id: 'quick-play',
      icon: <Play className="w-5 h-5" />,
      label: 'Quick Play',
      action: onQuickPlay,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'leaderboard',
      icon: <Trophy className="w-5 h-5" />,
      label: 'Leaderboard',
      action: onShowLeaderboard,
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'daily-challenge',
      icon: <Calendar className="w-5 h-5" />,
      label: 'Daily Challenge',
      action: onShowDailyChallenge,
      badge: dailyChallengeAvailable ? 'NEW' : undefined,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'achievements',
      icon: <Star className="w-5 h-5" />,
      label: 'Achievements',
      action: onShowAchievements,
      badge: newAchievements > 0 ? newAchievements.toString() : undefined,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'shop',
      icon: <Gift className="w-5 h-5" />,
      label: 'Shop',
      action: onShowShop,
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      id: 'multiplayer',
      icon: <Users className="w-5 h-5" />,
      label: 'Multiplayer',
      action: onShowMultiplayer,
      disabled: !isMultiplayerAvailable,
      color: isMultiplayerAvailable 
        ? 'bg-orange-500 hover:bg-orange-600' 
        : 'bg-gray-500 cursor-not-allowed'
    }
  ]

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Main floating action button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <button
          onClick={handleToggleExpanded}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
          aria-label="Quick actions menu"
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Quick access menu */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Quick access items */}
            <motion.div
              className="fixed bottom-24 right-6 z-40 flex flex-col gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {quickAccessItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => {
                      if (!item.disabled) {
                        item.action()
                        setIsExpanded(false)
                      }
                    }}
                    disabled={item.disabled}
                    className={`relative group flex items-center gap-3 px-4 py-3 ${item.color} text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none min-w-[160px]`}
                    aria-label={item.label}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>

                    {/* Label */}
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <motion.div
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {item.badge}
                      </motion.div>
                    )}

                    {/* Disabled overlay */}
                    {item.disabled && (
                      <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                        <span className="text-xs font-medium">Soon</span>
                      </div>
                    )}
                  </button>
                </motion.div>
              ))}

              {/* Sound toggle and settings separator */}
              <div className="w-full h-px bg-white/20 my-2" />

              {/* Sound toggle */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: quickAccessItems.length * 0.05 }}
              >
                <button
                  onClick={() => {
                    onToggleSound()
                    setIsExpanded(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 min-w-[160px]"
                  aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
                >
                  <div className="flex-shrink-0">
                    {soundEnabled ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium text-sm">
                    {soundEnabled ? 'Sound On' : 'Sound Off'}
                  </span>
                </button>
              </motion.div>

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: (quickAccessItems.length + 1) * 0.05 }}
              >
                <button
                  onClick={() => {
                    onShowSettings()
                    setIsExpanded(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 min-w-[160px]"
                  aria-label="Settings"
                >
                  <div className="flex-shrink-0">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm">Settings</span>
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 