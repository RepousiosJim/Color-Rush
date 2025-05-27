// Game Mode Selector Module
// Handles the top-right game mode selector dropdown functionality

import { gameState } from '../core/game-state.js';
import { eventManager } from '../utils/event-manager.js';

export class GameModeSelector {
    constructor() {
        this.isInitialized = false;
        this.currentMode = 'normal';

        this.elements = {};
        this.modes = {
            normal: {
                icon: '🎯',
                title: 'Normal',
                fullTitle: 'Normal Mode',
                description: 'Classic match-3 gameplay'
            },
            timeAttack: {
                icon: '⏱️',
                title: 'Time Attack',
                fullTitle: 'Time Attack',
                description: 'Race against the clock'
            },
            dailyChallenge: {
                icon: '📅',
                title: 'Daily',
                fullTitle: 'Daily Challenge',
                description: 'Special daily quest'
            }
        };
    }

    // Initialize the game mode selector
    initialize() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.updateDisplay();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Game Mode Selector:', error);
            return false;
        }
    }

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            selector: document.getElementById('gameModeSelector'),
            button: document.getElementById('modeSelectorBtn'),
            modeIcon: document.querySelector('.mode-icon'),
            modeText: document.querySelector('.mode-text'),
            arrowLeft: document.getElementById('modeArrowLeft'),
            arrowRight: document.getElementById('modeArrowRight'),
            badge: document.querySelector('.game-mode-selector .btn-badge'),
            modeContent: document.querySelector('.mode-content')
        };

        // Validate essential elements
        if (!this.elements.selector || !this.elements.button) {
            throw new Error('Essential game mode selector elements not found');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Left arrow click
        this.elements.arrowLeft.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.previousMode();
        });

        // Right arrow click
        this.elements.arrowRight.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.nextMode();
        });

        // Keyboard navigation
        this.elements.button.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });

        // Listen for game mode changes from other parts of the app
        document.addEventListener('gameModeChanged', (event) => {
            const { mode } = event.detail;
            if (mode && this.modes[mode] && mode !== this.currentMode) {
                this.currentMode = mode;
                this.updateDisplay();
            }
        });
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousMode();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextMode();
                break;
        }
    }

    // Navigate to previous mode
    previousMode() {
        const modes = Object.keys(this.modes);
        const currentIndex = modes.indexOf(this.currentMode);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : modes.length - 1;
        this.selectMode(modes[previousIndex]);
    }

    // Navigate to next mode
    nextMode() {
        const modes = Object.keys(this.modes);
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = currentIndex < modes.length - 1 ? currentIndex + 1 : 0;
        this.selectMode(modes[nextIndex]);
    }

    // Select a game mode
    selectMode(mode) {
        if (!this.modes[mode] || mode === this.currentMode) {
            return;
        }

        const previousMode = this.currentMode;
        this.currentMode = mode;

        // Update display
        this.updateDisplay();

        // Animate selection
        this.animateSelection();

        // Dispatch mode change event
        this.dispatchModeChangeEvent(mode, previousMode);

        console.log(`🎯 Game mode selected: ${mode}`);
    }

    // Update the main button display
    updateDisplay() {
        const modeData = this.modes[this.currentMode];
        if (!modeData) return;

        if (this.elements.modeIcon) {
            this.elements.modeIcon.textContent = modeData.icon;
        }

        if (this.elements.modeText) {
            this.elements.modeText.textContent = modeData.title;
        }

        // Update badge text to show active mode
        if (this.elements.badge) {
            this.elements.badge.textContent = 'ACTIVE';
        }

        // Update button title for accessibility
        if (this.elements.button) {
            this.elements.button.title = `Current mode: ${modeData.fullTitle} - ${modeData.description}`;
            this.elements.button.setAttribute('aria-label', `Game Mode Selector - Current: ${modeData.fullTitle}`);
        }
    }

    // Animate selection
    animateSelection() {
        // Add selection animation to button
        this.elements.button.style.animation = 'none';
        this.elements.button.offsetHeight; // Trigger reflow
        this.elements.button.style.animation = 'modeSelectionPulse 0.4s ease-out';

        // Add slide animation to content
        if (this.elements.modeContent) {
            this.elements.modeContent.style.animation = 'modeSlideIn 0.3s ease-out';
        }

        // Remove animations after completion
        setTimeout(() => {
            this.elements.button.style.animation = '';
            if (this.elements.modeContent) {
                this.elements.modeContent.style.animation = '';
            }
        }, 400);
    }

    // Add selection animation styles
    addAnimationStyles() {
        if (document.getElementById('gameModeAnimations')) return;

        const style = document.createElement('style');
        style.id = 'gameModeAnimations';
        style.textContent = `
            @keyframes modeSelectionPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }



    // Dispatch mode change event
    dispatchModeChangeEvent(newMode, previousMode) {
        const event = new CustomEvent('gameModeSelected', {
            detail: {
                mode: newMode,
                previousMode,
                modeData: this.modes[newMode],
                timestamp: Date.now()
            },
            bubbles: true
        });

        document.dispatchEvent(event);

        // Also update game state
        try {
            if (typeof gameState !== 'undefined' && gameState && gameState.setGameMode) {
                gameState.setGameMode(newMode);
            }
        } catch (error) {
            console.warn('⚠️ Could not update game state:', error);
        }
    }

    // Get current mode
    getCurrentMode() {
        return this.currentMode;
    }

    // Set mode programmatically
    setMode(mode) {
        if (this.modes[mode] && mode !== this.currentMode) {
            this.selectMode(mode);
        }
    }

    // Get mode data
    getModeData(mode = this.currentMode) {
        return this.modes[mode] || null;
    }

    // Add a new mode (for extensibility)
    addMode(modeId, modeData) {
        if (!modeId || !modeData) return false;

        this.modes[modeId] = {
            icon: modeData.icon || '🎮',
            title: modeData.title || modeId,
            fullTitle: modeData.fullTitle || modeData.title || modeId,
            description: modeData.description || 'Custom game mode'
        };

        return true;
    }

    // Hide/show selector
    setVisibility(visible) {
        if (this.elements.selector) {
            this.elements.selector.style.display = visible ? 'block' : 'none';
        }
    }

    // Cleanup method
    cleanup() {
        if (!this.isInitialized) return;

        // Remove event listeners
        eventManager.removeAllListeners('gameModeSelectorClick');
        eventManager.removeAllListeners('gameModeSelectorKeydown');

        // Clear references
        this.elements = {};
        this.isInitialized = false;

        console.log('🧹 Game Mode Selector cleaned up');
    }

    // Get selector state info
    getState() {
        return {
            isInitialized: this.isInitialized,
            currentMode: this.currentMode,
            availableModes: Object.keys(this.modes),
            currentModeData: this.modes[this.currentMode]
        };
    }
}

// Create and export singleton instance
export const gameModeSelector = new GameModeSelector();

// Add animation styles when module loads
document.addEventListener('DOMContentLoaded', () => {
    gameModeSelector.addAnimationStyles();
}); 