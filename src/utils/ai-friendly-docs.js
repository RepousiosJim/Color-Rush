/**
 * @fileoverview AI-Friendly Documentation and Type Definitions
 * @description This file contains comprehensive documentation and type definitions
 * to make the codebase more accessible for AI assistants and developers.
 * @version 1.0.0
 * @author Gems Rush Development Team
 */

/**
 * @typedef {Object} GemData
 * @property {string} type - The gem type emoji (🔥, 💧, etc.)
 * @property {string[]} colors - Array of two hex colors for gradient
 * @property {boolean} isPowerUp - Whether this gem has power-up properties
 * @property {string|null} powerUpType - Type of power-up if applicable
 * @property {string} id - Unique identifier for the gem
 * @property {Object} [position] - Optional position data
 * @property {number} [position.row] - Row position on board
 * @property {number} [position.col] - Column position on board
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} BOARD_SIZE - Size of the game board (9x9)
 * @property {number} MIN_MATCH_SIZE - Minimum gems needed for a match (3)
 * @property {string[]} GEM_TYPES - Array of available gem types
 * @property {Object} GEM_COLORS - Color mappings for each gem type
 * @property {Object} POWER_UP_TYPES - Power-up type definitions
 * @property {number} INITIAL_TARGET_SCORE - Starting target score
 * @property {number} LEVEL_SCORE_MULTIPLIER - Score multiplier per level
 */

/**
 * @typedef {Object} GameState
 * @property {GemData[][]} board - 2D array representing the game board
 * @property {number} score - Current player score
 * @property {number} level - Current game level
 * @property {number} targetScore - Score needed to complete current level
 * @property {number} moves - Number of moves made
 * @property {Object|null} selectedGem - Currently selected gem
 * @property {boolean} isAnimating - Whether animations are in progress
 * @property {number} rushMultiplier - Current score multiplier
 * @property {string} gameMode - Current game mode ('normal', 'timeAttack', etc.)
 * @property {boolean} isGameOver - Whether the game has ended
 * @property {Object} gameStats - Statistics tracking object
 */

/**
 * @typedef {Object} MatchData
 * @property {string} type - Type of match ('horizontal' or 'vertical')
 * @property {Object[]} gems - Array of gem positions in the match
 * @property {number} points - Points awarded for this match
 */

/**
 * @typedef {Object} CascadeResult
 * @property {number} totalScore - Total score from cascade
 * @property {number} cascadeLevel - Number of cascade levels processed
 * @property {Object[]} cascadeResults - Detailed results for each level
 */

/**
 * @typedef {Object} PowerUpConfig
 * @property {string} LIGHTNING - Lightning power-up identifier
 * @property {string} BOMB - Bomb power-up identifier  
 * @property {string} RAINBOW - Rainbow power-up identifier
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} frameTime - Time taken for last frame
 * @property {number} domUpdates - Number of DOM updates performed
 * @property {number} memoryUsage - Current memory usage
 * @property {number} lastGC - Timestamp of last garbage collection
 */

/**
 * Main game engine class that orchestrates all game functionality
 * @class GameEngine
 * @description Central controller for game initialization, board management,
 * user interactions, and game state updates. Handles the complete game lifecycle.
 */

/**
 * Gem management system for creating, validating, and manipulating gems
 * @class GemSystem
 * @description Handles all gem-related operations including creation, matching,
 * power-up generation, board manipulation, and game physics like gravity.
 */

/**
 * Game state management and persistence
 * @class GameState
 * @description Manages the current game state, statistics tracking,
 * save/load functionality, and state validation.
 */

/**
 * Performance optimization utilities
 * @class PerformanceUtils
 * @description Provides tools for optimizing animations, DOM operations,
 * memory management, and performance monitoring.
 */

/**
 * Project structure documentation for AI assistants
 * @namespace ProjectStructure
 * @description Complete overview of the codebase organization
 */
export const PROJECT_STRUCTURE = {
    /**
     * Core game logic modules
     * @namespace Core
     */
    core: {
        'game-engine.js': 'Main game controller and initialization',
        'game-state.js': 'Game state management and persistence',
        'gem-system.js': 'Gem creation, matching, and physics',
        'constants.js': 'Game configuration and constants'
    },

    /**
     * User interface modules
     * @namespace UI
     */
    ui: {
        'interface.js': 'Main UI controller and updates',
        'modals.js': 'Modal dialogs and overlays',
        'menu-system.js': 'Menu navigation and controls',
        'game-mode-selector.js': 'Game mode selection interface'
    },

    /**
     * Utility modules
     * @namespace Utils
     */
    utils: {
        'helpers.js': 'General utility functions',
        'storage.js': 'Local storage management',
        'validators.js': 'Input validation utilities',
        'event-manager.js': 'Event handling and cleanup',
        'performance-monitor.js': 'Performance tracking',
        'performance-utils.js': 'Performance optimization tools'
    },

    /**
     * Game mode implementations
     * @namespace Modes
     */
    modes: {
        'game-modes.js': 'Game mode configuration',
        'campaign.js': 'Campaign mode implementation',
        'stage-system.js': 'Stage progression system'
    },

    /**
     * Feature modules
     * @namespace Features
     */
    features: {
        'audio-system.js': 'Sound effects and music',
        'input-handler.js': 'Input processing and validation'
    }
};

/**
 * Code patterns and conventions for AI assistants
 * @namespace CodingConventions
 */
export const CODING_CONVENTIONS = {
    /**
     * Naming conventions used throughout the project
     */
    naming: {
        classes: 'PascalCase (e.g., GameEngine, GemSystem)',
        functions: 'camelCase (e.g., createGem, findMatches)',
        constants: 'UPPER_SNAKE_CASE (e.g., BOARD_SIZE, GEM_TYPES)',
        variables: 'camelCase (e.g., selectedGem, currentScore)',
        files: 'kebab-case (e.g., game-engine.js, gem-system.js)',
        eventHandlers: 'handle prefix (e.g., handleGemClick, handleKeyDown)'
    },

    /**
     * Error handling patterns
     */
    errorHandling: {
        validation: 'Use early returns for invalid inputs',
        tryWatch: 'Wrap risky operations in try-catch blocks',
        logging: 'Use descriptive console messages with emojis',
        fallbacks: 'Provide fallback values for failed operations',
        recovery: 'Implement graceful degradation when possible'
    },

    /**
     * Performance patterns
     */
    performance: {
        animations: 'Use CSS transforms and requestAnimationFrame',
        dom: 'Batch DOM operations when possible',
        events: 'Use event delegation and passive listeners',
        memory: 'Clean up event listeners and intervals',
        validation: 'Validate inputs early and cache results'
    },

    /**
     * Code organization patterns
     */
    organization: {
        modules: 'Use ES6 modules with clear exports',
        separation: 'Separate concerns into focused modules',
        dependencies: 'Keep dependencies explicit and minimal',
        configuration: 'Centralize configuration in constants.js',
        documentation: 'Use JSDoc for all public methods'
    }
};

/**
 * Common debugging and optimization patterns for AI assistants
 * @namespace DebuggingPatterns
 */
export const DEBUGGING_PATTERNS = {
    /**
     * Logging conventions used in the project
     */
    logging: {
        success: '✅ for successful operations',
        error: '❌ for error conditions',
        warning: '⚠️ for warnings',
        info: '🔍 for debug information',
        performance: '📊 for performance metrics',
        cleanup: '🧹 for cleanup operations',
        initialization: '🎮 for game initialization',
        cascade: '🌊 for cascade operations',
        powerup: '⚡ for power-up activities'
    },

    /**
     * Common debugging scenarios
     */
    scenarios: {
        boardSync: 'Check DOM vs board state alignment',
        memoryLeaks: 'Monitor event listeners and intervals',
        performance: 'Track frame rates and DOM operations',
        stateCorruption: 'Validate game state integrity',
        matchingLogic: 'Verify gem matching algorithms',
        animationIssues: 'Check requestAnimationFrame usage'
    }
};

/**
 * API documentation for key methods that AI assistants commonly need to understand
 * @namespace APIReference
 */
export const API_REFERENCE = {
    gameEngine: {
        initialize: 'Sets up the complete game environment',
        restart: 'Resets the game to initial state',
        processMatchesWithCascade: 'Handles match processing and cascading',
        handleGemClickSafely: 'Processes user gem interactions',
        renderBoardSafely: 'Updates the visual game board'
    },

    gemSystem: {
        createInitialBoard: 'Generates a valid starting game board',
        findMatches: 'Identifies matching gem groups',
        processCascade: 'Handles automatic match processing',
        activatePowerUp: 'Executes power-up effects',
        validateBoard: 'Checks board state integrity'
    },

    gameState: {
        reset: 'Initializes default game state',
        addScore: 'Updates player score',
        selectGem: 'Marks a gem as selected',
        getGem: 'Retrieves gem at specific position',
        setBoard: 'Updates the game board state'
    }
};

/**
 * Performance optimization checklist for AI assistants
 * @namespace OptimizationChecklist
 */
export const OPTIMIZATION_CHECKLIST = {
    css: [
        'Use transform instead of changing top/left',
        'Add will-change for animated elements',
        'Use hardware acceleration with translateZ(0)',
        'Minimize reflows and repaints',
        'Use efficient selectors'
    ],

    javascript: [
        'Use requestAnimationFrame for animations',
        'Batch DOM operations',
        'Implement object pooling for frequent allocations',
        'Use passive event listeners for touch events',
        'Debounce/throttle frequent function calls'
    ],

    memory: [
        'Remove event listeners on cleanup',
        'Clear intervals and timeouts',
        'Use WeakMap for automatic garbage collection',
        'Avoid creating objects in tight loops',
        'Monitor memory usage with performance.memory'
    ],

    dom: [
        'Use DocumentFragment for multiple insertions',
        'Cache DOM queries',
        'Use event delegation',
        'Minimize DOM traversal',
        'Use efficient selectors'
    ]
};

// Export all documentation for easy access
export default {
    PROJECT_STRUCTURE,
    CODING_CONVENTIONS,
    DEBUGGING_PATTERNS,
    API_REFERENCE,
    OPTIMIZATION_CHECKLIST
}; 