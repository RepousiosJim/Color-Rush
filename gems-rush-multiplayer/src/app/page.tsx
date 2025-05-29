'use client'

import { useState, useEffect, useRef } from 'react'
import { GameEngine } from '@/lib/game/GameEngine'
import { GameState } from '@/types/game'
import { settingsManager } from '@/lib/settings/SettingsManager'
import MainMenu from '@/components/ui/MainMenu'
import GameInterface from '@/components/game/GameInterface'
import SettingsModal from '@/components/ui/SettingsModal'
import StatisticsModal from '@/components/ui/StatisticsModal'
import { GameGuideModal, CreditsModal } from '@/components/ui/Modal'

type AppState = 'menu' | 'game' | 'loading'
type ModalState = 'settings' | 'guide' | 'credits' | 'statistics' | null

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [settingsInitialized, setSettingsInitialized] = useState(false)
  const [currentStage] = useState(1)
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [currentHint, setCurrentHint] = useState<{ from: { row: number; col: number }; to: { row: number; col: number } } | null>(null)
  
  // Use ref for cleanup to avoid dependency issues
  const gameEngineRef = useRef<GameEngine | null>(null)
  const eventListenersSetup = useRef(false)

  // Set up game engine event listeners (once only)
  const setupGameEngineListeners = (engine: GameEngine) => {
    if (eventListenersSetup.current) {
      return // Already set up
    }
    
    eventListenersSetup.current = true
    
    // Set up event listeners for real-time updates
    engine.on('game:move-made', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('game:board-changed', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('game:score-updated', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('game:level-completed', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('gemSelected', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('gemDeselected', () => {
      setGameState(engine.getGameState())
    })
    
    engine.on('hint:show', (hintMove) => {
      setCurrentHint(hintMove)
      // Clear hint after 3 seconds
      setTimeout(() => {
        setCurrentHint(null)
      }, 3000)
    })
  }

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🎮 Initializing Gems Rush...')
        
        // Initialize settings manager
        await settingsManager.initialize()
        setSettingsInitialized(true)
        
        // Initialize game engine
        const engine = new GameEngine()
        const success = await engine.initialize()
        
        if (success) {
          gameEngineRef.current = engine
          setGameEngine(engine)
          setGameState(engine.getGameState())
          
          // Set up event listeners only once
          setupGameEngineListeners(engine)
          
          console.log('✅ Game initialized successfully')
        } else {
          console.error('❌ Failed to initialize game')
        }
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500))
        setAppState('menu')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setAppState('menu')
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.cleanup()
      }
      settingsManager.destroy()
      eventListenersSetup.current = false
    }
  }, []) // Empty dependency array - run only once on mount

  const initializeGame = async (mode: string) => {
    setAppState('loading')
    
    try {
      if (!gameEngineRef.current) {
        const engine = new GameEngine()
        const success = await engine.initialize()
        
        if (success) {
          gameEngineRef.current = engine
          setGameEngine(engine)
          setGameState(engine.getGameState())
          
          // Set up event listeners only once
          setupGameEngineListeners(engine)
        } else {
          throw new Error('Failed to initialize game engine')
        }
      }
      
      // Apply game mode settings
      console.log(`Starting game in ${mode} mode`)
      setAppState('game')
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setAppState('menu')
    }
  }

  const handleModeSelect = (mode: string) => {
    initializeGame(mode)
  }

  const handleShowMenu = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.cleanup()
      gameEngineRef.current = null
    }
    setGameEngine(null)
    setGameState(null)
    setCurrentHint(null)
    eventListenersSetup.current = false // Reset event listeners flag
    setAppState('menu')
  }

  const handleRestart = () => {
    if (gameEngine) {
      gameEngine.reset()
      setGameState(gameEngine.getGameState())
    }
  }

  const handleNextLevel = () => {
    if (gameEngine) {
      gameEngine.nextLevel()
      setGameState(gameEngine.getGameState())
    }
  }

  const handlePause = () => {
    if (gameEngine) {
      if (gameState?.gameStatus === 'paused') {
        gameEngine.resume()
      } else {
        gameEngine.pause()
      }
      setGameState(gameEngine.getGameState())
    }
  }

  const handleShowHint = () => {
    if (gameEngine) {
      const result = gameEngine.showHint()
      console.log('Hint result:', result)
    }
  }

  const closeModal = () => {
    setModalState(null)
  }

  // Loading screen
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <div className="text-white text-xl font-semibold">Loading Gems Rush...</div>
          <div className="text-purple-300 text-sm mt-2">
            {settingsInitialized ? 'Preparing divine experience' : 'Initializing settings...'}
          </div>
          
          {/* Loading progress */}
          <div className="mt-4 w-64 mx-auto">
            <div className="bg-purple-800/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: settingsInitialized ? '100%' : '50%' }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main menu
  if (appState === 'menu') {
    return (
      <>
        <MainMenu
          onModeSelect={handleModeSelect}
          onShowSettings={() => setModalState('settings')}
          onShowGuide={() => setModalState('guide')}
          onShowCredits={() => setModalState('credits')}
          onShowStats={() => setModalState('statistics')}
          currentStage={currentStage}
        />
        
        {/* Modals */}
        <SettingsModal isOpen={modalState === 'settings'} onClose={closeModal} />
        <StatisticsModal isOpen={modalState === 'statistics'} onClose={closeModal} />
        <GameGuideModal isOpen={modalState === 'guide'} onClose={closeModal} />
        <CreditsModal isOpen={modalState === 'credits'} onClose={closeModal} />
      </>
    )
  }

  // Game interface
  if (appState === 'game' && gameState) {
    return (
      <>
        <GameInterface
          gameState={gameState}
          onMove={(fromRow, fromCol, _toRow, _toCol) => {
            if (gameEngine && gameState?.gameStatus === 'playing' && !gameState?.isAnimating) {
              const success = gameEngine.selectGem(fromRow, fromCol)
              if (success) {
                setGameState(gameEngine.getGameState())
              }
            }
          }}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onPause={handlePause}
          onShowMenu={handleShowMenu}
          onShowSettings={() => setModalState('settings')}
          onShowHint={handleShowHint}
          currentHint={currentHint}
          disabled={gameState.gameStatus !== 'playing' || gameState.isAnimating}
        />
        
        {/* Modals available during game */}
        <SettingsModal isOpen={modalState === 'settings'} onClose={closeModal} />
      </>
    )
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">❌</div>
        <div className="text-white text-xl">Failed to load game</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          Reload Game
        </button>
      </div>
    </div>
  )
}
