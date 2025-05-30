'use client'

import { useState, useRef, useCallback, useMemo, useEffect, ReactElement } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, GameState } from '@/types/game'
import EnhancedGem from '@/components/ui/EnhancedGem'
import ObstacleBlockComponent from '@/components/ui/ObstacleBlock'
import WinScreen from '@/components/ui/WinScreen'
import { VisualEffectsProvider, useVisualEffects } from '@/components/ui/VisualEffectsManager'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'
import { obstacleBlockManager } from '@/lib/game/ObstacleBlockManager'
import { stageSystem } from '@/lib/game/StageSystem'

// Simple className utility function
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

interface GameInterfaceProps {
  gameState: GameState
  onMove: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void
  onRestart: () => void
  onNextLevel?: () => void
  onPause?: () => void
  onShowMenu?: () => void
  onShowSettings?: () => void
  onShowHint?: () => void
  currentHint?: { from: { row: number; col: number }; to: { row: number; col: number } } | null
  disabled?: boolean
}

// Separate component to avoid provider nesting issues
const GameInterfaceContent = ({ gameState, onMove, onRestart, onNextLevel, onPause, onShowMenu, onShowSettings, onShowHint, currentHint, disabled }: GameInterfaceProps): ReactElement => {
  const [selectedGem, setSelectedGem] = useState<{ row: number; col: number } | null>(null)
  const [adjacentGems, setAdjacentGems] = useState<{ row: number; col: number }[]>([])
  const [combos, setCombos] = useState<number>(0)
  const [showHintMessage, setShowHintMessage] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)
  
  const { addEffect } = useVisualEffects()
  
  // Use user's auto quality preference, defaulting to locked for stability
  const { 
    quality, 
    shouldAnimate, 
    shouldShowEffects, 
    optimizedThrottle,
    optimizedDebounce,
    setManualQuality,
    isQualityLocked
  } = usePerformanceOptimization('locked') // Always lock quality during gameplay

  // Lock quality to 'high' when game starts to prevent fluctuations
  useEffect(() => {
    if (gameState?.gameStatus === 'playing' && !isQualityLocked) {
      setManualQuality('high') // Lock to high quality for stable gameplay experience
    }
  }, [gameState?.gameStatus, isQualityLocked, setManualQuality])

  // Show hint message when hint is displayed
  useEffect(() => {
    if (currentHint) {
      setShowHintMessage(true)
      const timer = setTimeout(() => setShowHintMessage(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [currentHint])

  // Responsive board size with better scaling
  const boardSize = useMemo(() => {
    // Get viewport dimensions
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    
    // Calculate optimal size based on available space and quality
    const maxSize = Math.min(vw * 0.9, vh * 0.6) // Take up to 90% width or 60% height
    
    const sizes = {
      minimal: Math.min(maxSize, 320),
      low: Math.min(maxSize, 380),
      medium: Math.min(maxSize, 450),
      high: Math.min(maxSize, 520),
      ultra: Math.min(maxSize, 600)
    }
    return Math.max(320, sizes[quality] || 450) // Minimum 320px
  }, [quality])

  // Optimized gem size calculation with better spacing
  const gemSize = useMemo(() => {
    const baseSize = Math.floor((boardSize - 32) / 8) // Account for padding and gaps
    return Math.max(32, baseSize) // Minimum 32px per gem
  }, [boardSize])

  // Performance-optimized hint system
  const showHints = useCallback(
    optimizedDebounce(() => {
      if (quality === 'minimal') return
      console.log('💡 Hint system: analyzing board for potential moves...')
    }, 2000),
    [quality]
  )

  // Optimized adjacent positions calculation
  const getAdjacentPositions = useCallback((row: number, col: number) => {
    const positions: { row: number; col: number }[] = []
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        positions.push({ row: newRow, col: newCol })
      }
    }
    
    return positions
  }, [])

  // Enhanced match detection and visual effects
  const handleMatchDetection = useCallback(
    optimizedThrottle((matchedPositions: { row: number; col: number }[]) => {
      if (matchedPositions.length === 0) return

      setCombos(prev => prev + 1)
      
      if (shouldShowEffects) {
        matchedPositions.forEach((pos, index) => {
          if (boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect()
            const x = rect.left + (pos.col * (gemSize + 4)) + gemSize / 2 + 16
            const y = rect.top + (pos.row * (gemSize + 4)) + gemSize / 2 + 16
            
            setTimeout(() => {
              addEffect({
                type: 'glow',
                position: { x, y },
                duration: 1000,
                intensity: 1,
                priority: 'medium'
              })
              
              if (quality === 'ultra') {
                addEffect({
                  type: 'particle',
                  position: { x, y },
                  duration: 800,
                  intensity: 0.8,
                  priority: 'low'
                })
              }
            }, index * 50)
          }
        })

        if (matchedPositions.length >= 4 && boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          
          setTimeout(() => {
            addEffect({
              type: 'combo',
              position: { x: centerX, y: centerY },
              duration: 1500,
              intensity: Math.min(matchedPositions.length / 3, 2),
              priority: 'high'
            })
          }, 200)
        }
      }
    }, 100),
    [shouldShowEffects, addEffect, gemSize, quality]
  )

  // Optimized gem click handler
  const handleGemClick = useCallback((row: number, col: number) => {
    if (disabled || !gameState.board[row]?.[col]) return

    if (!selectedGem) {
      setSelectedGem({ row, col })
      setAdjacentGems(getAdjacentPositions(row, col))
    } else if (selectedGem.row === row && selectedGem.col === col) {
      setSelectedGem(null)
      setAdjacentGems([])
    } else {
      const isAdjacent = adjacentGems.some(gem => gem.row === row && gem.col === col)
      
      if (isAdjacent) {
        onMove(selectedGem.row, selectedGem.col, row, col)
        const matchedGems = [selectedGem, { row, col }]
        handleMatchDetection(matchedGems)
      }
      
      setSelectedGem(null)
      setAdjacentGems([])
    }
  }, [selectedGem, adjacentGems, disabled, gameState.board, onMove, getAdjacentPositions, handleMatchDetection])

  // Enhanced gem rendering with hint highlighting
  const renderGemWithEffects = useCallback((gem: Gem | null, row: number, col: number) => {
    const isSelected = selectedGem?.row === row && selectedGem?.col === col
    const isAdjacent = adjacentGems.some(g => g.row === row && g.col === col)
    const isHintFrom = currentHint?.from.row === row && currentHint?.from.col === col
    const isHintTo = currentHint?.to.row === row && currentHint?.to.col === col
    const isHinted = isHintFrom || isHintTo
    
    return (
      <div 
        key={`${row}-${col}-${gem?.id || 'empty'}`}
        className="relative"
        style={{ width: gemSize, height: gemSize }}
      >
        <EnhancedGem
          gem={gem}
          row={row}
          col={col}
          isSelected={isSelected}
          isAdjacent={isAdjacent}
          isHinted={isHinted}
          onClick={() => handleGemClick(row, col)}
          disabled={disabled}
          size={gemSize < 40 ? 'sm' : gemSize < 60 ? 'md' : 'lg'}
        />
        
        {/* Enhanced hint indicators */}
        {isHintFrom && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            1
          </motion.div>
        )}
        
        {isHintTo && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -360 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            2
          </motion.div>
        )}
        
        {/* Animated hint arrow */}
        {isHintFrom && currentHint && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="text-2xl"
              animate={{ 
                x: [0, (currentHint.to.col - currentHint.from.col) * 20, 0],
                y: [0, (currentHint.to.row - currentHint.from.row) * 20, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ➡️
            </motion.div>
          </motion.div>
        )}
      </div>
    )
  }, [selectedGem, adjacentGems, currentHint, disabled, handleGemClick, gemSize])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-xl"
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Enhanced Game Header */}
      <motion.div 
        className="flex items-center justify-between p-4 lg:p-6 text-white relative z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left side - Menu & Settings */}
        <div className="flex items-center gap-2 lg:gap-3">
          {onShowMenu && (
            <motion.button
              onClick={onShowMenu}
              className="p-2 lg:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
              whileHover={shouldAnimate ? { scale: 1.05, y: -2 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-lg lg:text-xl">🏠</span>
            </motion.button>
          )}
          
          {onShowSettings && (
            <motion.button
              onClick={onShowSettings}
              className="p-2 lg:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
              whileHover={shouldAnimate ? { scale: 1.05, y: -2 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-lg lg:text-xl">⚙️</span>
            </motion.button>
          )}
        </div>

        {/* Center - Game Title */}
        <div className="text-center">
          <motion.h1 
            className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            Gems Rush: Divine Teams
          </motion.h1>
          <div className="text-xs lg:text-sm text-purple-300 mt-1">
            Level {gameState.level} - Divine Realm
          </div>
        </div>

        {/* Right side - Game Status */}
        <div className="flex items-center gap-2 lg:gap-3">
          {onPause && (
            <motion.button
              onClick={onPause}
              className="p-2 lg:p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
              whileHover={shouldAnimate ? { scale: 1.05, y: -2 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-lg lg:text-xl">
                {gameState.gameStatus === 'paused' ? '▶️' : '⏸️'}
              </span>
            </motion.button>
          )}
          
          <div className="text-center">
            <div className="text-xs opacity-80">Status</div>
            <div className="text-sm font-semibold capitalize">
              {gameState.gameStatus}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Hint Message */}
      <AnimatePresence>
        {showHintMessage && currentHint && (
          <motion.div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-xl border border-blue-400/30 backdrop-blur-sm"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">💡</span>
              <span>Swap the highlighted gems!</span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Game Stats Panel */}
      <motion.div 
        className="mx-4 lg:mx-6 mb-4 lg:mb-6 p-4 lg:p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={`grid gap-4 lg:gap-6 text-white text-center ${
          gameState.gameMode === 'stage' ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'
        }`}>
          <motion.div 
            className="space-y-1"
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
          >
            <div className="text-xs lg:text-sm opacity-80">Score</div>
            <div className="text-xl lg:text-3xl font-bold text-yellow-400">
              {gameState.score.toLocaleString()}
            </div>
            {gameState.lastMoveScore > 0 && (
              <motion.div 
                className="text-xs text-green-400 font-semibold"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                +{gameState.lastMoveScore}
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="space-y-1"
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
          >
            <div className="text-xs lg:text-sm opacity-80">Target</div>
            <div className="text-xl lg:text-3xl font-bold text-purple-400">
              {gameState.targetScore.toLocaleString()}
            </div>
            <div className="text-xs opacity-60">
              {Math.max(0, gameState.targetScore - gameState.score).toLocaleString()} to go
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-1"
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
          >
            <div className="text-xs lg:text-sm opacity-80">Moves</div>
            <div className="text-xl lg:text-3xl font-bold text-blue-400">
              {gameState.moves}
            </div>
            <div className="text-xs opacity-60">
              {gameState.gameMode === 'stage' && gameState.currentStage 
                ? `${gameState.moves}/${stageSystem.getStage(gameState.currentStage)?.maxMoves || '∞'}`
                : 'Divine moves'
              }
            </div>
          </motion.div>
          
          <motion.div 
            className="space-y-1"
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
          >
            <div className="text-xs lg:text-sm opacity-80">Combo</div>
            <div className="text-xl lg:text-3xl font-bold text-orange-400">
              {gameState.comboMultiplier.toFixed(1)}x
            </div>
            {combos > 0 && (
              <div className="text-xs text-orange-300">{combos} chains</div>
            )}
          </motion.div>

          {/* Stage-specific: Blocks Destroyed */}
          {gameState.gameMode === 'stage' && gameState.currentStage && (
            <motion.div 
              className="space-y-1"
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
            >
              <div className="text-xs lg:text-sm opacity-80">Blocks</div>
              <div className="text-xl lg:text-3xl font-bold text-green-400">
                {gameState.blocksDestroyed || 0}
              </div>
              <div className="text-xs opacity-60">
                {gameState.blocksDestroyed || 0}/{stageSystem.getStage(gameState.currentStage)?.blocksToBreak || 0} destroyed
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mt-4 lg:mt-6">
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>Progress to Next Realm</span>
            <span>{Math.round((gameState.score / gameState.targetScore) * 100)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((gameState.score / gameState.targetScore) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center space-y-4 lg:space-y-6 px-4 lg:px-6">
        {/* Enhanced Game Board */}
        <motion.div 
          ref={boardRef}
          className={cn(
            "grid grid-cols-8 gap-1 p-4 rounded-2xl border-2 relative shadow-2xl",
            quality === 'minimal' ? 'bg-gray-800 border-gray-600' : 
            quality === 'low' ? 'bg-gray-800/90 border-gray-500' :
            'bg-black/20 backdrop-blur-sm border-white/20'
          )}
          style={{
            width: boardSize,
            height: boardSize,
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Enhanced hint connection line */}
          {currentHint && shouldAnimate && (
            <motion.svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.line
                x1={16 + currentHint.from.col * (gemSize + 4) + gemSize / 2}
                y1={16 + currentHint.from.row * (gemSize + 4) + gemSize / 2}
                x2={16 + currentHint.to.col * (gemSize + 4) + gemSize / 2}
                y2={16 + currentHint.to.row * (gemSize + 4) + gemSize / 2}
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
                strokeDasharray="10 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </motion.svg>
          )}
          
          {gameState.board.map((row, rowIndex) =>
            row.map((gem, colIndex) => 
              renderGemWithEffects(gem, rowIndex, colIndex)
            )
          )}

          {/* Obstacle blocks overlay */}
          {gameState.obstacleBlocks && gameState.obstacleBlocks.map(block => {
            if (block.isDestroyed) return null
            
            return (
              <div
                key={block.id}
                className="absolute pointer-events-none"
                style={{
                  left: 16 + block.col * (gemSize + 4),
                  top: 16 + block.row * (gemSize + 4),
                  zIndex: 10
                }}
              >
                <ObstacleBlockComponent
                  block={block}
                  size={gemSize}
                  disabled={true}
                />
              </div>
            )
          })}
        </motion.div>

        {/* Enhanced Game Controls */}
        <motion.div 
          className="flex flex-wrap gap-3 lg:gap-4 justify-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            onClick={onRestart}
            disabled={disabled}
            className={cn(
              "px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg",
              disabled 
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl"
            )}
            whileHover={shouldAnimate && !disabled ? { scale: 1.05, y: -2 } : {}}
            whileTap={shouldAnimate && !disabled ? { scale: 0.95 } : {}}
          >
            <span className="text-lg">🔄</span>
            <span className="hidden sm:inline">Restart</span>
          </motion.button>

          {onShowHint && quality !== 'minimal' && (
            <motion.button
              onClick={onShowHint}
              disabled={disabled}
              className={cn(
                "px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg",
                disabled 
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white hover:shadow-xl"
              )}
              whileHover={shouldAnimate && !disabled ? { scale: 1.05, y: -2 } : {}}
              whileTap={shouldAnimate && !disabled ? { scale: 0.95 } : {}}
            >
              <span className="text-lg">💡</span>
              <span className="hidden sm:inline">Hint</span>
            </motion.button>
          )}

          {onNextLevel && gameState.gameStatus === 'completed' && (
            <motion.button
              onClick={onNextLevel}
              className="px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:shadow-xl transition-all duration-200"
              whileHover={shouldAnimate ? { scale: 1.05, y: -2 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-lg">⚡</span>
              <span>Next Realm</span>
            </motion.button>
          )}
        </motion.div>

        {/* Enhanced Game Status Messages */}
        <AnimatePresence>
          {gameState.gameStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="text-center p-6 lg:p-8 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl border border-red-400/30 backdrop-blur-sm shadow-2xl max-w-md"
            >
              <motion.div 
                className="text-5xl lg:text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💫
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold text-red-400 mb-2">
                Realm Challenge
              </div>
              <div className="text-white/80 mb-4">
                The divine forces were too strong this time
              </div>
              <div className="text-lg lg:text-xl text-orange-400 font-semibold">
                Score: {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Win Screen Modal */}
      <WinScreen
        isOpen={gameState.gameStatus === 'completed'}
        gameState={gameState}
        onNextLevel={() => {
          if (onNextLevel) {
            onNextLevel()
          }
        }}
        onMainMenu={() => {
          if (onShowMenu) {
            onShowMenu()
          }
        }}
        onRestart={onRestart}
        showRewards={true}
        rewards={{
          coins: Math.floor(gameState.score / 10),
          gems: Math.max(1, Math.floor(gameState.score / 100)),
          xp: Math.floor(gameState.score / 5),
          stars: gameState.score >= gameState.targetScore * 2.5 ? 3 : 
                 gameState.score >= gameState.targetScore * 1.8 ? 2 : 1
        }}
      />

      {/* Performance indicator (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 space-y-2">
          <div className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded">
            Quality: {quality} | Board: {boardSize}px | Gem: {gemSize}px
          </div>
          <div className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded">
            Score: {gameState.score.toLocaleString()} / Target: {gameState.targetScore.toLocaleString()}
          </div>
          <div className="text-xs text-white/60 bg-black/20 px-2 py-1 rounded">
            Status: {gameState.gameStatus}
          </div>
          <button
            onClick={() => {
              // Debug function to test win condition
              console.log('🧪 Debug: Triggering win condition manually')
              // This is a hack for testing - we'll trigger it via the parent component
              window.dispatchEvent(new CustomEvent('debug-win-test'))
            }}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
          >
            🧪 Test Win
          </button>
        </div>
      )}
    </div>
  )
}

// Main component with provider wrapper
export default function GameInterface(props: GameInterfaceProps) {
  return (
    <VisualEffectsProvider>
      <GameInterfaceContent {...props} />
    </VisualEffectsProvider>
  )
}