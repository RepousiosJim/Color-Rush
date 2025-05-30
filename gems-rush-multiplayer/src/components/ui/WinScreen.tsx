'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameState } from '@/types/game'
import { SUCCESS_MESSAGES } from '@/lib/game/constants'

interface WinScreenProps {
  isOpen: boolean
  gameState: GameState
  onNextLevel: () => void
  onMainMenu: () => void
  onRestart?: () => void
  showRewards?: boolean
  rewards?: {
    coins: number
    gems: number
    xp: number
    stars: number
  }
}

interface ScoreBreakdown {
  baseScore: number
  comboBonus: number
  timeBonus: number
  perfectionBonus: number
  total: number
}

export default function WinScreen({
  isOpen,
  gameState,
  onNextLevel,
  onMainMenu,
  onRestart,
  showRewards = true,
  rewards = { coins: 100, gems: 5, xp: 50, stars: 3 }
}: WinScreenProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'celebrating' | 'rewards' | 'options'>('celebrating')
  const [displayedScore, setDisplayedScore] = useState(0)
  const [displayedCoins, setDisplayedCoins] = useState(0)
  const [displayedGems, setDisplayedGems] = useState(0)
  const [displayedXP, setDisplayedXP] = useState(0)

  // Calculate score breakdown
  const calculateScoreBreakdown = (): ScoreBreakdown => {
    const baseScore = Math.floor(gameState.score * 0.7)
    const comboBonus = Math.floor(gameState.score * 0.2)
    const timeBonus = gameState.gameMode === 'timeAttack' ? Math.floor(gameState.score * 0.1) : 0
    const perfectionBonus = gameState.moves <= 10 ? Math.floor(gameState.score * 0.15) : 0
    
    return {
      baseScore,
      comboBonus,
      timeBonus,
      perfectionBonus,
      total: gameState.score
    }
  }

  const scoreBreakdown = calculateScoreBreakdown()

  // Calculate star rating based on performance
  const calculateStars = (): number => {
    const scoreRatio = gameState.score / gameState.targetScore
    if (scoreRatio >= 2.5) return 3
    if (scoreRatio >= 1.8) return 2
    return 1
  }

  const earnedStars = calculateStars()

  // Animated number counter
  useEffect(() => {
    if (!isOpen) {
      setDisplayedScore(0)
      setDisplayedCoins(0)
      setDisplayedGems(0)
      setDisplayedXP(0)
      setAnimationPhase('celebrating')
      return
    }

    // Only run this effect when the modal first opens
    console.log('WinScreen opened, starting animation phases...')

    // Much shorter delays to avoid issues
    const celebrationTimer = setTimeout(() => {
      console.log('Animation phase: rewards')
      setAnimationPhase('rewards')
    }, 1000) // Reduced to 1 second

    // Show options immediately after rewards
    const optionsTimer = setTimeout(() => {
      console.log('Animation phase: options (buttons should show)')
      setAnimationPhase('options')
    }, 1500) // Show buttons after 1.5 seconds

    // Emergency fallback - force buttons to show
    const emergencyTimer = setTimeout(() => {
      console.log('Emergency: forcing options phase')
      setAnimationPhase('options')
    }, 2000) // Emergency after 2 seconds

    return () => {
      clearTimeout(celebrationTimer)
      clearTimeout(optionsTimer)
      clearTimeout(emergencyTimer)
    }
  }, [isOpen]) // Only depend on isOpen to prevent resets

  // Separate effect for score animation that doesn't interfere with phase timing
  useEffect(() => {
    if (!isOpen) return
    
    // Score animation
    const scoreTimer = setTimeout(() => {
      const duration = 1500
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setDisplayedScore(Math.floor(gameState.score * easeOut))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }, 1000)

    return () => clearTimeout(scoreTimer)
  }, [isOpen, gameState.score])

  // Separate effect for rewards animation
  useEffect(() => {
    if (!isOpen || !showRewards) return
    
    const rewardsTimer = setTimeout(() => {
      const duration = 1000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        
        setDisplayedCoins(Math.floor(rewards.coins * easeOut))
        setDisplayedGems(Math.floor(rewards.gems * easeOut))
        setDisplayedXP(Math.floor(rewards.xp * easeOut))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }, 1500)

    return () => clearTimeout(rewardsTimer)
  }, [isOpen, showRewards, rewards.coins, rewards.gems, rewards.xp])

  console.log('WinScreen render - isOpen:', isOpen, 'animationPhase:', animationPhase)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl overflow-hidden"
          initial={{ scale: 0.5, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6 
          }}
        >
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Gems */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              >
                {['💎', '🔥', '💧', '🌍', '⚡', '🌿'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}

            {/* Sparkling Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Celebration Phase */}
            <AnimatePresence mode="wait">
              {animationPhase === 'celebrating' && (
                <motion.div
                  key="celebration"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="text-8xl"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🏆
                  </motion.div>
                  
                  <motion.h1
                    className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    LEVEL COMPLETE!
                  </motion.h1>
                  
                  <motion.div
                    className="text-2xl text-white/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    🎉 Congratulations! 🎉
                  </motion.div>
                </motion.div>
              )}

              {/* Rewards Phase */}
              {(animationPhase === 'rewards' || animationPhase === 'options') && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Level Header */}
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      LEVEL {gameState.level} COMPLETE!
                    </h1>
                    
                    {/* Star Rating */}
                    <div className="flex justify-center items-center space-x-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`text-4xl ${i < earnedStars ? 'text-yellow-400' : 'text-gray-600'}`}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: 2.5 + (i * 0.2),
                            type: "spring",
                            stiffness: 300
                          }}
                        >
                          ⭐
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Score Display */}
                  <motion.div
                    className="bg-black/30 rounded-2xl p-6 backdrop-blur-sm border border-white/10"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 3 }}
                  >
                    <div className="space-y-4">
                      <div className="text-lg text-purple-300">Final Score</div>
                      <motion.div 
                        className="text-5xl font-bold text-white"
                        animate={{ scale: displayedScore > 0 ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {displayedScore.toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-gray-400">
                        Target: {gameState.targetScore.toLocaleString()} 
                        <span className="text-green-400 ml-2">
                          (+{Math.round(((gameState.score / gameState.targetScore) - 1) * 100)}%)
                        </span>
                      </div>
                      
                      {/* Score Breakdown Toggle */}
                      <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
                      >
                        {showBreakdown ? 'Hide' : 'Show'} Score Breakdown
                      </button>
                      
                      <AnimatePresence>
                        {showBreakdown && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-2 pt-4 border-t border-white/10"
                          >
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Base Score:</span>
                              <span className="text-white">{scoreBreakdown.baseScore.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Combo Bonus:</span>
                              <span className="text-yellow-400">{scoreBreakdown.comboBonus.toLocaleString()}</span>
                            </div>
                            {scoreBreakdown.timeBonus > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Time Bonus:</span>
                                <span className="text-green-400">{scoreBreakdown.timeBonus.toLocaleString()}</span>
                              </div>
                            )}
                            {scoreBreakdown.perfectionBonus > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Perfection Bonus:</span>
                                <span className="text-purple-400">{scoreBreakdown.perfectionBonus.toLocaleString()}</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Rewards Display */}
                  {showRewards && (
                    <motion.div
                      className="grid grid-cols-3 gap-4"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 4 }}
                    >
                      <motion.div 
                        className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl mb-2">🪙</div>
                        <div className="text-sm text-yellow-300">Coins</div>
                        <div className="text-xl font-bold text-white">+{displayedCoins}</div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl mb-2">💎</div>
                        <div className="text-sm text-purple-300">Gems</div>
                        <div className="text-xl font-bold text-white">+{displayedGems}</div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="text-sm text-blue-300">XP</div>
                        <div className="text-xl font-bold text-white">+{displayedXP}</div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <AnimatePresence>
                    {animationPhase === 'options' && (
                      <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col sm:flex-row gap-4 pt-6"
                      >
                        <motion.button
                          onClick={onMainMenu}
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xl">🏠</span>
                          <span>Main Menu</span>
                        </motion.button>

                        {onRestart && (
                          <motion.button
                            onClick={onRestart}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-xl">🔄</span>
                            <span>Replay</span>
                          </motion.button>
                        )}

                        <motion.button
                          onClick={onNextLevel}
                          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xl">➡️</span>
                          <span>Next Level</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 -z-10 blur-xl"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 