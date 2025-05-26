// Game Engine Module
// Main game initialization, board creation, and game loop

import { gameState } from './game-state.js';
import { gemSystem } from './gem-system.js';
import { storageManager } from '../utils/storage.js';
import { helpers } from '../utils/helpers.js';

export class GameEngine {
    constructor() {
        this.gameBoard = null;
        this.isInitialized = false;
        this.animationQueue = [];
        this.cascadeInProgress = false;
    }

    // Initialize the complete game
    async initialize() {
        try {
            console.log('🎮 Initializing Game Engine...');
            
            // Find or create game board element
            this.gameBoard = this.findOrCreateGameBoard();
            
            // Initialize game state
            gameState.reset();
            
            // Create initial board
            const initialBoard = gemSystem.createInitialBoard();
            gameState.setBoard(initialBoard);
            
            // Render the board
            this.renderBoard();
            
            // Load saved game state if available
            this.loadGameState();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Game Engine initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize game engine:', error);
            return false;
        }
    }

    // Find existing game board or create new one
    findOrCreateGameBoard() {
        let board = document.querySelector('.game-board') || document.getElementById('gameBoard');
        
        if (!board) {
            console.log('🎯 Creating new game board element...');
            board = document.createElement('div');
            board.className = 'game-board';
            board.id = 'gameBoard';
            
            // Try to find game interface container
            const gameInterface = document.getElementById('gameInterface');
            if (gameInterface) {
                gameInterface.appendChild(board);
            } else {
                // Fallback to body
                document.body.appendChild(board);
            }
            
            console.log('✅ Game board created and added to DOM');
        }
        
        return board;
    }

    // Render the game board
    renderBoard() {
        if (!this.gameBoard) {
            console.error('❌ Game board element not found!');
            return;
        }

        try {
            console.log('🎨 Rendering game board...');
            
            // Clear existing board
            this.gameBoard.innerHTML = '';
            
            // Apply board layout class instead of inline styles
            this.gameBoard.classList.add('game-board-layout');
            
            // Render each gem
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const gem = gameState.getGem(row, col);
                    if (gem) {
                        const gemElement = this.createGemElement(gem, row, col);
                        this.gameBoard.appendChild(gemElement);
                    }
                }
            }
            
            console.log('✅ Game board rendered successfully');
            
        } catch (error) {
            console.error('❌ Failed to render game board:', error);
        }
    }

    // Create a gem DOM element
    createGemElement(gem, row, col) {
        const element = document.createElement('div');
        element.className = 'gem';
        element.dataset.row = row;
        element.dataset.col = col;
        element.dataset.type = gem.type;
        element.id = gem.id;
        
        // Set gem content
        element.textContent = gem.type;
        
        // Apply gem styling via class and background gradient
        element.style.background = `linear-gradient(135deg, ${gem.colors[0]}, ${gem.colors[1]})`;
        
        // Add power-up indicators
        if (gem.isPowerUp) {
            element.classList.add('power-up');
            element.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
            element.textContent = gem.powerUpType + gem.type;
        }
        
        // Add click handler
        element.addEventListener('click', (event) => this.handleGemClick(event));
        
        return element;
    }

    // Handle gem click events
    handleGemClick(event) {
        if (gameState.isAnimating) {
            return; // Ignore clicks during animations
        }
        
        const element = event.target;
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        
        console.log(`🔍 Gem clicked at position: ${row}, ${col}`);
        
        if (!gameState.selectedGem) {
            // First gem selection
            this.selectGem(element, row, col);
        } else {
            // Second gem selection - attempt swap
            if (gameState.selectedGem.row === row && gameState.selectedGem.col === col) {
                // Same gem clicked - deselect
                this.deselectGem();
            } else {
                // Different gem - attempt swap
                this.attemptSwap(
                    gameState.selectedGem.row, 
                    gameState.selectedGem.col, 
                    row, 
                    col
                );
            }
        }
    }

    // Select a gem
    selectGem(element, row, col) {
        gameState.selectGem(row, col, element);
        element.classList.add('selected');
        element.style.border = '3px solid #FFD700';
        element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        console.log(`✅ Gem selected at: ${row}, ${col}`);
    }

    // Deselect current gem
    deselectGem() {
        if (gameState.selectedGem) {
            const element = gameState.selectedGem.element;
            element.classList.remove('selected');
            element.style.border = '2px solid rgba(255, 255, 255, 0.3)';
            element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            gameState.clearSelection();
            console.log('🔄 Gem deselected');
        }
    }

    // Attempt to swap two gems
    async attemptSwap(row1, col1, row2, col2) {
        console.log(`🔄 Attempting swap: (${row1},${col1}) <-> (${row2},${col2})`);
        
        // Validate the swap
        if (!gemSystem.isValidSwap(gameState.board, row1, col1, row2, col2)) {
            console.log('❌ Invalid swap attempt');
            this.showInvalidMove();
            this.deselectGem();
            return;
        }
        
        // Save state for undo
        gameState.saveState();
        
        // Perform the swap
        this.swapGems(row1, col1, row2, col2);
        
        // Clear selection
        this.deselectGem();
        
        // Increment moves
        gameState.incrementMoves();
        
        // Process matches and cascades
        await this.processMatchesWithCascade();
        
        // Update UI
        this.updateAllDisplays();
        
        // Check for level completion
        this.checkLevelCompletion();
        
        // Save game state
        this.saveGameState();
    }

    // Swap two gems in the board and DOM
    swapGems(row1, col1, row2, col2) {
        const gem1 = gameState.getGem(row1, col1);
        const gem2 = gameState.getGem(row2, col2);
        
        // Swap in game state
        gameState.setGem(row1, col1, gem2);
        gameState.setGem(row2, col2, gem1);
        
        // Update DOM elements
        const element1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
        const element2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
        
        if (element1 && element2) {
            // Update data attributes
            element1.dataset.type = gem2.type;
            element1.textContent = gem2.type;
            element1.style.background = `linear-gradient(135deg, ${gem2.colors[0]}, ${gem2.colors[1]})`;
            
            element2.dataset.type = gem1.type;
            element2.textContent = gem1.type;
            element2.style.background = `linear-gradient(135deg, ${gem1.colors[0]}, ${gem1.colors[1]})`;
        }
    }

    // Process all matches and cascades
    async processMatchesWithCascade() {
        gameState.setAnimating(true);
        gameState.resetCascade();
        
        let hasMatches = true;
        
        while (hasMatches) {
            // Find matches
            const matches = gemSystem.findMatches(gameState.board);
            
            if (matches.length === 0) {
                hasMatches = false;
                break;
            }
            
            // Calculate score
            const scoreData = gemSystem.calculateScore(matches, gameState.cascadeLevel);
            
            // Update score and statistics
            gameState.updateScore(scoreData.totalScore);
            matches.forEach(match => gameState.recordMatch(match.length));
            
            // Animate matches
            await this.animateMatches(matches, scoreData.totalScore);
            
            // Remove matches
            gemSystem.removeMatches(gameState.board, matches);
            
            // Apply gravity
            gemSystem.applyGravity(gameState.board);
            
            // Fill empty spaces
            gemSystem.fillEmptySpaces(gameState.board);
            
            // Re-render board
            this.renderBoard();
            
            // Increment cascade level
            gameState.incrementCascade();
            
            // Wait for animation
            await helpers.sleep(500);
        }
        
        // Update streak
        gameState.updateStreak(gameState.cascadeLevel > 0);
        
        gameState.setAnimating(false);
    }

    // Animate matching gems
    async animateMatches(matches, points) {
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (element) {
                    element.style.animation = 'matchPulse 0.5s ease-in-out';
                    element.style.transform = 'scale(1.2)';
                    element.style.opacity = '0.8';
                }
            });
        });
        
        // Show floating score
        if (matches.length > 0) {
            const firstMatch = matches[0][0];
            this.showFloatingScore(points, firstMatch.row, firstMatch.col);
        }
        
        return helpers.sleep(500);
    }

    // Show floating score animation
    showFloatingScore(points, row, col) {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) return;
        
        const scoreElement = document.createElement('div');
        scoreElement.textContent = `+${helpers.formatNumber(points)}`;
        scoreElement.className = 'floating-score-element';
        
        const rect = element.getBoundingClientRect();
        // Fix position calculation by adding scroll offsets
        scoreElement.style.left = rect.left + window.scrollX + rect.width / 2 + 'px';
        scoreElement.style.top = rect.top + window.scrollY + 'px';
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1000);
    }

    // Show invalid move animation
    showInvalidMove() {
        if (this.gameBoard) {
            this.gameBoard.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                this.gameBoard.style.animation = '';
            }, 500);
        }
    }

    // Check level completion
    checkLevelCompletion() {
        if (gameState.isLevelComplete()) {
            console.log('🎉 Level completed!');
            this.showLevelComplete();
            gameState.updateLevel();
        }
        
        if (gameState.isTimeUp()) {
            console.log('⏰ Time up!');
            this.endGame();
        }
    }

    // Show level completion
    showLevelComplete() {
        // Trigger level complete event
        const event = new CustomEvent('levelComplete');
        document.dispatchEvent(event);
    }

    // End game
    endGame() {
        gameState.gameComplete();
        console.log('🎮 Game ended');
    }

    // Update all UI displays
    updateAllDisplays() {
        // Trigger UI update event
        const event = new CustomEvent('updateUI');
        document.dispatchEvent(event);
    }

    // Find possible moves (for hints)
    findPossibleMoves() {
        return gemSystem.findPossibleMoves(gameState.board);
    }

    // Show hint
    showHint() {
        const possibleMoves = this.findPossibleMoves();
        if (possibleMoves.length > 0) {
            const move = possibleMoves[0];
            const element = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`);
            if (element) {
                element.style.animation = 'hintPulse 1s ease-in-out 3';
            }
        }
    }

    // Undo last move
    undoLastMove() {
        if (gameState.restoreState()) {
            this.renderBoard();
            this.updateAllDisplays();
            console.log('↩️ Move undone');
        }
    }

    // Restart game
    restart() {
        gameState.reset();
        const newBoard = gemSystem.createInitialBoard();
        gameState.setBoard(newBoard);
        this.renderBoard();
        this.updateAllDisplays();
        console.log('🔄 Game restarted');
    }

    // Save game state
    saveGameState() {
        storageManager.saveGameState(gameState);
    }

    // Load game state
    loadGameState() {
        const savedState = storageManager.loadGameState();
        if (savedState) {
            gameState.import(savedState);
            this.renderBoard();
            this.updateAllDisplays();
            console.log('💾 Game state loaded');
        }
    }

    // Get game statistics
    getStatistics() {
        return gameState.gameStats;
    }

    // Set game mode
    setGameMode(mode) {
        gameState.setGameMode(mode);
        console.log(`🎯 Game mode set to: ${mode}`);
    }
}

// Global game engine instance
export const gameEngine = new GameEngine(); 