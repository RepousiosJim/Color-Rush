// Statistics and Progression Types
export interface GameStatistics {
  // Performance Tracking
  performance: PerformanceStats
  
  // Level Progression
  progression: ProgressionStats
  
  // Currency System
  currency: CurrencyStats
  
  // Match Analytics
  matches: MatchStatistics
  
  // Session Data
  session: SessionStats
  
  // Metadata
  version: string
  lastUpdated: Date
  totalPlayTime: number // in seconds
}

// Performance Statistics
export interface PerformanceStats {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  winRate: number
  
  // Scores
  bestScore: number
  totalScore: number
  averageScore: number
  
  // Streaks
  currentWinStreak: number
  bestWinStreak: number
  currentPlayStreak: number // consecutive days played
  bestPlayStreak: number
  
  // Time-based
  fastestLevel: number // seconds
  longestLevel: number // seconds
  averageLevelTime: number
  
  // Efficiency
  bestMovesPerLevel: number
  totalMoves: number
  averageMovesPerLevel: number
  
  // Rankings
  personalBest: PersonalBest[]
  globalRank: number
  weeklyRank: number
}

export interface PersonalBest {
  category: 'score' | 'time' | 'moves' | 'combo'
  value: number
  level: number
  mode: string
  achievedAt: Date
}

// Progression Statistics
export interface ProgressionStats {
  // Campaign Progress
  campaignProgress: CampaignProgress
  
  // Level Completion
  levelsCompleted: number
  levelsUnlocked: number
  totalLevels: number
  
  // Star Ratings
  totalStars: number
  maxStars: number
  starsByLevel: Record<number, number>
  
  // Difficulty Progress
  difficultyProgress: Record<string, DifficultyProgress>
  
  // Achievements
  achievements: Achievement[]
  achievementPoints: number
}

export interface CampaignProgress {
  currentWorld: number
  currentLevel: number
  worldsUnlocked: number
  worldsCompleted: number
  totalWorlds: number
  
  // World-specific progress
  worldProgress: Record<number, WorldProgress>
}

export interface WorldProgress {
  worldId: number
  name: string
  theme: string
  levelsCompleted: number
  totalLevels: number
  starsEarned: number
  maxStars: number
  isUnlocked: boolean
  isCompleted: boolean
  completedAt?: Date
}

export interface DifficultyProgress {
  difficulty: string
  levelsCompleted: number
  bestScore: number
  averageScore: number
  timesPlayed: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'gameplay' | 'progression' | 'collection' | 'social' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  isUnlocked: boolean
  unlockedAt?: Date
  progress: number
  maxProgress: number
  requirements: Record<string, any>
}

// Currency Statistics
export interface CurrencyStats {
  // Divine Essence
  divineEssence: number
  totalEssenceEarned: number
  totalEssenceSpent: number
  
  // Gems (premium currency)
  gems: number
  totalGemsEarned: number
  totalGemsSpent: number
  totalGemsPurchased: number
  
  // Experience
  experience: number
  level: number
  experienceToNext: number
  totalExperience: number
  
  // Currency History
  transactions: CurrencyTransaction[]
}

export interface CurrencyTransaction {
  id: string
  type: 'essence' | 'gems' | 'experience'
  action: 'earned' | 'spent' | 'purchased'
  amount: number
  reason: string
  timestamp: Date
  balanceAfter: number
}

// Match Analytics
export interface MatchStatistics {
  // Basic Matches
  totalMatches: number
  matchesBySize: Record<number, number> // 3, 4, 5, 6+ matches
  matchesByType: Record<string, number> // gem type matches
  
  // Combos and Cascades
  combos: ComboStats
  cascades: CascadeStats
  
  // Power-ups
  powerUps: PowerUpStats
  
  // Special Matches
  specialMatches: SpecialMatchStats
}

export interface ComboStats {
  totalCombos: number
  bestCombo: number
  averageCombo: number
  combosBySize: Record<number, number>
  
  // Combo timing
  fastestCombo: number // seconds
  slowestCombo: number
  averageComboTime: number
}

export interface CascadeStats {
  totalCascades: number
  bestCascade: number
  averageCascade: number
  cascadesByLength: Record<number, number>
  
  // Cascade efficiency
  cascadeScore: number
  totalCascadeScore: number
  averageCascadeScore: number
}

export interface PowerUpStats {
  totalPowerUpsUsed: number
  powerUpsEarned: number
  powerUpsByType: Record<string, number>
  powerUpEfficiency: Record<string, number> // points per power-up
}

export interface SpecialMatchStats {
  // T and L shaped matches
  tShapeMatches: number
  lShapeMatches: number
  
  // Cross matches
  crossMatches: number
  
  // Multiple simultaneous matches
  simultaneousMatches: number
  bestSimultaneous: number
}

// Session Statistics
export interface SessionStats {
  currentSession: CurrentSession
  sessionHistory: SessionHistory[]
  dailyStats: DailyStats
  weeklyStats: WeeklyStats
  monthlyStats: MonthlyStats
}

export interface CurrentSession {
  startTime: Date
  duration: number // seconds
  gamesPlayed: number
  bestScore: number
  totalScore: number
  levelProgress: number
  essenceEarned: number
  achievementsUnlocked: number
}

export interface SessionHistory {
  id: string
  date: Date
  duration: number
  gamesPlayed: number
  bestScore: number
  totalScore: number
  essenceEarned: number
  achievements: string[]
}

export interface DailyStats {
  date: string
  gamesPlayed: number
  timeSpent: number
  bestScore: number
  essenceEarned: number
  levelsCompleted: number
  streak: number
}

export interface WeeklyStats {
  week: string
  gamesPlayed: number
  timeSpent: number
  bestScore: number
  essenceEarned: number
  levelsCompleted: number
  rank: number
}

export interface MonthlyStats {
  month: string
  gamesPlayed: number
  timeSpent: number
  bestScore: number
  essenceEarned: number
  levelsCompleted: number
  achievements: number
}

// Visual Enhancement Types
export interface VisualEffects {
  // Gem Effects
  gemEffects: GemEffectConfig
  
  // Combo Display
  comboDisplay: ComboDisplayConfig
  
  // Particle System
  particles: ParticleSystemConfig
  
  // Power-up Effects
  powerUpEffects: PowerUpEffectConfig
}

export interface GemEffectConfig {
  glowIntensity: number // 0-100
  pulseSpeed: number // 0-100
  sparkleFrequency: number // 0-100
  matchHighlight: boolean
  selectionGlow: boolean
  hoverEffects: boolean
  animationDuration: number // milliseconds
}

export interface ComboDisplayConfig {
  showComboText: boolean
  showComboMultiplier: boolean
  textSize: number // 0.5-2.0
  animationDuration: number
  floatHeight: number // pixels
  fadeOutTime: number // milliseconds
  colorScheme: 'rainbow' | 'gold' | 'divine' | 'fire'
}

export interface ParticleSystemConfig {
  enabled: boolean
  particleCount: number // 0-1000
  particleLife: number // seconds
  gravity: number // -1 to 1
  windEffect: boolean
  colorTrails: boolean
  explosionEffect: boolean
}

export interface PowerUpEffectConfig {
  indicatorGlow: boolean
  chargeAnimation: boolean
  activationEffect: 'sparkle' | 'explosion' | 'wave' | 'divine'
  soundEffect: boolean
  screenShake: boolean
  flashEffect: boolean
}

// Statistics Events
export type StatisticsEvent = 
  | { type: 'GAME_STARTED'; gameMode: string; difficulty: string }
  | { type: 'GAME_COMPLETED'; score: number; moves: number; time: number; won: boolean }
  | { type: 'LEVEL_COMPLETED'; level: number; score: number; moves: number; time: number; stars: number }
  | { type: 'MATCH_MADE'; gemType: string; matchSize: number; cascade: boolean; combo: number }
  | { type: 'POWER_UP_USED'; powerUpType: string; effectiveness: number }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string }
  | { type: 'ESSENCE_EARNED'; amount: number; source: string }
  | { type: 'ESSENCE_SPENT'; amount: number; reason: string }
  | { type: 'EXPERIENCE_GAINED'; amount: number; source: string }
  | { type: 'STREAK_UPDATED'; streakType: 'win' | 'play'; newStreak: number }
  | { type: 'PERSONAL_BEST'; category: string; value: number; previousBest: number }

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  playerId: string
  playerName: string
  avatar?: string
  score: number
  level: number
  achievements: number
  winRate: number
  isCurrentPlayer?: boolean
}

export interface Leaderboard {
  id: string
  name: string
  type: 'global' | 'weekly' | 'daily' | 'friends'
  entries: LeaderboardEntry[]
  playerRank?: number
  totalPlayers: number
  lastUpdated: Date
}

// Star Rating System
export interface StarRating {
  level: number
  stars: number // 0-3
  requirements: StarRequirement[]
  rewards: StarReward[]
}

export interface StarRequirement {
  type: 'score' | 'moves' | 'time' | 'special'
  value: number
  description: string
}

export interface StarReward {
  type: 'essence' | 'gems' | 'powerup' | 'achievement'
  amount: number
  description: string
} 