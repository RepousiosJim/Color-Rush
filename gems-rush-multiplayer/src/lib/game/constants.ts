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

// Gem Types and Configurations - Enhanced for Visual Distinction
export const GEM_TYPES: Record<GemType, { 
  emoji: string; 
  symbol: string;
  name: string;
  colors: string[];
  shape: 'circle' | 'square' | 'diamond' | 'hexagon' | 'star' | 'triangle' | 'octagon';
  pattern: 'solid' | 'gradient' | 'radial' | 'stripe' | 'pulse' | 'swirl' | 'crystalline';
  border: string;
  icon: string;
}> = {
  fire: { 
    emoji: '🔥', 
    symbol: '♦',
    name: 'Fire',
    colors: ['#FF6B35', '#FF4500', '#DC2F02', '#E63946'], 
    shape: 'diamond',
    pattern: 'pulse',
    border: '#FF6B35',
    icon: '🔥'
  },
  water: { 
    emoji: '💧', 
    symbol: '●',
    name: 'Water',
    colors: ['#4CC9F0', '#219EBC', '#023047', '#1D3557'], 
    shape: 'circle',
    pattern: 'radial',
    border: '#4CC9F0',
    icon: '💧'
  },
  earth: { 
    emoji: '🌍', 
    symbol: '■',
    name: 'Earth',
    colors: ['#D4A574', '#B08D57', '#8B5A3C', '#5D4037'], 
    shape: 'square',
    pattern: 'solid',
    border: '#D4A574',
    icon: '⛰️'
  },
  air: { 
    emoji: '💨', 
    symbol: '▲',
    name: 'Air',
    colors: ['#E8F4FD', '#B8E6E6', '#87CEEB', '#6BB6FF'], 
    shape: 'triangle',
    pattern: 'swirl',
    border: '#B8E6E6',
    icon: '🌪️'
  },
  lightning: { 
    emoji: '⚡', 
    symbol: '✦',
    name: 'Lightning',
    colors: ['#FFEB3B', '#FFC107', '#FF9800', '#FF5722'], 
    shape: 'star',
    pattern: 'stripe',
    border: '#FFEB3B',
    icon: '⚡'
  },
  nature: { 
    emoji: '🌿', 
    symbol: '⬟',
    name: 'Nature',
    colors: ['#8BC34A', '#4CAF50', '#2E7D32', '#1B5E20'], 
    shape: 'hexagon',
    pattern: 'gradient',
    border: '#8BC34A',
    icon: '🍃'
  },
  magic: { 
    emoji: '🔮', 
    symbol: '⬢',
    name: 'Magic',
    colors: ['#E1BEE7', '#9C27B0', '#673AB7', '#3F51B5'], 
    shape: 'octagon',
    pattern: 'crystalline',
    border: '#E1BEE7',
    icon: '✨'
  }
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

// Enhanced gem color schemes for better visual distinction
export const GEM_COLORS: Record<GemType, { 
  primary: string; 
  secondary: string; 
  tertiary: string;
  glow: string; 
  shadow: string;
  accent: string;
}> = {
  fire: {
    primary: '#FF6B35',
    secondary: '#DC2F02',
    tertiary: '#E63946',
    glow: '#FF8A65',
    shadow: '#BF360C',
    accent: '#FFAB40'
  },
  water: {
    primary: '#4CC9F0',
    secondary: '#023047',
    tertiary: '#1D3557',
    glow: '#81D4FA',
    shadow: '#01579B',
    accent: '#00BCD4'
  },
  earth: {
    primary: '#D4A574',
    secondary: '#8B5A3C',
    tertiary: '#5D4037',
    glow: '#FFCC80',
    shadow: '#3E2723',
    accent: '#FF8F00'
  },
  air: {
    primary: '#E8F4FD',
    secondary: '#87CEEB',
    tertiary: '#6BB6FF',
    glow: '#F0F8FF',
    shadow: '#1565C0',
    accent: '#03DAC6'
  },
  lightning: {
    primary: '#FFEB3B',
    secondary: '#FF9800',
    tertiary: '#FF5722',
    glow: '#FFF176',
    shadow: '#E65100',
    accent: '#FFD54F'
  },
  nature: {
    primary: '#8BC34A',
    secondary: '#2E7D32',
    tertiary: '#1B5E20',
    glow: '#AED581',
    shadow: '#1B5E20',
    accent: '#00E676'
  },
  magic: {
    primary: '#E1BEE7',
    secondary: '#673AB7',
    tertiary: '#3F51B5',
    glow: '#F8BBD9',
    shadow: '#1A237E',
    accent: '#E040FB'
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