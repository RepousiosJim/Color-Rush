export interface GameLevel {
  id: number
  worldId: number
  type: 'score' | 'moves' | 'time' | 'clear' | 'combo' | 'cascade' | 'boss'
  name: string
  description: string
  
  // Objectives
  targetScore: number
  maxMoves?: number
  timeLimit?: number
  clearTarget?: { gemType: string; count: number }
  comboTarget?: number
  cascadeTarget?: number
  
  // Star Requirements
  starRequirements: {
    onestar: { score: number; moves?: number; time?: number }
    twostar: { score: number; moves?: number; time?: number }
    threestar: { score: number; moves?: number; time?: number }
  }
  
  // Rewards
  rewards: {
    essence: number
    experience: number
    gems?: number
  }
  
  // State
  isUnlocked: boolean
  isCompleted: boolean
  bestScore: number
  bestMoves: number
  bestTime: number
  stars: number
  completedAt?: Date
}

export interface GameWorld {
  id: number
  name: string
  theme: string
  description: string
  symbol: string
  color: string
  backgroundGradient: string
  
  // Level Configuration
  levels: GameLevel[]
  totalLevels: number
  
  // Unlock Requirements
  unlockRequirements: {
    previousWorldStars?: number
    levelsCompleted?: number
  }
  
  // State
  isUnlocked: boolean
  isCompleted: boolean
  starsEarned: number
  levelsCompleted: number
  completedAt?: Date
}

export interface LevelResult {
  score: number
  moves: number
  time: number
  stars: number
  essence: number
  experience: number
  newBest: {
    score: boolean
    moves: boolean
    time: boolean
    stars: boolean
  }
}

export class LevelProgressionManager {
  private worlds: Map<number, GameWorld> = new Map()
  private currentLevel: GameLevel | null = null
  private eventListeners: Map<string, Function[]> = new Map()
  
  constructor() {
    this.initializeWorlds()
    this.loadProgress()
  }

  // World and Level Management
  private initializeWorlds(): void {
    const worldsData = [
      {
        id: 1,
        name: 'Infernal Forge',
        theme: 'fire',
        description: 'Where divine flames burn eternal and forge the strongest gems',
        symbol: '🔥',
        color: '#FF4500',
        backgroundGradient: 'linear-gradient(135deg, #FF4500, #DC143C, #8B0000)',
        unlockRequirements: {},
        levels: this.createFireWorldLevels()
      },
      {
        id: 2,
        name: 'Celestial Ocean',
        theme: 'water',
        description: 'Where divine waters flow with ancient wisdom and power',
        symbol: '💧',
        color: '#1E90FF',
        backgroundGradient: 'linear-gradient(135deg, #1E90FF, #4169E1, #000080)',
        unlockRequirements: { previousWorldStars: 10 },
        levels: this.createWaterWorldLevels()
      },
      {
        id: 3,
        name: 'Ancient Foundations',
        theme: 'earth',
        description: 'Where eternal strength supports all divine creation',
        symbol: '🌍',
        color: '#8B4513',
        backgroundGradient: 'linear-gradient(135deg, #8B4513, #A0522D, #654321)',
        unlockRequirements: { previousWorldStars: 25 },
        levels: this.createEarthWorldLevels()
      },
      {
        id: 4,
        name: 'Sky Temple',
        theme: 'air',
        description: 'Where celestial winds carry divine messages across realms',
        symbol: '💨',
        color: '#87CEEB',
        backgroundGradient: 'linear-gradient(135deg, #87CEEB, #B0E0E6, #4682B4)',
        unlockRequirements: { previousWorldStars: 45 },
        levels: this.createAirWorldLevels()
      },
      {
        id: 5,
        name: 'Thunder Temple',
        theme: 'lightning',
        description: 'Where divine power crackles with pure celestial energy',
        symbol: '⚡',
        color: '#FFD700',
        backgroundGradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
        unlockRequirements: { previousWorldStars: 70 },
        levels: this.createLightningWorldLevels()
      },
      {
        id: 6,
        name: 'Living Gardens',
        theme: 'nature',
        description: 'Where divine life force nurtures endless growth and renewal',
        symbol: '🌿',
        color: '#32CD32',
        backgroundGradient: 'linear-gradient(135deg, #32CD32, #228B22, #006400)',
        unlockRequirements: { previousWorldStars: 100 },
        levels: this.createNatureWorldLevels()
      },
      {
        id: 7,
        name: 'Mystical Nexus',
        theme: 'magic',
        description: 'Where infinite divine potential awaits the worthy',
        symbol: '🔮',
        color: '#9932CC',
        backgroundGradient: 'linear-gradient(135deg, #9932CC, #8A2BE2, #4B0082)',
        unlockRequirements: { previousWorldStars: 135 },
        levels: this.createMagicWorldLevels()
      }
    ]

    worldsData.forEach(worldData => {
      const world: GameWorld = {
        ...worldData,
        totalLevels: worldData.levels.length,
        isUnlocked: worldData.id === 1, // First world unlocked by default
        isCompleted: false,
        starsEarned: 0,
        levelsCompleted: 0
      }
      
      this.worlds.set(world.id, world)
    })
  }

  private createFireWorldLevels(): GameLevel[] {
    return [
      {
        id: 1, worldId: 1, type: 'score', name: 'Ember Trial', 
        description: 'Learn the basics of divine flame manipulation',
        targetScore: 1000, maxMoves: 25,
        starRequirements: {
          onestar: { score: 1000, moves: 25 },
          twostar: { score: 1500, moves: 20 },
          threestar: { score: 2000, moves: 15 }
        },
        rewards: { essence: 50, experience: 100 },
        isUnlocked: true, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 2, worldId: 1, type: 'clear', name: 'Flame Harvest',
        description: 'Clear fire gems to stoke the eternal flames',
        targetScore: 1200, clearTarget: { gemType: 'fire', count: 30 }, maxMoves: 30,
        starRequirements: {
          onestar: { score: 1200, moves: 30 },
          twostar: { score: 1800, moves: 25 },
          threestar: { score: 2400, moves: 20 }
        },
        rewards: { essence: 75, experience: 150 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 3, worldId: 1, type: 'combo', name: 'Infernal Chains',
        description: 'Master the art of consecutive fire combinations',
        targetScore: 1500, comboTarget: 5, maxMoves: 35,
        starRequirements: {
          onestar: { score: 1500, moves: 35 },
          twostar: { score: 2250, moves: 30 },
          threestar: { score: 3000, moves: 25 }
        },
        rewards: { essence: 100, experience: 200 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 4, worldId: 1, type: 'time', name: 'Rapid Burn',
        description: 'Race against time in the forge of flames',
        targetScore: 2000, timeLimit: 120,
        starRequirements: {
          onestar: { score: 2000, time: 120 },
          twostar: { score: 2800, time: 90 },
          threestar: { score: 3600, time: 60 }
        },
        rewards: { essence: 125, experience: 250 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 5, worldId: 1, type: 'boss', name: 'Flame Lord',
        description: 'Face the guardian of the Infernal Forge',
        targetScore: 4000, maxMoves: 40,
        starRequirements: {
          onestar: { score: 4000, moves: 40 },
          twostar: { score: 6000, moves: 35 },
          threestar: { score: 8000, moves: 30 }
        },
        rewards: { essence: 250, experience: 500, gems: 10 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      }
    ]
  }

  private createWaterWorldLevels(): GameLevel[] {
    return [
      {
        id: 6, worldId: 2, type: 'score', name: 'Tide Pool',
        description: 'Learn to flow with the celestial currents',
        targetScore: 1400, maxMoves: 25,
        starRequirements: {
          onestar: { score: 1400, moves: 25 },
          twostar: { score: 2100, moves: 20 },
          threestar: { score: 2800, moves: 15 }
        },
        rewards: { essence: 60, experience: 120 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 7, worldId: 2, type: 'cascade', name: 'Flowing Waters',
        description: 'Create cascading chains like flowing rivers',
        targetScore: 1600, cascadeTarget: 3, maxMoves: 30,
        starRequirements: {
          onestar: { score: 1600, moves: 30 },
          twostar: { score: 2400, moves: 25 },
          threestar: { score: 3200, moves: 20 }
        },
        rewards: { essence: 80, experience: 160 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 8, worldId: 2, type: 'clear', name: 'Ocean Depths',
        description: 'Dive deep to gather water essence',
        targetScore: 1800, clearTarget: { gemType: 'water', count: 40 }, maxMoves: 35,
        starRequirements: {
          onestar: { score: 1800, moves: 35 },
          twostar: { score: 2700, moves: 30 },
          threestar: { score: 3600, moves: 25 }
        },
        rewards: { essence: 110, experience: 220 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 9, worldId: 2, type: 'time', name: 'Tidal Rush',
        description: 'Ride the celestial tides to victory',
        targetScore: 2500, timeLimit: 100,
        starRequirements: {
          onestar: { score: 2500, time: 100 },
          twostar: { score: 3500, time: 80 },
          threestar: { score: 4500, time: 60 }
        },
        rewards: { essence: 140, experience: 280 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      },
      {
        id: 10, worldId: 2, type: 'boss', name: 'Ocean Guardian',
        description: 'Challenge the keeper of celestial waters',
        targetScore: 5000, maxMoves: 45,
        starRequirements: {
          onestar: { score: 5000, moves: 45 },
          twostar: { score: 7000, moves: 40 },
          threestar: { score: 9000, moves: 35 }
        },
        rewards: { essence: 300, experience: 600, gems: 15 },
        isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
      }
    ]
  }

  // Similar methods for other worlds...
  private createEarthWorldLevels(): GameLevel[] {
    // Earth world levels (levels 11-15)
    return []
  }

  private createAirWorldLevels(): GameLevel[] {
    // Air world levels (levels 16-20)
    return []
  }

  private createLightningWorldLevels(): GameLevel[] {
    // Lightning world levels (levels 21-25)
    return []
  }

  private createNatureWorldLevels(): GameLevel[] {
    // Nature world levels (levels 26-30)
    return []
  }

  private createMagicWorldLevels(): GameLevel[] {
    // Magic world levels (levels 31-35)
    return []
  }

  // Level Management
  public getWorld(worldId: number): GameWorld | undefined {
    return this.worlds.get(worldId)
  }

  public getAllWorlds(): GameWorld[] {
    return Array.from(this.worlds.values()).sort((a, b) => a.id - b.id)
  }

  public getLevel(worldId: number, levelId: number): GameLevel | undefined {
    const world = this.worlds.get(worldId)
    if (!world) return undefined
    return world.levels.find(level => level.id === levelId)
  }

  public getCurrentLevel(): GameLevel | null {
    return this.currentLevel
  }

  public startLevel(worldId: number, levelId: number): boolean {
    const level = this.getLevel(worldId, levelId)
    if (!level || !level.isUnlocked) {
      return false
    }

    this.currentLevel = level
    this.emit('level:started', { worldId, levelId, level })
    return true
  }

  // Star Calculation
  public calculateStars(level: GameLevel, score: number, moves: number, time: number): number {
    const { starRequirements } = level
    let stars = 0

    // Check 3-star requirements first
    if (this.meetsStarRequirement(starRequirements.threestar, score, moves, time)) {
      stars = 3
    } else if (this.meetsStarRequirement(starRequirements.twostar, score, moves, time)) {
      stars = 2
    } else if (this.meetsStarRequirement(starRequirements.onestar, score, moves, time)) {
      stars = 1
    }

    return stars
  }

  private meetsStarRequirement(
    requirement: { score: number; moves?: number; time?: number },
    score: number, 
    moves: number, 
    time: number
  ): boolean {
    if (score < requirement.score) return false
    if (requirement.moves && moves > requirement.moves) return false
    if (requirement.time && time > requirement.time) return false
    return true
  }

  // Level Completion
  public completeLevel(score: number, moves: number, time: number): LevelResult | null {
    if (!this.currentLevel) return null

    const level = this.currentLevel
    const stars = this.calculateStars(level, score, moves, time)
    
    if (stars === 0) {
      this.emit('level:failed', { level, score, moves, time })
      return null
    }

    // Calculate rewards
    const baseEssence = level.rewards.essence
    const starBonus = stars * 25
    const essence = baseEssence + starBonus

    const baseExperience = level.rewards.experience
    const expBonus = stars * 50
    const experience = baseExperience + expBonus

    // Update level progress
    const wasFirstCompletion = !level.isCompleted
    const newBest = {
      score: score > level.bestScore,
      moves: moves < level.bestMoves || level.bestMoves === 0,
      time: time < level.bestTime || level.bestTime === 0,
      stars: stars > level.stars
    }

    // Update level data
    level.isCompleted = true
    level.bestScore = Math.max(level.bestScore, score)
    level.bestMoves = level.bestMoves === 0 ? moves : Math.min(level.bestMoves, moves)
    level.bestTime = level.bestTime === 0 ? time : Math.min(level.bestTime, time)
    level.stars = Math.max(level.stars, stars)
    level.completedAt = new Date()

    // Update world progress
    const world = this.worlds.get(level.worldId)!
    if (wasFirstCompletion) {
      world.levelsCompleted++
    }
    
    // Recalculate world stars
    world.starsEarned = world.levels.reduce((total, l) => total + l.stars, 0)
    
    // Check if world is completed
    if (world.levelsCompleted === world.totalLevels && !world.isCompleted) {
      world.isCompleted = true
      world.completedAt = new Date()
      this.emit('world:completed', { world })
    }

    // Unlock next level/world
    this.unlockNext(level)

    // Save progress
    this.saveProgress()

    const result: LevelResult = {
      score,
      moves,
      time,
      stars,
      essence,
      experience,
      newBest
    }

    this.emit('level:completed', { level, result, wasFirstCompletion })
    return result
  }

  private unlockNext(completedLevel: GameLevel): void {
    const world = this.worlds.get(completedLevel.worldId)!
    
    // Unlock next level in same world
    const nextLevelInWorld = world.levels.find(l => l.id === completedLevel.id + 1)
    if (nextLevelInWorld && !nextLevelInWorld.isUnlocked) {
      nextLevelInWorld.isUnlocked = true
      this.emit('level:unlocked', { level: nextLevelInWorld })
    }

    // Check if next world should be unlocked
    const nextWorld = this.worlds.get(world.id + 1)
    if (nextWorld && !nextWorld.isUnlocked) {
      const totalStars = Array.from(this.worlds.values())
        .slice(0, world.id)
        .reduce((total, w) => total + w.starsEarned, 0)

      if (nextWorld.unlockRequirements.previousWorldStars && 
          totalStars >= nextWorld.unlockRequirements.previousWorldStars) {
        nextWorld.isUnlocked = true
        // Unlock first level of new world
        if (nextWorld.levels.length > 0) {
          nextWorld.levels[0].isUnlocked = true
        }
        this.emit('world:unlocked', { world: nextWorld })
      }
    }
  }

  // Progress Persistence
  private saveProgress(): void {
    const progressData = {
      worlds: Array.from(this.worlds.values()),
      lastSaved: new Date().toISOString()
    }
    
    try {
      localStorage.setItem('gems_rush_level_progress', JSON.stringify(progressData))
    } catch (error) {
      console.error('Failed to save level progress:', error)
    }
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('gems_rush_level_progress')
      if (!saved) return

      const progressData = JSON.parse(saved)
      
      progressData.worlds.forEach((savedWorld: GameWorld) => {
        const world = this.worlds.get(savedWorld.id)
        if (world) {
          // Update world state
          world.isUnlocked = savedWorld.isUnlocked
          world.isCompleted = savedWorld.isCompleted
          world.starsEarned = savedWorld.starsEarned
          world.levelsCompleted = savedWorld.levelsCompleted
          world.completedAt = savedWorld.completedAt ? new Date(savedWorld.completedAt) : undefined

          // Update level states
          savedWorld.levels.forEach((savedLevel: GameLevel) => {
            const level = world.levels.find(l => l.id === savedLevel.id)
            if (level) {
              level.isUnlocked = savedLevel.isUnlocked
              level.isCompleted = savedLevel.isCompleted
              level.bestScore = savedLevel.bestScore
              level.bestMoves = savedLevel.bestMoves
              level.bestTime = savedLevel.bestTime
              level.stars = savedLevel.stars
              level.completedAt = savedLevel.completedAt ? new Date(savedLevel.completedAt) : undefined
            }
          })
        }
      })
    } catch (error) {
      console.error('Failed to load level progress:', error)
    }
  }

  // Statistics Integration
  public getProgressionStats() {
    const allWorlds = this.getAllWorlds()
    const totalLevels = allWorlds.reduce((sum, world) => sum + world.totalLevels, 0)
    const completedLevels = allWorlds.reduce((sum, world) => sum + world.levelsCompleted, 0)
    const totalStars = allWorlds.reduce((sum, world) => sum + world.starsEarned, 0)
    const maxStars = totalLevels * 3

    return {
      totalWorlds: allWorlds.length,
      worldsUnlocked: allWorlds.filter(w => w.isUnlocked).length,
      worldsCompleted: allWorlds.filter(w => w.isCompleted).length,
      totalLevels,
      levelsCompleted: completedLevels,
      totalStars,
      maxStars,
      progressPercentage: (completedLevels / totalLevels) * 100
    }
  }

  // Event System
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in level progression event listener for ${event}:`, error)
        }
      })
    }
  }

  // Cleanup
  public destroy(): void {
    this.eventListeners.clear()
    this.currentLevel = null
  }
}

// Singleton instance
export const levelProgressionManager = new LevelProgressionManager() 