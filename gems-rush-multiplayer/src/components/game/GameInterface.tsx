'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameState } from '@/types/game'
import { GEM_TYPES } from '@/lib/game/constants'
import CustomCursor from '@/components/ui/CustomCursor'
import { RestartButton, HintButton, PauseButton, MenuButton, NextLevelButton } from '@/components/ui/GameButton'
import GameStatsCard from '@/components/ui/GameStatsCard'
import EnhancedGem from '@/components/ui/EnhancedGem'
import EnhancedProgress from '@/components/ui/EnhancedProgress'
import ModernGamePanel from '@/components/ui/ModernGamePanel'
import Modern3DBoard from '@/components/ui/Modern3DBoard'
import ModernNotificationCenter from '@/components/ui/ModernNotificationCenter'
import ParticleSystem from '@/components/ui/ParticleSystem'
import EnhancedGemEffects from '@/components/ui/EnhancedGemEffects'
import ComboTextDisplay from '@/components/ui/ComboTextDisplay'
import PowerUpIndicators, { PowerUpGem, PowerUpType, createPowerUpGem } from '@/components/ui/PowerUpIndicators'
import { ThemeProvider, useTheme, ThemeSelector } from '@/components/ui/ThemeCustomization'
import { VisualEffectsProvider, useVisualEffects, useComboEffects, useGemMatchEffects, usePowerUpEffects } from '@/components/ui/VisualEffectsManager'
import usePerformanceOptimization from '@/hooks/usePerformanceOptimization'
import useResponsive from '@/hooks/useResponsive'

interface GameInterfaceProps {
  gameState: GameState
  onGemClick: (row: number, col: number) => void
  onRestart: () => void
  onNextLevel: () => void
  onPause: () => void
  onShowMenu: () => void
  onShowSettings: () => void
  onShowHint: () => void
  currentHint: { from: { row: number; col: number }; to: { row: number; col: number } } | null
}

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

interface FloatingScore {
  id: string
  points: number
  x: number
  y: number
  timestamp: number
}

export default function GameInterface({
  gameState,
  onGemClick,
  onRestart,
  onNextLevel,
  onPause,
  onShowMenu,
  onShowSettings,
  onShowHint,
  currentHint
}: GameInterfaceProps) {
  // Performance and responsive hooks
  const { 
    isHighPerformance, 
    isReducedMotion, 
    getOptimizedAnimation,
    optimizedDebounce,
    optimizedThrottle 
  } = usePerformanceOptimization()
  
  const { 
    screenSize, 
    boardSize, 
    getResponsiveValue, 
    showCompactUI,
    useStackedLayout,
    getContainerPadding,
    getButtonSize,
    reduceAnimations
  } = useResponsive()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([])
  const [showStats, setShowStats] = useState(false)
  const [isHoveringGem, setIsHoveringGem] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  
  // Enhanced Visual Effects State
  const [activePowerUps, setActivePowerUps] = useState<PowerUpGem[]>([])
  const [comboLevel, setComboLevel] = useState(0)
  const [lastComboScore, setLastComboScore] = useState(0)
  const [matchedGemTypes, setMatchedGemTypes] = useState<string[]>([])
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true)
  const [comboHistory, setComboHistory] = useState<{ level: number; score: number; timestamp: number }[]>([])
  
  const [gameStats] = useState({
    totalMatches: 0,
    bestCombo: 0,
    totalScore: 0,
    averageScore: 0,
    gemsMatched: {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      lightning: 0,
      nature: 0,
      magic: 0
    }
  })

  const boardRef = useRef<HTMLDivElement>(null)
  
  // Refs to track if initial instructions have been shown
  const initialInstructionsShown = useRef(false)
  const lastCompletedLevel = useRef<number | null>(null)
  const lastSelectedGem = useRef<{ row: number; col: number } | null>(null)

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  // Format time in mm:ss format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Show notification
  const showNotification = (
    message: string, 
    type: Notification['type'] = 'info', 
    duration: number = 3000,
    icon?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    const notification: Notification = {
      id: Date.now().toString() + Math.random(),
      message,
      type,
      duration,
      timestamp: Date.now(),
      icon,
      action
    }
    
    setNotifications(prev => [...prev.slice(-4), notification])
  }

  // Show floating score
  const showFloatingScore = (points: number, row: number, col: number) => {
    if (!boardRef.current) return
    
    const board = boardRef.current
    const rect = board.getBoundingClientRect()
    const cellSize = rect.width / gameState.boardSize
    
    const x = rect.left + (col * cellSize) + (cellSize / 2)
    const y = rect.top + (row * cellSize) + (cellSize / 2)
    
    const floatingScore: FloatingScore = {
      id: Date.now().toString() + Math.random(),
      points,
      x: x - rect.left,
      y: y - rect.top,
      timestamp: Date.now()
    }
    
    setFloatingScores(prev => [...prev, floatingScore])
    
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== floatingScore.id))
    }, 1500)
  }

  // Optimize the gem click handler with throttling for performance
  const handleGemClick = optimizedThrottle((row: number, col: number) => {
    // Provide user feedback for game rules
    if (gameState.gameStatus !== 'playing') {
      showNotification('Game is paused. Resume to continue playing.', 'warning', 3000, '⏸️')
      return
    }
    
    if (gameState.isAnimating) {
      showNotification('Please wait for the current move to complete.', 'info', 3000, '⏳')
      return
    }
    
    // If a gem is already selected and user clicks non-adjacent gem
    if (gameState.selectedGem && !isAdjacentToSelected(row, col) && 
        !(gameState.selectedGem.row === row && gameState.selectedGem.col === col)) {
      showNotification('You can only swap adjacent gems! Click a green highlighted gem.', 'warning', 4000, '❌')
      return
    }
    
    onGemClick(row, col)
    
    // Show floating score if move resulted in points
    if (gameState.lastMoveScore > 0) {
      showFloatingScore(gameState.lastMoveScore, row, col)
      showNotification(
        `Great move! +${formatNumber(gameState.lastMoveScore)} points!`, 
        'success',
        3000,
        '🎉'
      )
    }
  }, 100) // 100ms throttle for performance

  // Optimized animation configs based on performance
  const getAnimationConfig = (baseConfig: any) => {
    if (reduceAnimations || isReducedMotion) {
      return getOptimizedAnimation(baseConfig)
    }
    return baseConfig
  }

  // Check if two positions are adjacent
  const isAdjacent = (row1: number, col1: number, row2: number, col2: number): boolean => {
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  // Get adjacent positions for a gem
  const getAdjacentPositions = (row: number, col: number): Array<{row: number, col: number}> => {
    const adjacent = []
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }   // right
    ]
    
    for (const dir of directions) {
      const newRow = row + dir.row
      const newCol = col + dir.col
      if (newRow >= 0 && newRow < gameState.boardSize && newCol >= 0 && newCol < gameState.boardSize) {
        adjacent.push({ row: newRow, col: newCol })
      }
    }
    
    return adjacent
  }

  // Check if a gem should be highlighted as adjacent to selected gem
  const isAdjacentToSelected = (row: number, col: number): boolean => {
    if (!gameState.selectedGem) return false
    return isAdjacent(gameState.selectedGem.row, gameState.selectedGem.col, row, col)
  }

  // Check if a gem is part of the current hint
  const isPartOfHint = (row: number, col: number): boolean => {
    if (!currentHint) return false
    return (currentHint.from.row === row && currentHint.from.col === col) ||
           (currentHint.to.row === row && currentHint.to.col === col)
  }

  // Get notification color
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/90 border-green-400'
      case 'warning': return 'bg-yellow-500/90 border-yellow-400'
      case 'error': return 'bg-red-500/90 border-red-400'
      default: return 'bg-blue-500/90 border-blue-400'
    }
  }

  // Game mode display names
  const getGameModeDisplay = () => {
    const modeMap = {
      'normal': { icon: '🎯', name: 'Normal Mode' },
      'timeAttack': { icon: '⏱️', name: 'Time Attack' },
      'dailyChallenge': { icon: '📅', name: 'Daily Challenge' },
      'campaign': { icon: '⚔️', name: 'Divine Conquest' }
    }
    
    return modeMap[gameState.gameMode as keyof typeof modeMap] || { icon: '🎯', name: 'Normal Mode' }
  }

  const modeDisplay = getGameModeDisplay()

  // Show level complete notification
  useEffect(() => {
    if (gameState.gameStatus === 'completed' && lastCompletedLevel.current !== gameState.level) {
      lastCompletedLevel.current = gameState.level
      showNotification(
        `Level ${gameState.level} Complete! You scored ${formatNumber(gameState.score)} points!`,
        'achievement',
        5000,
        '🎉',
        {
          label: 'Next Level',
          onClick: onNextLevel
        }
      )
    }
  }, [gameState.gameStatus, gameState.level, gameState.score])

  // Show game instructions when starting (only once per game session)
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.moves === 0 && !initialInstructionsShown.current) {
      initialInstructionsShown.current = true
      
      const timer1 = setTimeout(() => {
        showNotification(
          'Click a gem, then click an adjacent gem to swap them!', 
          'info', 
          6000,
          '🎮'
        )
      }, 1000)
      
      const timer2 = setTimeout(() => {
        showNotification(
          'Make matches of 3+ identical gems to score points!', 
          'info', 
          6000,
          '🎯'
        )
      }, 3000)
      
      // Cleanup timers if component unmounts
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [gameState.gameStatus, gameState.moves])

  // Reset instruction flag when game is restarted
  useEffect(() => {
    if (gameState.moves === 0) {
      initialInstructionsShown.current = false
    }
  }, [gameState.moves])

  // Show selection guidance (only when gem selection changes)
  useEffect(() => {
    const currentSelectedGem = gameState.selectedGem
    const lastSelected = lastSelectedGem.current
    
    // Only show notification if gem selection actually changed
    if (currentSelectedGem && 
        (!lastSelected || 
         lastSelected.row !== currentSelectedGem.row || 
         lastSelected.col !== currentSelectedGem.col)) {
      lastSelectedGem.current = currentSelectedGem
      showNotification(
        'Now click a green highlighted adjacent gem to swap!', 
        'info', 
        4000,
        '✨'
      )
    } else if (!currentSelectedGem) {
      lastSelectedGem.current = null
    }
  }, [gameState.selectedGem])

  // Enhanced Visual Effects Integration
  const handleMatchDetection = (matches: any[], matchType: 'normal' | 'cascade' | 'power' = 'normal') => {
    if (matches.length === 0 || !visualEffectsEnabled) return

    // Calculate combo level based on chain reactions
    const newComboLevel = matchType === 'cascade' ? comboLevel + 1 : 1
    setComboLevel(newComboLevel)

    // Track matched gem types for visual effects
    const types = matches.map(match => match.type).filter(Boolean)
    setMatchedGemTypes(prev => [...new Set([...prev, ...types])])

    // Calculate combo score bonus
    const baseScore = matches.length * 50
    const comboMultiplier = newComboLevel > 1 ? Math.pow(1.5, newComboLevel - 1) : 1
    const comboScore = Math.floor(baseScore * comboMultiplier)
    setLastComboScore(comboScore)

    // Add to combo history
    if (newComboLevel > 1) {
      setComboHistory(prev => [...prev.slice(-9), {
        level: newComboLevel,
        score: comboScore,
        timestamp: Date.now()
      }])
    }

    // Trigger combo text effect if significant
    if (newComboLevel >= 2 && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // This would integrate with our VisualEffectsManager
      // For now, we'll show enhanced notifications
      if (newComboLevel >= 5) {
        showNotification(
          `AMAZING ${newComboLevel}x COMBO! +${formatNumber(comboScore)} points!`,
          'achievement',
          4000,
          '🔥'
        )
      } else if (newComboLevel >= 3) {
        showNotification(
          `Great ${newComboLevel}x Combo! +${formatNumber(comboScore)} points!`,
          'success',
          3000,
          '⭐'
        )
      }
    }

    // Check for power-up creation opportunities
    if (matches.length >= 4) {
      const powerUpType: PowerUpType = matches.length >= 6 ? 'RAINBOW' : 
                                      matches.length >= 5 ? 'LIGHTNING' : 'BOMB'
      
      // Create power-up gem (this would integrate with actual game logic)
      const powerUpGem = createPowerUpGem(
        `powerup-${Date.now()}`,
        matches[0].type,
        powerUpType,
        { row: matches[0].row, col: matches[0].col },
        newComboLevel
      )

      setActivePowerUps(prev => [...prev, powerUpGem])
      
      showNotification(
        `Power-up created! ${powerUpType} gem is ready!`,
        'achievement',
        3000,
        '💫'
      )
    }
  }

  // Monitor game state changes for visual effects
  useEffect(() => {
    // Reset combo when no moves for a while
    const timer = setTimeout(() => {
      if (comboLevel > 0) {
        setComboLevel(0)
        setMatchedGemTypes([])
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [gameState.lastMoveScore, comboLevel])

  // Clear visual state on game restart
  useEffect(() => {
    if (gameState.moves === 0) {
      setActivePowerUps([])
      setComboLevel(0)
      setLastComboScore(0)
      setMatchedGemTypes([])
      setComboHistory([])
    }
  }, [gameState.moves])

  // Enhanced gem rendering with visual effects
  const renderGemWithEffects = (gem: any, row: number, col: number) => {
    const isSelected = gameState.selectedGem?.row === row && gameState.selectedGem?.col === col
    const isAdjacent = isAdjacentToSelected(row, col)
    const isHinted = isPartOfHint(row, col)
    const powerUp = activePowerUps.find(p => p.position.row === row && p.position.col === col)

    return (
      <div key={`${row}-${col}`} className="relative w-full h-full group">
        {/* Base Gem */}
        <EnhancedGem
          gem={gem}
          row={row}
          col={col}
          onClick={() => handleGemClick(row, col)}
          isSelected={isSelected}
          isAdjacent={isAdjacent}
          isHinted={isHinted}
          disabled={gameState.isAnimating || gameState.gameStatus !== 'playing'}
        />

        {/* Enhanced Visual Effects Layer */}
        {visualEffectsEnabled && (
          <EnhancedGemEffects
            gem={gem}
            isSelected={isSelected}
            isAdjacent={isAdjacent}
            isHinted={isHinted}
            isMatched={matchedGemTypes.includes(gem?.type)}
            comboLevel={comboLevel}
            effectIntensity={isHighPerformance ? 'high' : 'medium'}
            enableAdvancedEffects={isHighPerformance && !isReducedMotion}
          />
        )}

        {/* Power-up Indicator */}
        {powerUp && (
          <div className="absolute inset-0">
            <PowerUpIndicators
              gem={powerUp}
              size={screenSize.isMobile ? 'sm' : 'md'}
              showAura={!isReducedMotion}
              showParticles={visualEffectsEnabled && isHighPerformance}
              animationIntensity={isHighPerformance ? 'high' : 'medium'}
              enableSoundEffects={false}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${getContainerPadding()} relative overflow-hidden`}>
      {/* Background Particle System */}
      <ParticleSystem
        active={true}
        type="ambient"
        intensity="low"
        className="fixed inset-0 z-0"
      />
      
      {/* Custom Cursor */}
      <CustomCursor
        gameState={gameState.gameStatus === 'idle' ? 'playing' : gameState.gameStatus}
        isHoveringGem={isHoveringGem}
        isHoveringButton={isHoveringButton}
        selectedGemType={gameState.selectedGem ? gameState.board[gameState.selectedGem.row][gameState.selectedGem.col]?.type : undefined}
        isHintActive={currentHint !== null}
      />
      
      {/* Modern Notification System */}
      <ModernNotificationCenter
        notifications={notifications}
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
        position="top-right"
        maxVisible={4}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <div className={`flex justify-between items-center mb-6 ${showCompactUI ? 'flex-col gap-4' : ''}`}>
          {/* Home Button */}
          <MenuButton
            onClick={onShowMenu}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
            size={getButtonSize()}
          />

          {/* Game Title */}
          <div className="text-center">
            <motion.h1 
              className={`font-bold text-white mb-1 ${getResponsiveValue('text-xl', 'text-2xl', 'text-3xl')}`}
              {...getAnimationConfig({
                animate: {
                  textShadow: [
                    '0 0 10px rgba(147, 51, 234, 0.8)',
                    '0 0 20px rgba(59, 130, 246, 0.8)',
                    '0 0 10px rgba(147, 51, 234, 0.8)'
                  ]
                },
                transition: { duration: 3, repeat: Infinity }
              })}
            >
              🔮 Gems Rush: Divine Teams
            </motion.h1>
            <div className="flex items-center justify-center gap-2 text-purple-200">
              <span className="text-lg">{modeDisplay.icon}</span>
              <span className="text-sm">{modeDisplay.name}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            onMouseEnter={() => setIsHoveringButton(true)}
            onMouseLeave={() => setIsHoveringButton(false)}
            className={`bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 text-white hover:scale-105 active:scale-95 ${getResponsiveValue('p-2', 'p-3', 'p-3')}`}
            aria-label="Settings"
          >
            <span className={getResponsiveValue('text-lg', 'text-xl', 'text-xl')}>⚙️</span>
          </button>
        </div>

        <div className={`grid gap-6 ${useStackedLayout ? 'grid-cols-1' : getResponsiveValue('grid-cols-1', 'lg:grid-cols-3', 'lg:grid-cols-4')}`}>
          
          {/* Left Panel - Game Stats */}
          <div className={useStackedLayout ? 'order-2' : 'lg:col-span-1'}>
            <ModernGamePanel variant="neumorph" blur="lg" glow={false} className="p-4 mb-4">
              <GameStatsCard
                title="📊 Game Stats"
                stats={[
                  {
                    label: 'Divine Score',
                    value: gameState.score,
                    icon: '🏆',
                    color: 'text-yellow-400',
                    highlight: gameState.lastMoveScore > 0,
                    trend: gameState.lastMoveScore > 0 ? 'up' : 'neutral'
                  },
                  {
                    label: 'Divine Realm',
                    value: gameState.level,
                    icon: '⚡',
                    color: 'text-purple-400'
                  },
                  {
                    label: 'Target Score',
                    value: gameState.targetScore,
                    icon: '🎯',
                    color: 'text-blue-400'
                  },
                  {
                    label: 'Moves',
                    value: gameState.moves,
                    icon: '🔄',
                    color: 'text-green-400'
                  },
                  ...(gameState.comboMultiplier > 1 ? [{
                    label: 'Rush Multiplier',
                    value: `${gameState.comboMultiplier.toFixed(1)}x`,
                    icon: '🔥',
                    color: 'text-orange-400',
                    highlight: true
                  }] : []),
                  ...(gameState.timeRemaining !== undefined && gameState.timeRemaining > 0 ? [{
                    label: 'Time',
                    value: formatTime(gameState.timeRemaining),
                    icon: '⏰',
                    color: gameState.timeRemaining <= 10 ? 'text-red-400' : 
                           gameState.timeRemaining <= 30 ? 'text-yellow-400' : 'text-green-400'
                  }] : [])
                ]}
                progress={{
                  label: 'Progress to Next Level',
                  current: gameState.score,
                  target: gameState.targetScore,
                  showPercentage: true
                }}
                className="bg-transparent border-none shadow-none"
              />
            </ModernGamePanel>

            {/* Controls */}
            <ModernGamePanel variant="floating" blur="md" glow={false} className="p-4">
              <h3 className={`font-semibold text-white mb-4 ${getResponsiveValue('text-base', 'text-lg', 'text-lg')}`}>🎮 Controls</h3>
              <div className="space-y-2">
                <RestartButton
                  onClick={onRestart}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="w-full"
                  size={getButtonSize()}
                >
                  Restart Game
                </RestartButton>
                
                <PauseButton
                  isPaused={gameState.gameStatus === 'paused'}
                  onClick={onPause}
                  disabled={gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'paused'}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="w-full"
                  size={getButtonSize()}
                >
                  {gameState.gameStatus === 'paused' ? 'Resume' : 'Pause'}
                </PauseButton>
                
                <HintButton
                  onClick={onShowHint}
                  disabled={gameState.gameStatus !== 'playing'}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="w-full"
                  size={getButtonSize()}
                >
                  Show Hint
                </HintButton>
              </div>
            </ModernGamePanel>
          </div>

          {/* Center Panel - Game Board */}
          <div className={`${useStackedLayout ? 'order-1' : 'lg:col-span-2'}`}>
            <Modern3DBoard
              size={{ width: boardSize.size, height: boardSize.size }}
              enableParticles={!reduceAnimations}
              enable3D={isHighPerformance && !reduceAnimations}
            >
              <div 
                ref={boardRef}
                className="grid gap-1 h-full w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gameState.boardSize}, minmax(0, 1fr))`
                }}
              >
                {gameState.board.map((row, rowIndex) =>
                  row.map((gem, colIndex) => (
                    renderGemWithEffects(gem, rowIndex, colIndex))
                  )
                )}
              </div>

              {/* Floating Scores */}
              <AnimatePresence>
                {floatingScores.map((score) => (
                  <motion.div
                    key={score.id}
                    className="absolute pointer-events-none z-10 text-yellow-400 font-bold text-lg"
                    style={{
                      left: score.x,
                      top: score.y
                    }}
                    {...getAnimationConfig({
                      initial: { opacity: 1, scale: 1, y: 0 },
                      animate: { opacity: 0, scale: 1.5, y: -50 },
                      exit: { opacity: 0 },
                      transition: { duration: 1.5 }
                    })}
                  >
                    +{formatNumber(score.points)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </Modern3DBoard>

            {/* Progress Bar */}
            <div className="mt-4">
              <EnhancedProgress
                value={gameState.score}
                max={gameState.targetScore}
                label="Progress to Next Level"
                showPercentage={true}
                showValues={true}
                variant={gameState.score >= gameState.targetScore ? 'success' : 'default'}
                animated={!reduceAnimations}
                glowing={gameState.score >= gameState.targetScore}
              />
            </div>
          </div>

          {/* Right Panel - Tips */}
          <div className={`${useStackedLayout ? 'order-3' : 'lg:col-span-1'}`}>
            {/* Game Tips */}
            {!showCompactUI && (
              <ModernGamePanel variant="gradient" blur="lg" glow={false} className="p-4">
                <h3 className={`font-semibold text-white mb-4 ${getResponsiveValue('text-base', 'text-lg', 'text-lg')}`}>💡 Match-3 Tips</h3>
                <div className="space-y-2 text-purple-200 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Click a gem, then click an adjacent gem to swap them</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Create lines of 3+ identical gems horizontally or vertically</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Swaps only work if they create a 3+ match</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Longer matches give more points (4+=150, 5+=300, 6+=500)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Chain reactions create cascades for bonus points</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Look for moves that set up future cascades</span>
                  </div>
                </div>
              </ModernGamePanel>
            )}
          </div>
        </div>

        {/* Game Status Overlays */}
        <AnimatePresence>
          {gameState.gameStatus === 'completed' && (
            <motion.div
              {...getAnimationConfig({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
              })}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                {...getAnimationConfig({
                  initial: { scale: 0.5, opacity: 0 },
                  animate: { scale: 1, opacity: 1 }
                })}
                className="bg-white/20 backdrop-blur-md rounded-lg p-8 text-center border border-green-500"
              >
                <motion.div 
                  className="text-6xl mb-4"
                  {...getAnimationConfig({
                    animate: { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    },
                    transition: { 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  })}
                >
                  🎉
                </motion.div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">Level Complete!</h2>
                <div className="text-white space-y-2">
                  <p>Score: <span className="font-bold text-yellow-400">{formatNumber(gameState.score)}</span></p>
                  <p>Moves: <span className="font-bold text-blue-400">{gameState.moves}</span></p>
                  <p>Level: <span className="font-bold text-purple-400">{gameState.level}</span></p>
                </div>
                <NextLevelButton
                  onClick={onNextLevel}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className="mt-6"
                  size={getButtonSize()}
                >
                  Next Level
                </NextLevelButton>
              </motion.div>
            </motion.div>
          )}

          {gameState.gameStatus === 'failed' && (
            <motion.div
              {...getAnimationConfig({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
              })}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                {...getAnimationConfig({
                  initial: { scale: 0.5, opacity: 0 },
                  animate: { scale: 1, opacity: 1 }
                })}
                className="bg-white/20 backdrop-blur-md rounded-lg p-8 text-center border border-red-500"
              >
                <div className="text-6xl mb-4">💔</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over</h2>
                <div className="text-white space-y-2">
                  <p>Final Score: <span className="font-bold">{formatNumber(gameState.score)}</span></p>
                  <p>Moves Used: <span className="font-bold">{gameState.moves}</span></p>
                  <p>Level Reached: <span className="font-bold">{gameState.level}</span></p>
                </div>
                <button
                  onClick={onRestart}
                  className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            </motion.div>
          )}

          {gameState.gameStatus === 'paused' && (
            <motion.div
              {...getAnimationConfig({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
              })}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                {...getAnimationConfig({
                  initial: { scale: 0.5, opacity: 0 },
                  animate: { scale: 1, opacity: 1 }
                })}
                className="bg-white/20 backdrop-blur-md rounded-lg p-8 text-center"
              >
                <div className="text-6xl mb-4">⏸️</div>
                <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
                <button
                  onClick={onPause}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Resume Game
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance indicator in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
            <div>FPS: {isHighPerformance ? '✅' : '⚠️'}</div>
            <div>Screen: {screenSize.width}x{screenSize.height}</div>
            <div>Device: {screenSize.isMobile ? 'Mobile' : screenSize.isTablet ? 'Tablet' : 'Desktop'}</div>
          </div>
        )}
      </div>
    </div>
  )
}