import { Gem, GemType, GameState } from '@/types/game'

export interface MoveAnalysis {
  from: { row: number; col: number }
  to: { row: number; col: number }
  expectedScore: number
  cascadePotential: number
  riskLevel: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  description: string
  priority: number
}

export interface BoardState {
  score: number
  stability: number  // 0-1, how stable the board is
  diversity: number  // 0-1, how diverse gem distribution is
  deadlockRisk: number // 0-1, risk of reaching deadlock
  moveCount: number
  cascadePotential: number
  powerUpOpportunities: number
}

export interface GameStateEvaluation {
  currentState: BoardState
  possibleMoves: MoveAnalysis[]
  bestMove: MoveAnalysis | null
  worstMove: MoveAnalysis | null
  isDeadlock: boolean
  recommendedAction: 'continue' | 'shuffle' | 'hint' | 'powerup'
  confidence: number // 0-1, confidence in analysis
}

export class IntelligentBoardAnalysis {
  private readonly BOARD_SIZE = 8
  private readonly MIN_MATCH_SIZE = 3
  private readonly MAX_ANALYSIS_DEPTH = 3
  
  // Weights for move scoring
  private readonly WEIGHTS = {
    immediateScore: 0.4,
    cascadePotential: 0.3,
    boardImprovement: 0.2,
    riskReduction: 0.1
  }

  constructor() {}

  // Main Analysis Methods
  public analyzeGameState(board: (Gem | null)[][]): GameStateEvaluation {
    const currentState = this.evaluateBoardState(board)
    const possibleMoves = this.findAndAnalyzePossibleMoves(board)
    
    // Sort moves by priority
    possibleMoves.sort((a, b) => b.priority - a.priority)
    
    const bestMove = possibleMoves.length > 0 ? possibleMoves[0] : null
    const worstMove = possibleMoves.length > 0 ? possibleMoves[possibleMoves.length - 1] : null
    const isDeadlock = possibleMoves.length === 0
    
    return {
      currentState,
      possibleMoves,
      bestMove,
      worstMove,
      isDeadlock,
      recommendedAction: this.getRecommendedAction(currentState, possibleMoves),
      confidence: this.calculateConfidence(currentState, possibleMoves)
    }
  }

  public evaluateBoardState(board: (Gem | null)[][]): BoardState {
    return {
      score: this.calculateBoardScore(board),
      stability: this.calculateStability(board),
      diversity: this.calculateDiversity(board),
      deadlockRisk: this.calculateDeadlockRisk(board),
      moveCount: this.countPossibleMoves(board),
      cascadePotential: this.analyzeCascadePotential(board),
      powerUpOpportunities: this.countPowerUpOpportunities(board)
    }
  }

  public findAndAnalyzePossibleMoves(board: (Gem | null)[][]): MoveAnalysis[] {
    const moves: MoveAnalysis[] = []
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        // Check right swap
        if (col < this.BOARD_SIZE - 1) {
          const move = this.analyzeMove(board, row, col, row, col + 1)
          if (move) moves.push(move)
        }
        
        // Check down swap
        if (row < this.BOARD_SIZE - 1) {
          const move = this.analyzeMove(board, row, col, row + 1, col)
          if (move) moves.push(move)
        }
      }
    }
    
    return moves
  }

  // Advanced Move Analysis
  private analyzeMove(
    board: (Gem | null)[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): MoveAnalysis | null {
    // Simulate the move
    const testBoard = this.cloneBoard(board)
    this.swapGems(testBoard, fromRow, fromCol, toRow, toCol)
    
    // Check if move creates matches
    const matches = this.findMatches(testBoard)
    if (matches.length === 0) return null
    
    // Calculate move metrics
    const immediateScore = this.calculateMatchScore(matches)
    const cascadePotential = this.predictCascades(testBoard)
    const riskLevel = this.assessRiskLevel(testBoard)
    const boardImprovement = this.calculateBoardImprovement(board, testBoard)
    
    // Calculate priority score
    const priority = 
      immediateScore * this.WEIGHTS.immediateScore +
      cascadePotential * this.WEIGHTS.cascadePotential +
      boardImprovement * this.WEIGHTS.boardImprovement +
      (1 - riskLevel) * this.WEIGHTS.riskReduction
    
    return {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      expectedScore: immediateScore,
      cascadePotential,
      riskLevel,
      difficulty: this.categorizeMoveDifficulty(priority, cascadePotential),
      description: this.generateMoveDescription(immediateScore, cascadePotential, riskLevel),
      priority
    }
  }

  private predictCascades(board: (Gem | null)[][], depth: number = 0): number {
    if (depth >= this.MAX_ANALYSIS_DEPTH) return 0
    
    const testBoard = this.cloneBoard(board)
    let totalCascadeScore = 0
    let cascadeLevel = 0
    
    // Simulate cascade process
    while (cascadeLevel < this.MAX_ANALYSIS_DEPTH) {
      const matches = this.findMatches(testBoard)
      if (matches.length === 0) break
      
      totalCascadeScore += this.calculateMatchScore(matches) * (cascadeLevel + 1)
      
      // Remove matches and apply gravity
      this.removeMatches(testBoard, matches)
      this.applyGravity(testBoard)
      this.fillEmptySpaces(testBoard)
      
      cascadeLevel++
    }
    
    return totalCascadeScore
  }

  // Board State Analysis
  private calculateBoardScore(board: (Gem | null)[][]): number {
    // Evaluate potential matches and board positioning
    let score = 0
    
    // Score for near-matches (2 in a row)
    score += this.countNearMatches(board) * 10
    
    // Score for gem distribution
    score += this.calculateDistributionScore(board)
    
    // Score for special position patterns
    score += this.analyzePatternScore(board)
    
    return score
  }

  private calculateStability(board: (Gem | null)[][]): number {
    let stabilityScore = 0
    let totalPositions = 0
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const gem = board[row][col]
        if (!gem) continue
        
        totalPositions++
        
        // Check if gem has stable neighbors (same type)
        const stableNeighbors = this.countStableNeighbors(board, row, col)
        stabilityScore += stableNeighbors / 4 // Max 4 neighbors
      }
    }
    
    return totalPositions > 0 ? stabilityScore / totalPositions : 0
  }

  private calculateDiversity(board: (Gem | null)[][]): number {
    const typeCount = new Map<GemType, number>()
    let totalGems = 0
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const gem = board[row][col]
        if (gem) {
          totalGems++
          typeCount.set(gem.type, (typeCount.get(gem.type) || 0) + 1)
        }
      }
    }
    
    if (totalGems === 0) return 0
    
    // Calculate diversity using Shannon entropy
    let entropy = 0
    typeCount.forEach(count => {
      const probability = count / totalGems
      entropy -= probability * Math.log2(probability)
    })
    
    // Normalize to 0-1 range (max entropy for 7 gem types is log2(7))
    return Math.min(1, entropy / Math.log2(7))
  }

  private calculateDeadlockRisk(board: (Gem | null)[][]): number {
    const possibleMoves = this.countPossibleMoves(board)
    const nearMatches = this.countNearMatches(board)
    const gemDensity = this.calculateGemDensity(board)
    
    // Risk increases with fewer possible moves and lower gem density
    let risk = 0
    
    if (possibleMoves === 0) return 1 // Definite deadlock
    if (possibleMoves <= 3) risk += 0.5
    if (possibleMoves <= 7) risk += 0.2
    
    if (nearMatches <= 2) risk += 0.3
    if (gemDensity < 0.8) risk += 0.2
    
    return Math.min(1, risk)
  }

  private analyzeCascadePotential(board: (Gem | null)[][]): number {
    let totalPotential = 0
    const moves = this.findPossibleMoves(board)
    
    moves.forEach(move => {
      const testBoard = this.cloneBoard(board)
      this.swapGems(testBoard, move.from.row, move.from.col, move.to.row, move.to.col)
      totalPotential += this.predictCascades(testBoard)
    })
    
    return moves.length > 0 ? totalPotential / moves.length : 0
  }

  // Helper Methods
  private findMatches(board: (Gem | null)[][]): Gem[][] {
    const matches: Gem[][] = []
    
    // Find horizontal matches
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      let currentMatch: Gem[] = []
      let currentType: GemType | null = null
      
      for (let col = 0; col <= this.BOARD_SIZE; col++) {
        const gem = col < this.BOARD_SIZE ? board[row][col] : null
        
        if (gem && gem.type === currentType) {
          currentMatch.push(gem)
        } else {
          if (currentMatch.length >= this.MIN_MATCH_SIZE) {
            matches.push([...currentMatch])
          }
          currentMatch = gem ? [gem] : []
          currentType = gem?.type || null
        }
      }
    }
    
    // Find vertical matches
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      let currentMatch: Gem[] = []
      let currentType: GemType | null = null
      
      for (let row = 0; row <= this.BOARD_SIZE; row++) {
        const gem = row < this.BOARD_SIZE ? board[row][col] : null
        
        if (gem && gem.type === currentType) {
          currentMatch.push(gem)
        } else {
          if (currentMatch.length >= this.MIN_MATCH_SIZE) {
            matches.push([...currentMatch])
          }
          currentMatch = gem ? [gem] : []
          currentType = gem?.type || null
        }
      }
    }
    
    return matches
  }

  private findPossibleMoves(board: (Gem | null)[][]): Array<{
    from: { row: number; col: number }
    to: { row: number; col: number }
  }> {
    const moves = []
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        // Check right
        if (col < this.BOARD_SIZE - 1) {
          if (this.wouldCreateMatch(board, row, col, row, col + 1)) {
            moves.push({ from: { row, col }, to: { row, col: col + 1 } })
          }
        }
        
        // Check down
        if (row < this.BOARD_SIZE - 1) {
          if (this.wouldCreateMatch(board, row, col, row + 1, col)) {
            moves.push({ from: { row, col }, to: { row: row + 1, col } })
          }
        }
      }
    }
    
    return moves
  }

  private wouldCreateMatch(
    board: (Gem | null)[][],
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean {
    const testBoard = this.cloneBoard(board)
    this.swapGems(testBoard, fromRow, fromCol, toRow, toCol)
    return this.findMatches(testBoard).length > 0
  }

  private countPossibleMoves(board: (Gem | null)[][]): number {
    return this.findPossibleMoves(board).length
  }

  private countNearMatches(board: (Gem | null)[][]): number {
    let nearMatches = 0
    
    // Count 2-in-a-row horizontally
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE - 1; col++) {
        const gem1 = board[row][col]
        const gem2 = board[row][col + 1]
        if (gem1 && gem2 && gem1.type === gem2.type) {
          nearMatches++
        }
      }
    }
    
    // Count 2-in-a-row vertically
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      for (let row = 0; row < this.BOARD_SIZE - 1; row++) {
        const gem1 = board[row][col]
        const gem2 = board[row + 1][col]
        if (gem1 && gem2 && gem1.type === gem2.type) {
          nearMatches++
        }
      }
    }
    
    return nearMatches
  }

  private countStableNeighbors(board: (Gem | null)[][], row: number, col: number): number {
    const gem = board[row][col]
    if (!gem) return 0
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    let stableCount = 0
    
    directions.forEach(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc
      
      if (newRow >= 0 && newRow < this.BOARD_SIZE && newCol >= 0 && newCol < this.BOARD_SIZE) {
        const neighbor = board[newRow][newCol]
        if (neighbor && neighbor.type === gem.type) {
          stableCount++
        }
      }
    })
    
    return stableCount
  }

  private calculateGemDensity(board: (Gem | null)[][]): number {
    let gemCount = 0
    const totalSpaces = this.BOARD_SIZE * this.BOARD_SIZE
    
    for (let row = 0; row < this.BOARD_SIZE; row++) {
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        if (board[row][col]) gemCount++
      }
    }
    
    return gemCount / totalSpaces
  }

  private calculateMatchScore(matches: Gem[][]): number {
    return matches.reduce((total, match) => {
      const baseScore = match.length * 50
      const sizeBonus = Math.max(0, match.length - 3) * 25
      return total + baseScore + sizeBonus
    }, 0)
  }

  private assessRiskLevel(board: (Gem | null)[][]): number {
    const deadlockRisk = this.calculateDeadlockRisk(board)
    const stability = this.calculateStability(board)
    
    return (deadlockRisk + (1 - stability)) / 2
  }

  private calculateBoardImprovement(oldBoard: (Gem | null)[][], newBoard: (Gem | null)[][]): number {
    const oldState = this.evaluateBoardState(oldBoard)
    const newState = this.evaluateBoardState(newBoard)
    
    return (newState.stability + newState.diversity - oldState.stability - oldState.diversity) / 2
  }

  private categorizeMoveDifficulty(priority: number, cascadePotential: number): 'easy' | 'medium' | 'hard' | 'expert' {
    if (priority > 200 || cascadePotential > 500) return 'easy'
    if (priority > 100 || cascadePotential > 200) return 'medium'
    if (priority > 50) return 'hard'
    return 'expert'
  }

  private generateMoveDescription(score: number, cascade: number, risk: number): string {
    let desc = `Score: ${score.toFixed(0)}`
    
    if (cascade > 100) desc += `, High cascade potential`
    if (risk > 0.7) desc += `, High risk`
    else if (risk < 0.3) desc += `, Safe move`
    
    return desc
  }

  private getRecommendedAction(
    state: BoardState,
    moves: MoveAnalysis[]
  ): 'continue' | 'shuffle' | 'hint' | 'powerup' {
    if (moves.length === 0) return 'shuffle'
    if (state.deadlockRisk > 0.8) return 'shuffle'
    if (moves.length <= 3) return 'hint'
    if (state.powerUpOpportunities > 0) return 'powerup'
    return 'continue'
  }

  private calculateConfidence(state: BoardState, moves: MoveAnalysis[]): number {
    let confidence = 0.5
    
    if (moves.length > 10) confidence += 0.2
    if (state.stability > 0.6) confidence += 0.2
    if (state.diversity > 0.7) confidence += 0.1
    
    return Math.min(1, confidence)
  }

  private countPowerUpOpportunities(board: (Gem | null)[][]): number {
    // Count potential 4+ matches that could create power-ups
    return 0 // Simplified for now
  }

  private calculateDistributionScore(board: (Gem | null)[][]): number {
    // Score based on how well gems are distributed
    return 0 // Simplified for now
  }

  private analyzePatternScore(board: (Gem | null)[][]): number {
    // Analyze special patterns like L-shapes, T-shapes, etc.
    return 0 // Simplified for now
  }

  // Utility Methods
  private cloneBoard(board: (Gem | null)[][]): (Gem | null)[][] {
    return board.map(row => row.map(gem => gem ? { ...gem } : null))
  }

  private swapGems(board: (Gem | null)[][], fromRow: number, fromCol: number, toRow: number, toCol: number): void {
    const temp = board[fromRow][fromCol]
    board[fromRow][fromCol] = board[toRow][toCol]
    board[toRow][toCol] = temp
  }

  private removeMatches(board: (Gem | null)[][], matches: Gem[][]): void {
    matches.forEach(match => {
      match.forEach(gem => {
        board[gem.row][gem.col] = null
      })
    })
  }

  private applyGravity(board: (Gem | null)[][]): void {
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      let writeIndex = this.BOARD_SIZE - 1
      
      for (let row = this.BOARD_SIZE - 1; row >= 0; row--) {
        if (board[row][col]) {
          if (row !== writeIndex) {
            board[writeIndex][col] = board[row][col]
            board[row][col] = null
            
            // Update gem position
            if (board[writeIndex][col]) {
              board[writeIndex][col]!.row = writeIndex
            }
          }
          writeIndex--
        }
      }
    }
  }

  private fillEmptySpaces(board: (Gem | null)[][]): void {
    const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
    
    for (let col = 0; col < this.BOARD_SIZE; col++) {
      for (let row = 0; row < this.BOARD_SIZE; row++) {
        if (!board[row][col]) {
          const randomType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
          board[row][col] = {
            type: randomType,
            id: `${row}-${col}-${Date.now()}-${Math.random()}`,
            row,
            col
          }
        }
      }
    }
  }
}

// Singleton instance
export const intelligentBoardAnalysis = new IntelligentBoardAnalysis() 