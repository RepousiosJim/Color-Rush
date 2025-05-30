'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GameState, Gem } from '@/types/game'
import { PowerUpGem } from '@/lib/game/GameEngine'

interface GameBoardProps {
  gameState: GameState
  onMove: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void
  onGemClick?: (row: number, col: number) => void
  disabled?: boolean
  timeRushMode?: boolean
  adrenalineMode?: boolean
  currentHint?: { from: { row: number; col: number }; to: { row: number; col: number } } | null
}

const GEM_COLORS = {
  fire: 'from-red-600 to-red-800',
  water: 'from-blue-600 to-blue-800', 
  earth: 'from-yellow-600 to-yellow-800',
  nature: 'from-green-600 to-green-800',
  lightning: 'from-purple-600 to-purple-800',
  magic: 'from-pink-600 to-pink-800',
  crystal: 'from-cyan-600 to-cyan-800'
}

const GEM_EMOJIS = {
  fire: '🔥',
  water: '💧', 
  earth: '🌍',
  nature: '🌿',
  lightning: '⚡',
  magic: '🔮',
  crystal: '💎'
}

const POWER_UP_EFFECTS = {
  lightning: {
    emoji: '⚡',
    color: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-400/50',
    animation: 'animate-pulse'
  },
  rainbow: {
    emoji: '🌈',
    color: 'from-purple-400 to-purple-600', 
    glow: 'shadow-purple-400/50',
    animation: 'animate-bounce'
  },
  bomb: {
    emoji: '💥',
    color: 'from-red-400 to-red-600',
    glow: 'shadow-red-400/50', 
    animation: 'animate-spin'
  },
  hammer: {
    emoji: '🔨',
    color: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-400/50',
    animation: 'animate-pulse'
  },
  shuffle: {
    emoji: '🌀',
    color: 'from-green-400 to-green-600',
    glow: 'shadow-green-400/50',
    animation: 'animate-spin'
  }
}

export default function GameBoard({ 
  gameState, 
  onMove, 
  onGemClick,
  disabled = false,
  timeRushMode = false,
  adrenalineMode = false,
  currentHint 
}: GameBoardProps) {
  // Early return if gameState is not available
  if (!gameState) {
    return (
      <div className="flex items-center justify-center w-96 h-96 bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl">
        <div className="text-white/70 text-lg">Initializing game board...</div>
      </div>
    )
  }

  const [selectedGem, setSelectedGem] = useState<{ row: number; col: number } | null>(null)
  const [animatingGems, setAnimatingGems] = useState<Set<string>>(new Set())
  const [cascadeLevel, setCascadeLevel] = useState(0)
  
  // Enhanced board size for Time Rush mode
  const boardSize = useMemo(() => {
    const baseSize = timeRushMode ? 520 : 450
    return Math.max(320, baseSize)
  }, [timeRushMode])

  const gemSize = useMemo(() => {
    return Math.floor((boardSize - 32) / 8) // 8x8 grid with padding
  }, [boardSize])

  // Check if gem is a power-up
  const isPowerUpGem = useCallback((gem: Gem | null): gem is PowerUpGem => {
    return gem !== null && 'isPowerUp' in gem && gem.isPowerUp === true
  }, [])

  // Get adjacent positions for move validation
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

  // Handle gem click
  const handleGemClick = useCallback((row: number, col: number) => {
    if (disabled) return
    
    const gem = gameState.board[row]?.[col]
    if (!gem) return

    // Handle power-up click in Time Rush mode
    if (timeRushMode && isPowerUpGem(gem) && onGemClick) {
      onGemClick(row, col)
      return
    }

    // Normal gem selection logic
    if (!selectedGem) {
      setSelectedGem({ row, col })
    } else {
      // Check if clicking the same gem (deselect)
      if (selectedGem.row === row && selectedGem.col === col) {
        setSelectedGem(null)
        return
      }

      // Check if gems are adjacent
      const adjacentPositions = getAdjacentPositions(selectedGem.row, selectedGem.col)
      const isAdjacent = adjacentPositions.some(pos => pos.row === row && pos.col === col)

      if (isAdjacent) {
        // Make the move
        onMove(selectedGem.row, selectedGem.col, row, col)
        setSelectedGem(null)
        
        // Add animation
        const gemId = `${selectedGem.row}-${selectedGem.col}`
        setAnimatingGems(prev => new Set([...prev, gemId]))
        setTimeout(() => {
          setAnimatingGems(prev => {
            const newSet = new Set(prev)
            newSet.delete(gemId)
            return newSet
          })
        }, 500)
      } else {
        // Select new gem
        setSelectedGem({ row, col })
      }
    }
  }, [disabled, gameState.board, timeRushMode, isPowerUpGem, onGemClick, selectedGem, getAdjacentPositions, onMove])

  // Render individual gem
  const renderGem = useCallback((gem: Gem | null, row: number, col: number) => {
    if (!gem) return null

    const isSelected = selectedGem?.row === row && selectedGem?.col === col
    const isAnimating = animatingGems.has(`${row}-${col}`)
    const isHinted = currentHint && 
      ((currentHint.from.row === row && currentHint.from.col === col) ||
       (currentHint.to.row === row && currentHint.to.col === col))
    const isPowerUp = isPowerUpGem(gem)

    const gemEmoji = isPowerUp ? POWER_UP_EFFECTS[gem.powerUpType].emoji : GEM_EMOJIS[gem.type]
    const gemColorClass = isPowerUp ? POWER_UP_EFFECTS[gem.powerUpType].color : GEM_COLORS[gem.type]
    
    return (
      <motion.div
        key={gem.id}
        className={cn(
          "relative rounded-xl border-2 cursor-pointer transition-all duration-200",
          "flex items-center justify-center text-2xl font-bold select-none",
          `bg-gradient-to-br ${gemColorClass}`,
          isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/50 scale-110 z-20' : 'border-white/30',
          isHinted ? 'ring-4 ring-blue-400/70 animate-pulse' : '',
          isPowerUp ? 'shadow-lg shadow-current border-white/60' : '',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 hover:brightness-110',
          timeRushMode ? 'shadow-lg' : '',
          adrenalineMode && isPowerUp ? POWER_UP_EFFECTS[gem.powerUpType].animation : ''
        )}
        style={{
          width: gemSize,
          height: gemSize,
        }}
        onClick={() => handleGemClick(row, col)}
        initial={{ scale: 0 }}
        animate={{ 
          scale: isAnimating ? [1, 1.2, 1] : 1,
          filter: adrenalineMode ? 'brightness(1.2) saturate(1.3)' : 'brightness(1) saturate(1)'
        }}
        transition={{ 
          duration: isAnimating ? 0.5 : 0.6,
          delay: (row + col) * 0.02,
          type: isAnimating ? "tween" : "spring",
          stiffness: 300,
          damping: 20
        }}
        whileHover={!disabled ? { 
          scale: 1.05,
          transition: { duration: 0.1 }
        } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        {/* Gem Content */}
        <span className="relative z-10 drop-shadow-lg leading-none flex items-center justify-center">
          {gemEmoji}
        </span>

        {/* Power-up Indicator for Time Rush */}
        {timeRushMode && isPowerUp && (
          <motion.div
            className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center leading-none"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 0.8,
              repeat: Infinity,
              type: "tween",
              ease: "easeInOut"
            }}
          >
            !
          </motion.div>
        )}

        {/* Power-up Glow Effect */}
        {isPowerUp && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl opacity-40",
              `bg-gradient-to-br ${POWER_UP_EFFECTS[gem.powerUpType].color}`,
              POWER_UP_EFFECTS[gem.powerUpType].glow
            )}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              type: "tween",
              ease: "easeInOut"
            }}
          />
        )}

        {/* Adrenaline Mode Effects */}
        {adrenalineMode && (
          <motion.div
            className="absolute inset-0 border-2 border-red-400/60 rounded-xl"
            animate={{
              opacity: [0, 1, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              type: "tween",
              ease: "easeInOut"
            }}
          />
        )}

        {/* Selection Ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 border-4 border-yellow-400 rounded-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              type: "tween",
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    )
  }, [selectedGem, animatingGems, currentHint, isPowerUpGem, gemSize, handleGemClick, disabled, timeRushMode, adrenalineMode])

  return (
    <div className="relative">
      {/* Enhanced Background for Time Rush */}
      {timeRushMode && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-3xl -m-4",
            adrenalineMode 
              ? "bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20"
              : "bg-gradient-to-br from-orange-500/10 via-red-500/10 to-purple-500/10"
          )}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: adrenalineMode ? [1, 1.02, 1] : [1, 1.01, 1]
          }}
          transition={{
            duration: adrenalineMode ? 0.8 : 2,
            repeat: Infinity,
            type: "tween",
            ease: "easeInOut"
          }}
        />
      )}

      {/* Main Game Board */}
      <motion.div
        className={cn(
          "grid grid-cols-8 gap-1 p-4 rounded-2xl border-2 relative shadow-2xl",
          timeRushMode 
            ? "bg-black/30 backdrop-blur-md border-orange-400/50"
            : "bg-black/20 backdrop-blur-sm border-white/20"
        )}
        style={{
          width: boardSize,
          height: boardSize,
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          filter: adrenalineMode ? 'brightness(1.1) contrast(1.1)' : 'brightness(1) contrast(1)'
        }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {/* Hint Connection Line */}
        {currentHint && (
          <motion.svg
            className="absolute inset-0 pointer-events-none z-30"
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
              stroke={timeRushMode ? "rgb(251, 146, 60)" : "rgb(59, 130, 246)"}
              strokeWidth="3"
              strokeDasharray="10 5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </motion.svg>
        )}

        {/* Board Grid */}
        {gameState?.board && Array.isArray(gameState.board) ? 
          gameState.board.map((row, rowIndex) =>
            Array.isArray(row) ? row.map((gem, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="relative">
                {renderGem(gem, rowIndex, colIndex)}
              </div>
            )) : null
          ) : (
            // Loading placeholder grid
            <div className="col-span-8 flex items-center justify-center h-full">
              <div className="text-white/50 text-sm">Loading board...</div>
            </div>
          )
        }

        {/* Time Rush Particles */}
        {timeRushMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(adrenalineMode ? 15 : 8)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "absolute w-1 h-1 rounded-full",
                  adrenalineMode ? "bg-yellow-400" : "bg-orange-400"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Adrenaline Pulse Overlay */}
        <AnimatePresence>
          {adrenalineMode && (
            <motion.div
              className="absolute inset-0 bg-red-400/10 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, repeat: Infinity, type: "tween" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Time Rush Mode Instructions */}
      {timeRushMode && (
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
      )}
    </div>
  )
} 