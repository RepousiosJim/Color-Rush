import { EventEmitter } from 'events'
import { Gem, GemType, GameState, GameMove, GameMoveResult } from '@/types/game'
import { GAME_CONFIG, GEM_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants'

export interface CascadeResult {
  totalScore: number
  cascadeLevel: number
  matchesProcessed: Gem[][]
  gemsRemoved: number
  newBoard: (Gem | null)[][]
}

export interface GameEngineEvents {
  'game:initialized': () => void
  'game:move-made': (move: GameMove, result: GameMoveResult) => void
  'game:cascade-started': (level: number) => void
  'game:cascade-completed': (result: CascadeResult) => void
  'game:board-changed': (board: (Gem | null)[][]) => void
  'game:score-updated': (score: number, change: number) => void
  'game:level-completed': (level: number) => void
  'game:game-over': (reason: string) => void
  'game:error': (error: Error) => void
  'hint:show': (hintMove: { from: { row: number; col: number }; to: { row: number; col: number } }) => void
}

export class GameEngine extends EventEmitter {
  private gameState: GameState
  private animationQueue: Array<() => Promise<void>> = []
  private isAnimating: boolean = false
  private cascadeInProgress: boolean = false
  private initialized: boolean = false
  private moveInProgress: boolean = false

  constructor(initialState?: Partial<GameState>) {
    super()
    this.gameState = this.createInitialState(initialState)
  }

  // Initialize game state
  private createInitialState(overrides?: Partial<GameState>): GameState {
    const level = overrides?.level || 1
    const defaultState: GameState = {
      board: [],
      boardSize: GAME_CONFIG.BOARD_SIZE,
      score: 0,
      level: level,
      moves: 0,
      targetScore: this.calculateTargetScore(level),
      gameStatus: 'idle',
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

    return { ...defaultState, ...overrides }
  }

  // Calculate target score based on the design document formula
  // targetScore = realm × 1000 + (realm - 1) × 500
  private calculateTargetScore(level: number): number {
    return level * 1000 + (level - 1) * 500
  }

  // Initialize the game
  async initialize(boardSize: number = GAME_CONFIG.BOARD_SIZE): Promise<boolean> {
    try {
      console.log('🎮 Initializing Game Engine...')
      
      // Create initial board with no matches
      const board = this.createValidBoard(boardSize)
      if (!board) {
        throw new Error('Failed to create initial board')
      }

      // Set up game state
      this.gameState.board = board
      this.gameState.boardSize = boardSize
      this.gameState.gameStatus = 'playing'
      
      this.initialized = true
      this.emit('game:initialized')
      
      console.log('✅ Game Engine initialized successfully')
      console.log(`Target score for level ${this.gameState.level}: ${this.gameState.targetScore}`)
      return true
    } catch (error) {
      console.error('❌ Game Engine initialization failed:', error)
      this.emit('game:error', error as Error)
      return false
    }
  }

  // Create a valid board with no initial matches
  createValidBoard(size: number, maxAttempts: number = 100): (Gem | null)[][] {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const board = this.generateRandomBoard(size)
      if (!this.hasInitialMatches(board)) {
        return board
      }
    }
    
    // If we can't generate a valid board, create one with forced placement
    return this.createForcedValidBoard(size)
  }

  // Generate a random board
  private generateRandomBoard(size: number): (Gem | null)[][] {
    const board: (Gem | null)[][] = []
    const gemTypes = Object.keys(GEM_TYPES) as GemType[]

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
        board[row][col] = this.createGem(gemType, row, col)
      }
    }

    return board
  }

  // Create board with careful placement to avoid matches
  private createForcedValidBoard(size: number): (Gem | null)[][] {
    const board: (Gem | null)[][] = []
    const gemTypes = Object.keys(GEM_TYPES) as GemType[]

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        let gemType: GemType
        let attempts = 0
        
        // Try to find a gem type that doesn't create a match
        do {
          gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
          attempts++
        } while (
          attempts < 20 && 
          this.wouldCreateMatch(board, row, col, gemType)
        )

        board[row][col] = this.createGem(gemType, row, col)
      }
    }

    return board
  }

  // Check if board has any initial matches
  private hasInitialMatches(board: (Gem | null)[][]): boolean {
    return this.findMatches(board).length > 0
  }

  // Create a new gem
  private createGem(type: GemType, row: number, col: number): Gem {
    return {
      type,
      id: `${type}-${row}-${col}-${Date.now()}-${Math.random()}`,
      row,
      col,
      isMatched: false,
      isAnimating: false,
      isSelected: false
    }
  }

  // Check if placing a gem would create an immediate match
  private wouldCreateMatch(board: (Gem | null)[][], row: number, col: number, gemType: GemType): boolean {
    // Check horizontal match
    let horizontalCount = 1
    
    // Check left
    for (let c = col - 1; c >= 0 && board[row][c]?.type === gemType; c--) {
      horizontalCount++
    }
    
    // Check right
    for (let c = col + 1; c < board.length && board[row][c]?.type === gemType; c++) {
      horizontalCount++
    }
    
    if (horizontalCount >= GAME_CONFIG.MIN_MATCH_SIZE) return true

    // Check vertical match
    let verticalCount = 1
    
    // Check up
    for (let r = row - 1; r >= 0 && board[r][col]?.type === gemType; r--) {
      verticalCount++
    }
    
    // Check down
    for (let r = row + 1; r < board.length && board[r][col]?.type === gemType; r++) {
      verticalCount++
    }
    
    return verticalCount >= GAME_CONFIG.MIN_MATCH_SIZE
  }

  // Make a move (swap two gems)
  async makeMove(fromRow: number, fromCol: number, toRow: number, toCol: number): Promise<GameMoveResult> {
    if (!this.initialized || this.gameState.gameStatus !== 'playing') {
      return {
        valid: false,
        scoreChange: 0,
        matchesFound: [],
        newBoard: this.gameState.board,
        comboCount: 0
      }
    }

    if (this.moveInProgress) {
      throw new Error('Move already in progress')
    }

    // Validate move
    if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
      return {
        valid: false,
        scoreChange: 0,
        matchesFound: [],
        newBoard: this.gameState.board,
        comboCount: 0
      }
    }

    try {
      this.moveInProgress = true
      this.isAnimating = true
      this.emit('moveStarted', { fromRow, fromCol, toRow, toCol })

      // Swap gems
      const newBoard = this.swapGems(this.gameState.board, fromRow, fromCol, toRow, toCol)
      
      // Check for matches
      const matches = this.findMatches(newBoard)
      
      if (matches.length === 0) {
        // No matches, swap back
        this.swapGems(newBoard, fromRow, fromCol, toRow, toCol)
        this.isAnimating = false
        return {
          valid: false,
          scoreChange: 0,
          matchesFound: [],
          newBoard: this.gameState.board,
          comboCount: 0
        }
      }

      // Process matches and cascades (starting with combo level 0)
      const result = await this.processMatchesAndCascades(newBoard, matches, 0)
      
      // Update game state
      this.gameState.board = result.newBoard
      this.gameState.score += result.scoreChange
      this.gameState.moves++
      this.gameState.lastMoveScore = result.scoreChange
      this.gameState.comboMultiplier = Math.max(1, result.comboCount)

      this.isAnimating = false
      
      // Check for level completion
      this.checkLevelCompletion()
      
      this.emit('game:move-made', { id: Date.now().toString(), playerId: 'local', fromRow, fromCol, toRow, toCol, timestamp: Date.now(), type: 'swap' }, result)
      this.emit('game:board-changed', this.gameState.board)
      this.emit('game:score-updated', this.gameState.score, result.scoreChange)

      return result
    } catch (error) {
      this.isAnimating = false
      console.error('Error making move:', error)
      return {
        valid: false,
        scoreChange: 0,
        matchesFound: [],
        newBoard: this.gameState.board,
        comboCount: 0
      }
    } finally {
      this.moveInProgress = false
    }
  }

  // Validate if a move is legal
  private isValidMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const { boardSize } = this.gameState

    // Check bounds
    if (fromRow < 0 || fromRow >= boardSize || fromCol < 0 || fromCol >= boardSize ||
        toRow < 0 || toRow >= boardSize || toCol < 0 || toCol >= boardSize) {
      return false
    }

    // Check if gems exist
    if (!this.gameState.board[fromRow][fromCol] || !this.gameState.board[toRow][toCol]) {
      return false
    }

    // Check if gems are adjacent
    const rowDiff = Math.abs(fromRow - toRow)
    const colDiff = Math.abs(fromCol - toCol)
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  // Swap two gems on the board
  private swapGems(board: (Gem | null)[][], row1: number, col1: number, row2: number, col2: number): (Gem | null)[][] {
    const newBoard = board.map(row => [...row])
    
    const temp = newBoard[row1][col1]
    newBoard[row1][col1] = newBoard[row2][col2]
    newBoard[row2][col2] = temp

    // Update gem positions
    if (newBoard[row1][col1]) {
      newBoard[row1][col1]!.row = row1
      newBoard[row1][col1]!.col = col1
    }
    if (newBoard[row2][col2]) {
      newBoard[row2][col2]!.row = row2
      newBoard[row2][col2]!.col = col2
    }

    return newBoard
  }

  // Find all matches on the board (improved algorithm)
  findMatches(board: (Gem | null)[][]): Gem[][] {
    const matches: Gem[][] = []
    const boardSize = board.length
    const processedGems = new Set<string>()

    console.log('🔍 Starting match detection...')

    // Find horizontal matches
    for (let row = 0; row < boardSize; row++) {
      let currentMatch: Gem[] = []
      let currentType: GemType | null = null

      for (let col = 0; col <= boardSize; col++) {
        const gem = col < boardSize ? board[row][col] : null
        const gemType = gem?.type || null

        if (gem && gemType === currentType && !processedGems.has(gem.id)) {
          currentMatch.push(gem)
        } else {
          // End of current sequence
          if (currentMatch.length >= GAME_CONFIG.MIN_MATCH_SIZE) {
            console.log(`🔸 Found horizontal match: ${currentMatch.length} ${currentType} gems in row ${row}`)
            matches.push([...currentMatch])
            currentMatch.forEach(g => processedGems.add(g.id))
          }
          
          currentMatch = gem && !processedGems.has(gem.id) ? [gem] : []
          currentType = gemType
        }
      }
    }

    // Find vertical matches
    for (let col = 0; col < boardSize; col++) {
      let currentMatch: Gem[] = []
      let currentType: GemType | null = null

      for (let row = 0; row <= boardSize; row++) {
        const gem = row < boardSize ? board[row][col] : null
        const gemType = gem?.type || null

        if (gem && gemType === currentType && !processedGems.has(gem.id)) {
          currentMatch.push(gem)
        } else {
          // End of current sequence
          if (currentMatch.length >= GAME_CONFIG.MIN_MATCH_SIZE) {
            // Only add if not already processed by horizontal match
            const hasUnprocessedGems = currentMatch.some(g => !processedGems.has(g.id))
            if (hasUnprocessedGems) {
              console.log(`🔹 Found vertical match: ${currentMatch.length} ${currentType} gems in col ${col}`)
              matches.push([...currentMatch])
              currentMatch.forEach(g => processedGems.add(g.id))
            }
          }
          
          currentMatch = gem && !processedGems.has(gem.id) ? [gem] : []
          currentType = gemType
        }
      }
    }

    console.log(`✅ Match detection complete: found ${matches.length} match groups`)
    return matches
  }

  // Process matches and handle cascades with proper rush scoring
  private async processMatchesAndCascades(board: (Gem | null)[][], initialMatches: Gem[][], comboLevel: number = 0): Promise<GameMoveResult> {
    let totalScore = 0
    const allMatches: Gem[][] = [...initialMatches]
    let currentBoard = [...board.map(row => [...row])]

    console.log(`🔍 Processing ${initialMatches.length} match groups at combo level ${comboLevel}`)
    
    // Debug: Show what gems are being removed
    initialMatches.forEach((match, index) => {
      console.log(`Match ${index + 1}: ${match.length} ${match[0].type} gems at positions:`, 
        match.map(gem => `(${gem.row},${gem.col})`).join(', '))
    })

    // Remove matched gems and calculate scores
    for (const match of initialMatches) {
      const matchScore = this.calculateMatchScore(match, comboLevel)
      totalScore += matchScore
      
      // Mark gems as matched and remove them
      for (const gem of match) {
        if (currentBoard[gem.row][gem.col]) {
          console.log(`🗑️ Removing gem at (${gem.row},${gem.col}): ${gem.type}`)
          currentBoard[gem.row][gem.col] = null
        }
      }
    }

    console.log(`💰 Total score for this cascade: ${totalScore}`)

    // Apply gravity
    console.log('⬇️ Applying gravity...')
    currentBoard = this.applyGravity(currentBoard)
    
    // Fill empty spaces
    console.log('🆕 Filling empty spaces with new gems...')
    currentBoard = this.fillEmptySpaces(currentBoard)

    // Check for new matches after cascade
    const newMatches = this.findMatches(currentBoard)
    
    if (newMatches.length > 0) {
      console.log(`🔄 Found ${newMatches.length} new matches after cascade - continuing...`)
      // Recursive cascade with increased combo level
      const cascadeResult = await this.processMatchesAndCascades(currentBoard, newMatches, comboLevel + 1)
      totalScore += cascadeResult.scoreChange
      allMatches.push(...cascadeResult.matchesFound)
      currentBoard = cascadeResult.newBoard
    } else {
      console.log('✅ No more matches found - cascade complete')
    }

    return {
      valid: true,
      scoreChange: totalScore,
      matchesFound: allMatches,
      newBoard: currentBoard,
      comboCount: comboLevel + 1
    }
  }

  // Calculate score for a match with proper divine scoring
  private calculateMatchScore(match: Gem[], comboLevel: number): number {
    // Base scores according to design document
    let baseScore: number
    switch (match.length) {
      case 3:
        baseScore = 50 // 3-match: 50 divine points
        break
      case 4:
        baseScore = 150 // 4-match: 150 divine points
        break
      case 5:
        baseScore = 300 // 5-match: 300 divine points
        break
      default:
        baseScore = 500 // 6+ match: 500+ divine points
        if (match.length > 6) {
          baseScore += (match.length - 6) * 100 // Bonus for extra long matches
        }
        break
    }

    // Rush Bonus = Cascade Level × Base Divine Score
    const rushBonus = comboLevel * baseScore
    
    // Final Divine Score = Base Score + Rush Bonus
    const finalScore = baseScore + rushBonus
    
    console.log(`Match of ${match.length} gems, combo level ${comboLevel}: ${baseScore} + ${rushBonus} = ${finalScore}`)
    
    return finalScore
  }

  // Apply gravity to make gems fall
  private applyGravity(board: (Gem | null)[][]): (Gem | null)[][] {
    const newBoard = board.map(row => [...row])
    const boardSize = newBoard.length

    for (let col = 0; col < boardSize; col++) {
      // Get all non-null gems in column from bottom to top
      const gems = []
      for (let row = boardSize - 1; row >= 0; row--) {
        if (newBoard[row][col]) {
          gems.push(newBoard[row][col])
          newBoard[row][col] = null
        }
      }

      // Place gems at bottom
      for (let i = 0; i < gems.length; i++) {
        const newRow = boardSize - 1 - i
        newBoard[newRow][col] = gems[i]
        if (newBoard[newRow][col]) {
          newBoard[newRow][col]!.row = newRow
        }
      }
    }

    return newBoard
  }

  // Fill empty spaces with new gems
  private fillEmptySpaces(board: (Gem | null)[][]): (Gem | null)[][] {
    const newBoard = board.map(row => [...row])
    const boardSize = newBoard.length
    const gemTypes = Object.keys(GEM_TYPES) as GemType[]

    for (let col = 0; col < boardSize; col++) {
      for (let row = 0; row < boardSize; row++) {
        if (!newBoard[row][col]) {
          const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
          newBoard[row][col] = this.createGem(gemType, row, col)
        }
      }
    }

    return newBoard
  }

  // Check if level is complete and advance to next level
  private checkLevelCompletion(): void {
    if (this.gameState.score >= this.gameState.targetScore) {
      this.gameState.level++
      this.gameState.targetScore = this.calculateTargetScore(this.gameState.level)
      this.gameState.gameStatus = 'completed'
      
      console.log(`🎉 Level ${this.gameState.level - 1} completed! Next target: ${this.gameState.targetScore}`)
      
      this.emit('game:level-completed', this.gameState.level - 1)
    }
  }

  // Select a gem
  selectGem(row: number, col: number): boolean {
    if (this.gameState.gameStatus !== 'playing' || this.isAnimating) {
      return false
    }

    const gem = this.gameState.board[row][col]
    if (!gem) return false

    // Clear previous selection
    if (this.gameState.selectedGem) {
      const prevGem = this.gameState.board[this.gameState.selectedGem.row][this.gameState.selectedGem.col]
      if (prevGem) prevGem.isSelected = false
    }

    // If same gem, deselect
    if (this.gameState.selectedGem?.row === row && this.gameState.selectedGem?.col === col) {
      this.gameState.selectedGem = null
      gem.isSelected = false
      this.emit('gemDeselected')
      return true
    }

    // If different gem and one already selected, attempt move
    if (this.gameState.selectedGem) {
      this.makeMove(this.gameState.selectedGem.row, this.gameState.selectedGem.col, row, col)
      this.gameState.selectedGem = null
      gem.isSelected = false
      return true
    }

    // Select new gem
    this.gameState.selectedGem = { row, col }
    gem.isSelected = true
    this.emit('gemSelected', { row, col })
    return true
  }

  // Get current game state
  getGameState(): GameState {
    return { ...this.gameState }
  }

  // Reset the game
  reset(): void {
    const currentLevel = this.gameState.level
    this.gameState = this.createInitialState({ level: currentLevel })
    this.initialize()
    this.emit('reset')
  }

  // Start next level
  nextLevel(): void {
    this.gameState.gameStatus = 'playing'
    this.gameState.moves = 0
    this.gameState.comboMultiplier = 1
    this.gameState.lastMoveScore = 0
    
    // Create new board for next level
    this.initialize()
    this.emit('nextLevel', {
      level: this.gameState.level,
      targetScore: this.gameState.targetScore
    })
  }

  // Pause the game
  pause(): void {
    if (this.gameState.gameStatus === 'playing') {
      this.gameState.gameStatus = 'paused'
      this.emit('paused')
    }
  }

  // Resume the game
  resume(): void {
    if (this.gameState.gameStatus === 'paused') {
      this.gameState.gameStatus = 'playing'
      this.emit('resumed')
    }
  }

  // Get possible moves (for hints)
  getPossibleMoves(): Array<{ from: { row: number; col: number }; to: { row: number; col: number } }> {
    const moves = []
    const { board, boardSize } = this.gameState

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        // Check right
        if (col < boardSize - 1) {
          const testBoard = this.swapGems(board, row, col, row, col + 1)
          if (this.findMatches(testBoard).length > 0) {
            moves.push({
              from: { row, col },
              to: { row, col: col + 1 }
            })
          }
        }

        // Check down
        if (row < boardSize - 1) {
          const testBoard = this.swapGems(board, row, col, row + 1, col)
          if (this.findMatches(testBoard).length > 0) {
            moves.push({
              from: { row, col },
              to: { row: row + 1, col }
            })
          }
        }
      }
    }

    return moves
  }

  // Show hint by highlighting a possible move
  showHint(): { success: boolean; message: string; hintMove?: { from: { row: number; col: number }; to: { row: number; col: number } } } {
    if (this.gameState.gameStatus !== 'playing') {
      return {
        success: false,
        message: '⏸️ Game must be playing to show hints.'
      }
    }

    if (this.isAnimating) {
      return {
        success: false,
        message: '⏳ Please wait for current animation to complete.'
      }
    }

    const possibleMoves = this.getPossibleMoves()
    
    if (possibleMoves.length === 0) {
      return {
        success: false,
        message: '🔄 No possible moves found! This shouldn\'t happen - board may need reshuffling.'
      }
    }

    // Select a random possible move to show as hint
    const randomIndex = Math.floor(Math.random() * possibleMoves.length)
    const hintMove = possibleMoves[randomIndex]

    // Emit hint event for UI to handle visual highlighting
    this.emit('hint:show', hintMove)

    return {
      success: true,
      message: `💡 Try swapping the gems at row ${hintMove.from.row + 1}, column ${hintMove.from.col + 1} with row ${hintMove.to.row + 1}, column ${hintMove.to.col + 1}!`,
      hintMove
    }
  }

  // Cleanup
  cleanup(): void {
    this.removeAllListeners()
    this.initialized = false
    this.isAnimating = false
    this.cascadeInProgress = false
    this.animationQueue = []
  }
} 