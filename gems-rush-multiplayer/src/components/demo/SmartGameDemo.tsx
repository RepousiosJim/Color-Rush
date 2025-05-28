'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Gem, GemType, GameState } from '@/types/game'
import { useSmartGameFeatures, useSmartGameDebug } from '@/lib/game/useSmartGameFeatures'

const SmartGameDemo: React.FC = () => {
  // Demo board state
  const [demoBoard, setDemoBoard] = useState<(Gem | null)[][]>(() => createDemoBoard())
  const [gameState, setGameState] = useState<GameState>(() => createDemoGameState(demoBoard))
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedGem, setSelectedGem] = useState<{ row: number; col: number } | null>(null)

  // Smart game features
  const smartGame = useSmartGameFeatures(gameState, {
    enableAutoAnalysis: true,
    enableSmartSpawning: true,
    enableProgressiveHints: true
  })

  // Debug information
  const debug = useSmartGameDebug()

  const demoRef = useRef<HTMLDivElement>(null)

  // Create initial demo board
  function createDemoBoard(): (Gem | null)[][] {
    const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
    const board: (Gem | null)[][] = []
    
    for (let row = 0; row < 8; row++) {
      board[row] = []
      for (let col = 0; col < 8; col++) {
        const type = gemTypes[Math.floor(Math.random() * gemTypes.length)]
        board[row][col] = {
          type,
          id: `${row}-${col}-${Date.now()}`,
          row,
          col
        }
      }
    }
    
    return board
  }

  function createDemoGameState(board: (Gem | null)[][]): GameState {
    return {
      board,
      boardSize: 8,
      score: 0,
      level: 1,
      moves: 0,
      targetScore: 1000,
      gameStatus: 'playing',
      gameMode: 'normal',
      selectedGem: null,
      isAnimating: false,
      matchesFound: [],
      isMultiplayer: false,
      players: [],
      powerUps: [],
      comboMultiplier: 1,
      lastMoveScore: 0
    }
  }

  // Handle gem click
  const handleGemClick = (row: number, col: number) => {
    if (!isPlaying) return

    smartGame.actions.onPlayerAction()

    if (!selectedGem) {
      setSelectedGem({ row, col })
    } else {
      // Attempt move
      if (isAdjacent(selectedGem, { row, col })) {
        performMove(selectedGem, { row, col })
      }
      setSelectedGem(null)
    }
  }

  const isAdjacent = (gem1: { row: number; col: number }, gem2: { row: number; col: number }) => {
    const rowDiff = Math.abs(gem1.row - gem2.row)
    const colDiff = Math.abs(gem1.col - gem2.col)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  const performMove = (from: { row: number; col: number }, to: { row: number; col: number }) => {
    const newBoard = demoBoard.map(row => row.map(gem => gem ? { ...gem } : null))
    
    // Swap gems
    const temp = newBoard[from.row][from.col]
    newBoard[from.row][from.col] = newBoard[to.row][to.col]
    newBoard[to.row][to.col] = temp

    // Update positions
    if (newBoard[from.row][from.col]) {
      newBoard[from.row][from.col]!.row = from.row
      newBoard[from.row][from.col]!.col = from.col
    }
    if (newBoard[to.row][to.col]) {
      newBoard[to.row][to.col]!.row = to.row
      newBoard[to.row][to.col]!.col = to.col
    }

    setDemoBoard(newBoard)
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      moves: prev.moves + 1
    }))

    // Update smart game metrics
    smartGame.actions.updateGameMetrics({
      score: 150, // Mock score
      cascades: 1,
      wasSuccessful: true
    })
  }

  // Demo actions
  const regenerateBoard = () => {
    const newBoard = createDemoBoard()
    setDemoBoard(newBoard)
    setGameState(createDemoGameState(newBoard))
    smartGame.actions.resetMetrics()
    smartGame.actions.resetHintSession()
  }

  const requestHint = async () => {
    try {
      const hint = await smartGame.actions.requestHint(demoBoard, gameState)
      console.log('Hint result:', hint)
    } catch (error) {
      console.error('Hint request failed:', error)
    }
  }

  const analyzeBoard = async () => {
    try {
      const analysis = await smartGame.actions.analyzeBoard(demoBoard)
      console.log('Board analysis:', analysis)
    } catch (error) {
      console.error('Board analysis failed:', error)
    }
  }

  const findBestMoves = () => {
    const moves = smartGame.actions.findBestMoves(demoBoard, 3)
    console.log('Best moves:', moves)
  }

  const testSmartSpawning = () => {
    const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
    const smartGem = smartGame.actions.generateSmartGem(demoBoard, 0, 0, gemTypes)
    console.log('Smart gem generated:', smartGem)
  }

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/30">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🧠 Smart Game Features Demo
      </h2>

      {/* Control Panel */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? 'Stop Playing' : 'Start Playing'}
        </button>
        <button
          onClick={regenerateBoard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          New Board
        </button>
        <button
          onClick={requestHint}
          disabled={!smartGame.isReady || smartGame.state.isHintActive}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {smartGame.state.isHintActive ? 'Getting Hint...' : 'Request Hint'}
        </button>
        <button
          onClick={analyzeBoard}
          disabled={!smartGame.isReady || smartGame.state.isAnalyzing}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {smartGame.state.isAnalyzing ? 'Analyzing...' : 'Analyze Board'}
        </button>
        <button
          onClick={findBestMoves}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Find Best Moves
        </button>
        <button
          onClick={testSmartSpawning}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          Test Smart Spawning
        </button>
      </div>

      {/* Game Board */}
      <div 
        ref={demoRef}
        className="grid grid-cols-8 gap-1 mb-6 max-w-lg mx-auto"
      >
        {demoBoard.map((row, rowIndex) =>
          row.map((gem, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-lg border border-white/30 
                flex items-center justify-center text-lg cursor-pointer transition-all duration-200
                ${selectedGem?.row === rowIndex && selectedGem?.col === colIndex 
                  ? 'ring-2 ring-yellow-400 scale-110' 
                  : 'hover:scale-105'
                }
                ${isPlaying ? 'hover:brightness-125' : 'opacity-75'}
              `}
              data-row={rowIndex}
              data-col={colIndex}
              onClick={() => handleGemClick(rowIndex, colIndex)}
            >
              {gem && getGemEmoji(gem.type)}
            </div>
          ))
        )}
      </div>

      {/* Status Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Metrics */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">🎯 Game Metrics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Move Efficiency:</span>
              <span className="text-white font-mono">
                {(smartGame.state.metrics.moveEfficiency * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Cascade Frequency:</span>
              <span className="text-white font-mono">
                {smartGame.state.metrics.cascadeFrequency.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Difficulty Level:</span>
              <span className="text-white font-mono">
                {(smartGame.state.metrics.difficultyLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Consecutive Failures:</span>
              <span className="text-white font-mono">
                {smartGame.state.metrics.consecutiveFailures}
              </span>
            </div>
          </div>
        </div>

        {/* Board Analysis */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">🧠 Board Analysis</h3>
          {smartGame.state.boardAnalysis ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Possible Moves:</span>
                <span className="text-white font-mono">
                  {smartGame.state.boardAnalysis.possibleMoves.length}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Board Stability:</span>
                <span className="text-white font-mono">
                  {(smartGame.state.boardAnalysis.currentState.stability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Gem Diversity:</span>
                <span className="text-white font-mono">
                  {(smartGame.state.boardAnalysis.currentState.diversity * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Deadlock Risk:</span>
                <span className={`font-mono ${
                  smartGame.state.boardAnalysis.currentState.deadlockRisk > 0.7 
                    ? 'text-red-400' 
                    : smartGame.state.boardAnalysis.currentState.deadlockRisk > 0.3 
                    ? 'text-yellow-400' 
                    : 'text-green-400'
                }`}>
                  {(smartGame.state.boardAnalysis.currentState.deadlockRisk * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Recommendation:</span>
                <span className="text-blue-400 font-mono capitalize">
                  {smartGame.state.boardAnalysis.recommendedAction}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Click "Analyze Board" to see analysis
            </div>
          )}
        </div>

        {/* Hint System */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">💡 Hint System</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Current Level:</span>
              <span className="text-white font-mono">
                {smartGame.state.hintStats.currentLevelName}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Hints Used:</span>
              <span className="text-white font-mono">
                {smartGame.state.hintStats.hintsUsed}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Remaining Hints:</span>
              <span className="text-white font-mono">
                {smartGame.state.hintStats.remainingHints}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Auto-Hint:</span>
              <span className={`font-mono ${
                smartGame.state.hintStats.autoHintEnabled ? 'text-green-400' : 'text-red-400'
              }`}>
                {smartGame.state.hintStats.autoHintEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {smartGame.state.hintResult && (
            <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-500/30">
              <div className="text-yellow-300 text-xs font-semibold">Last Hint:</div>
              <div className="text-yellow-100 text-xs mt-1">
                {smartGame.state.hintResult.message}
              </div>
            </div>
          )}
        </div>

        {/* Debug Information */}
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">🔧 Debug Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>System Status:</span>
              <span className={`font-mono ${
                smartGame.isReady ? 'text-green-400' : 'text-red-400'
              }`}>
                {smartGame.isReady ? 'Ready' : 'Initializing'}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Analysis Time:</span>
              <span className="text-white font-mono">
                {debug.debugInfo.performance.analysisTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Hint Time:</span>
              <span className="text-white font-mono">
                {debug.debugInfo.performance.hintTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Game State:</span>
              <span className="text-blue-400 font-mono">
                {gameState.gameStatus}
              </span>
            </div>
          </div>

          {smartGame.error && (
            <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/30">
              <div className="text-red-300 text-xs font-semibold">Error:</div>
              <div className="text-red-100 text-xs mt-1">
                {smartGame.error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-sm text-gray-300">
        <p className="mb-2">🎮 <strong>How to Use:</strong></p>
        <p className="text-xs leading-relaxed">
          • Click "Start Playing" and select adjacent gems to swap them<br />
          • Use "Request Hint" to get progressive hints based on your skill level<br />
          • "Analyze Board" shows intelligent analysis of current board state<br />
          • The system automatically adjusts difficulty based on your performance<br />
          • Smart spawning ensures better gem distribution and fewer deadlocks
        </p>
      </div>
    </div>
  )

  function getGemEmoji(type: GemType): string {
    const emojiMap: Record<GemType, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      lightning: '⚡',
      nature: '🌿',
      magic: '🔮'
    }
    return emojiMap[type] || '💎'
  }
}

export default SmartGameDemo 