// Dynamic Content Rotation System
// Creates engaging daily events and rotating challenges

export interface DailyEvent {
  id: string
  type: 'double_coins' | 'gem_rush' | 'power_up_party' | 'energy_boost' | 'streak_saver' | 'combo_master'
  name: string
  description: string
  multiplier?: number
  bonus?: number
  endTime: number
  startTime: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const DAILY_EVENTS: Omit<DailyEvent, 'endTime' | 'startTime'>[] = [
  {
    id: 'double_coins',
    type: 'double_coins',
    name: 'Coin Rush',
    description: 'Earn double coins from all matches!',
    multiplier: 2,
    rarity: 'common'
  },
  {
    id: 'gem_rush',
    type: 'gem_rush',
    name: 'Gem Bonanza',
    description: 'Extra gems appear in matches!',
    bonus: 50,
    rarity: 'rare'
  },
  {
    id: 'power_up_party',
    type: 'power_up_party',
    name: 'Power-Up Party',
    description: 'Start every game with a random power-up!',
    rarity: 'rare'
  },
  {
    id: 'energy_boost',
    type: 'energy_boost',
    name: 'Energy Surge',
    description: 'Energy regenerates 50% faster!',
    multiplier: 1.5,
    rarity: 'epic'
  },
  {
    id: 'streak_saver',
    type: 'streak_saver',
    name: 'Streak Protection',
    description: 'Your streak is protected from losses today!',
    rarity: 'epic'
  },
  {
    id: 'combo_master',
    type: 'combo_master',
    name: 'Combo Master',
    description: 'Triple points for combo chains!',
    multiplier: 3,
    rarity: 'legendary'
  }
]

export interface RotatingChallenge {
  id: string
  name: string
  description: string
  requirement: {
    type: 'score' | 'moves' | 'time' | 'matches' | 'combos'
    target: number
    gameMode?: string
  }
  reward: {
    coins?: number
    gems?: number
    xp?: number
    powerUps?: number
  }
  duration: number // hours
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

export const ROTATING_CHALLENGES: RotatingChallenge[] = [
  {
    id: 'score_master',
    name: 'Score Master',
    description: 'Achieve 10,000 points in a single game',
    requirement: { type: 'score', target: 10000 },
    reward: { coins: 500, xp: 200 },
    duration: 24,
    difficulty: 'medium'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a level in under 60 seconds',
    requirement: { type: 'time', target: 60, gameMode: 'timeAttack' },
    reward: { gems: 25, xp: 150 },
    duration: 12,
    difficulty: 'hard'
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Create a 6+ combo chain',
    requirement: { type: 'combos', target: 6 },
    reward: { coins: 300, gems: 15, xp: 100 },
    duration: 8,
    difficulty: 'medium'
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Complete a level in under 20 moves',
    requirement: { type: 'moves', target: 20 },
    reward: { coins: 750, gems: 50, xp: 300 },
    duration: 6,
    difficulty: 'expert'
  }
]

export class DynamicContentManager {
  // Generate daily event based on day of year
  generateDailyEvent(date: Date = new Date()): DailyEvent {
    const dayOfYear = this.getDayOfYear(date)
    
    // Use deterministic selection based on date
    const eventIndex = dayOfYear % DAILY_EVENTS.length
    const baseEvent = DAILY_EVENTS[eventIndex]
    
    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(23, 59, 59, 999)
    
    return {
      ...baseEvent,
      startTime: startTime.getTime(),
      endTime: endTime.getTime()
    }
  }

  // Generate rotating challenge
  generateRotatingChallenge(seed: number): RotatingChallenge & { endTime: number } {
    const challengeIndex = seed % ROTATING_CHALLENGES.length
    const challenge = ROTATING_CHALLENGES[challengeIndex]
    
    const endTime = Date.now() + (challenge.duration * 60 * 60 * 1000)
    
    return {
      ...challenge,
      endTime
    }
  }

  // Check if event is active
  isEventActive(event: DailyEvent): boolean {
    const now = Date.now()
    return now >= event.startTime && now <= event.endTime
  }

  // Get current active event
  getCurrentDailyEvent(): DailyEvent | null {
    const today = new Date()
    const event = this.generateDailyEvent(today)
    
    return this.isEventActive(event) ? event : null
  }

  // Apply event multipliers to rewards
  applyEventModifiers(
    baseReward: { coins?: number; gems?: number; xp?: number },
    activeEvent: DailyEvent | null
  ): { coins?: number; gems?: number; xp?: number } {
    if (!activeEvent) return baseReward

    const modifiedReward = { ...baseReward }

    switch (activeEvent.type) {
      case 'double_coins':
        if (modifiedReward.coins) {
          modifiedReward.coins *= (activeEvent.multiplier || 2)
        }
        break
      case 'gem_rush':
        if (modifiedReward.gems) {
          modifiedReward.gems += (activeEvent.bonus || 0)
        }
        break
      // Add other event types as needed
    }

    return modifiedReward
  }

  // Get personalized content based on player behavior
  getPersonalizedContent(playerStats: {
    favoriteMode: string
    level: number
    averageScore: number
    lastPlayTime: number
  }): {
    recommendedMode: string
    personalizedMessage: string
    bonusChallenge?: RotatingChallenge
  } {
    const { favoriteMode, level, averageScore, lastPlayTime } = playerStats
    const daysSinceLastPlay = (Date.now() - lastPlayTime) / (1000 * 60 * 60 * 24)

    // Comeback rewards
    if (daysSinceLastPlay > 1) {
      return {
        recommendedMode: favoriteMode,
        personalizedMessage: `Welcome back! You've been away for ${Math.floor(daysSinceLastPlay)} days. Here's a special challenge!`,
        bonusChallenge: this.generateRotatingChallenge(Date.now())
      }
    }

    // Mode-specific recommendations
    if (favoriteMode === 'timeAttack') {
      return {
        recommendedMode: 'timeAttack',
        personalizedMessage: 'Ready for another speed challenge? Your best time awaits!',
      }
    }

    return {
      recommendedMode: level < 10 ? 'normal' : 'campaign',
      personalizedMessage: `Level ${level} - You're doing great! Try ${level < 10 ? 'normal mode' : 'campaign mode'} for your level.`
    }
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}

// Singleton instance
export const dynamicContentManager = new DynamicContentManager() 