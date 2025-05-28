import { GemType } from '@/types/game'

// Game Configuration Constants
export const GAME_CONFIG = {
  // Board dimensions - Standardized to 8x8 for optimal multiplayer balance
  BOARD_SIZE: 8,
  MIN_MATCH_SIZE: 3,
  MAX_BOARD_SIZE: 12,
  MIN_BOARD_SIZE: 3,
  
  // Timing (in milliseconds)
  ANIMATION_DURATION: 300,
  CASCADE_DELAY: 200,
  HINT_DURATION: 3000,
  FLOATING_SCORE_DURATION: 1500,
  MOVE_TIMEOUT: 30000, // 30 seconds per move in multiplayer
  
  // Auto block breaking cascade settings
  MAX_CASCADE_DEPTH: 10,
  CASCADE_SCORE_MULTIPLIER: 1.5,
  
  // Power-ups
  POWER_UP_THRESHOLDS: {
    LIGHTNING: 4,  // 4+ gems in a line
    BOMB: 5,       // 5+ gems in L/T shape
    RAINBOW: 6     // 6+ gems
  },
  
  // Scoring
  BASE_SCORES: {
    THREE_MATCH: 50,
    FOUR_MATCH: 150,
    FIVE_MATCH: 300,
    SIX_PLUS_MATCH: 500
  },
  
  // Multiplier bonuses
  COMBO_MULTIPLIERS: [1, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
  MAX_COMBO_MULTIPLIER: 5.0,
  
  // Game modes
  MODE_CONFIGS: {
    CLASSIC: {
      TIME_LIMIT: undefined,
      MOVE_LIMIT: undefined,
      TARGET_SCORE: 1000
    },
    TIME_ATTACK: {
      TIME_LIMIT: 60000, // 1 minute
      MOVE_LIMIT: undefined,
      TARGET_SCORE: 2000
    },
    MOVES_LIMITED: {
      TIME_LIMIT: undefined,
      MOVE_LIMIT: 20,
      TARGET_SCORE: 1500
    },
    DAILY_CHALLENGE: {
      TIME_LIMIT: 120000, // 2 minutes
      MOVE_LIMIT: 30,
      TARGET_SCORE: 3000
    }
  },
  
  // Multiplayer
  MULTIPLAYER: {
    MAX_PLAYERS: 4,
    MIN_PLAYERS: 2,
    READY_TIMEOUT: 30000,
    GAME_START_COUNTDOWN: 3000,
    TURN_TIMEOUT: 30000,
    RECONNECT_TIMEOUT: 60000
  },
  
  // Performance
  MAX_RETRIES: 3,
  INITIALIZATION_TIMEOUT: 10000,
  MAX_TOUCH_DURATION: 5000,
  
  // UI
  NOTIFICATION_DURATION: 3000,
  MAX_NOTIFICATIONS: 5,
  TOUCH_THRESHOLD: 50,
  
  // Validation
  REQUIRED_GEM_PROPERTIES: ['type', 'id', 'row', 'col'] as const,
  REQUIRED_STATE_PROPERTIES: ['board', 'score', 'level', 'gameStatus'] as const
} as const

// Gem Types and Configurations
export const GEM_TYPES: Record<GemType, { emoji: string; colors: string[] }> = {
  fire: { emoji: '🔥', colors: ['#FF4500', '#DC143C'] },
  water: { emoji: '💧', colors: ['#1E90FF', '#4169E1'] },
  earth: { emoji: '🌍', colors: ['#8B4513', '#A0522D'] },
  air: { emoji: '💨', colors: ['#87CEEB', '#B0E0E6'] },
  lightning: { emoji: '⚡', colors: ['#FFD700', '#FFA500'] },
  nature: { emoji: '🌿', colors: ['#32CD32', '#228B22'] },
  magic: { emoji: '🔮', colors: ['#9932CC', '#8A2BE2'] }
}

// Animation Constants
export const ANIMATION_CONSTANTS = {
  STAGGER_DELAY: 50,
  MATCH_DURATION: 600,
  CASCADE_DURATION: 400,
  GRAVITY_DURATION: 300,
  SPAWN_DURATION: 200,
  HINT_PULSE_DURATION: 2000
} as const

// Power-up Types
export const POWER_UP_TYPES = {
  BOMB: { emoji: '💥', name: 'Bomb', description: 'Destroys surrounding gems' },
  LIGHTNING: { emoji: '🌟', name: 'Lightning', description: 'Clears entire row or column' },
  RAINBOW: { emoji: '🌈', name: 'Rainbow', description: 'Clears all gems of selected color' },
  ROW_CLEAR: { emoji: '🔥', name: 'Row Clear', description: 'Clears entire row' },
  COL_CLEAR: { emoji: '⚡', name: 'Column Clear', description: 'Clears entire column' },
  COLOR_BLAST: { emoji: '💫', name: 'Color Blast', description: 'Removes all gems of selected color' },
  SHUFFLE: { emoji: '🌀', name: 'Shuffle', description: 'Shuffles the board' },
  TIME_FREEZE: { emoji: '❄️', name: 'Time Freeze', description: 'Freezes time temporarily' }
} as const

// Power-up type keys for easier access
export const POWER_UP_KEYS = {
  BOMB: 'BOMB',
  LIGHTNING: 'LIGHTNING', 
  RAINBOW: 'RAINBOW',
  ROW_CLEAR: 'ROW_CLEAR',
  COL_CLEAR: 'COL_CLEAR',
  COLOR_BLAST: 'COLOR_BLAST',
  SHUFFLE: 'SHUFFLE',
  TIME_FREEZE: 'TIME_FREEZE'
} as const

// Validation Rules
export const VALIDATION_RULES = {
  MIN_BOARD_SIZE: 3,
  MAX_BOARD_SIZE: 12,
  REQUIRED_GEM_PROPERTIES: ['type', 'id', 'row', 'col'] as const,
  REQUIRED_STATE_PROPERTIES: ['board', 'score', 'level', 'gameStatus'] as const,
  MAX_USERNAME_LENGTH: 20,
  MIN_USERNAME_LENGTH: 3,
  MAX_DISPLAYNAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8
} as const

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_MOVE: 'Invalid move - gems must be adjacent',
  NO_MATCHES: 'No matches found for this move',
  GAME_OVER: 'Game over - no more possible moves',
  CONNECTION_LOST: 'Connection lost - attempting to reconnect',
  INVALID_BOARD: 'Invalid board state detected',
  INITIALIZATION_FAILED: 'Failed to initialize game engine'
} as const

// Success Messages  
export const SUCCESS_MESSAGES = {
  GAME_INITIALIZED: 'Game initialized successfully',
  LEVEL_COMPLETED: 'Level completed! Well done!',
  NEW_HIGH_SCORE: 'New high score achieved!',
  MULTIPLAYER_CONNECTED: 'Connected to multiplayer session',
  SETTINGS_SAVED: 'Settings saved successfully'
} as const

// Gem color schemes for different themes
export const GEM_COLORS: Record<GemType, { primary: string; secondary: string; glow: string }> = {
  fire: {
    primary: '#FF4500',
    secondary: '#DC143C',
    glow: '#FF6347'
  },
  water: {
    primary: '#1E90FF',
    secondary: '#4169E1',
    glow: '#87CEEB'
  },
  earth: {
    primary: '#8B4513',
    secondary: '#A0522D',
    glow: '#D2691E'
  },
  air: {
    primary: '#87CEEB',
    secondary: '#B0E0E6',
    glow: '#E0F6FF'
  },
  lightning: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: '#FFFF00'
  },
  nature: {
    primary: '#32CD32',
    secondary: '#228B22',
    glow: '#90EE90'
  },
  magic: {
    primary: '#9932CC',
    secondary: '#8A2BE2',
    glow: '#DA70D6'
  }
} as const

// Power-up configurations
export const POWER_UP_CONFIGS = {
  BOMB: {
    name: 'Gem Bomb',
    description: 'Destroys a 3x3 area around the target',
    cost: { coins: 50 },
    cooldown: 0,
    unlockLevel: 1
  },
  ROW_CLEAR: {
    name: 'Row Blaster',
    description: 'Clears an entire row',
    cost: { coins: 75 },
    cooldown: 0,
    unlockLevel: 3
  },
  COL_CLEAR: {
    name: 'Column Crusher',
    description: 'Clears an entire column',
    cost: { coins: 75 },
    cooldown: 0,
    unlockLevel: 3
  },
  COLOR_BLAST: {
    name: 'Color Bomb',
    description: 'Removes all gems of the selected color',
    cost: { coins: 100 },
    cooldown: 30000,
    unlockLevel: 5
  },
  SHUFFLE: {
    name: 'Divine Shuffle',
    description: 'Shuffles the entire board',
    cost: { gems: 1 },
    cooldown: 60000,
    unlockLevel: 8
  },
  TIME_FREEZE: {
    name: 'Time Freeze',
    description: 'Stops the timer for 10 seconds',
    cost: { gems: 2 },
    cooldown: 120000,
    unlockLevel: 10
  }
} as const

// Game Events
export const EVENT_TYPES = {
  // Core game events
  GEM_CLICK: 'gemClick',
  SWAP_GEMS: 'swapGems',
  MATCH_FOUND: 'matchFound',
  LEVEL_COMPLETE: 'levelComplete',
  GAME_OVER: 'gameOver',
  UPDATE_UI: 'updateUI',
  
  // Multiplayer events
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_READY: 'playerReady',
  GAME_STARTED: 'gameStarted',
  MOVE_MADE: 'moveMade',
  TURN_CHANGED: 'turnChanged',
  
  // Power-up events
  POWER_UP_ACTIVATED: 'powerUpActivated',
  POWER_UP_COOLDOWN: 'powerUpCooldown',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievementUnlocked',
  DAILY_CHALLENGE_COMPLETE: 'dailyChallengeComplete'
} as const

// CSS Classes for styling
export const CSS_CLASSES = {
  // Gem classes
  GEM: 'gem',
  GEM_SELECTED: 'gem-selected',
  GEM_MATCHED: 'gem-matched',
  GEM_ANIMATING: 'gem-animating',
  
  // Power-up classes
  POWER_UP: 'power-up',
  POWER_UP_ACTIVE: 'power-up-active',
  POWER_UP_COOLDOWN: 'power-up-cooldown',
  
  // Animation classes
  HINT_GLOW: 'hint-glow',
  MATCH_PULSE: 'match-pulse',
  FLOATING_SCORE: 'floating-score',
  CASCADE_ANIMATION: 'cascade-animation',
  
  // UI classes
  LOADING: 'loading',
  DISABLED: 'disabled',
  HIGHLIGHTED: 'highlighted',
  HIDDEN: 'hidden'
} as const

// Socket.io event names
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Room management
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  
  // Game flow
  READY_UP: 'ready-up',
  GAME_MOVE: 'game-move',
  CHAT_MESSAGE: 'chat-message',
  
  // Updates
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  PLAYER_READY: 'player-ready',
  GAME_STARTING: 'game-starting',
  GAME_STARTED: 'game-started',
  GAME_MOVE_UPDATE: 'game-move-update',
  GAME_ENDED: 'game-ended',
  
  // Errors
  ERROR: 'error',
  INVALID_MOVE: 'invalid-move'
} as const

// Achievement configurations
export const ACHIEVEMENT_CONFIGS = {
  FIRST_MATCH: {
    name: 'First Match',
    description: 'Make your first match',
    points: 10,
    rarity: 'bronze' as const
  },
  COMBO_MASTER: {
    name: 'Combo Master',
    description: 'Achieve a 5x combo',
    points: 50,
    rarity: 'silver' as const
  },
  POWER_USER: {
    name: 'Power User',
    description: 'Use 10 power-ups',
    points: 100,
    rarity: 'gold' as const
  },
  MULTIPLAYER_WINNER: {
    name: 'Multiplayer Champion',
    description: 'Win your first multiplayer game',
    points: 75,
    rarity: 'silver' as const
  }
} as const

// Local storage keys
export const STORAGE_KEYS = {
  GAME_STATE: 'gems_rush_game_state',
  USER_PREFERENCES: 'gems_rush_preferences',
  ACHIEVEMENTS: 'gems_rush_achievements',
  STATISTICS: 'gems_rush_statistics',
  SETTINGS: 'gems_rush_settings'
} as const 