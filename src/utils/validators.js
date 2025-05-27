// Validation Utilities
// Centralized validation functions to reduce code duplication

import { GAME_CONFIG, VALIDATION_RULES } from '../core/constants.js';

export class Validators {
    // Coordinate validation
    static isValidCoordinate(row, col, boardSize = GAME_CONFIG.BOARD_SIZE) {
        return Number.isInteger(row) && 
               Number.isInteger(col) && 
               row >= 0 && row < boardSize && 
               col >= 0 && col < boardSize;
    }

    // Gem validation
    static isValidGem(gem) {
        if (!gem || typeof gem !== 'object') return false;
        
        return VALIDATION_RULES.REQUIRED_GEM_PROPERTIES.every(prop => 
            gem.hasOwnProperty(prop)
        );
    }

    // Board structure validation
    static isValidBoard(board, expectedSize = GAME_CONFIG.BOARD_SIZE) {
        if (!Array.isArray(board) || board.length !== expectedSize) {
            return false;
        }
        
        return board.every(row => 
            Array.isArray(row) && 
            row.length === expectedSize &&
            row.every(gem => gem === null || this.isValidGem(gem))
        );
    }

    // Game state validation
    static isValidGameState(state) {
        if (!state || typeof state !== 'object') return false;
        
        return VALIDATION_RULES.REQUIRED_STATE_PROPERTIES.every(prop => 
            state.hasOwnProperty(prop)
        );
    }

    // Touch coordinates validation
    static isValidTouchCoordinate(coordinate) {
        return typeof coordinate === 'number' && 
               isFinite(coordinate) && 
               coordinate >= 0;
    }

    // Score validation
    static isValidScore(score) {
        return typeof score === 'number' && 
               score >= 0 && 
               isFinite(score);
    }

    // Level validation
    static isValidLevel(level) {
        return typeof level === 'number' && 
               level >= 1 && 
               level <= 1000 && 
               Number.isInteger(level);
    }

    // DOM element validation
    static isValidElement(element) {
        return element instanceof HTMLElement && 
               element.parentNode !== null;
    }

    // Event validation
    static isValidEvent(event, expectedType = null) {
        if (!event || typeof event !== 'object') return false;
        
        if (expectedType && event.type !== expectedType) return false;
        
        return true;
    }

    // Range validation
    static isInRange(value, min, max) {
        return typeof value === 'number' && 
               value >= min && 
               value <= max;
    }

    // Array validation
    static isValidArray(arr, minLength = 0, maxLength = Infinity) {
        return Array.isArray(arr) && 
               arr.length >= minLength && 
               arr.length <= maxLength;
    }

    // Configuration validation
    static isValidConfig(config, requiredKeys = []) {
        if (!config || typeof config !== 'object') return false;
        
        return requiredKeys.every(key => config.hasOwnProperty(key));
    }
}

// Convenience functions for common validations
export const isValidCoord = Validators.isValidCoordinate;
export const isValidGem = Validators.isValidGem;
export const isValidBoard = Validators.isValidBoard;
export const isValidGameState = Validators.isValidGameState; 