'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Zap, Target, Flame, AlertTriangle } from 'lucide-react'
import { GameState, Gem } from '@/types/game'
import { GameEngine, PowerUpGem } from '@/lib/game/GameEngine'
import GameBoard from './GameBoard'

interface TimeRushModeProps {
  gameEngine: GameEngine
  onGameEnd: (finalScore: number, stats: TimeRushStats) => void
  onPause: () => void
  onShowMenu: () => void
}

interface TimeRushStats {
  finalScore: number
  totalMatches: number
  powerUpsActivated: number
  maxCombo: number
  rushBonus: number
  timeUsed: number
}

interface PowerUpIndicator {
  id: string
  type: string
  row: number
  col: number
  charge: number
  maxCharge: number
  isReady: boolean
}

export default function TimeRushMode({ gameEngine, onGameEnd, onPause, onShowMenu }: TimeRushModeProps) {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(60) // 60 seconds
  const [isActive, setIsActive] = useState(false)
  const [rushMultiplier, setRushMultiplier] = useState(1.0)
  const [powerUps, setPowerUps] = useState<PowerUpIndicator[]>([])
  const [adrenalineMode, setAdrenalineMode] = useState(false)
  const [warningMode, setWarningMode] = useState(false)
  const [finalStats, setFinalStats] = useState<TimeRushStats | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const [totalMatches, setTotalMatches] = useState(0)
  const [powerUpsActivated, setPowerUpsActivated] = useState(0)
  const [maxCombo, setMaxCombo] = useState(1)
  const [startTime] = useState(Date.now())

  // Helper function to check if a gem is a power-up
  const isPowerUpGem = useCallback((gem: Gem | null): boolean => {
    if (!gem) return false
    return 'isPowerUp' in gem && gem.isPowerUp === true
  }, [])

  // Enhanced scoring system for Time Rush
  const calculateTimeRushScore = useCallback((matchSize: number, comboLevel: number): number => {
    let baseScore: number
    
    switch (matchSize) {
      case 3:
        baseScore = 100 // Increased from 50
        break
      case 4:
        baseScore = 300 // Increased from 150 - Lightning power-up
        break
      case 5:
        baseScore = 600 // Increased from 300 - Rainbow power-up  
        break
      case 6:
        baseScore = 1000 // Increased from 500 - Bomb power-up
        break
      default:
        baseScore = 1500 + (matchSize - 6) * 250 // Meteor power-up
        break
    }

    // Time Rush multipliers
    const comboMultiplier = Math.min(comboLevel * 0.5 + 1, 5.0)
    const rushMultiplier = timeRemaining <= 15 ? 2.0 : timeRemaining <= 30 ? 1.5 : 1.0
    
    return Math.floor(baseScore * comboMultiplier * rushMultiplier)
  }, [timeRemaining])

  // Start the timer
  const startTimer = useCallback(() => {
    if (timerRef.current) return
    
    setIsActive(true)
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        // Adrenaline mode at 15 seconds
        if (newTime === 15) {
          setAdrenalineMode(true)
        }
        
        // Warning mode at 10 seconds
        if (newTime === 10) {
          setWarningMode(true)
        }
        
        // Game over
        if (newTime <= 0) {
          endGame()
          return 0
        }
        
        return newTime
      })
    }, 1000)
  }, [])

  // End the game
  const endGame = useCallback(() => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      setIsActive(false)
      
      const finalScore = gameState?.score || 0
      const rushBonus = Math.floor(finalScore * 0.1) // 10% rush bonus
      
      const stats: TimeRushStats = {
        finalScore,
        totalMatches: totalMatches || 0,
        powerUpsActivated: powerUpsActivated || 0,
        maxCombo: maxCombo || 1,
        rushBonus,
        timeUsed: Math.max(0, 60 - timeRemaining)
      }
      
      setFinalStats(stats)
      setTimeout(() => {
        try {
          onGameEnd(finalScore, stats)
        } catch (error) {
          console.error('Error calling onGameEnd:', error)
        }
      }, 2000)
    } catch (error) {
      console.error('Error ending game:', error)
      // Fallback: still try to call onGameEnd with safe values
      const safeStats: TimeRushStats = {
        finalScore: 0,
        totalMatches: 0,
        powerUpsActivated: 0,
        maxCombo: 1,
        rushBonus: 0,
        timeUsed: 60
      }
      onGameEnd(0, safeStats)
    }
  }, [gameState, totalMatches, powerUpsActivated, maxCombo, timeRemaining, onGameEnd])

  // Initialize game when component mounts
  useEffect(() => {
    if (gameEngine) {
      // Get initial game state from the already-initialized engine
      const initialState = gameEngine.getGameState()
      setGameState(initialState)
      startTimer()
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameEngine, startTimer])

  // Set up GameEngine event listeners
  useEffect(() => {
    if (!gameEngine) return

    const handleStateChange = (newState: GameState) => {
      try {
        setGameState(newState)
        
        // Track max combo with null check
        if (newState?.comboMultiplier && newState.comboMultiplier > maxCombo) {
          setMaxCombo(newState.comboMultiplier)
        }
      } catch (error) {
        console.error('Error handling state change:', error)
      }
    }

    const handleMatchFound = (matches: any[]) => {
      try {
        if (Array.isArray(matches)) {
          setTotalMatches(prev => prev + matches.length)
          
          // Check for power-ups created from large matches
          matches.forEach(match => {
            if (match?.length >= 4) {
              const powerUpType = match.length === 4 ? 'lightning' : 
                                match.length === 5 ? 'rainbow' : 'bomb'
              
              // Add power-up to tracking with error handling
              setPowerUps(prev => [...prev, {
                id: `${Date.now()}-${Math.random()}`,
                type: powerUpType,
                row: match[0]?.row || 0,
                col: match[0]?.col || 0,
                charge: 100,
                maxCharge: 100,
                isReady: true
              }])
            }
          })
        }
      } catch (error) {
        console.error('Error handling matches found:', error)
      }
    }

    const handlePowerUpActivated = () => {
      try {
        setPowerUpsActivated(prev => prev + 1)
      } catch (error) {
        console.error('Error handling power-up activation:', error)
      }
    }

    // Set up event listeners with error handling
    try {
      gameEngine.on('game:board-changed', handleStateChange)
      gameEngine.on('game:match-found', handleMatchFound)
      gameEngine.on('game:powerup-activated', handlePowerUpActivated)
    } catch (error) {
      console.error('Error setting up event listeners:', error)
    }

    return () => {
      try {
        gameEngine.off('game:board-changed', handleStateChange)
        gameEngine.off('game:match-found', handleMatchFound)
        gameEngine.off('game:powerup-activated', handlePowerUpActivated)
      } catch (error) {
        console.error('Error removing event listeners:', error)
      }
    }
  }, [gameEngine, maxCombo])

  // Handle gem moves
  const handleMove = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    if (!gameEngine || !gameState || !isActive) return
    
    gameEngine.makeMove(fromRow, fromCol, toRow, toCol).then((result) => {
      if (result.valid) {
        // Update local state with new board and score
        setGameState(prevState => {
          if (!prevState) return null
          
          const newScore = prevState.score + result.scoreChange
          
          return {
            ...prevState,
            board: result.newBoard,
            score: newScore,
            moves: prevState.moves + 1,
            matchesFound: result.matchesFound,
            comboMultiplier: result.comboCount > 0 ? result.comboCount : 1,
            lastMoveScore: result.scoreChange
          }
        })
      }
    })
  }, [gameEngine, gameState, isActive])

  // Handle power-up click
  const handlePowerUpClick = useCallback((row: number, col: number) => {
    if (!gameState || !isActive) return
    
    const gem = gameState.board[row]?.[col]
    if (!gem || !('isPowerUp' in gem) || !gem.isPowerUp) return
    
    // Activate power-up through game engine
    gameEngine.makeMove(row, col, row, col) // Self-click to activate
    
    // Remove from power-up tracking
    setPowerUps(prev => prev.filter(p => !(p.row === row && p.col === col)))
  }, [gameState, isActive, gameEngine])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
        <div className="text-white text-2xl">Initializing Time Rush...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced Dynamic Background */}
      <motion.div
        ref={backgroundRef}
        className={`absolute inset-0 transition-all duration-1000 ${
          adrenalineMode
            ? 'bg-gradient-to-br from-red-900 via-orange-800 to-yellow-700'
            : warningMode
            ? 'bg-gradient-to-br from-red-800 via-orange-700 to-red-600'
            : 'bg-gradient-to-br from-orange-900 via-red-900 to-purple-900'
        }`}
        animate={{
          scale: adrenalineMode ? [1, 1.02, 1] : [1, 1.01, 1],
        }}
        transition={{
          duration: adrenalineMode ? 0.5 : 2,
          repeat: Infinity,
          type: "tween",
          ease: "easeInOut"
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                adrenalineMode ? 'bg-yellow-400' : 'bg-orange-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                type: "tween",
              }}
            />
          ))}
        </div>

        {/* Pulse overlay for adrenaline mode */}
        <AnimatePresence>
          {adrenalineMode && (
            <motion.div
              className="absolute inset-0 bg-red-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, type: "tween" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Header with Timer and Stats */}
      <motion.div
        className="relative z-10 p-4 md:p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          {/* Timer - Large and prominent */}
          <motion.div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-300 ${
              warningMode
                ? 'bg-red-500/20 border-red-400 text-red-100'
                : adrenalineMode
                ? 'bg-orange-500/20 border-orange-400 text-orange-100'
                : 'bg-white/10 border-white/30 text-white'
            }`}
            animate={{
              scale: warningMode ? [1, 1.05, 1] : 1,
              boxShadow: warningMode 
                ? ['0 0 0 0 rgba(239, 68, 68, 0.4)', '0 0 0 8px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0.4)']
                : '0 0 0 0 rgba(239, 68, 68, 0)'
            }}
            transition={{
              scale: { duration: 0.5, repeat: warningMode ? Infinity : 0, type: warningMode ? "tween" : "spring" },
              boxShadow: { duration: 1, repeat: warningMode ? Infinity : 0, type: warningMode ? "tween" : "spring" }
            }}
          >
            <Clock className={`w-8 h-8 ${warningMode ? 'text-red-400' : adrenalineMode ? 'text-orange-400' : 'text-blue-400'}`} />
            <div>
              <div className="text-xs opacity-80">TIME REMAINING</div>
              <div className="text-3xl font-bold font-mono">{formatTime(timeRemaining)}</div>
            </div>
            {adrenalineMode && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, type: "tween" }}
              >
                <Flame className="w-6 h-6 text-red-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Mode Indicator */}
          <motion.div
            className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, type: "tween" }}
          >
            <Zap className="w-5 h-5" />
            <span>TIME RUSH</span>
            {adrenalineMode && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
          </motion.div>

          {/* Menu Button */}
          <button
            onClick={onShowMenu}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
          >
            Menu
          </button>
        </div>

        {/* Enhanced Stats Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-xs text-white/70">SCORE</div>
            <motion.div
              className="text-2xl font-bold text-yellow-400"
              key={gameState?.score || 0}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {(gameState?.score || 0).toLocaleString()}
            </motion.div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">COMBO</div>
            <div className="text-2xl font-bold text-orange-400">
              {(gameState?.comboMultiplier || 1).toFixed(1)}x
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">MATCHES</div>
            <div className="text-2xl font-bold text-green-400">
              {totalMatches || 0}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">POWER-UPS</div>
            <div className="text-2xl font-bold text-purple-400">
              {powerUpsActivated || 0}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/70">RUSH BONUS</div>
            <div className="text-2xl font-bold text-red-400">
              {timeRemaining <= 15 ? '2.0x' : timeRemaining <= 30 ? '1.5x' : '1.0x'}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Game Board */}
      <div className="relative z-10 flex justify-center px-4">
        <motion.div
          className="relative"
          animate={{
            filter: adrenalineMode ? 'brightness(1.2) contrast(1.1)' : 'brightness(1) contrast(1)',
          }}
          transition={{ duration: 0.3 }}
        >
          <GameBoard
            gameState={gameState}
            onMove={handleMove}
            disabled={!isActive}
            onGemClick={handlePowerUpClick}
            timeRushMode={true}
            adrenalineMode={adrenalineMode}
          />

          {/* Power-up Click Indicators */}
          <AnimatePresence>
            {powerUps.map(powerUp => (
              <motion.div
                key={powerUp.id}
                className={`absolute pointer-events-none z-20 w-16 h-16 rounded-full border-4 ${
                  powerUp.type === 'lightning' ? 'border-blue-400 bg-blue-500/30' :
                  powerUp.type === 'rainbow' ? 'border-purple-400 bg-purple-500/30' :
                  'border-red-400 bg-red-500/30'
                }`}
                style={{
                  left: `${powerUp.col * 12.5}%`,
                  top: `${powerUp.row * 12.5}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.1, 1], 
                  opacity: 1,
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.4)',
                    '0 0 0 10px rgba(59, 130, 246, 0)',
                    '0 0 0 0 rgba(59, 130, 246, 0.4)'
                  ]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  scale: { duration: 1, repeat: Infinity, type: "tween" },
                  boxShadow: { duration: 1.5, repeat: Infinity, type: "tween" }
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                  CLICK!
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Time Rush Instructions */}
      <motion.div
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 max-w-md p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 text-white"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-sm space-y-2">
          <div className="font-bold text-orange-400">⚡ TIME RUSH TIPS:</div>
          <div>• 4+ matches create clickable power-ups</div>
          <div>• Click power-ups to activate instantly</div>
          <div>• Rush bonus at 30s & 15s remaining</div>
          <div>• Chain combos for massive scores!</div>
        </div>
      </motion.div>

      {/* Time Rush Mode Instructions */}
      <motion.div
        className="mt-4 text-center text-white/80 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {gameState?.board && Array.isArray(gameState.board) && 
         gameState.board.some(row => Array.isArray(row) && row.some(gem => gem && isPowerUpGem(gem))) && (
          <div className="text-yellow-400 font-semibold">
            ⚡ Click power-ups to activate instantly!
          </div>
        )}
      </motion.div>

      {/* Game Over Screen */}
      <AnimatePresence>
        {finalStats && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-red-900 p-8 rounded-3xl border border-white/20 max-w-md w-full mx-4 text-center"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-3xl font-bold text-white mb-6">Time's Up!</h2>
              
              <div className="space-y-4 text-white">
                <div className="flex justify-between">
                  <span>Final Score:</span>
                  <span className="font-bold text-yellow-400">{(finalStats?.finalScore || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Matches:</span>
                  <span className="font-bold">{finalStats?.totalMatches || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Power-ups Used:</span>
                  <span className="font-bold">{finalStats?.powerUpsActivated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Combo:</span>
                  <span className="font-bold text-orange-400">{(finalStats?.maxCombo || 1).toFixed(1)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Rush Bonus:</span>
                  <span className="font-bold text-red-400">+{(finalStats?.rushBonus || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="text-sm text-white/70">
                  Time Used: {Math.floor((finalStats?.timeUsed || 0) / 60)}:{((finalStats?.timeUsed || 0) % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 