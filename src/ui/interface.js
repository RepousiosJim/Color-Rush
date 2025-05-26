// UI Interface Module
// Handles UI updates, displays, notifications, and game interface management

import { gameState } from '../core/game-state.js';
import { helpers } from '../utils/helpers.js';

export class UIInterface {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
        this.currentNotifications = [];
        this.animationQueue = [];
    }

    // Initialize UI interface
    initialize() {
        try {
            this.cacheElements();
            this.createGameStats();
            this.setupEventListeners();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize UI Interface:', error);
            return false;
        }
    }

    // Cache frequently used DOM elements
    cacheElements() {
        this.elements = {
            gameStats: document.querySelector('.game-stats'),
            gameInterface: document.getElementById('gameInterface'),
            mainMenu: document.getElementById('mainMenu'),
            gameBoard: document.getElementById('gameBoard'),
            gameTitle: document.querySelector('.game-title'),
            gameModeIndicator: document.getElementById('gameModeIndicator'),
            timerDisplay: document.getElementById('timerDisplay'),
            streakCounter: document.getElementById('streakCounter'),
            statsPanel: document.getElementById('statsPanel'),
            dailyChallengeBadge: document.getElementById('dailyChallengeBadge')
        };
    }

    // Create and populate game statistics
    createGameStats() {
        if (!this.elements.gameStats) {
            console.warn('Game stats container not found');
            return;
        }

        this.elements.gameStats.innerHTML = `
            <div class="stat-item" id="scoreDisplay">
                <div class="stat-label">🏆 Divine Score</div>
                <div class="stat-value" id="scoreValue">0</div>
            </div>
            <div class="stat-item" id="levelDisplay">
                <div class="stat-label">⚡ Divine Realm</div>
                <div class="stat-value" id="levelValue">1</div>
            </div>
            <div class="stat-item" id="targetDisplay">
                <div class="stat-label">🎯 Target Score</div>
                <div class="stat-value" id="targetValue">1,000</div>
            </div>
            <div class="stat-item" id="movesDisplay">
                <div class="stat-label">🔄 Moves</div>
                <div class="stat-value" id="movesValue">0</div>
            </div>
            <div class="stat-item" id="multiplierDisplay" style="display: none;">
                <div class="stat-label">🔥 Rush Multiplier</div>
                <div class="stat-value" id="multiplierValue">1x</div>
            </div>
        `;
    }

    // Update all game displays
    updateAllDisplays() {
        this.updateScore();
        this.updateLevel();
        this.updateTarget();
        this.updateMoves();
        this.updateMultiplier();
        this.updateGameModeDisplay();
        this.updateTimer();
        this.updateStreak();
        this.updateStatistics();
    }

    // Update score display
    updateScore() {
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            const formattedScore = helpers.formatNumber(gameState.score);
            
            // Animate score change
            if (scoreElement.textContent !== formattedScore) {
                scoreElement.style.animation = 'scoreUpdate 0.3s ease-in-out';
                scoreElement.textContent = formattedScore;
                
                setTimeout(() => {
                    scoreElement.style.animation = '';
                }, 300);
            }
        }
    }

    // Update level display
    updateLevel() {
        const levelElement = document.getElementById('levelValue');
        if (levelElement) {
            levelElement.textContent = gameState.level;
        }
    }

    // Update target score display
    updateTarget() {
        const targetElement = document.getElementById('targetValue');
        if (targetElement) {
            targetElement.textContent = helpers.formatNumber(gameState.targetScore);
        }
    }

    // Update moves display
    updateMoves() {
        const movesElement = document.getElementById('movesValue');
        if (movesElement) {
            movesElement.textContent = gameState.moves;
        }
    }

    // Update rush multiplier display
    updateMultiplier() {
        const multiplierElement = document.getElementById('multiplierValue');
        const multiplierDisplay = document.getElementById('multiplierDisplay');
        
        if (multiplierElement && multiplierDisplay) {
            if (gameState.rushMultiplier > 1) {
                multiplierDisplay.style.display = 'block';
                multiplierElement.textContent = `${gameState.rushMultiplier.toFixed(1)}x`;
                multiplierElement.style.color = '#FFD700';
                multiplierElement.style.animation = 'multiplierPulse 0.5s ease-in-out';
            } else {
                multiplierDisplay.style.display = 'none';
            }
        }
    }

    // Update game mode display
    updateGameModeDisplay() {
        const indicator = this.elements.gameModeIndicator;
        if (indicator) {
            const modeIcons = {
                'normal': '🎯',
                'timeAttack': '⏱️',
                'dailyChallenge': '📅',
                'campaign': '⚔️'
            };
            
            const modeNames = {
                'normal': 'Normal Mode',
                'timeAttack': 'Time Attack',
                'dailyChallenge': 'Daily Challenge',
                'campaign': 'Divine Conquest'
            };
            
            const icon = modeIcons[gameState.gameMode] || '🎯';
            const name = modeNames[gameState.gameMode] || 'Normal Mode';
            
            indicator.innerHTML = `${icon} ${name}`;
            indicator.style.display = 'block';
        }
    }

    // Update timer display
    updateTimer() {
        const timerElement = this.elements.timerDisplay;
        if (timerElement) {
            if (gameState.timeRemaining > 0) {
                timerElement.innerHTML = `⏰ ${helpers.formatTime(gameState.timeRemaining)}`;
                timerElement.style.display = 'block';
                
                // Warning colors for low time
                if (gameState.timeRemaining <= 10) {
                    timerElement.style.color = '#ff4757';
                    timerElement.style.animation = 'timerPulse 0.5s ease-in-out infinite';
                } else if (gameState.timeRemaining <= 30) {
                    timerElement.style.color = '#ffa502';
                } else {
                    timerElement.style.color = '#2ed573';
                    timerElement.style.animation = '';
                }
            } else {
                timerElement.style.display = 'none';
            }
        }
    }

    // Update streak counter
    updateStreak() {
        const streakElement = this.elements.streakCounter;
        if (streakElement) {
            if (gameState.streak > 1) {
                streakElement.innerHTML = `🔥 Streak: ${gameState.streak}`;
                streakElement.style.display = 'block';
                streakElement.style.animation = 'streakGlow 0.5s ease-in-out';
            } else {
                streakElement.style.display = 'none';
            }
        }
    }

    // Update statistics panel
    updateStatistics() {
        const statsPanel = this.elements.statsPanel;
        if (statsPanel) {
            const stats = gameState.gameStats;
            
            const elements = {
                statGames: stats.totalGamesPlayed,
                statBestScore: helpers.formatNumber(stats.bestScore),
                statTotalScore: helpers.formatNumber(stats.totalScore),
                statHighestLevel: stats.highestLevel || gameState.level,
                statBestStreak: stats.longestStreak || gameState.streak
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        }
    }

    // Show floating notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `game-notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 2000;
            font-weight: bold;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(notification);
        this.currentNotifications.push(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        // Position multiple notifications
        this.repositionNotifications();
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        return notification;
    }

    // Get notification color based on type
    getNotificationColor(type) {
        const colors = {
            'info': 'linear-gradient(135deg, #667eea, #764ba2)',
            'success': 'linear-gradient(135deg, #2ed573, #17a2b8)',
            'warning': 'linear-gradient(135deg, #ffa502, #ff6348)',
            'error': 'linear-gradient(135deg, #ff4757, #c44569)',
            'achievement': 'linear-gradient(135deg, #FFD700, #FFA500)'
        };
        return colors[type] || colors.info;
    }

    // Remove notification
    removeNotification(notification) {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                const index = this.currentNotifications.indexOf(notification);
                if (index > -1) {
                    this.currentNotifications.splice(index, 1);
                }
                this.repositionNotifications();
            }, 300);
        }
    }

    // Reposition multiple notifications
    repositionNotifications() {
        this.currentNotifications.forEach((notification, index) => {
            notification.style.top = `${20 + (index * 80)}px`;
        });
    }

    // Show level completion
    showLevelComplete() {
        this.showNotification(
            `🎉 Realm ${gameState.level - 1} Conquered! Ascending to Realm ${gameState.level}`,
            'achievement',
            4000
        );
        
        // Play level complete animation
        this.playLevelCompleteAnimation();
    }

    // Play level complete animation
    playLevelCompleteAnimation() {
        const gameBoard = this.elements.gameBoard;
        if (gameBoard) {
            gameBoard.style.animation = 'levelComplete 1s ease-in-out';
            setTimeout(() => {
                gameBoard.style.animation = '';
            }, 1000);
        }
    }

    // Show game over
    showGameOver(reason = 'time') {
        const messages = {
            'time': '⏰ Time\'s Up! Divine battle concluded.',
            'moves': '🔄 No more moves available!',
            'completed': '🏆 All realms conquered! You are now a Divine Master!'
        };
        
        this.showNotification(
            messages[reason] || messages.time,
            'info',
            5000
        );
    }

    // Show floating score
    showFloatingScore(points, x, y) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'floating-score';
        scoreElement.textContent = `+${helpers.formatNumber(points)}`;
        
        scoreElement.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: 20px;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            z-index: 1500;
            animation: floatUpScore 1.5s ease-out forwards;
        `;
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1500);
    }

    // Show hint animation
    showHint(row, col) {
        const gemElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (gemElement) {
            gemElement.style.animation = 'hintPulse 1s ease-in-out 3';
            this.showNotification('💡 Possible move highlighted!', 'info', 2000);
        }
    }

    // Show invalid move feedback
    showInvalidMove() {
        const gameBoard = this.elements.gameBoard;
        if (gameBoard) {
            gameBoard.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                gameBoard.style.animation = '';
            }, 500);
        }
        this.showNotification('❌ Invalid move! Gems must be adjacent.', 'warning', 2000);
    }

    // Toggle statistics panel
    toggleStatistics() {
        const statsPanel = this.elements.statsPanel;
        if (statsPanel) {
            const isVisible = statsPanel.style.display !== 'none';
            statsPanel.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.updateStatistics();
                statsPanel.style.animation = 'slideInRight 0.3s ease-out';
            }
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Store references for cleanup
        this.visibilityChangeHandler = () => {
            if (document.hidden) {
                this.showNotification('⏸️ Game paused', 'info', 1000);
            }
        };
        
        this.keydownHandler = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (event.key.toLowerCase() === 't') {
                this.toggleStatistics();
            }
        };

        this.updateUIHandler = () => {
            this.updateAllDisplays();
        };

        this.levelCompleteHandler = () => {
            this.showLevelComplete();
        };

        // Add event listeners
        document.addEventListener('visibilitychange', this.visibilityChangeHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('updateUI', this.updateUIHandler);
        document.addEventListener('levelComplete', this.levelCompleteHandler);
    }

    // Clean up event listeners
    cleanup() {
        if (this.visibilityChangeHandler) {
            document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
        }
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.updateUIHandler) {
            document.removeEventListener('updateUI', this.updateUIHandler);
        }
        if (this.levelCompleteHandler) {
            document.removeEventListener('levelComplete', this.levelCompleteHandler);
        }
        
        // Clear notification references
        this.clearNotifications();
        
        // Reset initialization state
        this.isInitialized = false;
    }

    // Transition between menu and game
    showGameInterface() {
        const mainMenu = this.elements.mainMenu;
        const gameInterface = this.elements.gameInterface;
        
        if (mainMenu && gameInterface) {
            mainMenu.style.opacity = '0';
            mainMenu.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                mainMenu.style.display = 'none';
                gameInterface.style.display = 'block';
                gameInterface.style.opacity = '0';
                gameInterface.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    gameInterface.style.opacity = '1';
                    gameInterface.style.transform = 'scale(1)';
                }, 50);
            }, 300);
        }
    }

    // Transition from game to menu
    showMainMenu() {
        const mainMenu = this.elements.mainMenu;
        const gameInterface = this.elements.gameInterface;
        
        if (mainMenu && gameInterface) {
            gameInterface.style.opacity = '0';
            gameInterface.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                gameInterface.style.display = 'none';
                mainMenu.style.display = 'flex';
                mainMenu.style.opacity = '0';
                mainMenu.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    mainMenu.style.opacity = '1';
                    mainMenu.style.transform = 'scale(1)';
                }, 50);
            }, 300);
        }
    }

    // Add CSS animations
    addAnimations() {
        // Check if animations already exist
        const existingStyle = document.querySelector('style[data-ui-animations]');
        if (existingStyle) {
            return;
        }

        const style = document.createElement('style');
        style.setAttribute('data-ui-animations', 'true');
        style.textContent = `
            @keyframes scoreUpdate {
                0% { transform: scale(1); color: #fff; }
                50% { transform: scale(1.1); color: #FFD700; }
                100% { transform: scale(1); color: #fff; }
            }
            
            @keyframes multiplierPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes timerPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            @keyframes streakGlow {
                0%, 100% { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                50% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
            }
            
            @keyframes levelComplete {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                25% { transform: scale(1.02); filter: brightness(1.2); }
                50% { transform: scale(1.05); filter: brightness(1.5); }
                75% { transform: scale(1.02); filter: brightness(1.2); }
            }
            
            @keyframes floatUpScore {
                0% { 
                    transform: translateY(0) scale(1); 
                    opacity: 1; 
                }
                100% { 
                    transform: translateY(-60px) scale(1.2); 
                    opacity: 0; 
                }
            }
            
            @keyframes hintPulse {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); 
                }
                50% { 
                    transform: scale(1.1); 
                    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); 
                }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes slideInRight {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Clear all notifications
    clearNotifications() {
        this.currentNotifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    // Get interface state
    getState() {
        return {
            isInitialized: this.isInitialized,
            notificationCount: this.currentNotifications.length,
            currentMode: gameState.gameMode
        };
    }
}

// Global UI interface instance
export const uiInterface = new UIInterface();

// Note: Initialization handled by main.js 