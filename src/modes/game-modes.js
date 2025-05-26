// Game Modes Module
// Handles Normal, Time Attack, Daily Challenge modes and their specific logic

import { gameState } from '../core/game-state.js';
import { helpers } from '../utils/helpers.js';

export class GameModes {
    constructor() {
        this.currentMode = 'normal';
        this.timers = {};
        this.modeConfigs = {};
        this.isInitialized = false;
    }

    // Initialize game modes system
    initialize() {
        try {
            console.log('🎯 Initializing Game Modes...');
            this.setupModeConfigurations();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('✅ Game Modes initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Game Modes:', error);
            return false;
        }
    }

    // Setup mode configurations
    setupModeConfigurations() {
        this.modeConfigs = {
            normal: {
                name: 'Normal Mode',
                icon: '🎯',
                hasTimer: false,
                hasLifeLimit: false,
                hasSpecialRules: false,
                description: 'Classic divine gameplay with unlimited time',
                scoreMultiplier: 1.0
            },
            timeAttack: {
                name: 'Time Attack',
                icon: '⏱️',
                hasTimer: true,
                timeLimit: 60, // seconds
                hasLifeLimit: false,
                hasSpecialRules: true,
                description: 'Score as much as possible in 60 seconds',
                scoreMultiplier: 1.5
            },
            dailyChallenge: {
                name: 'Daily Challenge',
                icon: '📅',
                hasTimer: true,
                timeLimit: 120, // seconds
                hasLifeLimit: false,
                hasSpecialRules: true,
                description: 'Special daily divine quest with unique objectives',
                scoreMultiplier: 2.0,
                hasSpecialObjectives: true
            }
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for timer updates
        document.addEventListener('timerTick', (event) => {
            this.handleTimerTick(event.detail);
        });

        // Listen for score updates
        document.addEventListener('scoreUpdate', (event) => {
            this.handleScoreUpdate(event.detail);
        });
    }

    // Start specific game mode
    startMode(mode) {
        console.log(`🎮 Starting game mode: ${mode}`);
        
        this.currentMode = mode;
        const config = this.modeConfigs[mode];
        
        if (!config) {
            console.error('Unknown game mode:', mode);
            return false;
        }

        // Set game state for the mode
        gameState.setGameMode(mode);
        
        // Apply mode-specific configurations
        this.applyModeConfig(config);
        
        // Start mode-specific features
        if (config.hasTimer) {
            this.startTimer(config.timeLimit);
        }
        
        if (config.hasSpecialObjectives) {
            this.setupSpecialObjectives(mode);
        }
        
        // Trigger mode started event
        const event = new CustomEvent('gameModeStarted', {
            detail: { mode, config }
        });
        document.dispatchEvent(event);
        
        return true;
    }

    // Apply mode configuration
    applyModeConfig(config) {
        // Apply score multiplier
        gameState.scoreMultiplier = config.scoreMultiplier || 1.0;
        
        // Set timer if needed
        if (config.hasTimer) {
            gameState.timeRemaining = config.timeLimit;
        } else {
            gameState.timeRemaining = 0;
        }
        
        // Mode-specific adjustments
        switch (this.currentMode) {
            case 'timeAttack':
                this.setupTimeAttackMode();
                break;
            case 'dailyChallenge':
                this.setupDailyChallengeMode();
                break;
            default:
                this.setupNormalMode();
        }
    }

    // Setup Normal Mode
    setupNormalMode() {
        console.log('🎯 Setting up Normal Mode');
        // Normal mode uses default settings
        gameState.targetScore = 1000;
    }

    // Setup Time Attack Mode
    setupTimeAttackMode() {
        console.log('⏱️ Setting up Time Attack Mode');
        
        // Adjust scoring for time pressure
        gameState.targetScore = 5000; // Higher target for time attack
        
        // Enable quick-play features
        gameState.hintsEnabled = true;
        gameState.cascadeSpeedMultiplier = 1.5;
    }

    // Setup Daily Challenge Mode
    setupDailyChallengeMode() {
        console.log('📅 Setting up Daily Challenge Mode');
        
        const today = new Date().toDateString();
        const dailySeed = helpers.hashCode(today);
        
        // Generate daily challenge based on date
        const challenge = this.generateDailyChallenge(dailySeed);
        
        gameState.targetScore = challenge.targetScore;
        gameState.specialObjectives = challenge.objectives;
        gameState.dailyReward = challenge.reward;
        
        console.log('📅 Daily challenge generated:', challenge);
    }

    // Generate daily challenge
    generateDailyChallenge(seed) {
        // Use seed for consistent daily challenges
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        const challenges = [
            {
                name: 'Divine Fire Master',
                targetScore: 3000,
                objectives: [
                    'Match 20 Fire gems 🔥',
                    'Create 5 cascades',
                    'Reach target score'
                ],
                reward: { type: 'essence', amount: 100 }
            },
            {
                name: 'Lightning Speed',
                targetScore: 2500,
                objectives: [
                    'Complete in under 90 seconds',
                    'Match 15 Lightning gems ⚡',
                    'Achieve 3x multiplier'
                ],
                reward: { type: 'essence', amount: 150 }
            },
            {
                name: 'Nature\'s Harmony',
                targetScore: 4000,
                objectives: [
                    'Match 25 Nature gems 🌿',
                    'Create 10 cascades',
                    'No invalid moves'
                ],
                reward: { type: 'essence', amount: 200 }
            },
            {
                name: 'Mystic Convergence',
                targetScore: 3500,
                objectives: [
                    'Match every gem type',
                    'Create 5+ gem match',
                    'Reach target score'
                ],
                reward: { type: 'essence', amount: 175 }
            }
        ];

        const challengeIndex = Math.floor(random() * challenges.length);
        return challenges[challengeIndex];
    }

    // Setup special objectives
    setupSpecialObjectives(mode) {
        if (mode === 'dailyChallenge' && gameState.specialObjectives) {
            // Track special objectives
            gameState.objectiveProgress = {};
            gameState.specialObjectives.forEach(objective => {
                gameState.objectiveProgress[objective] = 0;
            });
        }
    }

    // Start timer for timed modes
    startTimer(seconds) {
        console.log(`⏰ Starting timer for ${seconds} seconds`);
        
        this.clearTimer();
        gameState.timeRemaining = seconds;
        
        this.timers.gameTimer = setInterval(() => {
            gameState.timeRemaining--;
            
            // Trigger timer update event
            const event = new CustomEvent('timerUpdate', {
                detail: { timeRemaining: gameState.timeRemaining }
            });
            document.dispatchEvent(event);
            
            if (gameState.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    // Handle timer tick
    handleTimerTick(data) {
        if (this.timers.gameTimer && data.timeRemaining <= 10) {
            // Add urgency effects for last 10 seconds
            document.body.classList.add('timer-warning');
        }
    }

    // Handle time up
    handleTimeUp() {
        console.log('⏰ Time\'s up!');
        
        this.clearTimer();
        
        // Trigger time up event
        const event = new CustomEvent('timeUp', {
            detail: { 
                mode: this.currentMode,
                finalScore: gameState.score 
            }
        });
        document.dispatchEvent(event);
        
        // End the game
        this.endMode();
    }

    // Handle score update
    handleScoreUpdate(data) {
        const config = this.modeConfigs[this.currentMode];
        
        if (config && config.scoreMultiplier && config.scoreMultiplier !== 1.0) {
            // Apply mode-specific score multiplier
            const bonusPoints = Math.round(data.points * (config.scoreMultiplier - 1.0));
            
            if (bonusPoints > 0) {
                // Show bonus points notification
                const event = new CustomEvent('showNotification', {
                    detail: {
                        message: `+${bonusPoints} Mode Bonus!`,
                        type: 'success'
                    }
                });
                document.dispatchEvent(event);
            }
        }
    }

    // Update objective progress
    updateObjectiveProgress(type, data) {
        if (this.currentMode !== 'dailyChallenge' || !gameState.specialObjectives) {
            return;
        }

        switch (type) {
            case 'gemMatch':
                this.updateGemMatchObjectives(data);
                break;
            case 'cascade':
                this.updateCascadeObjectives(data);
                break;
            case 'timeComplete':
                this.updateTimeObjectives(data);
                break;
            case 'invalidMove':
                this.updateMoveObjectives(data);
                break;
        }

        // Check if all objectives completed
        this.checkObjectivesCompletion();
    }

    // Update gem match objectives
    updateGemMatchObjectives(data) {
        const { gemType, matchSize } = data;
        
        gameState.specialObjectives.forEach(objective => {
            if (objective.includes(gemType)) {
                const current = gameState.objectiveProgress[objective] || 0;
                gameState.objectiveProgress[objective] = current + matchSize;
            }
            
            if (objective.includes('every gem type')) {
                // Track unique gem types matched
                if (!gameState.uniqueGemsMatched) {
                    gameState.uniqueGemsMatched = new Set();
                }
                gameState.uniqueGemsMatched.add(gemType);
            }
            
            if (objective.includes('5+ gem match') && matchSize >= 5) {
                gameState.objectiveProgress[objective] = true;
            }
        });
    }

    // Update cascade objectives
    updateCascadeObjectives(data) {
        const { cascadeLevel } = data;
        
        gameState.specialObjectives.forEach(objective => {
            if (objective.includes('cascades')) {
                const current = gameState.objectiveProgress[objective] || 0;
                gameState.objectiveProgress[objective] = current + 1;
            }
            
            if (objective.includes('multiplier') && cascadeLevel >= 3) {
                gameState.objectiveProgress[objective] = true;
            }
        });
    }

    // Update time objectives
    updateTimeObjectives(data) {
        const { completionTime } = data;
        
        gameState.specialObjectives.forEach(objective => {
            if (objective.includes('90 seconds') && completionTime < 90) {
                gameState.objectiveProgress[objective] = true;
            }
        });
    }

    // Update move objectives
    updateMoveObjectives(data) {
        gameState.specialObjectives.forEach(objective => {
            if (objective.includes('No invalid moves')) {
                gameState.objectiveProgress[objective] = false;
            }
        });
    }

    // Check objectives completion
    checkObjectivesCompletion() {
        if (!gameState.specialObjectives) return;

        let allCompleted = true;
        
        gameState.specialObjectives.forEach(objective => {
            const progress = gameState.objectiveProgress[objective];
            
            // Extract target numbers from objectives
            const match = objective.match(/(\d+)/);
            const target = match ? parseInt(match[1]) : 1;
            
            if (objective.includes('every gem type')) {
                if (!gameState.uniqueGemsMatched || gameState.uniqueGemsMatched.size < 7) {
                    allCompleted = false;
                }
            } else if (typeof progress === 'number' && progress < target) {
                allCompleted = false;
            } else if (typeof progress === 'boolean' && !progress) {
                allCompleted = false;
            }
        });

        if (allCompleted) {
            this.completeObjectives();
        }
    }

    // Complete objectives
    completeObjectives() {
        console.log('🎉 All objectives completed!');
        
        // Award daily reward
        if (gameState.dailyReward) {
            const event = new CustomEvent('awardReward', {
                detail: { reward: gameState.dailyReward }
            });
            document.dispatchEvent(event);
        }
        
        // Show completion notification
        const event = new CustomEvent('showNotification', {
            detail: {
                message: '🎉 All objectives completed! Bonus reward earned!',
                type: 'achievement'
            }
        });
        document.dispatchEvent(event);
    }

    // End current mode
    endMode() {
        console.log(`🏁 Ending game mode: ${this.currentMode}`);
        
        this.clearTimer();
        
        // Calculate final results
        const results = this.calculateResults();
        
        // Trigger mode ended event
        const event = new CustomEvent('gameModeEnded', {
            detail: { 
                mode: this.currentMode,
                results: results
            }
        });
        document.dispatchEvent(event);
        
        // Reset to normal mode
        this.currentMode = 'normal';
        gameState.setGameMode('normal');
    }

    // Calculate results
    calculateResults() {
        const config = this.modeConfigs[this.currentMode];
        
        return {
            score: gameState.score,
            moves: gameState.moves,
            level: gameState.level,
            timeUsed: config.hasTimer ? (config.timeLimit - gameState.timeRemaining) : null,
            objectivesCompleted: this.getCompletedObjectives(),
            scoreMultiplier: config.scoreMultiplier || 1.0
        };
    }

    // Get completed objectives
    getCompletedObjectives() {
        if (!gameState.specialObjectives) return [];
        
        return gameState.specialObjectives.filter(objective => {
            const progress = gameState.objectiveProgress[objective];
            
            if (objective.includes('every gem type')) {
                return gameState.uniqueGemsMatched && gameState.uniqueGemsMatched.size >= 7;
            }
            
            const match = objective.match(/(\d+)/);
            const target = match ? parseInt(match[1]) : 1;
            
            if (typeof progress === 'number') {
                return progress >= target;
            }
            
            return progress === true;
        });
    }

    // Clear all timers
    clearTimer() {
        if (this.timers.gameTimer) {
            clearInterval(this.timers.gameTimer);
            this.timers.gameTimer = null;
        }
        
        document.body.classList.remove('timer-warning');
    }

    // Get current mode info
    getCurrentModeInfo() {
        return {
            mode: this.currentMode,
            config: this.modeConfigs[this.currentMode],
            timeRemaining: gameState.timeRemaining,
            objectives: gameState.specialObjectives,
            objectiveProgress: gameState.objectiveProgress
        };
    }

    // Get available modes
    getAvailableModes() {
        return Object.keys(this.modeConfigs).map(key => ({
            key,
            ...this.modeConfigs[key]
        }));
    }

    // Pause current mode
    pauseMode() {
        if (this.timers.gameTimer) {
            clearInterval(this.timers.gameTimer);
            this.timers.gameTimer = null;
        }
        
        const event = new CustomEvent('gameModePaused', {
            detail: { mode: this.currentMode }
        });
        document.dispatchEvent(event);
    }

    // Resume current mode
    resumeMode() {
        if (gameState.timeRemaining > 0) {
            this.startTimer(gameState.timeRemaining);
        }
        
        const event = new CustomEvent('gameModeResumed', {
            detail: { mode: this.currentMode }
        });
        document.dispatchEvent(event);
    }
}

// Global game modes instance
export const gameModes = new GameModes();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameModes.initialize();
    });
} else {
    gameModes.initialize();
} 