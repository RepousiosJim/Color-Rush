'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gem, GameState } from '@/types/game'
import EnhancedGem from '@/components/ui/EnhancedGem'
import { VisualEffectsProvider, useVisualEffects } from '@/components/ui/VisualEffectsManager'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'

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
const GameInterfaceContent = ({ gameState, onMove, onRestart, onNextLevel, onPause, onShowMenu, onShowSettings, onShowHint, currentHint, disabled }: GameInterfaceProps) => {
  const [selectedGem, setSelectedGem] = useState<{ row: number; col: number } | null>(null)
  const [adjacentGems, setAdjacentGems] = useState<{ row: number; col: number }[]>([])
  const [hintedGems, setHintedGems] = useState<{ row: number; col: number }[]>([])
  const [combos, setCombos] = useState<number>(0)
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
  // Users can change this in settings if they prefer auto quality
  useEffect(() => {
    if (gameState?.gameStatus === 'playing' && !isQualityLocked) {
      setManualQuality('high') // Lock to high quality for stable gameplay experience
    }
  }, [gameState?.gameStatus, isQualityLocked, setManualQuality])

  // Optimized board size based on performance
  const boardSize = useMemo(() => {
    const sizes = {
      minimal: 320,
      low: 360,
      medium: 400,
      high: 440,
      ultra: 480
    }
    return sizes[quality] || 400
  }, [quality])

  // Optimized gem size calculation
  const gemSize = useMemo(() => Math.floor(boardSize / 8) - 4, [boardSize])

  // Performance-optimized hint system
  const showHints = useCallback(
    optimizedDebounce(() => {
      if (quality === 'minimal') return // Skip hints for minimal performance
      
      // Simplified hint logic for performance - just log potential hints
      console.log('Hint system: analyzing board for potential moves...')
      
      // Note: Visual hints are now handled through the currentHint prop
      // which comes from the parent component
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

  // Simplified match detection for performance
  const canCreateMatch = useCallback((fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const fromGem = gameState.board[fromRow]?.[fromCol]
    const toGem = gameState.board[toRow]?.[toCol]
    
    if (!fromGem || !toGem) return false
    
    // Simple validation - just check if gems are different types
    return fromGem.type !== toGem.type
  }, [gameState.board])

  // Performance-optimized match detection and visual effects
  const handleMatchDetection = useCallback(
    optimizedThrottle((matchedPositions: { row: number; col: number }[]) => {
      if (matchedPositions.length === 0) return

      // Increment combo counter
      setCombos(prev => prev + 1)
      
      // Add visual effects only if performance allows
      if (shouldShowEffects) {
        matchedPositions.forEach((pos, index) => {
          if (boardRef.current) {
            const rect = boardRef.current.getBoundingClientRect()
            const x = rect.left + (pos.col * gemSize) + gemSize / 2
            const y = rect.top + (pos.row * gemSize) + gemSize / 2
            
            // Stagger effects for performance
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

        // Add combo effect for larger matches
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
      // Select gem
      setSelectedGem({ row, col })
      setAdjacentGems(getAdjacentPositions(row, col))
    } else if (selectedGem.row === row && selectedGem.col === col) {
      // Deselect gem
      setSelectedGem(null)
      setAdjacentGems([])
    } else {
      // Attempt move
      const isAdjacent = adjacentGems.some(gem => gem.row === row && gem.col === col)
      
      if (isAdjacent) {
        onMove(selectedGem.row, selectedGem.col, row, col)
        
        // Trigger match detection for visual effects
        const matchedGems = [selectedGem, { row, col }]
        handleMatchDetection(matchedGems)
      }
      
      // Clear selection
      setSelectedGem(null)
      setAdjacentGems([])
    }
  }, [selectedGem, adjacentGems, disabled, gameState.board, onMove, getAdjacentPositions, handleMatchDetection])

  // Performance-optimized gem rendering with memoization
  const renderGemWithEffects = useCallback((gem: Gem | null, row: number, col: number, isHinted: boolean) => {
    const isSelected = selectedGem?.row === row && selectedGem?.col === col
    const isAdjacent = adjacentGems.some(g => g.row === row && g.col === col)
    
    return (
      <EnhancedGem
        key={`${row}-${col}-${gem?.id || 'empty'}`}
        gem={gem}
        row={row}
        col={col}
        isSelected={isSelected}
        isAdjacent={isAdjacent}
        isHinted={isHinted}
        onClick={() => handleGemClick(row, col)}
        disabled={disabled}
        size={quality === 'minimal' ? 'sm' : quality === 'low' ? 'md' : 'md'}
      />
    )
  }, [selectedGem, adjacentGems, disabled, handleGemClick, quality])

  // Auto-show hints for better UX (performance permitting)
  useEffect(() => {
    if (quality !== 'minimal' && !selectedGem) {
      const hintTimer = setTimeout(showHints, 5000)
      return () => clearTimeout(hintTimer)
    }
  }, [selectedGem, showHints, quality])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Game Header */}
      <div className="flex items-center justify-between p-4 text-white">
        {/* Left side - Menu & Settings */}
        <div className="flex items-center gap-3">
          {onShowMenu && (
            <motion.button
              onClick={onShowMenu}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-xl">🏠</span>
            </motion.button>
          )}
          
          {onShowSettings && (
            <motion.button
              onClick={onShowSettings}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-xl">⚙️</span>
            </motion.button>
          )}
        </div>

        {/* Center - Game Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Gems Rush: Divine Teams
          </h1>
          <div className="text-sm text-purple-300">Level {gameState.level} - Divine Realm</div>
        </div>

        {/* Right side - Game Status */}
        <div className="flex items-center gap-3">
          {onPause && (
            <motion.button
              onClick={onPause}
              className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span className="text-xl">{gameState.gameStatus === 'paused' ? '▶️' : '⏸️'}</span>
            </motion.button>
          )}
          
          <div className="text-center">
            <div className="text-xs opacity-80">Status</div>
            <div className="text-sm font-semibold capitalize">{gameState.gameStatus}</div>
          </div>
        </div>
      </div>

      {/* Game Stats Panel */}
      <div className="mx-4 mb-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-center">
          <div className="space-y-1">
            <div className="text-sm opacity-80">Score</div>
            <div className="text-2xl font-bold text-yellow-400">{gameState.score.toLocaleString()}</div>
            {gameState.lastMoveScore > 0 && (
              <div className="text-xs text-green-400">+{gameState.lastMoveScore}</div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm opacity-80">Target</div>
            <div className="text-2xl font-bold text-purple-400">{gameState.targetScore.toLocaleString()}</div>
            <div className="text-xs opacity-60">
              {Math.max(0, gameState.targetScore - gameState.score).toLocaleString()} to go
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm opacity-80">Moves</div>
            <div className="text-2xl font-bold text-blue-400">{gameState.moves}</div>
            <div className="text-xs opacity-60">Divine moves</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm opacity-80">Combo</div>
            <div className="text-2xl font-bold text-orange-400">{gameState.comboMultiplier.toFixed(1)}x</div>
            {combos > 0 && (
              <div className="text-xs text-orange-300">{combos} chains</div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Progress to Next Realm</span>
            <span>{Math.round((gameState.score / gameState.targetScore) * 100)}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((gameState.score / gameState.targetScore) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col items-center space-y-6 px-4">
        {/* Game Board - Performance optimized */}
        <div 
          ref={boardRef}
          className={cn(
            "grid grid-cols-8 gap-1 p-3 rounded-xl border-2 relative",
            quality === 'minimal' ? 'bg-gray-800 border-gray-600' : 
            quality === 'low' ? 'bg-gray-800/90 border-gray-500' :
            'bg-black/20 backdrop-blur-sm border-white/20 shadow-2xl'
          )}
          style={{
            width: boardSize,
            height: boardSize,
          }}
        >
          {gameState.board.map((row, rowIndex) =>
            row.map((gem, colIndex) => {
              const isHintFrom = currentHint?.from.row === rowIndex && currentHint?.from.col === colIndex
              const isHintTo = currentHint?.to.row === rowIndex && currentHint?.to.col === colIndex
              
              return renderGemWithEffects(gem, rowIndex, colIndex, isHintFrom || isHintTo)
            })
          )}
        </div>

        {/* Game Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          <motion.button
            onClick={onRestart}
            disabled={disabled}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2",
              disabled 
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            )}
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
            whileTap={shouldAnimate ? { scale: 0.95 } : {}}
          >
            <span>🔄</span>
            Restart
          </motion.button>

          {onShowHint && quality !== 'minimal' && (
            <motion.button
              onClick={onShowHint}
              disabled={disabled}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2",
                disabled 
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
              )}
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span>💡</span>
              Hint
            </motion.button>
          )}

          {onNextLevel && gameState.gameStatus === 'completed' && (
            <motion.button
              onClick={onNextLevel}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg flex items-center gap-2"
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              whileTap={shouldAnimate ? { scale: 0.95 } : {}}
            >
              <span>⚡</span>
              Next Realm
            </motion.button>
          )}
        </div>

        {/* Game Status Messages */}
        {gameState.gameStatus === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30 backdrop-blur-sm"
          >
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-2xl font-bold text-green-400 mb-2">Realm Completed!</div>
            <div className="text-white/80">
              You've successfully conquered the Divine Realm {gameState.level}
            </div>
            <div className="text-lg text-yellow-400 mt-2">
              Final Score: {gameState.score.toLocaleString()}
            </div>
          </motion.div>
        )}

        {gameState.gameStatus === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-400/30 backdrop-blur-sm"
          >
            <div className="text-4xl mb-2">💫</div>
            <div className="text-2xl font-bold text-red-400 mb-2">Realm Challenge</div>
            <div className="text-white/80">
              The divine forces were too strong this time
            </div>
            <div className="text-lg text-orange-400 mt-2">
              Score: {gameState.score.toLocaleString()} / {gameState.targetScore.toLocaleString()}
            </div>
          </motion.div>
        )}

        {gameState.gameStatus === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="text-center p-8 bg-white/10 rounded-xl border border-white/20">
              <div className="text-6xl mb-4">⏸️</div>
              <div className="text-2xl font-bold text-white mb-4">Game Paused</div>
              <div className="text-white/80">Click pause button to resume your divine journey</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>Quality: {quality} {isQualityLocked ? '🔒' : '🔄'}</div>
          <div>Combos: {combos}</div>
          <div>DEV MODE</div>
        </div>
      )}
    </div>
  )
}

// Main component with provider
export default function GameInterface(props: GameInterfaceProps) {
  return (
    <VisualEffectsProvider>
      <GameInterfaceContent {...props} />
    </VisualEffectsProvider>
  )
}