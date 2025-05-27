/**
 * @fileoverview Central Module Index for Gems Rush Game
 * @description This file provides centralized access to all game modules
 * for easier AI assistant navigation and development workflow.
 */

// Core game modules
export { GameEngine, gameEngine } from './core/game-engine.js';
export { GameState, gameState } from './core/game-state.js';
export { GemSystem, gemSystem } from './core/gem-system.js';
export { GAME_CONFIG, GEM_TYPES, POWER_UP_TYPES } from './core/constants.js';

// UI modules
export { UIManager } from './ui/interface.js';
export { ModalManager } from './ui/modals.js';
export { MenuSystem } from './ui/menu-system.js';
export { GameModeSelector } from './ui/game-mode-selector.js';

// Utility modules
export { helpers } from './utils/helpers.js';
export { storageManager } from './utils/storage.js';
export { validators } from './utils/validators.js';
export { eventManager } from './utils/event-manager.js';
export { performanceMonitor } from './utils/performance-monitor.js';
export { PerformanceUtils, performanceUtils, performanceHelpers } from './utils/performance-utils.js';

// Game modes
export { GameModes, gameModes } from './modes/game-modes.js';
export { CampaignMode, campaignMode, startCampaign } from './modes/campaign.js';
export { StageSystem, stageSystem } from './modes/stage-system.js';

// Features
export { AudioSystem } from './features/audio-system.js';
export { InputHandler } from './features/input-handler.js';
export { SettingsSystem, settingsSystem, getSetting, setSetting } from './features/settings-system.js';
export { AdvancedInputSystem, advancedInputSystem, isTouch, isMobile } from './features/advanced-input-system.js';

// UI Systems
export { settingsUI } from './ui/settings-ui.js';

// Documentation and type definitions
export { 
    PROJECT_STRUCTURE, 
    CODING_CONVENTIONS, 
    DEBUGGING_PATTERNS, 
    API_REFERENCE, 
    OPTIMIZATION_CHECKLIST 
} from './utils/ai-friendly-docs.js';

/**
 * Quick access object for AI assistants
 * @namespace QuickAccess
 * @description Provides easy access to commonly used functionality
 */
export const QuickAccess = {
    // Core instances
    game: gameEngine,
    state: gameState,
    gems: gemSystem,
    
    // Common operations
    initialize: () => gameEngine.initialize(),
    restart: () => gameEngine.restart(),
    getScore: () => gameState.score,
    getBoard: () => gameState.board,
    
    // Debugging helpers
    debugBoard: () => console.table(gameState.board.map(row => row.map(gem => gem?.type || '❌'))),
    debugMetrics: () => performanceUtils.getMetrics(),
    debugState: () => ({ ...gameState }),
    
    // Performance helpers
    enablePerformanceMode: () => {
        document.body.classList.add('high-performance-mode');
        performanceUtils.optimizeCSS().enableHardwareAcceleration(document.querySelector('.game-board'));
    },
    
    // Common fixes
    fixBoardSync: () => gameEngine.fixBoardSynchronization(),
    validateBoard: () => gemSystem.validateBoard(gameState.board),
    clearCache: () => {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🧹 Cache cleared');
    }
};

/**
 * Module health check for AI assistants
 * @function healthCheck
 * @description Verifies all modules are properly loaded and functional
 * @returns {Object} Health status of all modules
 */
export const healthCheck = () => {
    const modules = {
        gameEngine: !!gameEngine,
        gameState: !!gameState,
        gemSystem: !!gemSystem,
        performanceUtils: !!performanceUtils,
        helpers: !!helpers,
        storageManager: !!storageManager
    };
    
    const healthy = Object.values(modules).every(Boolean);
    
    console.log(healthy ? '✅ All modules healthy' : '❌ Some modules missing');
    return { healthy, modules };
};

/**
 * Development utilities for AI assistants
 * @namespace DevUtils
 */
export const DevUtils = {
    // Logging helpers
    logWithStyle: (message, style = 'color: #4CAF50; font-weight: bold;') => {
        console.log(`%c${message}`, style);
    },
    
    // Performance measurement
    measurePerformance: (fn, name = 'operation') => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`📊 ${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    // Memory usage tracking
    trackMemory: () => {
        if (performance.memory) {
            const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
            console.log(`🧠 Memory: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB used of ${(totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
            return { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit };
        }
        return null;
    },
    
    // DOM query helpers
    queryAll: (selector) => Array.from(document.querySelectorAll(selector)),
    queryOne: (selector) => document.querySelector(selector),
    
    // State inspection
    inspectGameState: () => {
        const state = { ...gameState };
        state.board = state.board?.map(row => row.map(gem => gem?.type || null));
        return state;
    }
};

// Auto-run health check in development
if (process?.env?.NODE_ENV === 'development') {
    setTimeout(healthCheck, 1000);
} 