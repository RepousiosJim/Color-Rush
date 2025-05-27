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
        this.maxRetries = 3;
        this.initializationTimeout = 10000; // 10 seconds
        
        // Debug: Verify gameState availability during construction
        console.log('🔍 GameEngine constructor - gameState check:', {
            gameStateExists: !!gameState,
            gameStateType: typeof gameState,
            gameStateConstructor: gameState?.constructor?.name
        });
    }

    // Validate engine prerequisites
    validatePrerequisites() {
        const errors = [];
        
        if (!gameState) {
            errors.push('Game state module not available');
        }
        
        if (!gemSystem) {
            errors.push('Gem system module not available');
        }
        
        if (!document) {
            errors.push('DOM not available');
        }
        
        if (!window.requestAnimationFrame) {
            errors.push('Animation API not supported');
        }
        
        return errors;
    }

    // Initialize the complete game with timeout and retry logic
    async initialize() {
        const validationErrors = this.validatePrerequisites();
        if (validationErrors.length > 0) {
            console.error('❌ Prerequisites not met:', validationErrors);
            return false;
        }

        let retryCount = 0;
        
        while (retryCount < this.maxRetries) {
            try {
                console.log(`🎮 Initializing Game Engine... (Attempt ${retryCount + 1}/${this.maxRetries})`);
                
                // Set timeout for initialization
                const initPromise = this.performInitialization();
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Initialization timeout')), this.initializationTimeout);
                });
                
                await Promise.race([initPromise, timeoutPromise]);
                
                // Validate initialization
                if (this.validateInitialization()) {
                    console.log('✅ Game Engine initialized successfully');
                    return true;
                }
                
                throw new Error('Initialization validation failed');
                
            } catch (error) {
                retryCount++;
                console.error(`❌ Initialization attempt ${retryCount} failed:`, error);
                
                if (retryCount < this.maxRetries) {
                    console.log(`🔄 Retrying initialization in ${retryCount * 1000}ms...`);
                    await helpers.sleep(retryCount * 1000);
                    
                    // Reset state for retry
                    this.resetForRetry();
                } else {
                    console.error('❌ All initialization attempts failed');
                    this.handleInitializationFailure(error);
                    return false;
                }
            }
        }
        
        return false;
    }

    // Perform the actual initialization steps
    async performInitialization() {
        // Find or create game board element
        this.gameBoard = this.findOrCreateGameBoard();
        if (!this.gameBoard) {
            throw new Error('Failed to create game board element');
        }
        
        // Initialize and validate game state
        const stateInitialized = this.initializeGameState();
        if (!stateInitialized) {
            throw new Error('Failed to initialize game state');
        }
        
        // Create and validate initial board
        const initialBoard = this.createValidatedBoard();
        if (!initialBoard) {
            throw new Error('Failed to create valid initial board');
        }
        
        gameState.setBoard(initialBoard);
        
        // Render the board with validation
        const renderSuccess = this.renderBoardSafely();
        if (!renderSuccess) {
            throw new Error('Failed to render game board');
        }
        
        // Load saved game state with validation
        this.loadGameStateSafely();
        
        // Mark as initialized
        this.isInitialized = true;
        
        // Start periodic board health checks
        this.startBoardHealthCheck();
    }

    // Validate that initialization completed successfully
    validateInitialization() {
        const checks = [
            () => this.gameBoard !== null,
            () => this.gameBoard.parentNode !== null,
            () => gameState.board && Array.isArray(gameState.board),
            () => gameState.board.length === 9,
            () => gameState.board.every(row => Array.isArray(row) && row.length === 9),
            () => this.isInitialized === true
        ];
        
        return checks.every(check => {
            try {
                return check();
            } catch (error) {
                console.error('Validation check failed:', error);
                return false;
            }
        });
    }

    // Reset state for retry attempt
    resetForRetry() {
        this.isInitialized = false;
        this.animationQueue = [];
        this.cascadeInProgress = false;
        
        // Remove any partially created game board
        if (this.gameBoard) {
            try {
                this.gameBoard.remove();
            } catch (error) {
                console.warn('Failed to remove game board during retry:', error);
            }
            this.gameBoard = null;
        }
    }

    // Handle initialization failure gracefully
    handleInitializationFailure(error) {
        console.error('🚨 Game Engine initialization failed permanently:', error);
        
        // Show user-friendly error message
        this.showCriticalError('Failed to initialize game. Please refresh the page and try again.');
        
        // Attempt to provide fallback functionality
        this.enableFallbackMode();
    }

    // Initialize game state with validation
    initializeGameState() {
        try {
            if (!gameState) {
                throw new Error('Game state not available');
            }
            
            // Reset with validation
            gameState.reset();
            
            // Validate reset state
            if (!this.validateGameState(gameState)) {
                throw new Error('Game state validation failed after reset');
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize game state:', error);
            return false;
        }
    }

    // Validate game state integrity
    validateGameState(state) {
        if (!state) return false;
        
        const requiredProperties = [
            'board', 'score', 'level', 'targetScore', 'moves', 
            'gameMode', 'isGameOver', 'gameStats'
        ];
        
        return requiredProperties.every(prop => {
            const hasProperty = state.hasOwnProperty(prop);
            if (!hasProperty) {
                console.error(`Missing required property: ${prop}`);
            }
            return hasProperty;
        });
    }

    // Create validated initial board
    createValidatedBoard() {
        try {
            if (!gemSystem || typeof gemSystem.createInitialBoard !== 'function') {
                throw new Error('Gem system not available or invalid');
            }
            
            const board = gemSystem.createInitialBoard();
            
            // Validate board structure
            if (!this.validateBoardStructure(board)) {
                throw new Error('Invalid board structure created');
            }
            
            // Validate no immediate matches exist
            if (this.hasImmediateMatches(board)) {
                console.warn('Board created with immediate matches, regenerating...');
                return this.createValidatedBoard(); // Recursive retry
            }
            
            return board;
        } catch (error) {
            console.error('Failed to create validated board:', error);
            return null;
        }
    }

    // Validate board structure
    validateBoardStructure(board) {
        if (!Array.isArray(board)) {
            console.error('Board is not an array');
            return false;
        }
        
        if (board.length !== 9) {
            console.error(`Invalid board height: ${board.length}, expected 9`);
            return false;
        }
        
        for (let row = 0; row < 9; row++) {
            if (!Array.isArray(board[row])) {
                console.error(`Row ${row} is not an array`);
                return false;
            }
            
            if (board[row].length !== 9) {
                console.error(`Row ${row} has invalid length: ${board[row].length}, expected 9`);
                return false;
            }
            
            for (let col = 0; col < 9; col++) {
                const gem = board[row][col];
                if (!this.validateGem(gem)) {
                    console.error(`Invalid gem at position ${row},${col}:`, gem);
                    return false;
                }
            }
        }
        
        return true;
    }

    // Validate individual gem
    validateGem(gem) {
        if (!gem || typeof gem !== 'object') {
            return false;
        }
        
        const requiredProperties = ['type', 'colors', 'id'];
        return requiredProperties.every(prop => gem.hasOwnProperty(prop));
    }

    // Check for immediate matches that would make game unplayable
    hasImmediateMatches(board) {
        try {
            if (!gemSystem || typeof gemSystem.findMatches !== 'function') {
                console.warn('Cannot check for immediate matches - gem system unavailable');
                return false;
            }
            
            const matches = gemSystem.findMatches(board);
            const hasMatches = matches && matches.length > 0;
            
            if (hasMatches) {
                console.log(`🔍 Found ${matches.length} immediate matches on board - rejecting`);
                matches.forEach((match, index) => {
                    if (match.gems) {
                        console.log(`  Match ${index + 1}: ${match.type} with ${match.gems.length} gems`);
                    }
                });
            }
            
            return hasMatches;
        } catch (error) {
            console.error('Error checking for immediate matches:', error);
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
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
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
        
        // Apply gem styling via class and background gradient
        element.style.background = `linear-gradient(135deg, ${gem.colors[0]}, ${gem.colors[1]})`;
        
        // Add power-up indicators
        if (gem.isPowerUp) {
            element.classList.add('power-up', `power-up-${gem.powerUpName.toLowerCase()}`);
            
            // Power-up specific styling and symbols
            if (gem.powerUpType === gemSystem.powerUpTypes.LIGHTNING) {
                element.innerHTML = `
                    <div class="power-up-icon">⚡</div>
                    <div class="gem-base">${gem.type}</div>
                `;
                element.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.2)';
                element.style.border = '2px solid #FFD700';
                element.classList.add('lightning-power-up');
                element.title = 'Lightning Power-Up: Clears entire row and column';
                
            } else if (gem.powerUpType === gemSystem.powerUpTypes.BOMB) {
                element.innerHTML = `
                    <div class="power-up-icon">💥</div>
                    <div class="gem-base">${gem.type}</div>
                `;
                element.style.boxShadow = '0 0 20px rgba(255, 69, 0, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.2)';
                element.style.border = '2px solid #FF4500';
                element.classList.add('bomb-power-up');
                element.title = 'Bomb Power-Up: Destroys 3x3 area';
                
            } else if (gem.powerUpType === gemSystem.powerUpTypes.RAINBOW) {
                element.innerHTML = `
                    <div class="power-up-icon">🌈</div>
                    <div class="gem-base">${gem.type}</div>
                `;
                element.style.boxShadow = '0 0 20px rgba(148, 0, 211, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.2)';
                element.style.border = '2px solid #9400D3';
                element.classList.add('rainbow-power-up');
                element.title = 'Rainbow Power-Up: Clears all gems of selected type';
            }
            
            // Add pulsing animation class
            element.classList.add('power-up-pulse');
            
        } else {
            // Regular gem
            element.textContent = gem.type;
        }
        
        // Add click handler
        element.addEventListener('click', (event) => this.handleGemClickSafely(event));
        
        // Add enhanced hover effects for power-ups
        if (gem.isPowerUp) {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'scale(1.15)';
                element.style.zIndex = '10';
                element.style.filter = 'brightness(1.3)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
                element.style.zIndex = '1';
                element.style.filter = 'brightness(1)';
            });
        }
        
        return element;
    }

    // Handle gem click events (legacy method - redirects to safer handler)
    handleGemClick(event) {
        console.log('🔄 Redirecting to safer gem click handler...');
        this.handleGemClickSafely(event);
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
        try {
            // Validate coordinates
            if (!this.validateCoordinates(row1, col1) || !this.validateCoordinates(row2, col2)) {
                console.error('Invalid swap coordinates');
                this.deselectGem();
                return false;
            }

            // Check if positions are adjacent
            if (!gemSystem.isAdjacent(row1, col1, row2, col2)) {
                console.log('❌ Gems are not adjacent');
                this.showInvalidMove();
                this.deselectGem();
                return false;
            }

            // Validate the swap would create matches
            if (!gemSystem.isValidSwap(gameState.board, row1, col1, row2, col2)) {
                console.log('❌ Swap would not create any matches');
                this.showInvalidMove();
                // Keep gem selected for user to try another move
                return false;
            }

            // Set animating state to prevent multiple clicks
            gameState.setAnimating(true);

            // Perform the swap
            console.log(`🔄 Performing swap: (${row1},${col1}) ↔ (${row2},${col2})`);
            this.swapGems(row1, col1, row2, col2);
            
            // Clear selection only after successful swap
            this.deselectGem();
            
            // Process cascade after swap
            await this.processMatchesWithCascade();
            
            return true;

        } catch (error) {
            console.error('❌ Error in attemptSwap:', error);
            this.deselectGem();
            return false;
        } finally {
            // Always reset animating state
            gameState.setAnimating(false);
        }
    }

    // Validate coordinates for 9x9 board
    validateCoordinates(row, col) {
        return Number.isInteger(row) && Number.isInteger(col) && 
               row >= 0 && row < 9 && 
               col >= 0 && col < 9;
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
        if (this.cascadeInProgress) {
            console.log('🔄 Cascade already in progress, skipping...');
            return;
        }

        this.cascadeInProgress = true;
        console.log('🌊 Starting cascade processing on 9x9 board...');

        try {
            // Debug: Check gameState structure
            console.log('🔍 Debugging gameState:', {
                gameStateExists: !!gameState,
                gameStateType: typeof gameState,
                hasAddScore: typeof gameState?.addScore,
                hasIncrementMoves: typeof gameState?.incrementMoves,
                gameStateKeys: gameState ? Object.getOwnPropertyNames(gameState) : [],
                gameStateProto: gameState ? Object.getPrototypeOf(gameState) : null
            });
            
            // Use the enhanced cascade system from gem system
            const cascadeResult = await gemSystem.processCascade(gameState.board);
            
            // Update game state with results
            if (typeof gameState.addScore === 'function') {
                gameState.addScore(cascadeResult.totalScore);
            } else {
                console.error('❌ gameState.addScore is not a function:', typeof gameState.addScore);
                // Fallback: direct score update
                if (gameState && typeof gameState.score === 'number') {
                    gameState.score += cascadeResult.totalScore;
                    console.log('✅ Used fallback score update');
                }
            }
            
            if (typeof gameState.incrementMoves === 'function') {
                gameState.incrementMoves();
            } else {
                console.error('❌ gameState.incrementMoves is not a function:', typeof gameState.incrementMoves);
                // Fallback: direct moves update
                if (gameState && typeof gameState.moves === 'number') {
                    gameState.moves++;
                    console.log('✅ Used fallback moves update');
                }
            }

            // Log cascade results
            console.log(`🎯 Cascade completed: ${cascadeResult.cascadeLevel} levels, ${cascadeResult.totalScore} points`);
            
            // Update all displays
            this.updateAllDisplays();
            
            // Re-render the updated board
            this.renderBoardSafely();
            
            // Ensure board still has possible moves
            if (!gemSystem.hasPossibleMoves(gameState.board)) {
                console.log('🔄 No possible moves detected after cascade, shuffling board...');
                gemSystem.shuffleBoard(gameState.board);
                this.renderBoardSafely();
            }
            
            // Check for level completion
            this.checkLevelCompletion();

        } catch (error) {
            console.error('❌ Error during cascade processing:', error);
        } finally {
            this.cascadeInProgress = false;
        }
    }

    // Create power-ups from large matches
    createPowerUpsFromMatches(matches) {
        const powerUpsToCreate = [];
        
        matches.forEach(match => {
            if (match.length >= 4) {
                // Find the center position of the match
                const centerIndex = Math.floor(match.length / 2);
                const centerPosition = match[centerIndex];
                const gemType = gameState.getGem(centerPosition.row, centerPosition.col)?.type;
                
                if (gemType) {
                    const powerUp = gemSystem.createPowerUpGem(
                        match.length,
                        gemType,
                        centerPosition
                    );
                    
                    powerUpsToCreate.push({
                        powerUp,
                        position: centerPosition,
                        matchSize: match.length
                    });
                    
                    console.log(`⚡ Creating ${powerUp.powerUpName} power-up from ${match.length}-match at (${centerPosition.row}, ${centerPosition.col})`);
                }
            }
        });
        
        return powerUpsToCreate;
    }

    // Place created power-ups in the board
    placePowerUps(powerUpsCreated) {
        powerUpsCreated.forEach(({ powerUp, position }) => {
            gameState.setGem(position.row, position.col, powerUp);
        });
    }

    // Animate matching gems with enhanced visual effects
    async animateMatches(matches, points, cascadeLevel = 0) {
        if (!matches || matches.length === 0) return;
        
        console.log(`🎬 Animating ${matches.length} matches (cascade level: ${cascadeLevel})`);
        
        // First phase: Highlight matched gems
        matches.forEach((match, matchIndex) => {
            if (match.gems && Array.isArray(match.gems)) {
                match.gems.forEach(({ row, col }, gemIndex) => {
                    const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (element) {
                        // Add highlight class and stagger the animation
                        setTimeout(() => {
                            element.classList.add('matched');
                            element.style.animation = cascadeLevel > 0 ? 
                                'cascadePop 0.6s ease-out' : 
                                'matchPulse 0.4s ease-in-out';
                        }, gemIndex * 50 + matchIndex * 100);
                    }
                });
            }
        });
        
        // Wait for highlight animation
        await helpers.sleep(400);
        
        // Second phase: Breaking animation
        matches.forEach((match, matchIndex) => {
            if (match.gems && Array.isArray(match.gems)) {
                match.gems.forEach(({ row, col }, gemIndex) => {
                    const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (element) {
                        setTimeout(() => {
                            element.style.animation = 'simpleMatch 0.8s ease-out forwards';
                            element.style.zIndex = '10';
                        }, gemIndex * 30 + matchIndex * 80);
                    }
                });
            }
        });
        
        // Show floating score with cascade bonus
        if (matches.length > 0) {
            const firstMatch = matches[0];
            if (firstMatch.gems && firstMatch.gems.length > 0) {
                const { row, col } = firstMatch.gems[0];
                this.showFloatingScore(points, row, col, cascadeLevel);
            }
        }
        
        // Wait for breaking animation to complete
        return helpers.sleep(800);
    }

    // Show floating score animation with cascade indication
    showFloatingScore(points, row, col, cascadeLevel = 0) {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) return;
        
        const scoreElement = document.createElement('div');
        
        // Add cascade indicator to score display
        let scoreText = `+${helpers.formatNumber(points)}`;
        if (cascadeLevel > 0) {
            scoreText += ` (x${cascadeLevel + 1})`;
        }
        
        scoreElement.textContent = scoreText;
        scoreElement.className = 'floating-score-element';
        
        // Add cascade-specific styling
        if (cascadeLevel > 0) {
            scoreElement.classList.add('cascade-score');
            scoreElement.style.color = '#FFD700';
            scoreElement.style.fontSize = '1.2em';
            scoreElement.style.fontWeight = 'bold';
            scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        }
        
        const rect = element.getBoundingClientRect();
        scoreElement.style.left = rect.left + window.scrollX + rect.width / 2 + 'px';
        scoreElement.style.top = rect.top + window.scrollY + 'px';
        scoreElement.style.pointerEvents = 'none';
        scoreElement.style.zIndex = '1000';
        
        document.body.appendChild(scoreElement);
        
        // Mark element as temporary for cleanup
        scoreElement.setAttribute('data-temporary', 'true');
        
        // Animate the score display
        requestAnimationFrame(() => {
            scoreElement.style.animation = cascadeLevel > 0 ? 
                'floatUp 1.2s ease-out forwards' : 
                'floatUp 1s ease-out forwards';
        });
        
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, cascadeLevel > 0 ? 1200 : 1000);
    }

    // Render board with error handling
    renderBoardSafely() {
        try {
            if (!this.gameBoard) {
                console.error('❌ Game board element not found during safe render!');
                return false;
            }

            // Validate game state before rendering
            if (!gameState.board || !this.validateBoardStructure(gameState.board)) {
                console.error('❌ Invalid board state during render');
                return false;
            }

            console.log('🎨 Rendering game board safely...');
            
            // Clear existing board completely with error handling
            try {
                // Remove all event listeners and child elements
                const existingGems = this.gameBoard.querySelectorAll('.gem');
                existingGems.forEach(gem => {
                    gem.removeEventListener('click', this.handleGemClickSafely);
                    gem.remove();
                });
                this.gameBoard.innerHTML = '';
            } catch (error) {
                console.error('Failed to clear game board:', error);
                return false;
            }
            
            // Apply board layout class
            this.gameBoard.classList.add('game-board-layout');
            
            // Render each gem with validation
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const gem = gameState.getGem(row, col);
                    if (gem && this.validateGem(gem)) {
                        try {
                            const gemElement = this.createGemElementSafely(gem, row, col);
                            if (gemElement) {
                                this.gameBoard.appendChild(gemElement);
                            }
                        } catch (error) {
                            console.error(`Failed to create gem at ${row},${col}:`, error);
                            // Continue rendering other gems
                        }
                    }
                }
            }
            
            // Validate the rendered board matches the game state
            const renderedGems = this.gameBoard.querySelectorAll('.gem');
            const expectedGemCount = gameState.board.flat().filter(cell => !!cell).length;
            
            if (renderedGems.length !== expectedGemCount) {
                console.warn(`⚠️ Gem count mismatch: rendered ${renderedGems.length}, expected ${expectedGemCount}`);
            } else {
                console.log(`✅ Board sync verified: ${renderedGems.length} gems rendered correctly`);
            }
            
            console.log('✅ Game board rendered safely');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to render game board safely:', error);
            return false;
        }
    }

    // Load game state with comprehensive validation
    loadGameStateSafely() {
        try {
            const savedState = storageManager.loadGameState();
            if (!savedState) {
                console.log('No saved game state found');
                return;
            }

            // Validate saved state structure
            if (!this.validateSavedState(savedState)) {
                console.warn('Saved state validation failed, starting fresh');
                return;
            }

            // Import with validation
            gameState.import(savedState);
            
            // Re-validate after import
            if (!this.validateGameState(gameState)) {
                console.warn('Game state corrupted after import, resetting');
                gameState.reset();
                return;
            }

            // Re-render board
            this.renderBoardSafely();
            this.updateAllDisplays();
            console.log('💾 Game state loaded safely');
            
        } catch (error) {
            console.error('Failed to load saved state:', error);
            console.log('Starting with fresh game state');
        }
    }

    // Validate saved state before importing
    validateSavedState(savedState) {
        if (!savedState || typeof savedState !== 'object') {
            return false;
        }

        // Check for required properties
        const requiredProps = ['board', 'score', 'level', 'gameMode'];
        if (!requiredProps.every(prop => savedState.hasOwnProperty(prop))) {
            return false;
        }

        // Validate board structure if present
        if (savedState.board && !this.validateBoardStructure(savedState.board)) {
            return false;
        }

        // Validate data types
        if (typeof savedState.score !== 'number' || savedState.score < 0) {
            return false;
        }

        if (typeof savedState.level !== 'number' || savedState.level < 1) {
            return false;
        }

        return true;
    }

    // Create gem element with error handling
    createGemElementSafely(gem, row, col) {
        try {
            const element = document.createElement('div');
            element.className = 'gem';
            element.dataset.row = row;
            element.dataset.col = col;
            element.dataset.type = gem.type;
            element.id = gem.id;
            
            // Validate gem colors
            if (!gem.colors || !Array.isArray(gem.colors) || gem.colors.length < 2) {
                console.warn(`Invalid colors for gem at ${row},${col}, using defaults`);
                element.style.background = '#gray';
            } else {
                element.style.background = `linear-gradient(135deg, ${gem.colors[0]}, ${gem.colors[1]})`;
            }
            
            // Add power-up indicators with validation
            if (gem.isPowerUp && gem.powerUpType) {
                element.classList.add('power-up', `power-up-${gem.powerUpName?.toLowerCase() || 'unknown'}`);
                this.addPowerUpStyling(element, gem);
            } else {
                // Regular gem
                element.textContent = gem.type;
            }
            
            // Add click handler with error boundary
            element.addEventListener('click', (event) => {
                try {
                    this.handleGemClickSafely(event);
                } catch (error) {
                    console.error('Error in gem click handler:', error);
                }
            });
            
            return element;
            
        } catch (error) {
            console.error(`Failed to create gem element for ${row},${col}:`, error);
            return null;
        }
    }

    // Add power-up styling with validation
    addPowerUpStyling(element, gem) {
        try {
            const powerUpConfig = {
                [gemSystem.powerUpTypes.LIGHTNING]: {
                    icon: '⚡',
                    color: '#FFD700',
                    title: 'Lightning Power-Up: Clears entire row and column'
                },
                [gemSystem.powerUpTypes.BOMB]: {
                    icon: '💥',
                    color: '#FF4500',
                    title: 'Bomb Power-Up: Destroys 3x3 area'
                },
                [gemSystem.powerUpTypes.RAINBOW]: {
                    icon: '🌈',
                    color: '#9400D3',
                    title: 'Rainbow Power-Up: Clears all gems of selected type'
                }
            };

            const config = powerUpConfig[gem.powerUpType];
            if (config) {
                element.innerHTML = `
                    <div class="power-up-icon">${config.icon}</div>
                    <div class="gem-base">${gem.type}</div>
                `;
                element.style.boxShadow = `0 0 20px ${config.color}99, inset 0 0 20px rgba(255, 255, 255, 0.2)`;
                element.style.border = `2px solid ${config.color}`;
                element.title = config.title;
                element.classList.add('power-up-pulse');
            }
        } catch (error) {
            console.error('Failed to add power-up styling:', error);
        }
    }

    // Handle gem click with comprehensive error checking
    handleGemClickSafely(event) {
        try {
            // Check if game engine is properly initialized
            if (!gameState || !gameState.board) {
                console.warn('⚠️ Game not properly initialized, ignoring gem click');
                return;
            }

            if (gameState.isAnimating) {
                console.log('⏸️ Animation in progress, ignoring gem click');
                return; // Ignore clicks during animations
            }

            if (this.cascadeInProgress) {
                console.log('🌊 Cascade in progress, ignoring gem click');
                return; // Ignore clicks during cascade
            }
            
            const element = event.target.closest('.gem');
            if (!element) {
                console.warn('Click target is not a gem element');
                return;
            }

            const row = parseInt(element.dataset.row, 10);
            const col = parseInt(element.dataset.col, 10);

            // Validate coordinates
            if (isNaN(row) || isNaN(col) || row < 0 || row >= 9 || col < 0 || col >= 9) {
                console.error(`Invalid gem coordinates: ${row}, ${col}`);
                return;
            }

            // Validate board state first
            if (!gameState.board || !gameState.board[row] || gameState.board[row][col] === undefined) {
                console.error(`Invalid board state at position: ${row}, ${col}`);
                console.error(`Board state:`, {
                    boardExists: !!gameState.board,
                    boardSize: gameState.board ? `${gameState.board.length}x${gameState.board[0]?.length}` : 'none',
                    elementCoords: { row, col },
                    boardRow: gameState.board?.[row],
                    actualGem: gameState.board?.[row]?.[col]
                });
                // Try to re-render the board to fix synchronization
                console.log('🔄 Attempting to re-render board to fix synchronization...');
                this.renderBoardSafely();
                return;
            }

            const gem = gameState.getGem(row, col);
            if (!gem) {
                console.error(`No gem found at position: ${row}, ${col} despite board validation`);
                console.error(`Detailed debugging:`, {
                    row, col,
                    boardCell: gameState.board[row][col],
                    elementId: element.id,
                    elementDataset: element.dataset,
                    elementPosition: element.getBoundingClientRect(),
                    allBoardPositions: gameState.board.map((row, r) => 
                        row.map((cell, c) => ({ r, c, hasGem: !!cell, gemType: cell?.type }))
                    ).flat().filter(pos => pos.hasGem)
                });
                
                // Try to fix the synchronization issue
                console.log('🔄 Attempting to fix board synchronization...');
                this.fixBoardSynchronization();
                return;
            }
            
            console.log(`🔍 Gem clicked at position: ${row}, ${col}`);
            
            // Check if this is a power-up gem
            if (gem.isPowerUp && gem.powerUpType) {
                this.activatePowerUp(row, col, gem.powerUpType);
            } else {
                // Handle regular gem selection
                this.handleRegularGemClick(element, row, col);
            }
            
        } catch (error) {
            console.error('Error in gem click handler:', error);
        }
    }

    // Handle regular gem click (non-power-up)
    handleRegularGemClick(element, row, col) {
        if (gameState.selectedGem) {
            const selected = gameState.selectedGem;
            
            // Check if clicking on the same gem - deselect it
            if (selected.row === row && selected.col === col) {
                console.log('🔄 Clicking same gem, deselecting...');
                this.deselectGem();
                return;
            }
            
            // Check if gems are adjacent for a valid swap
            if (gemSystem.isAdjacent(selected.row, selected.col, row, col)) {
                // Attempt the swap
                console.log(`🔄 Attempting swap between (${selected.row},${selected.col}) and (${row},${col})`);
                this.attemptSwap(selected.row, selected.col, row, col);
            } else {
                // Gems are not adjacent - deselect current and select new gem
                console.log('❌ Gems not adjacent, switching selection...');
                this.deselectGem();
                this.selectGem(element, row, col);
            }
        } else {
            // No gem selected, select this gem
            console.log(`✅ Selecting gem at (${row},${col})`);
            this.selectGem(element, row, col);
        }
    }

    // Show critical error message
    showCriticalError(message) {
        try {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'critical-error-message';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <h3>🚨 Critical Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">Refresh Page</button>
                </div>
            `;
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                text-align: center;
            `;
            document.body.appendChild(errorDiv);
        } catch (error) {
            // Fallback to alert if DOM manipulation fails
            alert(message);
        }
    }

    // Enable fallback mode with limited functionality
    enableFallbackMode() {
        console.log('🔧 Enabling fallback mode...');
        try {
            // Create a simple fallback interface
            const fallbackDiv = document.createElement('div');
            fallbackDiv.innerHTML = `
                <div style="text-align: center; margin: 50px;">
                    <h2>⚠️ Fallback Mode</h2>
                    <p>Game running with limited functionality</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
            document.body.appendChild(fallbackDiv);
        } catch (error) {
            console.error('Failed to enable fallback mode:', error);
        }
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
        if (!gameState.board) {
            console.error('No game board available for finding moves');
            return [];
        }
        
        return gemSystem.findPossibleMoves(gameState.board);
    }

    // Show hint
    showHint() {
        const possibleMoves = this.findPossibleMoves();
        
        if (possibleMoves.length === 0) {
            console.log('🔄 No possible moves found, shuffling board...');
            gemSystem.shuffleBoard(gameState.board);
            this.renderBoardSafely();
            return;
        }

        // Show first available move as hint
        const hint = possibleMoves[0];
        console.log(`💡 Hint: Swap gems at (${hint.from.row},${hint.from.col}) and (${hint.to.row},${hint.to.col})`);
        
        // Highlight the hinted gems
        const fromElement = document.querySelector(`[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
        const toElement = document.querySelector(`[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
        
        if (fromElement && toElement) {
            fromElement.classList.add('hint-glow');
            toElement.classList.add('hint-glow');
            
            // Remove hint after 3 seconds
            setTimeout(() => {
                fromElement.classList.remove('hint-glow');
                toElement.classList.remove('hint-glow');
            }, 3000);
        }
    }

    // Undo last move
    undoLastMove() {
        if (gameState.restoreState()) {
            this.renderBoardSafely();
            this.updateAllDisplays();
            console.log('↩️ Move undone');
        }
    }

    // Restart game
    restart() {
        console.log('🔄 Restarting game with new 9x9 board...');
        
        try {
            // Reset game state
            gameState.reset();
            
            // Validate gem system is available
            if (!gemSystem || typeof gemSystem.createInitialBoard !== 'function') {
                console.error('❌ Gem system not available for restart');
                return;
            }
            
            // Create new board with validation
            const newBoard = gemSystem.createInitialBoard();
            if (!this.validateBoardStructure(newBoard)) {
                console.error('❌ Failed to create valid board during restart');
                return;
            }
            
            gameState.setBoard(newBoard);
            
            // Verify board was set correctly
            if (!gameState.board || gameState.board.length !== 9) {
                console.error('❌ Board not set correctly after restart');
                return;
            }
            
            // Clear any ongoing animations
            this.animationQueue = [];
            this.cascadeInProgress = false;
            
            // Clear selections
            this.deselectGem();
            
            // Re-render board
            const renderSuccess = this.renderBoardSafely();
            if (!renderSuccess) {
                console.error('❌ Failed to render board after restart');
                return;
            }
            
            // Update displays
            this.updateAllDisplays();
            
            console.log('✅ Game restarted successfully');
            
        } catch (error) {
            console.error('❌ Error during restart:', error);
        }
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
            this.renderBoardSafely();
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

    // Activate power-up with visual effects
    async activatePowerUp(row, col, powerUpType) {
        gameState.setAnimating(true);
        
        try {
            console.log(`⚡ Activating ${powerUpType} power-up at (${row}, ${col})`);
            
            // Get the power-up element for initial animation
            const powerUpElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (powerUpElement) {
                powerUpElement.classList.add('power-up-activating');
                powerUpElement.style.animation = 'powerUpActivation 0.8s ease-out';
            }
            
            // Activate the power-up
            const result = gemSystem.activatePowerUp(gameState.board, row, col, powerUpType);
            const { affectedPositions, powerUpInfo } = result;
            
            // Update score
            gameState.updateScore(powerUpInfo.score);
            
            // Apply gravity and fill spaces
            gemSystem.applyGravity(gameState.board);
            gemSystem.fillEmptySpaces(gameState.board);
            
            // Re-render board
            this.renderBoardSafely();
            
            // Check for additional matches after power-up
            await this.processMatchesWithCascade();
            
            // Update displays
            this.updateAllDisplays();
            
            // Check level completion
            this.checkLevelCompletion();
            
        } catch (error) {
            console.error('❌ Error activating power-up:', error);
        } finally {
            gameState.setAnimating(false);
        }
    }

    // Start periodic board health checks
    startBoardHealthCheck() {
        // Run a health check every 10 seconds
        this.healthCheckInterval = setInterval(() => {
            if (this.isInitialized && gameState.board) {
                this.performBoardHealthCheck();
            }
        }, 10000);
    }

    // Perform board health check
    performBoardHealthCheck() {
        try {
            const domGems = document.querySelectorAll('.gem');
            const boardGems = gameState.board.flat().filter(cell => !!cell);
            
            if (domGems.length !== boardGems.length) {
                console.warn(`⚠️ Board health check: DOM has ${domGems.length} gems, board has ${boardGems.length}`);
                this.fixBoardSynchronization();
            }
        } catch (error) {
            console.error('❌ Error during board health check:', error);
        }
    }

    // Fix board synchronization issues
    fixBoardSynchronization() {
        try {
            console.log('🔧 Fixing board synchronization...');
            
            // Check if board has valid gems
            const hasValidGems = gameState.board.some(row => 
                row.some(cell => cell && cell.type)
            );
            
            if (!hasValidGems) {
                console.log('🎯 Board appears empty, regenerating...');
                const newBoard = gemSystem.createInitialBoard();
                gameState.setBoard(newBoard);
                this.renderBoardSafely();
                return;
            }
            
            // Check for and remove any immediate matches without processing them
            const immediateMatches = gemSystem.findMatches(gameState.board);
            if (immediateMatches.length > 0) {
                console.log(`🔧 Removing ${immediateMatches.length} immediate matches during synchronization fix...`);
                gemSystem.removeMatches(gameState.board, immediateMatches);
                gemSystem.applyGravity(gameState.board);
                gemSystem.fillEmptySpaces(gameState.board);
                
                // Ensure board is still playable after cleanup
                if (!gemSystem.hasPossibleMoves(gameState.board)) {
                    console.log('🔄 Board became unplayable after cleanup, shuffling...');
                    gemSystem.shuffleBoard(gameState.board);
                }
            }
            
            // Check DOM vs board mismatch
            const domGems = document.querySelectorAll('.gem');
            const boardGemCount = gameState.board.flat().filter(cell => !!cell).length;
            
            console.log(`DOM gems: ${domGems.length}, Board gems: ${boardGemCount}`);
            
            if (domGems.length !== boardGemCount) {
                console.log('🔄 DOM and board count mismatch, re-rendering...');
                this.renderBoardSafely();
                return;
            }
            
            // Check for position mismatches
            let mismatchFound = false;
            domGems.forEach(element => {
                const row = parseInt(element.dataset.row, 10);
                const col = parseInt(element.dataset.col, 10);
                const boardGem = gameState.board[row]?.[col];
                
                if (!boardGem) {
                    console.log(`Mismatch found: DOM element at (${row},${col}) but no board gem`);
                    mismatchFound = true;
                }
            });
            
            if (mismatchFound) {
                console.log('🔄 Position mismatches found, re-rendering...');
                this.renderBoardSafely();
            } else {
                console.log('✅ Board synchronization check passed');
            }
            
        } catch (error) {
            console.error('❌ Error fixing board synchronization:', error);
            // Fallback: restart the game
            this.restart();
        }
    }

    // Cleanup method
    cleanup() {
        console.log('🧹 Cleaning up Game Engine...');

        // Clear animations
        this.animationQueue = [];
        this.cascadeInProgress = false;

        // Clear health check interval
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }

        // Clear selections
        this.deselectGem();

        // Clear any hint indicators
        const hintElements = document.querySelectorAll('.hint-glow');
        hintElements.forEach(el => el.classList.remove('hint-glow'));

        // Clear animations on game board
        if (this.gameBoard) {
            this.gameBoard.style.animation = '';
            this.gameBoard.innerHTML = '';
        }

        // Clear power-up activations
        const powerUpElements = document.querySelectorAll('.power-up-activating');
        powerUpElements.forEach(el => {
            el.classList.remove('power-up-activating');
            el.style.animation = '';
        });

        // Remove any power-up classes
        const powerUpClasses = document.querySelectorAll('.power-up-pulse');
        powerUpClasses.forEach(el => el.classList.remove('power-up-pulse'));

        // Save state before cleanup
        this.saveGameState();

        // Reset state
        this.isInitialized = false;

        console.log('✅ Game Engine cleaned up');
    }
}

// Global game engine instance
export const gameEngine = new GameEngine();