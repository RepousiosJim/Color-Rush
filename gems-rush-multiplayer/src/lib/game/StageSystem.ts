import { GemType } from '@/types/game'

export interface Stage {
  id: number
  name: string
  isBoss: boolean
  targetScore: number
  maxMoves: number
  blocksToBreak: number
  specialObjectives?: {
    greenBlocks?: number
    blueBlocks?: number
    specificGems?: { type: GemType; count: number }[]
  }
  difficulty: 'easy' | 'medium' | 'hard' | 'boss'
  rewards: {
    coins: number
    gems: number
    xp: number
    stars: number
  }
  description: string
  backgroundTheme: 'forest' | 'ocean' | 'mountain' | 'volcano' | 'divine'
}

export interface StageProgress {
  currentStage: number
  completedStages: number[]
  starsEarned: { [stageId: number]: number }
  totalStars: number
  unlockedStages: number[]
}

export class StageSystem {
  private stages: Stage[] = []
  private stageProgress: StageProgress

  constructor() {
    this.stageProgress = {
      currentStage: 1,
      completedStages: [],
      starsEarned: {},
      totalStars: 0,
      unlockedStages: [1] // First stage always unlocked
    }
    this.generateStages()
    this.loadProgress()
  }

  private generateStages(): void {
    for (let i = 1; i <= 20; i++) {
      const stage = this.createStage(i)
      this.stages.push(stage)
    }
  }

  private createStage(stageNumber: number): Stage {
    const isBoss = stageNumber % 5 === 0
    const difficulty = this.calculateDifficulty(stageNumber, isBoss)
    const theme = this.getThemeForStage(stageNumber)
    
    // Base calculations
    const baseScore = 1000 + (stageNumber - 1) * 250
    const baseMoves = 15 + Math.floor(stageNumber / 3)
    const baseBlocks = 10 + Math.floor(stageNumber * 1.5)
    
    // Boss level modifications
    const scoreMultiplier = isBoss ? 2.5 : 1
    const moveMultiplier = isBoss ? 1.5 : 1
    const blockMultiplier = isBoss ? 2 : 1
    
    const stage: Stage = {
      id: stageNumber,
      name: isBoss ? this.getBossName(stageNumber) : `Stage ${stageNumber}`,
      isBoss,
      targetScore: Math.floor(baseScore * scoreMultiplier),
      maxMoves: Math.floor(baseMoves * moveMultiplier),
      blocksToBreak: Math.floor(baseBlocks * blockMultiplier),
      specialObjectives: this.generateSpecialObjectives(stageNumber, isBoss),
      difficulty,
      rewards: this.calculateRewards(stageNumber, isBoss),
      description: this.getStageDescription(stageNumber, isBoss),
      backgroundTheme: theme
    }

    return stage
  }

  private calculateDifficulty(stageNumber: number, isBoss: boolean): 'easy' | 'medium' | 'hard' | 'boss' {
    if (isBoss) return 'boss'
    if (stageNumber <= 5) return 'easy'
    if (stageNumber <= 12) return 'medium'
    return 'hard'
  }

  private getThemeForStage(stageNumber: number): 'forest' | 'ocean' | 'mountain' | 'volcano' | 'divine' {
    const themes = ['forest', 'ocean', 'mountain', 'volcano', 'divine'] as const
    return themes[Math.floor((stageNumber - 1) / 4) % themes.length]
  }

  private getBossName(stageNumber: number): string {
    const bossNames = [
      'Forest Guardian', // Stage 5
      'Ocean Leviathan', // Stage 10
      'Mountain Titan',  // Stage 15
      'Divine Emperor'   // Stage 20
    ]
    return bossNames[Math.floor(stageNumber / 5) - 1] || `Boss ${stageNumber}`
  }

  private generateSpecialObjectives(stageNumber: number, isBoss: boolean): Stage['specialObjectives'] {
    const objectives: Stage['specialObjectives'] = {}
    
    // Add green/blue block objectives starting from stage 3
    if (stageNumber >= 3) {
      if (stageNumber % 3 === 0) {
        objectives.greenBlocks = Math.floor(2 + stageNumber / 3)
      }
      if (stageNumber % 4 === 0) {
        objectives.blueBlocks = Math.floor(1 + stageNumber / 4)
      }
    }
    
    // Boss levels have additional gem-specific objectives
    if (isBoss) {
      objectives.specificGems = [
        { type: 'fire', count: 5 + Math.floor(stageNumber / 5) },
        { type: 'water', count: 4 + Math.floor(stageNumber / 5) },
        { type: 'earth', count: 3 + Math.floor(stageNumber / 5) }
      ]
    }
    
    return Object.keys(objectives).length > 0 ? objectives : undefined
  }

  private calculateRewards(stageNumber: number, isBoss: boolean): Stage['rewards'] {
    const baseRewards = {
      coins: 50 + stageNumber * 10,
      gems: Math.max(1, Math.floor(stageNumber / 3)),
      xp: 100 + stageNumber * 25,
      stars: 3
    }
    
    if (isBoss) {
      return {
        coins: baseRewards.coins * 3,
        gems: baseRewards.gems * 2,
        xp: baseRewards.xp * 2,
        stars: 3
      }
    }
    
    return baseRewards
  }

  private getStageDescription(stageNumber: number, isBoss: boolean): string {
    if (isBoss) {
      const bossDescriptions = [
        'Face the mighty Forest Guardian! Break through the green barriers to claim victory.',
        'Dive deep to challenge the Ocean Leviathan! Blue currents block your path.',
        'Ascend the peaks to battle the Mountain Titan! Ancient stone blocks your way.',
        'Enter the divine realm to face the ultimate challenge! All elements converge here.'
      ]
      return bossDescriptions[Math.floor(stageNumber / 5) - 1] || 'Face the ultimate boss challenge!'
    }
    
    const normalDescriptions = [
      'Welcome to your first challenge! Learn the basics of gem matching.',
      'The forest awakens! Green obstacles begin to appear.',
      'Ocean currents flow through the realm! Blue barriers emerge.',
      'Mountain paths grow treacherous! Stone and crystal blocks your way.',
      'Divine energy pulses through the gems! Master all elements to proceed.'
    ]
    
    const descIndex = Math.min(Math.floor((stageNumber - 1) / 4), normalDescriptions.length - 1)
    return normalDescriptions[descIndex]
  }

  // Public methods
  getStage(stageNumber: number): Stage | null {
    return this.stages.find(stage => stage.id === stageNumber) || null
  }

  getCurrentStage(): Stage | null {
    return this.getStage(this.stageProgress.currentStage)
  }

  getAllStages(): Stage[] {
    return [...this.stages]
  }

  getAvailableStages(): Stage[] {
    return this.stages.filter(stage => 
      this.stageProgress.unlockedStages.includes(stage.id)
    )
  }

  isStageUnlocked(stageNumber: number): boolean {
    return this.stageProgress.unlockedStages.includes(stageNumber)
  }

  isStageCompleted(stageNumber: number): boolean {
    return this.stageProgress.completedStages.includes(stageNumber)
  }

  getStageStars(stageNumber: number): number {
    return this.stageProgress.starsEarned[stageNumber] || 0
  }

  completeStage(stageNumber: number, score: number, moves: number, blocksDestroyed: number): {
    success: boolean
    stars: number
    rewards: Stage['rewards']
    nextStageUnlocked?: number
  } {
    const stage = this.getStage(stageNumber)
    if (!stage) {
      return { success: false, stars: 0, rewards: { coins: 0, gems: 0, xp: 0, stars: 0 } }
    }

    // Check completion requirements
    const scoreReached = score >= stage.targetScore
    const blocksDestroyed_req = blocksDestroyed >= stage.blocksToBreak
    const movesValid = moves <= stage.maxMoves
    
    if (!scoreReached || !blocksDestroyed_req || !movesValid) {
      return { success: false, stars: 0, rewards: { coins: 0, gems: 0, xp: 0, stars: 0 } }
    }

    // Calculate stars based on performance
    let stars = 1 // Base completion star
    
    // Bonus star for exceeding score target significantly
    if (score >= stage.targetScore * 1.5) {
      stars++
    }
    
    // Bonus star for efficiency (using fewer moves)
    if (moves <= Math.floor(stage.maxMoves * 0.7)) {
      stars++
    }

    // Update progress
    if (!this.isStageCompleted(stageNumber)) {
      this.stageProgress.completedStages.push(stageNumber)
    }
    
    // Update stars (keep best)
    const currentStars = this.getStageStars(stageNumber)
    if (stars > currentStars) {
      this.stageProgress.starsEarned[stageNumber] = stars
      this.stageProgress.totalStars += (stars - currentStars)
    }

    // Unlock next stage
    let nextStageUnlocked: number | undefined
    const nextStage = stageNumber + 1
    if (nextStage <= 20 && !this.isStageUnlocked(nextStage)) {
      this.stageProgress.unlockedStages.push(nextStage)
      nextStageUnlocked = nextStage
    }

    this.saveProgress()

    return {
      success: true,
      stars,
      rewards: stage.rewards,
      nextStageUnlocked
    }
  }

  setCurrentStage(stageNumber: number): boolean {
    if (this.isStageUnlocked(stageNumber)) {
      this.stageProgress.currentStage = stageNumber
      this.saveProgress()
      return true
    }
    return false
  }

  getProgress(): StageProgress {
    return { ...this.stageProgress }
  }

  // Stage difficulty progression
  getStagesByDifficulty(difficulty: Stage['difficulty']): Stage[] {
    return this.stages.filter(stage => stage.difficulty === difficulty)
  }

  getBossStages(): Stage[] {
    return this.stages.filter(stage => stage.isBoss)
  }

  getCompletionPercentage(): number {
    return (this.stageProgress.completedStages.length / this.stages.length) * 100
  }

  private saveProgress(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gems-rush-stage-progress', JSON.stringify(this.stageProgress))
    }
  }

  private loadProgress(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gems-rush-stage-progress')
      if (saved) {
        try {
          this.stageProgress = { ...this.stageProgress, ...JSON.parse(saved) }
        } catch (error) {
          console.warn('Failed to load stage progress:', error)
        }
      }
    }
  }

  // Reset progress (for testing/debugging)
  resetProgress(): void {
    this.stageProgress = {
      currentStage: 1,
      completedStages: [],
      starsEarned: {},
      totalStars: 0,
      unlockedStages: [1]
    }
    this.saveProgress()
  }
}

// Singleton instance
export const stageSystem = new StageSystem() 