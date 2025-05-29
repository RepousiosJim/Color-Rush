import {
  GameStatistics,
  PerformanceStats,
  ProgressionStats,
  CurrencyStats,
  MatchStatistics,
  SessionStats,
  StatisticsEvent,
  Achievement,
  CurrencyTransaction,
  Leaderboard,
  StarRating,
  VisualEffects
} from '@/types/statistics'

export class StatisticsManager {
  private statistics: GameStatistics
  private listeners: Map<string, Function[]> = new Map()
  private sessionStartTime: Date = new Date()
  private isInitialized = false

  constructor() {
    this.statistics = this.createDefaultStatistics()
    this.startSession()
  }

  // Initialization
  public async initialize(): Promise<void> {
    try {
      await this.loadStatistics()
      this.isInitialized = true
      this.emit('statistics:initialized', this.statistics)
    } catch (error) {
      console.error('Failed to initialize statistics:', error)
      this.statistics = this.createDefaultStatistics()
      this.emit('statistics:error', { message: 'Failed to initialize statistics' })
    }
  }

  // Statistics Getters
  public getStatistics(): GameStatistics {
    return { ...this.statistics }
  }

  public getPerformance(): PerformanceStats {
    return { ...this.statistics.performance }
  }

  public getProgression(): ProgressionStats {
    return { ...this.statistics.progression }
  }

  public getCurrency(): CurrencyStats {
    return { ...this.statistics.currency }
  }

  public getMatches(): MatchStatistics {
    return { ...this.statistics.matches }
  }

  public getSession(): SessionStats {
    return { ...this.statistics.session }
  }

  // Event Processing
  public processEvent(event: StatisticsEvent): void {
    if (!this.isInitialized) {
      console.warn('Statistics manager not initialized')
      return
    }

    try {
      switch (event.type) {
        case 'GAME_STARTED':
          this.handleGameStarted(event.gameMode, event.difficulty)
          break
        case 'GAME_COMPLETED':
          this.handleGameCompleted(event.score, event.moves, event.time, event.won)
          break
        case 'LEVEL_COMPLETED':
          this.handleLevelCompleted(event.level, event.score, event.moves, event.time, event.stars)
          break
        case 'MATCH_MADE':
          this.handleMatchMade(event.gemType, event.matchSize, event.cascade, event.combo)
          break
        case 'POWER_UP_USED':
          this.handlePowerUpUsed(event.powerUpType, event.effectiveness)
          break
        case 'ACHIEVEMENT_UNLOCKED':
          this.handleAchievementUnlocked(event.achievementId)
          break
        case 'ESSENCE_EARNED':
          this.handleEssenceEarned(event.amount, event.source)
          break
        case 'ESSENCE_SPENT':
          this.handleEssenceSpent(event.amount, event.reason)
          break
        case 'EXPERIENCE_GAINED':
          this.handleExperienceGained(event.amount, event.source)
          break
        case 'STREAK_UPDATED':
          this.handleStreakUpdated(event.streakType, event.newStreak)
          break
        case 'PERSONAL_BEST':
          this.handlePersonalBest(event.category, event.value, event.previousBest)
          break
      }

      this.updateTimestamps()
      this.saveStatistics()
      this.emit('statistics:updated', this.statistics)

    } catch (error) {
      console.error('Error processing statistics event:', error)
      this.emit('statistics:error', { message: 'Failed to process event', event })
    }
  }

  // Game Event Handlers
  private handleGameStarted(gameMode: string, difficulty: string): void {
    // Update session
    this.statistics.session.currentSession.gamesPlayed++
    
    // Update difficulty progress
    if (!this.statistics.progression.difficultyProgress[difficulty]) {
      this.statistics.progression.difficultyProgress[difficulty] = {
        difficulty,
        levelsCompleted: 0,
        bestScore: 0,
        averageScore: 0,
        timesPlayed: 0
      }
    }
    this.statistics.progression.difficultyProgress[difficulty].timesPlayed++

    this.emit('game:started', { gameMode, difficulty })
  }

  private handleGameCompleted(score: number, moves: number, time: number, won: boolean): void {
    const perf = this.statistics.performance
    const session = this.statistics.session.currentSession

    // Update performance stats
    perf.gamesPlayed++
    perf.totalScore += score
    perf.totalMoves += moves
    perf.averageScore = perf.totalScore / perf.gamesPlayed
    perf.averageMovesPerLevel = perf.totalMoves / perf.gamesPlayed

    if (won) {
      perf.gamesWon++
      perf.currentWinStreak++
      perf.bestWinStreak = Math.max(perf.bestWinStreak, perf.currentWinStreak)
    } else {
      perf.gamesLost++
      perf.currentWinStreak = 0
    }

    perf.winRate = perf.gamesWon / perf.gamesPlayed

    // Update best scores
    if (score > perf.bestScore) {
      perf.bestScore = score
      this.processEvent({ type: 'PERSONAL_BEST', category: 'score', value: score, previousBest: perf.bestScore })
    }

    // Update time records
    if (time < perf.fastestLevel || perf.fastestLevel === 0) {
      perf.fastestLevel = time
    }
    if (time > perf.longestLevel) {
      perf.longestLevel = time
    }
    perf.averageLevelTime = (perf.averageLevelTime * (perf.gamesPlayed - 1) + time) / perf.gamesPlayed

    // Update moves records
    if (moves < perf.bestMovesPerLevel || perf.bestMovesPerLevel === 0) {
      perf.bestMovesPerLevel = moves
    }

    // Update session
    session.bestScore = Math.max(session.bestScore, score)
    session.totalScore += score

    // Calculate essence earned
    const essenceEarned = this.calculateEssenceReward(score, moves, time, won)
    if (essenceEarned > 0) {
      this.processEvent({ type: 'ESSENCE_EARNED', amount: essenceEarned, source: 'game_completion' })
    }

    // Calculate experience gained
    const experienceGained = this.calculateExperienceReward(score, moves, time, won)
    if (experienceGained > 0) {
      this.processEvent({ type: 'EXPERIENCE_GAINED', amount: experienceGained, source: 'game_completion' })
    }

    this.emit('game:completed', { score, moves, time, won, essenceEarned, experienceGained })
  }

  private handleLevelCompleted(level: number, score: number, moves: number, time: number, stars: number): void {
    const prog = this.statistics.progression
    
    // Update level progression
    prog.levelsCompleted = Math.max(prog.levelsCompleted, level)
    prog.levelsUnlocked = Math.max(prog.levelsUnlocked, level + 1)
    
    // Update star ratings
    const previousStars = prog.starsByLevel[level] || 0
    if (stars > previousStars) {
      prog.starsByLevel[level] = stars
      prog.totalStars += (stars - previousStars)
      
      // Award star rewards
      this.awardStarRewards(level, stars)
    }

    // Update campaign progress
    const campaign = prog.campaignProgress
    campaign.currentLevel = Math.max(campaign.currentLevel, level)
    
    // Check for world completion
    this.updateWorldProgress(level)

    this.emit('level:completed', { level, score, moves, time, stars })
  }

  private handleMatchMade(gemType: string, matchSize: number, cascade: boolean, combo: number): void {
    const matches = this.statistics.matches

    // Update basic match stats
    matches.totalMatches++
    matches.matchesBySize[matchSize] = (matches.matchesBySize[matchSize] || 0) + 1
    matches.matchesByType[gemType] = (matches.matchesByType[gemType] || 0) + 1

    // Update combo stats
    if (combo > 1) {
      matches.combos.totalCombos++
      matches.combos.bestCombo = Math.max(matches.combos.bestCombo, combo)
      matches.combos.combosBySize[combo] = (matches.combos.combosBySize[combo] || 0) + 1
      
      // Recalculate average
      const totalComboSum = Object.entries(matches.combos.combosBySize)
        .reduce((sum, [size, count]) => sum + (parseInt(size) * count), 0)
      matches.combos.averageCombo = totalComboSum / matches.combos.totalCombos
    }

    // Update cascade stats
    if (cascade) {
      matches.cascades.totalCascades++
      // Additional cascade logic would be implemented here
    }

    this.emit('match:made', { gemType, matchSize, cascade, combo })
  }

  private handlePowerUpUsed(powerUpType: string, effectiveness: number): void {
    const powerUps = this.statistics.matches.powerUps

    powerUps.totalPowerUpsUsed++
    powerUps.powerUpsByType[powerUpType] = (powerUps.powerUpsByType[powerUpType] || 0) + 1
    powerUps.powerUpEfficiency[powerUpType] = effectiveness

    this.emit('powerup:used', { powerUpType, effectiveness })
  }

  private handleAchievementUnlocked(achievementId: string): void {
    const achievement = this.getAchievementById(achievementId)
    if (achievement && !achievement.isUnlocked) {
      achievement.isUnlocked = true
      achievement.unlockedAt = new Date()
      
      this.statistics.progression.achievementPoints += achievement.points
      this.statistics.session.currentSession.achievementsUnlocked++

      // Award achievement rewards
      this.awardAchievementRewards(achievement)

      this.emit('achievement:unlocked', achievement)
    }
  }

  private handleEssenceEarned(amount: number, source: string): void {
    const currency = this.statistics.currency

    currency.divineEssence += amount
    currency.totalEssenceEarned += amount

    // Add transaction
    this.addCurrencyTransaction('essence', 'earned', amount, source, currency.divineEssence)

    // Update session
    this.statistics.session.currentSession.essenceEarned += amount

    this.emit('essence:earned', { amount, source, newBalance: currency.divineEssence })
  }

  private handleEssenceSpent(amount: number, reason: string): void {
    const currency = this.statistics.currency

    if (currency.divineEssence >= amount) {
      currency.divineEssence -= amount
      currency.totalEssenceSpent += amount

      // Add transaction
      this.addCurrencyTransaction('essence', 'spent', amount, reason, currency.divineEssence)

      this.emit('essence:spent', { amount, reason, newBalance: currency.divineEssence })
    } else {
      this.emit('essence:insufficient', { required: amount, available: currency.divineEssence })
    }
  }

  private handleExperienceGained(amount: number, source: string): void {
    const currency = this.statistics.currency

    currency.experience += amount
    currency.totalExperience += amount

    // Check for level up
    const oldLevel = currency.level
    while (currency.experience >= currency.experienceToNext) {
      currency.experience -= currency.experienceToNext
      currency.level++
      currency.experienceToNext = this.calculateExperienceForLevel(currency.level + 1)
      
      this.emit('level:up', { newLevel: currency.level, oldLevel })
      
      // Award level up rewards
      this.awardLevelUpRewards(currency.level)
    }

    // Add transaction
    this.addCurrencyTransaction('experience', 'earned', amount, source, currency.totalExperience)

    this.emit('experience:gained', { amount, source, newLevel: currency.level })
  }

  private handleStreakUpdated(streakType: 'win' | 'play', newStreak: number): void {
    if (streakType === 'win') {
      this.statistics.performance.currentWinStreak = newStreak
      this.statistics.performance.bestWinStreak = Math.max(
        this.statistics.performance.bestWinStreak,
        newStreak
      )
    } else {
      this.statistics.performance.currentPlayStreak = newStreak
      this.statistics.performance.bestPlayStreak = Math.max(
        this.statistics.performance.bestPlayStreak,
        newStreak
      )
    }

    this.emit('streak:updated', { streakType, newStreak })
  }

  private handlePersonalBest(category: string, value: number, previousBest: number): void {
    // Add to personal bests
    this.statistics.performance.personalBest.push({
      category: category as any,
      value,
      level: this.statistics.progression.campaignProgress.currentLevel,
      mode: 'normal', // Would be determined from current game mode
      achievedAt: new Date()
    })

    // Keep only top 10 personal bests per category
    this.statistics.performance.personalBest = this.statistics.performance.personalBest
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    this.emit('personal:best', { category, value, previousBest })
  }

  // Helper Methods
  private calculateEssenceReward(score: number, moves: number, time: number, won: boolean): number {
    let baseReward = Math.floor(score / 100)
    
    if (won) {
      baseReward *= 1.5
    }
    
    // Bonus for efficiency
    if (moves < 20) {
      baseReward *= 1.2
    }
    
    // Bonus for speed
    if (time < 60) {
      baseReward *= 1.1
    }
    
    return Math.floor(baseReward)
  }

  private calculateExperienceReward(score: number, moves: number, time: number, won: boolean): number {
    let baseExp = Math.floor(score / 50)
    
    if (won) {
      baseExp += 50
    }
    
    return baseExp
  }

  private calculateExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1))
  }

  private awardStarRewards(level: number, stars: number): void {
    // Implementation for star-based rewards
    const essenceReward = stars * 10
    if (essenceReward > 0) {
      this.processEvent({ type: 'ESSENCE_EARNED', amount: essenceReward, source: 'star_reward' })
    }
  }

  private awardAchievementRewards(achievement: Achievement): void {
    // Implementation for achievement rewards
    const essenceReward = achievement.points * 5
    if (essenceReward > 0) {
      this.processEvent({ type: 'ESSENCE_EARNED', amount: essenceReward, source: 'achievement' })
    }
  }

  private awardLevelUpRewards(level: number): void {
    // Implementation for level up rewards
    const essenceReward = level * 25
    const gemsReward = Math.floor(level / 5)
    
    if (essenceReward > 0) {
      this.processEvent({ type: 'ESSENCE_EARNED', amount: essenceReward, source: 'level_up' })
    }
    
    if (gemsReward > 0) {
      this.statistics.currency.gems += gemsReward
      this.statistics.currency.totalGemsEarned += gemsReward
    }
  }

  private updateWorldProgress(level: number): void {
    // Implementation for world progress tracking
    const worldId = Math.floor((level - 1) / 10) + 1
    const worldProgress = this.statistics.progression.campaignProgress.worldProgress[worldId]
    
    if (worldProgress) {
      worldProgress.levelsCompleted = Math.max(worldProgress.levelsCompleted, level % 10 || 10)
      
      if (worldProgress.levelsCompleted >= worldProgress.totalLevels) {
        worldProgress.isCompleted = true
        worldProgress.completedAt = new Date()
        this.statistics.progression.campaignProgress.worldsCompleted++
      }
    }
  }

  private addCurrencyTransaction(
    type: 'essence' | 'gems' | 'experience',
    action: 'earned' | 'spent' | 'purchased',
    amount: number,
    reason: string,
    balanceAfter: number
  ): void {
    const transaction: CurrencyTransaction = {
      id: Date.now().toString() + Math.random(),
      type,
      action,
      amount,
      reason,
      timestamp: new Date(),
      balanceAfter
    }

    this.statistics.currency.transactions.push(transaction)
    
    // Keep only last 100 transactions
    if (this.statistics.currency.transactions.length > 100) {
      this.statistics.currency.transactions = this.statistics.currency.transactions.slice(-100)
    }
  }

  private getAchievementById(id: string): Achievement | undefined {
    return this.statistics.progression.achievements.find(a => a.id === id)
  }

  // Session Management
  private startSession(): void {
    this.sessionStartTime = new Date()
    this.statistics.session.currentSession = {
      startTime: this.sessionStartTime,
      duration: 0,
      gamesPlayed: 0,
      bestScore: 0,
      totalScore: 0,
      levelProgress: 0,
      essenceEarned: 0,
      achievementsUnlocked: 0
    }
  }

  private updateTimestamps(): void {
    this.statistics.lastUpdated = new Date()
    this.statistics.session.currentSession.duration = 
      Math.floor((Date.now() - this.sessionStartTime.getTime()) / 1000)
  }

  // Persistence
  private async loadStatistics(): Promise<void> {
    try {
      const stored = localStorage.getItem('gems_rush_statistics')
      if (stored) {
        const parsedStats = JSON.parse(stored)
        this.statistics = {
          ...this.createDefaultStatistics(),
          ...parsedStats,
          lastUpdated: new Date(parsedStats.lastUpdated || Date.now())
        }
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
      this.statistics = this.createDefaultStatistics()
    }
  }

  private saveStatistics(): void {
    try {
      localStorage.setItem('gems_rush_statistics', JSON.stringify(this.statistics))
    } catch (error) {
      console.error('Failed to save statistics:', error)
    }
  }

  // Default Statistics
  private createDefaultStatistics(): GameStatistics {
    return {
      performance: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        bestScore: 0,
        totalScore: 0,
        averageScore: 0,
        currentWinStreak: 0,
        bestWinStreak: 0,
        currentPlayStreak: 0,
        bestPlayStreak: 0,
        fastestLevel: 0,
        longestLevel: 0,
        averageLevelTime: 0,
        bestMovesPerLevel: 0,
        totalMoves: 0,
        averageMovesPerLevel: 0,
        personalBest: [],
        globalRank: 0,
        weeklyRank: 0
      },
      progression: {
        campaignProgress: {
          currentWorld: 1,
          currentLevel: 1,
          worldsUnlocked: 1,
          worldsCompleted: 0,
          totalWorlds: 10,
          worldProgress: {}
        },
        levelsCompleted: 0,
        levelsUnlocked: 1,
        totalLevels: 100,
        totalStars: 0,
        maxStars: 300,
        starsByLevel: {},
        difficultyProgress: {},
        achievements: [],
        achievementPoints: 0
      },
      currency: {
        divineEssence: 0,
        totalEssenceEarned: 0,
        totalEssenceSpent: 0,
        gems: 0,
        totalGemsEarned: 0,
        totalGemsSpent: 0,
        totalGemsPurchased: 0,
        experience: 0,
        level: 1,
        experienceToNext: 100,
        totalExperience: 0,
        transactions: []
      },
      matches: {
        totalMatches: 0,
        matchesBySize: {},
        matchesByType: {},
        combos: {
          totalCombos: 0,
          bestCombo: 0,
          averageCombo: 0,
          combosBySize: {},
          fastestCombo: 0,
          slowestCombo: 0,
          averageComboTime: 0
        },
        cascades: {
          totalCascades: 0,
          bestCascade: 0,
          averageCascade: 0,
          cascadesByLength: {},
          cascadeScore: 0,
          totalCascadeScore: 0,
          averageCascadeScore: 0
        },
        powerUps: {
          totalPowerUpsUsed: 0,
          powerUpsEarned: 0,
          powerUpsByType: {},
          powerUpEfficiency: {}
        },
        specialMatches: {
          tShapeMatches: 0,
          lShapeMatches: 0,
          crossMatches: 0,
          simultaneousMatches: 0,
          bestSimultaneous: 0
        }
      },
      session: {
        currentSession: {
          startTime: new Date(),
          duration: 0,
          gamesPlayed: 0,
          bestScore: 0,
          totalScore: 0,
          levelProgress: 0,
          essenceEarned: 0,
          achievementsUnlocked: 0
        },
        sessionHistory: [],
        dailyStats: {
          date: new Date().toISOString().split('T')[0],
          gamesPlayed: 0,
          timeSpent: 0,
          bestScore: 0,
          essenceEarned: 0,
          levelsCompleted: 0,
          streak: 0
        },
        weeklyStats: {
          week: this.getWeekString(new Date()),
          gamesPlayed: 0,
          timeSpent: 0,
          bestScore: 0,
          essenceEarned: 0,
          levelsCompleted: 0,
          rank: 0
        },
        monthlyStats: {
          month: new Date().toISOString().slice(0, 7),
          gamesPlayed: 0,
          timeSpent: 0,
          bestScore: 0,
          essenceEarned: 0,
          levelsCompleted: 0,
          achievements: 0
        }
      },
      version: '1.0.0',
      lastUpdated: new Date(),
      totalPlayTime: 0
    }
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  // Event System
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(callback)
      if (index > -1) {
        eventListeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in statistics event listener for ${event}:`, error)
        }
      })
    }
  }

  // Cleanup
  public destroy(): void {
    this.listeners.clear()
    this.isInitialized = false
  }
}

// Singleton instance
export const statisticsManager = new StatisticsManager() 