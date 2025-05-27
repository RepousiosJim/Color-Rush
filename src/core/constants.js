// Game Constants
// Centralized configuration and magic numbers

export const GAME_CONFIG = {
    // Board dimensions
    BOARD_SIZE: 9,
    MIN_MATCH_SIZE: 3,
    
    // Timing
    ANIMATION_DURATION: 500,
    CASCADE_DELAY: 300,
    HINT_DURATION: 3000,
    FLOATING_SCORE_DURATION: 1500,
    
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
    
    // Game modes
    MODE_CONFIGS: {
        TIME_ATTACK_DURATION: 60,
        DAILY_CHALLENGE_DURATION: 120,
        DEFAULT_TARGET_SCORE: 1000
    },
    
    // Performance
    MAX_RETRIES: 3,
    INITIALIZATION_TIMEOUT: 10000,
    MAX_TOUCH_DURATION: 5000,
    
    // UI
    NOTIFICATION_DURATION: 3000,
    MAX_NOTIFICATIONS: 5,
    TOUCH_THRESHOLD: 50
};

export const GEM_TYPES = {
    FIRE: '🔥',
    WATER: '💧', 
    EARTH: '🌍',
    AIR: '💨',
    LIGHTNING: '⚡',
    NATURE: '🌿',
    MAGIC: '🔮'
};

export const POWER_UP_TYPES = {
    LIGHTNING: 'lightning',
    BOMB: 'bomb', 
    RAINBOW: 'rainbow'
};

export const GAME_MODES = {
    NORMAL: 'normal',
    TIME_ATTACK: 'timeAttack',
    DAILY_CHALLENGE: 'dailyChallenge',
    CAMPAIGN: 'campaign',
    STAGE_MODE: 'stageMode'
};

export const EVENT_TYPES = {
    GEM_CLICK: 'gemClick',
    SWAP_GEMS: 'swapGems',
    MATCH_FOUND: 'matchFound',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver',
    UPDATE_UI: 'updateUI',
    STAGE_COMPLETE: 'stageComplete'
};

export const CSS_CLASSES = {
    GEM: 'gem',
    POWER_UP: 'power-up',
    SELECTED: 'selected',
    HINT_GLOW: 'hint-glow',
    MATCH_PULSE: 'matchPulse',
    POWER_UP_PULSE: 'power-up-pulse',
    FLOATING_SCORE: 'floating-score-element'
};

export const VALIDATION_RULES = {
    MIN_BOARD_SIZE: 3,
    MAX_BOARD_SIZE: 12,
    REQUIRED_GEM_PROPERTIES: ['type', 'colors', 'id'],
    REQUIRED_STATE_PROPERTIES: ['board', 'score', 'level', 'gameMode']
}; 