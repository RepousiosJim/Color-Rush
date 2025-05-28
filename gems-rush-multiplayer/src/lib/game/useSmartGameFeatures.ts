import { useCallback, useEffect, useRef, useState } from 'react'
import { Gem, GemType, GameState } from '@/types/game'
import { smartGameMechanics, GameMetrics, DifficultySettings } from './SmartGameMechanics'
import { intelligentBoardAnalysis, GameStateEvaluation, MoveAnalysis } from './IntelligentBoardAnalysis'
import { advancedHintSystem, HintResult, HintConfig } from './AdvancedHintSystem'

export interface SmartGameState {
  // Game metrics
  metrics: GameMetrics
  difficulty: DifficultySettings
  
  // Board analysis
  boardAnalysis: GameStateEvaluation | null
  isAnalyzing: boolean
  
  // Hint system
  hintResult: HintResult | null
  hintStats: any
  isHintActive: boolean
  
  // Smart recommendations
  recommendedAction: 'continue' | 'shuffle' | 'hint' | 'powerup' | null
  confidence: number
}

export interface SmartGameActions {
  // Metrics and difficulty
  updateGameMetrics: (moveResult: { score: number; cascades: number; wasSuccessful: boolean }) => void
  resetMetrics: () => void
  getDifficultySettings: () => DifficultySettings
  
  // Board analysis
  analyzeBoard: (board: (Gem | null)[][]) => Promise<GameStateEvaluation>
  findBestMoves: (board: (Gem | null)[][], count?: number) => MoveAnalysis[]
  checkDeadlock: (board: (Gem | null)[][]) => boolean
  
  // Smart gem generation
  generateSmartGem: (board: (Gem | null)[][], row: number, col: number, availableTypes: GemType[]) => GemType
  shouldRegenerateBoard: (gameState: GameState) => boolean
  
  // Hint system
  requestHint: (board: (Gem | null)[][], gameState: GameState) => Promise<HintResult>
  enableAutoHint: (enabled: boolean) => void
  resetHintSession: () => void
  onPlayerAction: () => void
  
  // Configuration
  updateHintConfig: (config: Partial<HintConfig>) => void
  updateSpawnConfig: (config: any) => void
}

export interface UseSmartGameFeaturesReturn {
  state: SmartGameState
  actions: SmartGameActions
  isReady: boolean
  error: string | null
}

export const useSmartGameFeatures = (
  initialGameState?: GameState,
  options?: {
    enableAutoAnalysis?: boolean
    enableSmartSpawning?: boolean
    enableProgressiveHints?: boolean
  }
): UseSmartGameFeaturesReturn => {
  const [state, setState] = useState<SmartGameState>({
    metrics: smartGameMechanics.getMetrics(),
    difficulty: smartGameMechanics.getDifficultySettings(),
    boardAnalysis: null,
    isAnalyzing: false,
    hintResult: null,
    hintStats: advancedHintSystem.getSessionStats(),
    isHintActive: false,
    recommendedAction: null,
    confidence: 0
  })

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastBoardHashRef = useRef<string>('')

  // Initialize systems
  useEffect(() => {
    try {
      // Setup auto-hint event listener
      const handleAutoHint = (event: any) => {
        if (options?.enableProgressiveHints !== false) {
          setState(prev => ({
            ...prev,
            recommendedAction: 'hint',
            confidence: 0.8
          }))
        }
      }

      document.addEventListener('game:auto-hint-ready', handleAutoHint)
      setIsReady(true)

      return () => {
        document.removeEventListener('game:auto-hint-ready', handleAutoHint)
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current)
        }
      }
    } catch (err) {
      setError(`Failed to initialize smart game features: ${err}`)
    }
  }, [options?.enableProgressiveHints])

  // Auto-analysis when board changes
  const analyzeBoard = useCallback(async (board: (Gem | null)[][]): Promise<GameStateEvaluation> => {
    setState(prev => ({ ...prev, isAnalyzing: true }))
    
    try {
      const analysis = intelligentBoardAnalysis.analyzeGameState(board)
      
      setState(prev => ({
        ...prev,
        boardAnalysis: analysis,
        isAnalyzing: false,
        recommendedAction: analysis.recommendedAction,
        confidence: analysis.confidence
      }))
      
      return analysis
    } catch (err) {
      setError(`Board analysis failed: ${err}`)
      setState(prev => ({ ...prev, isAnalyzing: false }))
      throw err
    }
  }, [])

  // Debounced auto-analysis
  const scheduleAutoAnalysis = useCallback((board: (Gem | null)[][]) => {
    if (options?.enableAutoAnalysis === false) return

    // Generate board hash to avoid redundant analysis
    const boardHash = board.map(row => 
      row.map(gem => gem?.type || 'null').join('')
    ).join('|')

    if (boardHash === lastBoardHashRef.current) return
    lastBoardHashRef.current = boardHash

    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeBoard(board).catch(console.error)
    }, 500) // 500ms debounce
  }, [analyzeBoard, options?.enableAutoAnalysis])

  // Game metrics and difficulty
  const updateGameMetrics = useCallback((moveResult: { 
    score: number
    cascades: number
    wasSuccessful: boolean 
  }) => {
    try {
      smartGameMechanics.updateMetrics(initialGameState!, moveResult)
      
      setState(prev => ({
        ...prev,
        metrics: smartGameMechanics.getMetrics(),
        difficulty: smartGameMechanics.getDifficultySettings()
      }))
    } catch (err) {
      setError(`Failed to update metrics: ${err}`)
    }
  }, [initialGameState])

  const resetMetrics = useCallback(() => {
    smartGameMechanics.resetMetrics()
    setState(prev => ({
      ...prev,
      metrics: smartGameMechanics.getMetrics(),
      difficulty: smartGameMechanics.getDifficultySettings()
    }))
  }, [])

  // Board analysis actions
  const findBestMoves = useCallback((board: (Gem | null)[][], count: number = 5): MoveAnalysis[] => {
    try {
      const analysis = intelligentBoardAnalysis.analyzeGameState(board)
      return analysis.possibleMoves.slice(0, count)
    } catch (err) {
      setError(`Failed to find best moves: ${err}`)
      return []
    }
  }, [])

  const checkDeadlock = useCallback((board: (Gem | null)[][]): boolean => {
    try {
      const analysis = intelligentBoardAnalysis.analyzeGameState(board)
      return analysis.isDeadlock
    } catch (err) {
      setError(`Failed to check deadlock: ${err}`)
      return false
    }
  }, [])

  // Smart gem generation
  const generateSmartGem = useCallback((
    board: (Gem | null)[][],
    row: number,
    col: number,
    availableTypes: GemType[]
  ): GemType => {
    if (options?.enableSmartSpawning === false) {
      return availableTypes[Math.floor(Math.random() * availableTypes.length)]
    }

    try {
      const gemType = smartGameMechanics.generateSmartGem(board, row, col, availableTypes)
      smartGameMechanics.updateGemFrequency(gemType)
      return gemType
    } catch (err) {
      setError(`Smart gem generation failed: ${err}`)
      return availableTypes[0]
    }
  }, [options?.enableSmartSpawning])

  const shouldRegenerateBoard = useCallback((gameState: GameState): boolean => {
    return smartGameMechanics.shouldRegenerateBoard(gameState)
  }, [])

  // Hint system actions
  const requestHint = useCallback(async (
    board: (Gem | null)[][], 
    gameState: GameState
  ): Promise<HintResult> => {
    setState(prev => ({ ...prev, isHintActive: true }))
    
    try {
      const hintResult = await advancedHintSystem.requestHint(board, gameState)
      
      setState(prev => ({
        ...prev,
        hintResult,
        hintStats: advancedHintSystem.getSessionStats(),
        isHintActive: false
      }))
      
      return hintResult
    } catch (err) {
      setError(`Hint request failed: ${err}`)
      setState(prev => ({ ...prev, isHintActive: false }))
      throw err
    }
  }, [])

  const enableAutoHint = useCallback((enabled: boolean) => {
    advancedHintSystem.enableAutoHint(enabled)
    setState(prev => ({
      ...prev,
      hintStats: advancedHintSystem.getSessionStats()
    }))
  }, [])

  const resetHintSession = useCallback(() => {
    advancedHintSystem.resetSession()
    setState(prev => ({
      ...prev,
      hintResult: null,
      hintStats: advancedHintSystem.getSessionStats()
    }))
  }, [])

  const onPlayerAction = useCallback(() => {
    advancedHintSystem.onPlayerAction()
    setState(prev => ({ ...prev, recommendedAction: null }))
  }, [])

  // Configuration actions
  const updateHintConfig = useCallback((config: Partial<HintConfig>) => {
    advancedHintSystem.updateConfig(config)
  }, [])

  const updateSpawnConfig = useCallback((config: any) => {
    smartGameMechanics.updateSpawnConfig(config)
  }, [])

  const getDifficultySettings = useCallback(() => {
    return smartGameMechanics.getDifficultySettings()
  }, [])

  // Auto-trigger analysis on board changes
  useEffect(() => {
    if (initialGameState?.board && isReady) {
      scheduleAutoAnalysis(initialGameState.board)
    }
  }, [initialGameState?.board, isReady, scheduleAutoAnalysis])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      advancedHintSystem.cleanup()
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    actions: {
      updateGameMetrics,
      resetMetrics,
      getDifficultySettings,
      analyzeBoard,
      findBestMoves,
      checkDeadlock,
      generateSmartGem,
      shouldRegenerateBoard,
      requestHint,
      enableAutoHint,
      resetHintSession,
      onPlayerAction,
      updateHintConfig,
      updateSpawnConfig
    },
    isReady,
    error
  }
}

// Hook for debugging and monitoring
export const useSmartGameDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    metrics: smartGameMechanics.getMetrics(),
    hintStats: advancedHintSystem.getSessionStats(),
    lastAnalysis: null as GameStateEvaluation | null,
    performance: {
      analysisTime: 0,
      hintTime: 0,
      lastUpdate: Date.now()
    }
  })

  const updateDebugInfo = useCallback(() => {
    setDebugInfo({
      metrics: smartGameMechanics.getMetrics(),
      hintStats: advancedHintSystem.getSessionStats(),
      lastAnalysis: debugInfo.lastAnalysis,
      performance: {
        ...debugInfo.performance,
        lastUpdate: Date.now()
      }
    })
  }, [debugInfo])

  const benchmarkAnalysis = useCallback(async (board: (Gem | null)[][]) => {
    const start = performance.now()
    const analysis = intelligentBoardAnalysis.analyzeGameState(board)
    const end = performance.now()
    
    setDebugInfo(prev => ({
      ...prev,
      lastAnalysis: analysis,
      performance: {
        ...prev.performance,
        analysisTime: end - start,
        lastUpdate: Date.now()
      }
    }))
    
    return analysis
  }, [])

  const benchmarkHint = useCallback(async (board: (Gem | null)[][], gameState: GameState) => {
    const start = performance.now()
    const hint = await advancedHintSystem.requestHint(board, gameState)
    const end = performance.now()
    
    setDebugInfo(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        hintTime: end - start,
        lastUpdate: Date.now()
      }
    }))
    
    return hint
  }, [])

  return {
    debugInfo,
    updateDebugInfo,
    benchmarkAnalysis,
    benchmarkHint
  }
} 