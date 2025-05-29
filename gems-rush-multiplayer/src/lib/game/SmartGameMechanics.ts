import { Gem, GemType, GameState } from '@/types/game'

export interface DifficultySettings {
  targetMoveEfficiency: number // 0.3-0.8 (30%-80% efficiency)
  comboBoostChance: number     // 0.1-0.5 (10%-50% chance)
  specialGemChance: number     // 0.05-0.25 (5%-25% chance)
  minimumMoves: number         // 5-20 moves before difficulty adjustment
  cascadeWeight: number        // 1.0-3.0 cascade importance multiplier
}

export interface GameMetrics {
  averageMoveScore: number
  cascadeFrequency: number
  moveEfficiency: number
  consecutiveFailures: number
  timeBetweenMoves: number
  difficultyLevel: number
}

export interface SmartSpawnConfig {
  favorComboSetups: boolean
  avoidDeadlocks: boolean
  balanceGemDistribution: boolean
  enableSmartPowerUps: boolean
  adaptiveDifficulty: boolean
}

export class SmartGameMechanics {
  private metrics: GameMetrics = {
    averageMoveScore: 0,
    cascadeFrequency: 0,
    moveEfficiency: 0,
    consecutiveFailures: 0,
    timeBetweenMoves: 3000,
    difficultyLevel: 0.5
  }

  private difficultySettings: DifficultySettings = {
    targetMoveEfficiency: 0.6,
    comboBoostChance: 0.2,
    specialGemChance: 0.1,
    minimumMoves: 10,
    cascadeWeight: 1.5
  }

  private spawnConfig: SmartSpawnConfig = {
    favorComboSetups: true,
    avoidDeadlocks: true,
    balanceGemDistribution: true,
    enableSmartPowerUps: true,
    adaptiveDifficulty: true
  }

  private moveHistory: Array<{
    score: number
    cascades: number
    timestamp: number
    efficiency: number
  }> = []

  private gemTypeFrequency = new Map<GemType, number>()
  private lastMoveTime = Date.now()

  constructor(initialConfig?: Partial<SmartSpawnConfig>) {
    if (initialConfig) {
      this.spawnConfig = { ...this.spawnConfig, ...initialConfig }
    }
    this.initializeGemFrequency()
  }

  private initializeGemFrequency(): void {
    const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
    gemTypes.forEach(type => {
      this.gemTypeFrequency.set(type, 0)
    })
  }

  // Core Smart Mechanics
  public updateMetrics(gameState: GameState, moveResult: {
    score: number
    cascades: number
    wasSuccessful: boolean
  }): void {
    const now = Date.now()
    const timeSinceLastMove = now - this.lastMoveTime

    // Update move history
    this.moveHistory.push({
      score: moveResult.score,
      cascades: moveResult.cascades,
      timestamp: now,
      efficiency: moveResult.wasSuccessful ? 1 : 0
    })

    // Keep only last 20 moves for analysis
    if (this.moveHistory.length > 20) {
      this.moveHistory.shift()
    }

    // Update metrics
    this.metrics.averageMoveScore = this.calculateAverageMoveScore()
    this.metrics.cascadeFrequency = this.calculateCascadeFrequency()
    this.metrics.moveEfficiency = this.calculateMoveEfficiency()
    this.metrics.timeBetweenMoves = timeSinceLastMove
    
    if (!moveResult.wasSuccessful) {
      this.metrics.consecutiveFailures++
    } else {
      this.metrics.consecutiveFailures = 0
    }

    this.lastMoveTime = now

    // Adjust difficulty if enough data
    if (this.moveHistory.length >= this.difficultySettings.minimumMoves) {
      this.adjustDifficulty()
    }
  }

  private calculateAverageMoveScore(): number {
    if (this.moveHistory.length === 0) return 0
    
    const successfulMoves = this.moveHistory.filter(move => move.score > 0)
    if (successfulMoves.length === 0) return 0

    const total = successfulMoves.reduce((sum, move) => sum + move.score, 0)
    return total / successfulMoves.length
  }

  private calculateCascadeFrequency(): number {
    if (this.moveHistory.length === 0) return 0
    
    const totalCascades = this.moveHistory.reduce((sum, move) => sum + move.cascades, 0)
    return totalCascades / this.moveHistory.length
  }

  private calculateMoveEfficiency(): number {
    if (this.moveHistory.length === 0) return 0
    
    const successfulMoves = this.moveHistory.filter(move => move.efficiency > 0).length
    return successfulMoves / this.moveHistory.length
  }

  private adjustDifficulty(): void {
    const currentEfficiency = this.metrics.moveEfficiency
    const targetEfficiency = this.difficultySettings.targetMoveEfficiency
    
    // Adjust difficulty based on player performance
    if (currentEfficiency > targetEfficiency + 0.1) {
      // Player is doing too well, increase difficulty
      this.metrics.difficultyLevel = Math.min(1, this.metrics.difficultyLevel + 0.05)
      this.difficultySettings.comboBoostChance = Math.max(0.1, this.difficultySettings.comboBoostChance - 0.02)
    } else if (currentEfficiency < targetEfficiency - 0.1) {
      // Player is struggling, decrease difficulty
      this.metrics.difficultyLevel = Math.max(0, this.metrics.difficultyLevel - 0.05)
      this.difficultySettings.comboBoostChance = Math.min(0.5, this.difficultySettings.comboBoostChance + 0.02)
    }

    // Adjust special gem chance based on consecutive failures
    if (this.metrics.consecutiveFailures > 3) {
      this.difficultySettings.specialGemChance = Math.min(0.25, this.difficultySettings.specialGemChance + 0.02)
    }

    console.log(`🎯 Difficulty adjusted: Level ${this.metrics.difficultyLevel.toFixed(2)}, Combo chance: ${this.difficultySettings.comboBoostChance.toFixed(2)}`)
  }

  // Smart Gem Spawning
  public generateSmartGem(
    board: (Gem | null)[][],
    row: number,
    col: number,
    availableTypes: GemType[]
  ): GemType {
    if (!this.spawnConfig.adaptiveDifficulty) {
      return this.generateBasicGem(availableTypes)
    }

    // Analyze board context
    const context = this.analyzeBoardContext(board, row, col)
    
    // Apply smart generation rules
    let candidates = [...availableTypes]

    // Rule 1: Favor combo setups when difficulty is lower
    if (this.spawnConfig.favorComboSetups && this.metrics.difficultyLevel < 0.7) {
      candidates = this.filterForComboSetups(board, row, col, candidates, context)
    }

    // Rule 2: Balance gem distribution
    if (this.spawnConfig.balanceGemDistribution) {
      candidates = this.balanceGemTypes(candidates)
    }

    // Rule 3: Avoid immediate deadlocks
    if (this.spawnConfig.avoidDeadlocks) {
      candidates = this.avoidDeadlockGems(board, row, col, candidates)
    }

    // Rule 4: Special gem chance adjustment
    if (this.spawnConfig.enableSmartPowerUps && Math.random() < this.difficultySettings.specialGemChance) {
      return this.generateSpecialGem(context)
    }

    // Select final gem type
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : availableTypes[0]
  }

  private generateBasicGem(availableTypes: GemType[]): GemType {
    return availableTypes[Math.floor(Math.random() * availableTypes.length)]
  }

  private analyzeBoardContext(board: (Gem | null)[][], row: number, col: number) {
    const context = {
      nearbyTypes: new Map<GemType, number>(),
      potentialMatches: 0,
      emptySpaces: 0,
      specialGems: 0
    }

    // Analyze 3x3 area around position
    for (let r = Math.max(0, row - 1); r <= Math.min(board.length - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(board[0].length - 1, col + 1); c++) {
        const gem = board[r][c]
        if (gem) {
          const count = context.nearbyTypes.get(gem.type) || 0
          context.nearbyTypes.set(gem.type, count + 1)
        } else {
          context.emptySpaces++
        }
      }
    }

    return context
  }

  private filterForComboSetups(
    board: (Gem | null)[][],
    row: number,
    col: number,
    candidates: GemType[],
    context: any
  ): GemType[] {
    const comboTypes: GemType[] = []

    candidates.forEach(type => {
      // Check if this type would help create potential matches
      const nearbyCount = context.nearbyTypes.get(type) || 0
      
      // Favor types that appear nearby (potential for future matches)
      if (nearbyCount >= 1 && Math.random() < this.difficultySettings.comboBoostChance) {
        comboTypes.push(type)
      }
    })

    return comboTypes.length > 0 ? comboTypes : candidates
  }

  private balanceGemTypes(candidates: GemType[]): GemType[] {
    // Find least used gem types
    const sortedByFreq = candidates.sort((a, b) => {
      const freqA = this.gemTypeFrequency.get(a) || 0
      const freqB = this.gemTypeFrequency.get(b) || 0
      return freqA - freqB
    })

    // Return bottom 60% to encourage diversity
    const count = Math.max(1, Math.floor(sortedByFreq.length * 0.6))
    return sortedByFreq.slice(0, count)
  }

  private avoidDeadlockGems(
    board: (Gem | null)[][],
    row: number,
    col: number,
    candidates: GemType[]
  ): GemType[] {
    // This is a simplified deadlock avoidance
    // In practice, you'd want more sophisticated analysis
    return candidates.filter(type => {
      // Avoid creating isolated gems (different from all neighbors)
      const hasMatchingNeighbor = this.hasMatchingNeighbor(board, row, col, type)
      return hasMatchingNeighbor || Math.random() < 0.3 // Allow some isolation
    })
  }

  private hasMatchingNeighbor(board: (Gem | null)[][], row: number, col: number, type: GemType): boolean {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    
    return directions.some(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc
      
      if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
        const neighbor = board[newRow][newCol]
        return neighbor?.type === type
      }
      return false
    })
  }

  private generateSpecialGem(context: any): GemType {
    // Logic for special gem generation based on context
    // This could be extended to create power-ups, bombs, etc.
    const specialTypes: GemType[] = ['lightning', 'magic']
    return specialTypes[Math.floor(Math.random() * specialTypes.length)]
  }

  // Public API methods
  public updateGemFrequency(type: GemType): void {
    const current = this.gemTypeFrequency.get(type) || 0
    this.gemTypeFrequency.set(type, current + 1)
  }

  public getMetrics(): GameMetrics {
    return { ...this.metrics }
  }

  public getDifficultySettings(): DifficultySettings {
    return { ...this.difficultySettings }
  }

  public updateSpawnConfig(config: Partial<SmartSpawnConfig>): void {
    this.spawnConfig = { ...this.spawnConfig, ...config }
  }

  public resetMetrics(): void {
    this.moveHistory = []
    this.metrics = {
      averageMoveScore: 0,
      cascadeFrequency: 0,
      moveEfficiency: 0,
      consecutiveFailures: 0,
      timeBetweenMoves: 3000,
      difficultyLevel: 0.5
    }
    this.initializeGemFrequency()
  }

  // Performance optimization for board generation
  public shouldRegenerateBoard(gameState: GameState): boolean {
    // Regenerate if too many consecutive failures
    if (this.metrics.consecutiveFailures > 5) {
      return true
    }

    // Regenerate if average move time is too high (player struggling)
    if (this.metrics.timeBetweenMoves > 10000 && this.metrics.moveEfficiency < 0.3) {
      return true
    }

    return false
  }
}

// Singleton instance for global access
export const smartGameMechanics = new SmartGameMechanics() 