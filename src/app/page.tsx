'use client'

import { useState, useEffect } from 'react'
import { GameEngine } from '@/lib/game/GameEngine'
import { GameState } from '@/types/game'
import { settingsManager } from '@/lib/settings/SettingsManager'
import MainMenu from '@/components/ui/MainMenu'
import GameInterface from '@/components/game/GameInterface'
import SettingsModal from '@/components/ui/SettingsModal'
import StatisticsModal from '@/components/ui/StatisticsModal'
import { GameGuideModal, CreditsModal } from '@/components/ui/Modal'

type AppState = 'menu' | 'game' | 'loading'
type ModalState = 'settings' | 'guide' | 'credits' | 'statistics' | 'campaign' | null

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [modalState, setModalState] = useState<ModalState>(null)
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentStage, setCurrentStage] = useState(1)
  const [, setSelectedMode] = useState<string>('normal')
  const [settingsInitialized, setSettingsInitialized] = useState(false)

  useEffect(() => {
    // Initialize the app and settings
    const initializeApp = async () => {
      try {
        // Initialize settings manager first
        await settingsManager.initialize()
        setSettingsInitialized(true)
        
        // Listen for settings events
        settingsManager.on('settings:error', (error: any) => {
          console.warn('Settings error:', error)
        })
        
        // Simulate initial loading
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAppState('menu')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        // Continue even if settings fail
        setAppState('menu')
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      if (gameEngine) {
        gameEngine.cleanup()
      }
      settingsManager.destroy()
    }
  }, [])

  const initializeGame = async (mode: string) => {
    try {
      setAppState('loading')
      
      const engine = new GameEngine({
        gameMode: mode as 'normal' | 'timeAttack' | 'dailyChallenge' | 'campaign'
      })
      
      // Listen to game state changes
      engine.on('stateChanged', (newState: GameState) => {
        setGameState(newState)
      })
      
      engine.on('initialized', (initialState: GameState) => {
        setGameState(initialState)
        setAppState('game')
      })

      engine.on('levelComplete', (data: { level: number; score: number; moves: number }) => {
        console.log('Level complete:', data)
        setCurrentStage(data.level + 1)
      })

      engine.on('nextLevel', (data: { level: number; targetScore: number }) => {
        console.log('Next level started:', data)
        setCurrentStage(data.level)
      })
      
      // Initialize the game
      await engine.initialize()
      setGameEngine(engine)
      setSelectedMode(mode)
    } catch (error) {
      console.error('Failed to initialize game:', error)
      setAppState('menu')
    }
  }

  const handleModeSelect = (mode: string) => {
    initializeGame(mode)
  }

  const handleShowMenu = () => {
    if (gameEngine) {
      gameEngine.cleanup()
      setGameEngine(null)
      setGameState(null)
    }
    setAppState('menu')
  }

  const handleGemClick = (row: number, col: number) => {
    if (gameEngine) {
      gameEngine.selectGem(row, col)
    }
  }

  const handleRestart = () => {
    if (gameEngine) {
      gameEngine.reset()
    }
  }

  const handleNextLevel = () => {
    if (gameEngine) {
      gameEngine.nextLevel()
    }
  }

  const handlePause = () => {
    if (gameEngine) {
      if (gameState?.gameStatus === 'paused') {
        gameEngine.resume()
      } else {
        gameEngine.pause()
      }
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
          onShowCampaign={() => setModalState('campaign')}
          currentStage={currentStage}
        />
        
        {/* Modals */}
        <SettingsModal isOpen={modalState === 'settings'} onClose={closeModal} />
        <StatisticsModal isOpen={modalState === 'statistics'} onClose={closeModal} />
        <GameGuideModal isOpen={modalState === 'guide'} onClose={closeModal} />
        <CreditsModal isOpen={modalState === 'credits'} onClose={closeModal} />
        
        {/* Campaign Modal - For now, show a placeholder */}
        {modalState === 'campaign' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🏅</div>
              <h2 className="text-2xl font-bold text-white mb-4">Campaign Mode</h2>
              <p className="text-purple-300 mb-6">
                Embark on an epic journey through divine realms! Complete levels, earn stars, and unlock new worlds in this exciting campaign progression system.
              </p>
              <div className="space-y-3 text-left mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-white">Earn up to 3 stars per level</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🌍</span>
                  <span className="text-white">Unlock 7 divine worlds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">🎯</span>
                  <span className="text-white">35 unique levels with objectives</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">💎</span>
                  <span className="text-white">Earn essence and rewards</span>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleModeSelect('campaign')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Start Campaign
                </button>
                <button
                  onClick={closeModal}
                  className="w-full py-2 px-4 text-gray-300 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Game interface
  if (appState === 'game' && gameState) {
    return (
      <>
        <GameInterface
          gameState={gameState}
          onGemClick={handleGemClick}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onPause={handlePause}
          onShowMenu={handleShowMenu}
          onShowSettings={() => setModalState('settings')}
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