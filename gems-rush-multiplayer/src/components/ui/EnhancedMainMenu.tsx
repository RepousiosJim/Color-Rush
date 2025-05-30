'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Calendar, Clock, Target, Settings, Info, Medal, Users, Zap } from 'lucide-react'

interface EnhancedMainMenuProps {
  onModeSelect: (mode: string) => void
  onShowSettings: () => void
  onShowGuide: () => void
  onShowCredits: () => void
  onShowStats: () => void
  onShowDashboard?: () => void
  currentStage: number
  userLevel?: number
  userXP?: number
  userCoins?: number
  userGems?: number
  dailyChallengeCompleted?: boolean
  streak?: number
}

interface GameMode {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  badge?: string
  badgeColor?: string
  locked?: boolean
  progress?: number
  reward?: number
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
}

const gameModesData: GameMode[] = [
  {
    id: 'normal',
    icon: <Target className="w-8 h-8" />,
    title: 'Classic Mode',
    subtitle: 'Timeless match-3 fun',
    badge: 'PLAY',
    badgeColor: 'bg-green-500',
    description: 'Master the art of gem matching in our classic endless mode',
    difficulty: 'Easy'
  },
  {
    id: 'timeAttack',
    icon: <Clock className="w-8 h-8" />,
    title: 'Time Rush',
    subtitle: 'Beat the clock',
    badge: 'FAST',
    badgeColor: 'bg-orange-500',
    description: 'Race against time to achieve the highest score possible',
    difficulty: 'Medium'
  },
  {
    id: 'dailyChallenge',
    icon: <Calendar className="w-8 h-8" />,
    title: 'Daily Quest',
    subtitle: 'Fresh challenges',
    badge: 'NEW',
    badgeColor: 'bg-purple-500',
    description: 'Complete unique challenges that refresh every 24 hours',
    difficulty: 'Hard',
    reward: 100
  },
  {
    id: 'campaign',
    icon: <Medal className="w-8 h-8" />,
    title: 'Divine Conquest',
    subtitle: 'Epic adventure',
    badge: 'EPIC',
    badgeColor: 'bg-yellow-500',
    description: 'Embark on an epic journey through mystical realms',
    difficulty: 'Expert',
    locked: true
  },
  {
    id: 'multiplayer',
    icon: <Users className="w-8 h-8" />,
    title: 'Multiplayer',
    subtitle: 'Challenge friends',
    badge: 'BETA',
    badgeColor: 'bg-blue-500',
    description: 'Compete with players from around the world',
    difficulty: 'Medium',
    locked: true
  }
]

const floatingGems = [
  { emoji: '🔥', color: '#FF4500', size: 'text-2xl', delay: 0 },
  { emoji: '💧', color: '#1E90FF', size: 'text-xl', delay: 0.5 },
  { emoji: '🌍', color: '#8B4513', size: 'text-3xl', delay: 1 },
  { emoji: '💨', color: '#87CEEB', size: 'text-lg', delay: 1.5 },
  { emoji: '⚡', color: '#FFD700', size: 'text-2xl', delay: 2 },
  { emoji: '🌿', color: '#32CD32', size: 'text-xl', delay: 2.5 },
  { emoji: '🔮', color: '#9932CC', size: 'text-3xl', delay: 3 }
]

export default function EnhancedMainMenu({
  onModeSelect,
  onShowSettings,
  onShowGuide,
  onShowCredits,
  onShowStats,
  onShowDashboard,
  currentStage,
  userLevel = 1,
  userXP = 0,
  userCoins = 100,
  userGems = 10,
  dailyChallengeCompleted = false,
  streak = 0
}: EnhancedMainMenuProps) {
  const [selectedModeIndex, setSelectedModeIndex] = useState(0)
  const [animatingSelection, setAnimatingSelection] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [firstTimeUser, setFirstTimeUser] = useState(false)

  const selectedMode = gameModesData[selectedModeIndex]

  // Check if this is a first-time user
  useEffect(() => {
    const hasPlayed = localStorage.getItem('gems-rush-has-played')
    if (!hasPlayed) {
      setFirstTimeUser(true)
    }
  }, [])

  const handleModeSelect = (mode: string) => {
    // Mark user as having played
    localStorage.setItem('gems-rush-has-played', 'true')
    setFirstTimeUser(false)
    
    // Check if mode is locked
    const selectedModeData = gameModesData.find(m => m.id === mode)
    if (selectedModeData?.locked) {
      // Show unlock requirement modal
      return
    }

    setAnimatingSelection(true)
    setTimeout(() => {
      onModeSelect(mode)
      setAnimatingSelection(false)
    }, 1200)
  }

  const navigateMode = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSelectedModeIndex(prev => prev === 0 ? gameModesData.length - 1 : prev - 1)
    } else {
      setSelectedModeIndex(prev => prev === gameModesData.length - 1 ? 0 : prev + 1)
    }
  }

  const handleQuickPlay = () => {
    handleModeSelect('normal')
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating orbs */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/20 rounded-full blur-xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating gems with enhanced animations */}
        {floatingGems.map((gem, index) => (
          <motion.div
            key={index}
            className={`absolute ${gem.size} filter drop-shadow-lg`}
            style={{ 
              color: gem.color,
              left: `${5 + Math.random() * 85}%`,
              top: `${5 + Math.random() * 85}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              rotate: [0, 360],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: gem.delay,
              ease: "easeInOut"
            }}
          >
            {gem.emoji}
          </motion.div>
        ))}
      </div>

      {/* First-time user overlay */}
      <AnimatePresence>
        {firstTimeUser && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/20 backdrop-blur-md rounded-3xl p-8 mx-4 max-w-md text-center border border-white/30"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to Gems Rush!</h2>
              <p className="text-white/80 mb-6">
                Match colorful gems, create amazing combos, and embark on an epic adventure!
              </p>
              <button
                onClick={handleQuickPlay}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
              >
                Start Playing! 🚀
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with user profile */}
      <motion.div
        className="relative z-10 p-8 flex justify-between items-start"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* User Profile Section */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onShowDashboard?.()}
            className="relative flex items-center gap-5 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/25 hover:bg-white/25 transition-all duration-200 group shadow-lg"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-200 shadow-md">
              👑
            </div>
            <div className="text-left space-y-1">
              <div className="text-white font-bold text-xl">Level {userLevel}</div>
              <div className="text-white/70 text-base">Gem Master</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/60 ml-2">
              <div className="text-sm">View Profile</div>
            </div>
          </button>

          {/* User stats quick view */}
          <div className="flex gap-4">
            <div className="bg-white/15 backdrop-blur-md rounded-xl px-5 py-4 border border-white/25 flex items-center gap-3 hover:bg-white/20 transition-colors duration-200 shadow-md min-w-[120px] justify-center">
              <span className="text-yellow-400 text-xl">💰</span>
              <span className="text-white font-semibold text-xl">{userCoins}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl px-5 py-4 border border-white/25 flex items-center gap-3 hover:bg-white/20 transition-colors duration-200 shadow-md min-w-[120px] justify-center">
              <span className="text-purple-400 text-xl">💎</span>
              <span className="text-white font-semibold text-xl">{userGems}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-4">
          <button
            onClick={onShowSettings}
            className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all duration-200 shadow-md"
            aria-label="Settings"
          >
            <Settings className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={onShowGuide}
            className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-xl border border-white/25 flex items-center justify-center hover:bg-white/25 transition-all duration-200 shadow-md"
            aria-label="Help"
          >
            <Info className="w-7 h-7 text-white" />
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-8">
        {/* Enhanced Game logo */}
        <motion.div
          className="text-center mb-24 lg:mb-28 w-full flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.h1 
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent leading-none tracking-tight text-center w-full"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            GEMS RUSH
          </motion.h1>
          
          <motion.div
            className="flex items-center justify-center gap-8 mt-10 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-28 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            <div className="flex items-center justify-center">
              <span className="text-5xl leading-none">⚡</span>
            </div>
            <div className="w-28 h-2.5 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
          </motion.div>
          
          <div className="mt-12 w-full flex flex-col items-center justify-center text-center">
            <p className="text-white/90 text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide leading-tight text-center">
              Divine Match-3 Adventure
            </p>
            <p className="text-white/60 text-lg md:text-xl mt-8 max-w-2xl mx-auto leading-relaxed text-center px-4">
              Master elemental gems, unlock divine powers, and conquer mystical realms
            </p>
          </div>
        </motion.div>

        {/* Enhanced Game mode selector */}
        <motion.div
          className="w-full max-w-5xl flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {/* Mode navigation */}
          <div className="flex items-center justify-center gap-16 w-full mb-16">
            <motion.button
              onClick={() => navigateMode('left')}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-xl"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous mode"
            >
              <span className="text-3xl lg:text-4xl leading-none flex items-center justify-center">◀</span>
            </motion.button>

            {/* Enhanced Selected mode card */}
            <motion.div
              key={selectedModeIndex}
              className="flex-1 max-w-3xl"
              initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className={`relative bg-white/15 backdrop-blur-md rounded-3xl p-12 lg:p-16 border border-white/25 shadow-2xl ${selectedMode.locked ? 'opacity-60' : ''} hover:bg-white/20 transition-all duration-300`}>
                {selectedMode.locked && (
                  <motion.div 
                    className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center flex flex-col items-center justify-center">
                      <motion.div 
                        className="text-8xl leading-none mb-8 flex items-center justify-center"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🔒
                      </motion.div>
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="text-white font-semibold text-2xl mb-4 text-center">Reach Level {userLevel + 5}</div>
                        <div className="text-white/60 text-lg text-center">Continue playing to unlock!</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-center flex flex-col items-center justify-center w-full">
                  <motion.div 
                    className="flex justify-center text-white w-full mb-10"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-24 h-24 flex items-center justify-center bg-white/10 rounded-2xl">
                      <div className="scale-150 flex items-center justify-center">
                        {selectedMode.icon}
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="text-center w-full flex flex-col items-center justify-center mb-10">
                    <h3 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-center mb-6">
                      {selectedMode.title}
                    </h3>
                    <p className="text-white/80 text-xl lg:text-2xl font-medium tracking-wide text-center">
                      {selectedMode.subtitle}
                    </p>
                  </div>
                  
                  {selectedMode.badge && (
                    <motion.div 
                      className="flex justify-center w-full mb-10"
                      whileHover={{ scale: 1.05 }}
                      animate={{ 
                        boxShadow: ['0 0 0 0 rgba(147, 51, 234, 0.3)', '0 0 0 10px rgba(147, 51, 234, 0)', '0 0 0 0 rgba(147, 51, 234, 0.3)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className={`inline-block px-8 py-4 rounded-full text-white text-lg font-bold ${selectedMode.badgeColor} shadow-lg`}>
                        {selectedMode.badge}
                      </div>
                    </motion.div>
                  )}

                  <div className="max-w-2xl w-full flex justify-center mb-10">
                    <p className="text-white/70 text-lg lg:text-xl leading-relaxed text-center">
                      {selectedMode.description}
                    </p>
                  </div>

                  <div className="w-full max-w-xl flex flex-col items-center justify-center gap-6">
                    <div className="flex justify-between items-center text-lg lg:text-xl bg-white/8 rounded-2xl px-8 py-6 border border-white/10 w-full">
                      <span className="text-white/70 font-medium">Difficulty:</span>
                      <span className={`font-bold px-6 py-3 rounded-full text-base ${
                        selectedMode.difficulty === 'Easy' ? 'text-green-400 bg-green-400/20' :
                        selectedMode.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/20' :
                        selectedMode.difficulty === 'Hard' ? 'text-orange-400 bg-orange-400/20' : 'text-red-400 bg-red-400/20'
                      }`}>
                        {selectedMode.difficulty}
                      </span>
                    </div>

                    {selectedMode.reward && (
                      <div className="flex justify-between items-center text-lg lg:text-xl bg-white/8 rounded-2xl px-8 py-6 border border-white/10 w-full">
                        <span className="text-white/70 font-medium">Reward:</span>
                        <span className="text-yellow-400 font-bold bg-yellow-400/20 px-6 py-3 rounded-full flex items-center gap-3">
                          +{selectedMode.reward} <span className="text-xl leading-none">💰</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              onClick={() => navigateMode('right')}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next mode"
            >
              <span className="text-3xl lg:text-4xl leading-none flex items-center justify-center">▶</span>
            </motion.button>
          </div>

          {/* Play button */}
          <div className="flex justify-center w-full">
            <motion.button
              onClick={() => handleModeSelect(selectedMode.id)}
              disabled={animatingSelection || selectedMode.locked}
              className={`w-full max-w-2xl py-8 rounded-2xl font-bold text-2xl lg:text-3xl transition-all duration-200 transform shadow-xl flex items-center justify-center ${
                selectedMode.locked 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95'
              }`}
              whileHover={!selectedMode.locked ? { scale: 1.02 } : {}}
              whileTap={!selectedMode.locked ? { scale: 0.98 } : {}}
            >
              {animatingSelection ? (
                <div className="flex items-center justify-center gap-5">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : selectedMode.locked ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl leading-none">🔒</span>
                  <span>Locked</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span>Play {selectedMode.title}!</span>
                  <span className="text-3xl leading-none">🎮</span>
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Daily challenge notification */}
        {!dailyChallengeCompleted && (
          <motion.div
            className="mt-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 max-w-3xl w-full shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center gap-8 w-full">
              <div className="w-18 h-18 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-9 h-9 text-white" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-white font-semibold text-xl text-left">Daily Challenge Available!</h4>
                <p className="text-white/70 text-lg text-left">Complete today's challenge for bonus rewards</p>
              </div>
              <button
                onClick={() => handleModeSelect('dailyChallenge')}
                className="px-8 py-5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-medium shadow-md flex items-center gap-3"
              >
                <span>Play</span>
                <span className="text-xl leading-none">🎯</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Streak indicator */}
        {streak > 0 && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-5 bg-orange-500/20 backdrop-blur-md rounded-xl px-8 py-5 border border-orange-500/30 shadow-lg max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4 }}
          >
            <Zap className="w-8 h-8 text-orange-400" />
            <span className="text-white font-semibold text-xl flex items-center gap-3">
              {streak} Day Streak! <span className="text-2xl leading-none">🔥</span>
            </span>
          </motion.div>
        )}
      </div>

      {/* Bottom navigation */}
      <motion.div
        className="relative z-10 p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="flex justify-center gap-8">
          <button
            onClick={onShowStats}
            className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-xl px-8 py-5 border border-white/25 hover:bg-white/25 transition-all duration-200 shadow-lg"
          >
            <Trophy className="w-7 h-7 text-yellow-400" />
            <span className="text-white font-medium text-xl">Leaderboard</span>
          </button>
          
          <button
            onClick={onShowCredits}
            className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-xl px-8 py-5 border border-white/25 hover:bg-white/25 transition-all duration-200 shadow-lg"
          >
            <Star className="w-7 h-7 text-purple-400" />
            <span className="text-white font-medium text-xl">About</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
} 