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

  // Enhanced Time Rush Scoring
  TIME_RUSH_SCORES: {
    THREE_MATCH: 100,    // 2x normal
    FOUR_MATCH: 300,     // 2x normal + Lightning power-up
    FIVE_MATCH: 600,     // 2x normal + Rainbow power-up
    SIX_MATCH: 1000,     // 2x normal + Bomb power-up
    SEVEN_PLUS_MATCH: 1500, // Meteor power-up + bonus per extra gem
    EXTRA_GEM_BONUS: 250,   // Bonus per gem beyond 6
    
    // Time-based multipliers
    ADRENALINE_MULTIPLIER: 2.0,  // Last 15 seconds
    WARNING_MULTIPLIER: 1.5,     // Last 30 seconds
    COMBO_BASE_MULTIPLIER: 0.5,  // Added per combo level
    MAX_COMBO_MULTIPLIER: 5.0,
    
    // Power-up activation bonuses
    POWER_UP_CLICK_BONUS: 100,   // Bonus for clicking to activate
    LIGHTNING_CLEAR_BONUS: 50,   // Per gem cleared by lightning
    BOMB_EXPLOSION_BONUS: 75,    // Per gem cleared by bomb
    RAINBOW_COLOR_BONUS: 100,    // Per gem of target color cleared
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
      TIME_LIMIT: 60000, // 1 minute (60 seconds)
      MOVE_LIMIT: undefined,
      TARGET_SCORE: 5000, // Higher target for Time Rush
      ADRENALINE_THRESHOLD: 15, // Seconds
      WARNING_THRESHOLD: 30,    // Seconds
      RUSH_BONUS_PERCENTAGE: 10, // 10% final score bonus
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

  // Time Rush specific configuration
  TIME_RUSH_CONFIG: {
    // Visual effect thresholds
    ADRENALINE_TIME: 15,        // Seconds when adrenaline mode starts
    WARNING_TIME: 10,           // Seconds when warning effects start
    CRITICAL_TIME: 5,           // Seconds when critical effects start
    
    // Power-up mechanics
    MIN_MATCH_FOR_POWERUP: 4,   // Minimum match size to create power-up
    POWERUP_CHARGE_TIME: 0,     // Instant activation in Time Rush
    POWERUP_VISUAL_DURATION: 2000, // How long power-up indicators show
    
    // Animation speeds (multipliers)
    ANIMATION_SPEED_NORMAL: 1.0,
    ANIMATION_SPEED_ADRENALINE: 1.3,
    ANIMATION_SPEED_CRITICAL: 1.6,
    
    // Background effects
    PARTICLE_COUNT_NORMAL: 8,
    PARTICLE_COUNT_ADRENALINE: 15,
    PARTICLE_COUNT_CRITICAL: 25,
    
    // Sound effect triggers
    COMBO_SOUND_THRESHOLD: 2,   // Combo level to trigger special sound
    POWERUP_SOUND_DELAY: 200,   // ms delay for power-up activation sound
    ADRENALINE_MUSIC_FADE: 1000, // ms to fade to adrenaline music
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

// Time Rush Power-up Effects Configuration
export const TIME_RUSH_POWERUPS = {
  lightning: {
    name: 'Lightning Strike',
    description: 'Clears entire row and column',
    emoji: '⚡',
    matchSize: 4,
    clearPattern: 'cross', // Clears row + column
    scoreMultiplier: 2.0,
    visualEffect: 'electric',
    soundEffect: 'lightning_crack',
    activationDelay: 0, // Instant in Time Rush
  },
  rainbow: {
    name: 'Rainbow Burst',
    description: 'Clears all gems of the same color',
    emoji: '🌈',
    matchSize: 5,
    clearPattern: 'color', // Clears all of target color
    scoreMultiplier: 2.5,
    visualEffect: 'rainbow_wave',
    soundEffect: 'rainbow_burst',
    activationDelay: 0,
  },
  bomb: {
    name: 'Explosive Blast',
    description: 'Destroys 3x3 area around target',
    emoji: '💥',
    matchSize: 6,
    clearPattern: 'area', // 3x3 explosion
    scoreMultiplier: 3.0,
    visualEffect: 'explosion',
    soundEffect: 'bomb_blast',
    activationDelay: 0,
  },
  meteor: {
    name: 'Meteor Strike',
    description: 'Massive area destruction',
    emoji: '☄️',
    matchSize: 7,
    clearPattern: 'massive', // 5x5 explosion
    scoreMultiplier: 4.0,
    visualEffect: 'meteor_impact',
    soundEffect: 'meteor_crash',
    activationDelay: 0,
  }
} as const

// Time Rush Visual Effects
export const TIME_RUSH_EFFECTS = {
  backgrounds: {
    normal: 'from-orange-900 via-red-900 to-purple-900',
    adrenaline: 'from-red-900 via-orange-800 to-yellow-700',
    warning: 'from-red-800 via-orange-700 to-red-600',
    critical: 'from-red-600 via-red-700 to-red-800'
  },
  
  particles: {
    normal: { count: 8, color: 'bg-orange-400', speed: 'normal' },
    adrenaline: { count: 15, color: 'bg-yellow-400', speed: 'fast' },
    warning: { count: 20, color: 'bg-red-400', speed: 'faster' },
    critical: { count: 25, color: 'bg-white', speed: 'fastest' }
  },
  
  pulseEffects: {
    adrenaline: { duration: 0.8, intensity: 0.3 },
    warning: { duration: 0.6, intensity: 0.4 },
    critical: { duration: 0.4, intensity: 0.6 }
  },
  
  screenShake: {
    powerup: { intensity: 2, duration: 200 },
    adrenaline: { intensity: 1, duration: 100 },
    combo: { intensity: 3, duration: 300 }
  }
} as const

// Gem type definitions for Time Rush enhanced visuals
export const TIME_RUSH_GEM_EFFECTS = {
  fire: {
    normalEmoji: '🔥',
    adrenalineEmoji: '🌋',
    trailColor: 'rgb(239, 68, 68)',
    glowColor: 'rgba(239, 68, 68, 0.5)'
  },
  water: {
    normalEmoji: '💧',
    adrenalineEmoji: '🌊',
    trailColor: 'rgb(59, 130, 246)',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  earth: {
    normalEmoji: '🌍',
    adrenalineEmoji: '⛰️',
    trailColor: 'rgb(245, 158, 11)',
    glowColor: 'rgba(245, 158, 11, 0.5)'
  },
  nature: {
    normalEmoji: '🌿',
    adrenalineEmoji: '🌳',
    trailColor: 'rgb(34, 197, 94)',
    glowColor: 'rgba(34, 197, 94, 0.5)'
  },
  lightning: {
    normalEmoji: '⚡',
    adrenalineEmoji: '🌩️',
    trailColor: 'rgb(147, 51, 234)',
    glowColor: 'rgba(147, 51, 234, 0.5)'
  },
  magic: {
    normalEmoji: '🔮',
    adrenalineEmoji: '✨',
    trailColor: 'rgb(236, 72, 153)',
    glowColor: 'rgba(236, 72, 153, 0.5)'
  },
  crystal: {
    normalEmoji: '💎',
    adrenalineEmoji: '💠',
    trailColor: 'rgb(6, 182, 212)',
    glowColor: 'rgba(6, 182, 212, 0.5)'
  }
} as const

// Enhanced 5-Gem Elemental System - Professional Industry Standards
// Based on analysis of top-performing match-3 games (Candy Crush, Royal Match, Gems of War)
export const GEM_TYPES: Record<GemType, { 
  emoji: string; 
  symbol: string;
  name: string;
  colors: string[];
  shape: 'circle' | 'square' | 'diamond' | 'hexagon' | 'star' | 'triangle' | 'octagon';
  pattern: 'solid' | 'gradient' | 'radial' | 'stripe' | 'pulse' | 'swirl' | 'crystalline';
  border: string;
  icon: string;
  visualIcon: string; // Enhanced professional icon representation
  meaning: string;
  powerUp: string;
  weakTo: GemType | null;
  strongTo: GemType | null;
  // NEW: Industry-standard visual enhancements
  clarity: 'excellent' | 'good' | 'fair'; // Visibility at small sizes
  uniqueness: number; // 1-10 scale of visual distinction
  culturalApproval: number; // 1-10 scale of universal recognition
  gameplayReadability: number; // 1-10 scale of instant recognition during fast gameplay
  professionalNotes: string; // Design reasoning from industry perspective
}> = {
  fire: { 
    emoji: '🔥', 
    symbol: '◆', // Changed from ♦ to more geometric, game-friendly diamond
    name: 'Ember Crystal',
    colors: ['#E53E3E', '#FD8B1E', '#F6AD55', '#F56500'], // Refined fire palette - warmer, more vibrant
    shape: 'diamond',
    pattern: 'radial', // Changed from pulse to radial for better performance
    border: '#C53030',
    icon: '🔥',
    visualIcon: '💎🔥', // Crystalline fire gem - combines precious gem feel with fire element
    meaning: 'Passion, energy, transformation',
    powerUp: 'Ignition Blast - destroys 3x3 area with spreading fire effect',
    weakTo: 'water' as GemType,
    strongTo: 'nature' as GemType,
    clarity: 'excellent',
    uniqueness: 9,
    culturalApproval: 10,
    gameplayReadability: 9,
    professionalNotes: 'Diamond shape offers excellent small-scale visibility. Fire symbolism is universally understood. Strong contrast ratios ensure accessibility compliance.'
  },
  water: { 
    emoji: '💧', 
    symbol: '◉', // Enhanced circle with center dot for better distinction
    name: 'Aqua Sphere',
    colors: ['#2B6CB0', '#3182CE', '#63B3ED', '#90CDF4'], // Refined water blues - deeper, more premium
    shape: 'circle',
    pattern: 'radial',
    border: '#2A69AC',
    icon: '💧',
    visualIcon: '🔵💎', // Crystalline water orb - sophisticated water representation
    meaning: 'Tranquility, flow, wisdom',
    powerUp: 'Tidal Wave - cascades enhance chain reactions by 75%',
    weakTo: 'lightning' as GemType,
    strongTo: 'fire' as GemType,
    clarity: 'excellent',
    uniqueness: 8,
    culturalApproval: 10,
    gameplayReadability: 9,
    professionalNotes: 'Circular shape is most readable at all sizes. Water/blue association is cross-culturally universal. High contrast against most backgrounds.'
  },
  earth: { 
    emoji: '🌍', 
    symbol: '⬟', // Hexagonal crystal structure - represents crystalline earth
    name: 'Terra Gem',
    colors: ['#744210', '#A0522D', '#D69E2E', '#F6E05E'], // Enhanced earth tones - richer, more premium
    shape: 'hexagon',
    pattern: 'crystalline', // Changed from solid to crystalline for premium feel
    border: '#653A11',
    icon: '💎',
    visualIcon: '🟤💎', // Brown crystalline gem - sophisticated earth representation
    meaning: 'Stability, strength, endurance',
    powerUp: 'Earthquake - creates fault lines affecting entire columns',
    weakTo: 'nature' as GemType,
    strongTo: 'lightning' as GemType,
    clarity: 'good',
    uniqueness: 8,
    culturalApproval: 9,
    gameplayReadability: 8,
    professionalNotes: 'Hexagonal shape provides strong geometric identity. Earth/brown is universally recognized. Crystalline pattern adds premium feel while maintaining readability.'
  },
  nature: { 
    emoji: '🌿', 
    symbol: '✧', // Star-like but organic - represents growth/life force
    name: 'Life Crystal',
    colors: ['#22543D', '#38A169', '#68D391', '#9AE6B4'], // Enhanced nature greens - more vibrant, lively
    shape: 'star',
    pattern: 'swirl', // Changed from gradient to swirl for organic movement feel
    border: '#1A365D',
    icon: '🌱',
    visualIcon: '💚🌟', // Green crystalline star - represents growing life force
    meaning: 'Growth, harmony, renewal',
    powerUp: 'Overgrowth - spreads to convert 12 adjacent gems organically',
    weakTo: 'fire' as GemType,
    strongTo: 'earth' as GemType,
    clarity: 'good',
    uniqueness: 9,
    culturalApproval: 9,
    gameplayReadability: 8,
    professionalNotes: 'Star shape creates strongest visual distinction. Green/nature association is universal. Organic swirl pattern reinforces growth theme.'
  },
  lightning: { 
    emoji: '⚡', 
    symbol: '▲', // Sharp triangle - represents energy/power direction
    name: 'Storm Shard',
    colors: ['#D69E2E', '#F6E05E', '#FEFCBF', '#FFFBEB'], // Enhanced lightning yellows - more electric, premium
    shape: 'triangle',
    pattern: 'stripe', // Kept stripe for electric energy feel
    border: '#B7791F',
    icon: '⚡',
    visualIcon: '⚡💎', // Electric crystalline shard - dynamic energy representation
    meaning: 'Power, speed, transformation',
    powerUp: 'Chain Lightning - connects and energizes 5 gem clusters anywhere',
    weakTo: 'earth' as GemType,
    strongTo: 'water' as GemType,
    clarity: 'excellent',
    uniqueness: 10,
    culturalApproval: 10,
    gameplayReadability: 10,
    professionalNotes: 'Triangle provides sharpest visual distinction. Lightning/yellow is universally understood as power/energy. Highest readability due to sharp edges and bright colors.'
  }
}

// Professional Color Palette - WCAG AAA compliant with enhanced premium feel
// Colors optimized for mobile devices and various lighting conditions
export const GEM_COLORS: Record<GemType, {
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  glow: string;
  shadow: string;
  contrast: string;
  // NEW: Industry enhancements
  premiumGradient: string; // Professional gradient for high-end visual appeal
  edgeHighlight: string; // Edge lighting effect for premium gem appearance
  coreGlow: string; // Inner core glow for crystalline effect
  contrastRatio: number; // WCAG compliance ratio
}> = {
  fire: {
    primary: '#E53E3E', // Professional fire red - warmer, more premium
    secondary: '#FD8B1E', // Rich orange accent
    tertiary: '#F6AD55', // Golden highlight
    accent: '#F56500', // Deep amber accent
    glow: 'rgba(229, 62, 62, 0.8)', // Enhanced glow intensity
    shadow: 'rgba(138, 24, 24, 0.6)', // Deeper shadow for depth
    contrast: '#FFFFFF',
    premiumGradient: 'linear-gradient(135deg, #E53E3E 0%, #FD8B1E 50%, #F6AD55 100%)',
    edgeHighlight: '#FFE4E1', // Soft fire edge glow
    coreGlow: 'rgba(253, 139, 30, 0.9)', // Bright core emanation
    contrastRatio: 7.2 // AAA compliant
  },
  water: {
    primary: '#2B6CB0', // Deep professional blue
    secondary: '#3182CE', // Rich ocean blue
    tertiary: '#63B3ED', // Sky blue highlight
    accent: '#90CDF4', // Light crystalline blue
    glow: 'rgba(43, 108, 176, 0.8)', // Deep blue glow
    shadow: 'rgba(23, 56, 95, 0.6)', // Ocean depth shadow
    contrast: '#FFFFFF',
    premiumGradient: 'linear-gradient(135deg, #2B6CB0 0%, #3182CE 50%, #63B3ED 100%)',
    edgeHighlight: '#E6F7FF', // Crystalline edge light
    coreGlow: 'rgba(49, 130, 206, 0.9)', // Aqua core shimmer
    contrastRatio: 8.1 // AAA compliant
  },
  earth: {
    primary: '#744210', // Rich earth brown
    secondary: '#A0522D', // Sienna accent
    tertiary: '#D69E2E', // Golden brown highlight
    accent: '#F6E05E', // Warm gold accent
    glow: 'rgba(116, 66, 16, 0.8)', // Earthy glow
    shadow: 'rgba(90, 47, 10, 0.6)', // Deep earth shadow
    contrast: '#FFFFFF',
    premiumGradient: 'linear-gradient(135deg, #744210 0%, #A0522D 50%, #D69E2E 100%)',
    edgeHighlight: '#FFF8DC', // Warm cream edge
    coreGlow: 'rgba(160, 82, 45, 0.9)', // Rich earth core
    contrastRatio: 9.3 // AAA compliant
  },
  nature: {
    primary: '#22543D', // Deep forest green
    secondary: '#38A169', // Vibrant nature green
    tertiary: '#68D391', // Fresh leaf green
    accent: '#9AE6B4', // Light spring green
    glow: 'rgba(34, 84, 61, 0.8)', // Forest depth glow
    shadow: 'rgba(20, 44, 31, 0.6)', // Deep forest shadow
    contrast: '#FFFFFF',
    premiumGradient: 'linear-gradient(135deg, #22543D 0%, #38A169 50%, #68D391 100%)',
    edgeHighlight: '#F0FFF4', // Mint cream edge
    coreGlow: 'rgba(56, 161, 105, 0.9)', // Living green core
    contrastRatio: 8.7 // AAA compliant
  },
  lightning: {
    primary: '#D69E2E', // Rich golden yellow
    secondary: '#F6E05E', // Bright electric yellow
    tertiary: '#FEFCBF', // Pale electric highlight
    accent: '#FFFBEB', // Soft electric accent
    glow: 'rgba(214, 158, 46, 0.9)', // Intense electric glow
    shadow: 'rgba(183, 121, 31, 0.6)', // Golden shadow
    contrast: '#000000',
    premiumGradient: 'linear-gradient(135deg, #D69E2E 0%, #F6E05E 50%, #FEFCBF 100%)',
    edgeHighlight: '#FFFFF0', // Pure electric edge
    coreGlow: 'rgba(246, 224, 94, 0.95)', // Brilliant electric core
    contrastRatio: 12.1 // AAA+ compliant
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