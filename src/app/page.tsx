'use client'

import React, { useState, useEffect, useRef } from 'react'
import { GameEngine } from '@/lib/game/GameEngine'
import { GameState } from '@/types/game'
import { settingsManager } from '@/lib/settings/SettingsManager'
import { energyManager } from '@/lib/game/EnergySystem'
import { dynamicContentManager } from '@/lib/game/DynamicContentSystem'
import { tutorialManager } from '@/lib/game/ProgressiveTutorialSystem'
import { stageSystem } from '@/lib/game/StageSystem'
import { obstacleBlockManager } from '@/lib/game/ObstacleBlockManager'
import EnhancedMainMenu from '@/components/ui/EnhancedMainMenu'
import UserOnboarding from '@/components/ui/UserOnboarding'
import QuickAccessToolbar from '@/components/ui/QuickAccessToolbar'
import UserDashboard from '@/components/ui/UserDashboard'
import EnergyDisplay from '@/components/ui/EnergyDisplay'
import DailyEventBanner from '@/components/ui/DailyEventBanner'
import GameInterface from '@/components/game/GameInterface'
import StageSelectScreen from '@/components/ui/StageSelectScreen'
import SettingsModal from '@/components/ui/SettingsModal'
import StatisticsModal from '@/components/ui/StatisticsModal'
import { GameGuideModal, CreditsModal } from '@/components/ui/Modal'

type AppState = 'menu' | 'game' | 'loading' | 'stageSelect'
type ModalState = 'settings' | 'guide' | 'credits' | 'statistics' | 'dashboard' | null

interface UserStatsType {
  level: number
  xp: number
  coins: number
  gems: number
  streak: number
  gamesPlayed: number
  totalScore: number
  averageScore: number
  bestScore: number
  dailyChallengeCompleted: boolean
  achievements: Array<{
    id: string
    name: string
    description: string
    icon: string
    rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
    unlockedAt?: Date
  }>
  favoriteMode: string
  totalPlayTime: number
  // Energy System
  energy: number
  maxEnergy: number
  lastEnergyUpdate: number // timestamp
  energyRegenRate: number // minutes per energy point
  // Dynamic Content
  lastDailyEventCheck: number
  currentDailyEvent: {
    type: string
    name: string
    description: string
    multiplier?: number
    bonus?: number
    endTime: number
  } | null
  // Progressive Tutorial
  tutorialProgress: {
    currentStep: number
    completedSteps: string[]
    isActive: boolean
    skipped: boolean
    lastStepTime: number
  }
}

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentStage, setCurrentStage] = useState(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userStats, setUserStats] = useState<UserStatsType>({
    level: 1,
    xp: 0,
    coins: 100,
    gems: 10,
    streak: 0,
    gamesPlayed: 0,
    totalScore: 0,
    averageScore: 0,
    bestScore: 0,
    dailyChallengeCompleted: false,
    achievements: [],
    favoriteMode: 'Classic',
    totalPlayTime: 0,
    energy: 100,
    maxEnergy: 100,
    lastEnergyUpdate: 0,
    energyRegenRate: 1,
    lastDailyEventCheck: 0,
    currentDailyEvent: null,
    tutorialProgress: {
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      skipped: false,
      lastStepTime: Date.now()
    }
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const gameEngineRef = useRef<GameEngine | null>(null)

  // Add hint state management
  const [currentHint, setCurrentHint] = useState<{ from: { row: number; col: number }; to: { row: number; col: number } } | null>(null)
  const [hintTimeout, setHintTimeout] = useState<NodeJS.Timeout | null>(null)

  // Debug win condition test (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const handleDebugWin = () => {
        if (gameState && gameState.gameStatus === 'playing') {
          console.log('🧪 Debug: Manually triggering win condition')
          setGameState(prev => {
            if (!prev) return null
            return {
              ...prev,
              score: prev.targetScore, // Set score to exactly target score
              gameStatus: 'completed'
            }
          })
        }
      }

      window.addEventListener('debug-win-test', handleDebugWin)
      return () => {
        window.removeEventListener('debug-win-test', handleDebugWin)
      }
    }
  }, [gameState])

  // Initialize the app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize settings manager
        await settingsManager.initialize()
        
        // Load user stats from localStorage
        const savedStats = localStorage.getItem('gems-rush-user-stats')
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats)
          
          // Update energy based on time passed
          const energyStatus = energyManager.getEnergyStatus(
            parsedStats.energy || 100,
            parsedStats.lastEnergyUpdate || Date.now(),
            parsedStats.maxEnergy || 100
          )
          
          // Check for new daily events
          const currentEvent = dynamicContentManager.getCurrentDailyEvent()
          
          // Ensure tutorialProgress has proper defaults
          const defaultTutorialProgress = {
            currentStep: 1,
            completedSteps: [],
            isActive: true,
            skipped: false,
            lastStepTime: Date.now()
          }
          
          // Update stats with current energy and event
          const updatedStats = {
            ...parsedStats,
            energy: energyStatus.currentEnergy,
            lastEnergyUpdate: Date.now(),
            currentDailyEvent: currentEvent,
            lastDailyEventCheck: Date.now(),
            // Ensure tutorialProgress is properly initialized
            tutorialProgress: parsedStats.tutorialProgress || defaultTutorialProgress
          }
          
          setUserStats(updatedStats)
        }

        // Check if user has played before
        const hasPlayed = localStorage.getItem('gems-rush-has-played')
        if (!hasPlayed) {
          setShowOnboarding(true)
        }

        // Load sound preference
        const soundPref = localStorage.getItem('gems-rush-sound-enabled')
        if (soundPref !== null) {
          setSoundEnabled(JSON.parse(soundPref))
        }

        setIsInitialized(true)
        setAppState('menu')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setAppState('menu') // Fallback to menu even if initialization fails
      }
    }

    initializeApp()
  }, [])

  // Energy regeneration timer
  useEffect(() => {
    if (!isInitialized) return

    const energyTimer = setInterval(() => {
      setUserStats(prev => {
        const energyStatus = energyManager.getEnergyStatus(
          prev.energy,
          prev.lastEnergyUpdate,
          prev.maxEnergy
        )
        
        if (energyStatus.currentEnergy !== prev.energy) {
          return {
            ...prev,
            energy: energyStatus.currentEnergy,
            lastEnergyUpdate: Date.now()
          }
        }
        
        return prev
      })
    }, 60000) // Update every minute

    return () => clearInterval(energyTimer)
  }, [isInitialized])

  // Save user stats when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('gems-rush-user-stats', JSON.stringify(userStats))
    }
  }, [userStats, isInitialized])

  // Save sound preference when it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('gems-rush-sound-enabled', JSON.stringify(soundEnabled))
    }
  }, [soundEnabled, isInitialized])

  const setupGameEngineListeners = (engine: GameEngine) => {
    engine.on('game:score-updated', (score: number) => {
      if (gameState) {
        const newGameState = { ...gameState, score }
        setGameState(newGameState)
      }
    })

    engine.on('game:level-completed', (level: number) => {
      if (gameState) {
        const newGameState = { ...gameState, level }
        setGameState(newGameState)
        setCurrentStage(level)
        
        // Update user XP and level
        setUserStats(prev => ({
          ...prev,
          level: Math.max(prev.level, level),
          xp: prev.xp + (level * 100)
        }))
      }
    })

    engine.on('game:game-over', () => {
      if (gameState) {
        const newGameState = { ...gameState, gameStatus: 'failed' as const }
        setGameState(newGameState)
        
        // Base rewards based on performance
        const baseCoinsEarned = Math.floor(gameState.score / 100)
        const baseXP = gameState.score
        
        // Apply dynamic content modifiers
        const modifiedRewards = dynamicContentManager.applyEventModifiers(
          { coins: baseCoinsEarned, xp: baseXP },
          userStats.currentDailyEvent || null
        )
        
        // Update user stats with modified rewards
        setUserStats(prev => {
          const updatedStats = {
            ...prev,
            coins: prev.coins + (modifiedRewards.coins || 0),
            xp: prev.xp + (modifiedRewards.xp || 0),
            totalScore: prev.totalScore + gameState.score,
            averageScore: Math.floor((prev.totalScore + gameState.score) / prev.gamesPlayed),
            bestScore: Math.max(prev.bestScore, gameState.score)
          }
          
          // Check for tutorial step completion
          if (gameState.score > 5000 && prev.tutorialProgress && !prev.tutorialProgress.completedSteps.includes('first_match')) {
            const updatedProgress = tutorialManager.completeStep('first_match', prev.tutorialProgress)
            updatedStats.tutorialProgress = updatedProgress
          }
          
          return updatedStats
        })
      }
    })

    // Enhanced power-up system listeners
    engine.on('game:powerup-created', (powerUpGem: { powerUpType: string; row: number; col: number }) => {
      console.log(`⚡ Power-up created: ${powerUpGem.powerUpType} at (${powerUpGem.row}, ${powerUpGem.col})`)
      // Could show special effects or notifications here
    })

    engine.on('game:powerup-activated', (powerUpGem: { powerUpType: string }, effects: { affectedGems: unknown[] }) => {
      console.log(`💥 Power-up activated: ${powerUpGem.powerUpType}, affected ${effects.affectedGems.length} gems`)
      // Could show dramatic visual effects here
    })

    // Enhanced hint system listeners with visual highlighting
    engine.on('hint:show', (hintMove: { from: { row: number; col: number }; to: { row: number; col: number }; score: number; matchCount: number }) => {
      console.log(`💡 Hint: Try swapping (${hintMove.from.row}, ${hintMove.from.col}) with (${hintMove.to.row}, ${hintMove.to.col})`)
      console.log(`💰 Potential score: ${hintMove.score}, Match count: ${hintMove.matchCount}`)
      
      // Set the hint for visual highlighting
      setCurrentHint({
        from: { row: hintMove.from.row, col: hintMove.from.col },
        to: { row: hintMove.to.row, col: hintMove.to.col }
      })
      
      // Clear hint after 5 seconds
      if (hintTimeout) {
        clearTimeout(hintTimeout)
      }
      const timeout = setTimeout(() => {
        setCurrentHint(null)
      }, 5000)
      setHintTimeout(timeout)
    })

    engine.on('hint:hide', () => {
      console.log('💡 Hiding hint')
      setCurrentHint(null)
      if (hintTimeout) {
        clearTimeout(hintTimeout)
        setHintTimeout(null)
      }
    })

    // Board management listeners
    engine.on('board:no-moves', () => {
      console.log('🔄 No moves available - preparing for reshuffle')
      // Could show "Reshuffling..." message
    })

    engine.on('board:reshuffled', () => {
      console.log('🔄 Board reshuffled - new moves available!')
      // Could show "New moves available!" message
    })

    engine.on('game:error', (error: Error) => {
      console.error('🎮 Game Engine Error:', error)
    })
  }

  const initializeGame = async (mode: string) => {
    try {
      // Check if player has enough energy
      const energyStatus = energyManager.getEnergyStatus(
        userStats.energy,
        userStats.lastEnergyUpdate,
        userStats.maxEnergy
      )
      
      if (!energyStatus.canPlayGame) {
        // Show energy insufficient modal or offer refill
        console.warn('⚡ Not enough energy to play!', energyStatus)
        return
      }

      setAppState('loading')
      
      if (gameEngineRef.current) {
        gameEngineRef.current.removeAllListeners()
      }

      const engine = new GameEngine()
      await engine.initialize()
      
      setupGameEngineListeners(engine)
      
      // Consume energy for starting the game
      const newEnergy = energyManager.consumeEnergy(energyStatus.currentEnergy, 'game')
      
      // Update user stats with energy consumption
      setUserStats(prev => ({
        ...prev,
        energy: newEnergy,
        lastEnergyUpdate: Date.now(),
        gamesPlayed: prev.gamesPlayed + 1
      }))
      
      // Check for tutorial progression
      const nextTutorialStep = tutorialManager.getNextStep(
        userStats.tutorialProgress,
        {
          level: userStats.level,
          gamesPlayed: userStats.gamesPlayed + 1,
          achievements: userStats.achievements
        }
      )
      
      if (nextTutorialStep && nextTutorialStep.trigger === 'auto') {
        console.log('🎓 Tutorial step available:', nextTutorialStep.title)
        // Could trigger tutorial modal here
      }
      
      const initialGameState: GameState = {
        board: engine.getGameState().board,
        obstacleBlocks: [], // Initialize empty, will be populated for stage mode
        boardSize: 8,
        score: 0,
        level: 1,
        moves: 0,
        timeRemaining: mode === 'timeAttack' ? 60 : undefined,
        selectedGem: null,
        gameMode: mode as 'normal' | 'timeAttack' | 'dailyChallenge' | 'campaign' | 'stage',
        gameStatus: 'playing',
        isAnimating: false,
        matchesFound: [],
        isMultiplayer: false,
        players: [],
        powerUps: [],
        comboMultiplier: 1,
        lastMoveScore: 0,
        targetScore: 1000,
        currentStage: mode === 'stage' ? currentStage : undefined,
        blocksDestroyed: 0
      }

      // Generate obstacle blocks for stage mode
      if (mode === 'stage') {
        const currentStageData = stageSystem.getStage(currentStage)
        if (currentStageData) {
          const obstacles = obstacleBlockManager.generateObstacleBlocks(
            currentStage,
            initialGameState.boardSize,
            initialGameState.board
          )
          initialGameState.obstacleBlocks = obstacles
          initialGameState.targetScore = currentStageData.targetScore
          
          console.log(`🎮 Stage ${currentStage}: ${currentStageData.name}`)
          console.log(`🎯 Target: ${currentStageData.targetScore} | Max Moves: ${currentStageData.maxMoves} | Blocks to Break: ${currentStageData.blocksToBreak}`)
        }
      }

      setGameEngine(engine)
      setGameState(initialGameState)
      gameEngineRef.current = engine
      setAppState('game')
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setAppState('menu')
    }
  }

  const handleModeSelect = (mode: string) => {
    if (mode === 'stage') {
      setAppState('stageSelect')
    } else {
    initializeGame(mode)
    }
  }

  const handleStageSelect = (stageNumber: number) => {
    if (stageSystem.isStageUnlocked(stageNumber)) {
      setCurrentStage(stageNumber)
      stageSystem.setCurrentStage(stageNumber)
      initializeGame('stage')
    } else {
      console.warn(`Stage ${stageNumber} is not unlocked yet!`)
    }
  }

  const handleShowMenu = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.removeAllListeners()
      gameEngineRef.current = null
    }
      setGameEngine(null)
      setGameState(null)
    setAppState('menu')
  }

  const handleRestart = () => {
    if (gameState) {
      initializeGame(gameState.gameMode)
    }
  }

  const handleNextLevel = () => {
    const nextStage = currentStage + 1
    setCurrentStage(nextStage)
    
    // Calculate and apply level completion rewards
    if (gameState) {
      const levelRewards = {
        coins: Math.floor(gameState.score / 10),
        gems: Math.floor(gameState.score / 100),
        xp: Math.floor(gameState.score / 5),
        energy: 1 // Bonus energy for completing level
      }
      
      // Apply rewards to user stats
      setUserStats(prev => ({
        ...prev,
        coins: prev.coins + levelRewards.coins,
        gems: prev.gems + levelRewards.gems,
        xp: prev.xp + levelRewards.xp,
        energy: Math.min(prev.energy + levelRewards.energy, prev.maxEnergy),
        gamesPlayed: prev.gamesPlayed + 1,
        totalScore: prev.totalScore + gameState.score
      }))
      
      console.log('🏆 Level completed! Rewards given:', levelRewards)
      
      // Initialize next level
      initializeGame(gameState.gameMode)
    }
  }

  const handleLevelComplete = () => {
    // This function can be called when level is completed to give immediate rewards
    if (gameState) {
      const levelRewards = {
        coins: Math.floor(gameState.score / 10),
        gems: Math.max(1, Math.floor(gameState.score / 100)),
        xp: Math.floor(gameState.score / 5),
        energy: 1
      }
      
      // Update user stats with rewards
      setUserStats(prev => ({
        ...prev,
        coins: prev.coins + levelRewards.coins,
        gems: prev.gems + levelRewards.gems,
        xp: prev.xp + levelRewards.xp,
        energy: Math.min(prev.energy + levelRewards.energy, prev.maxEnergy),
        gamesPlayed: prev.gamesPlayed + 1,
        bestScore: Math.max(prev.bestScore, gameState.score),
        totalScore: prev.totalScore + gameState.score,
        averageScore: Math.floor((prev.totalScore + gameState.score) / (prev.gamesPlayed + 1))
      }))
      
      return levelRewards
    }
    return { coins: 0, gems: 0, xp: 0, energy: 0 }
  }

  const handlePause = () => {
    if (gameState && gameEngine) {
      const newStatus: 'playing' | 'paused' = gameState.gameStatus === 'paused' ? 'playing' : 'paused'
      const newGameState = { ...gameState, gameStatus: newStatus }
      setGameState(newGameState)
    }
  }

  const handleShowHint = () => {
    if (gameEngine) {
      const hintResult = gameEngine.showHint()
      if (hintResult.success) {
        console.log('🔍 Showing hint:', hintResult.message)
        // UI will automatically receive the hint via the event listener
      } else {
        console.warn('⚠️ Cannot show hint:', hintResult.message)
      }
    } else {
      console.log('🔍 No game engine available for hints')
    }
  }

  // Clear hint when player makes a move
  const handleMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    // Clear current hint when player makes a move
    if (currentHint) {
      setCurrentHint(null)
      if (hintTimeout) {
        clearTimeout(hintTimeout)
        setHintTimeout(null)
      }
    }

    if (gameEngine && gameState && gameState.gameStatus === 'playing' && !gameState.isAnimating) {
      gameEngine.makeMove(fromRow, fromCol, toRow, toCol).then((result) => {
        if (result.valid) {
          setGameState(prevState => {
            if (!prevState) return null
            
            const newScore = prevState.score + result.scoreChange
            let newObstacleBlocks = [...prevState.obstacleBlocks]
            let blocksDestroyed = prevState.blocksDestroyed || 0
            
            // Check for obstacle block destruction when gems are matched
            if (result.matchesFound && result.matchesFound.length > 0) {
              const allMatchedGems = result.matchesFound.flat()
              const destructionResult = obstacleBlockManager.checkObstacleDestruction(
                allMatchedGems,
                newObstacleBlocks
              )
              
              newObstacleBlocks = destructionResult.remainingBlocks
              blocksDestroyed += destructionResult.destroyedBlocks.length
              
              if (destructionResult.destroyedBlocks.length > 0) {
                console.log(`💥 Destroyed ${destructionResult.destroyedBlocks.length} obstacle blocks!`)
              }
            }
            
            const newGameState = {
              ...prevState,
              board: result.newBoard,
              score: newScore,
              moves: prevState.moves + 1,
              matchesFound: result.matchesFound,
              comboMultiplier: result.comboCount > 0 ? result.comboCount : 1,
              lastMoveScore: result.scoreChange,
              obstacleBlocks: newObstacleBlocks,
              blocksDestroyed
            }
            
            // Check win condition based on game mode
            if (prevState.gameMode === 'stage' && prevState.currentStage) {
              const stageData = stageSystem.getStage(prevState.currentStage)
              if (stageData) {
                const scoreReached = newScore >= stageData.targetScore
                const blocksDestroyed_req = blocksDestroyed >= stageData.blocksToBreak
                const movesValid = newGameState.moves <= stageData.maxMoves
                
                if (scoreReached && blocksDestroyed_req && movesValid) {
                  console.log(`🏆 Stage ${prevState.currentStage} completed!`)
                  console.log(`📊 Score: ${newScore}/${stageData.targetScore} | Blocks: ${blocksDestroyed}/${stageData.blocksToBreak} | Moves: ${newGameState.moves}/${stageData.maxMoves}`)
                  newGameState.gameStatus = 'completed'
                  
                  // Complete the stage and get rewards
                  setTimeout(() => {
                    const completion = stageSystem.completeStage(
                      prevState.currentStage!,
                      newScore,
                      newGameState.moves,
                      blocksDestroyed
                    )
                    
                    if (completion.success) {
                      console.log(`⭐ Earned ${completion.stars} stars! Rewards:`, completion.rewards)
                      
                      // Update user stats with stage rewards
                      setUserStats(prev => ({
                        ...prev,
                        coins: prev.coins + completion.rewards.coins,
                        gems: prev.gems + completion.rewards.gems,
                        xp: prev.xp + completion.rewards.xp,
                        totalScore: prev.totalScore + newScore
                      }))
                      
                      if (completion.nextStageUnlocked) {
                        console.log(`🔓 Stage ${completion.nextStageUnlocked} unlocked!`)
                      }
                    }
                  }, 500)
                } else if (newGameState.moves >= stageData.maxMoves && !scoreReached) {
                  // Failed due to running out of moves
                  console.log(`💔 Stage failed - not enough score in time`)
                  newGameState.gameStatus = 'failed'
                }
              }
            } else {
              // Regular win condition for non-stage modes
              if (newScore >= prevState.targetScore) {
                console.log(`🏆 Level completed! Score: ${newScore} / Target: ${prevState.targetScore}`)
                newGameState.gameStatus = 'completed'
                
                // Call the level complete handler to award rewards
                setTimeout(() => {
                  handleLevelComplete()
                }, 500) // Small delay to let the UI update first
              }
            }
            
            return newGameState
          })
        }
      })
    }
  }

  const closeModal = () => {
    setModalState(null)
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('gems-rush-has-played', 'true')
    setShowOnboarding(false)
    // Start with normal mode for first-time users
    handleModeSelect('normal')
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem('gems-rush-has-played', 'true')
    setShowOnboarding(false)
  }

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const handleQuickPlay = () => {
    handleModeSelect('normal')
  }

  const handleShowDailyChallenge = () => {
    handleModeSelect('dailyChallenge')
  }

  const handleShowDashboard = () => {
    setModalState('dashboard')
  }

  const handleUpdateProfile = (updates: Partial<UserStatsType>) => {
    setUserStats(prev => ({ ...prev, ...updates }))
  }

  const handleRefillEnergy = () => {
    const REFILL_COST = 50 // gems
    
    if (userStats.gems >= REFILL_COST) {
      setUserStats(prev => ({
        ...prev,
        energy: prev.maxEnergy,
        gems: prev.gems - REFILL_COST,
        lastEnergyUpdate: Date.now()
      }))
      console.log('⚡ Energy refilled!')
    } else {
      console.warn('💎 Not enough gems to refill energy!')
      // Could show purchase gems modal here
    }
  }

  // Show loading screen
  if (!isInitialized || appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💎</div>
          <div className="text-white text-2xl font-bold mb-4">Gems Rush</div>
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // Game interface
  if (appState === 'game' && gameEngine && gameState) {
    return (
      <>
        <GameInterface
          gameState={gameState}
          onMove={handleMove}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onPause={handlePause}
          onShowMenu={handleShowMenu}
          onShowSettings={() => setModalState('settings')}
          onShowHint={handleShowHint}
          currentHint={currentHint}
        />
        
        {/* Game modals */}
        <SettingsModal isOpen={modalState === 'settings'} onClose={closeModal} />
        <StatisticsModal isOpen={modalState === 'statistics'} onClose={closeModal} />
      </>
    )
  }

  // Stage selection screen
  if (appState === 'stageSelect') {
    return (
      <StageSelectScreen
        onStageSelect={handleStageSelect}
        onBackToMenu={() => setAppState('menu')}
      />
    )
  }

  // Main menu
  if (appState === 'menu') {
    return (
      <>
        {/* Daily Event Banner */}
        <div className="fixed top-4 left-4 right-4 z-30">
          <DailyEventBanner 
            currentEvent={userStats.currentDailyEvent || null}
            onEventClick={() => console.log('Event clicked!')}
          />
        </div>

        {/* Energy Display */}
        <div className="fixed top-24 right-4 z-30 w-64">
          <EnergyDisplay
            energy={userStats.energy}
            maxEnergy={userStats.maxEnergy}
            lastEnergyUpdate={userStats.lastEnergyUpdate}
            onRefillEnergy={handleRefillEnergy}
          />
        </div>

        <EnhancedMainMenu
          onModeSelect={handleModeSelect}
          onShowSettings={() => setModalState('settings')}
          onShowGuide={() => setModalState('guide')}
          onShowCredits={() => setModalState('credits')}
          onShowStats={() => setModalState('statistics')}
          onShowDashboard={handleShowDashboard}
          currentStage={currentStage}
          userLevel={userStats.level}
          userXP={userStats.xp}
          userCoins={userStats.coins}
          userGems={userStats.gems}
          dailyChallengeCompleted={userStats.dailyChallengeCompleted}
          streak={userStats.streak}
        />

        {/* Quick access toolbar */}
        <QuickAccessToolbar
          onQuickPlay={handleQuickPlay}
          onShowLeaderboard={() => setModalState('statistics')}
          onShowDailyChallenge={handleShowDailyChallenge}
          onShowAchievements={() => setModalState('statistics')}
          onShowShop={() => console.log('Shop coming soon!')}
          onShowMultiplayer={() => console.log('Multiplayer coming soon!')}
          onShowSettings={() => setModalState('settings')}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          dailyChallengeAvailable={!userStats.dailyChallengeCompleted}
          newAchievements={0}
          isMultiplayerAvailable={false}
        />

        {/* User onboarding */}
        <UserOnboarding
          isVisible={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />

        {/* User Dashboard */}
        <UserDashboard
          isVisible={modalState === 'dashboard'}
          onClose={closeModal}
          userStats={userStats}
          onUpdateProfile={handleUpdateProfile}
        />
        
        {/* Modals */}
        <SettingsModal isOpen={modalState === 'settings'} onClose={closeModal} />
        <StatisticsModal isOpen={modalState === 'statistics'} onClose={closeModal} />
        <GameGuideModal isOpen={modalState === 'guide'} onClose={closeModal} />
        <CreditsModal isOpen={modalState === 'credits'} onClose={closeModal} />
      </>
    )
  }

  return null
} 