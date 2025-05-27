// Gem System Module
// Handles gem creation, matching logic, power-ups, and game physics

export class GemSystem {
    constructor() {
        this.gemTypes = ['🔥', '💧', '🌍', '💨', '⚡', '🌿', '🔮'];
        this.gemColors = {
            '🔥': ['#FF4500', '#DC143C'],
            '💧': ['#1E90FF', '#4169E1'],
            '🌍': ['#8B4513', '#A0522D'],
            '💨': ['#87CEEB', '#B0E0E6'],
            '⚡': ['#FFD700', '#FFA500'],
            '🌿': ['#32CD32', '#228B22'],
            '🔮': ['#9932CC', '#8A2BE2']
        };
        this.powerUpTypes = {
            BOMB: '💥',
            LIGHTNING: '🌟',
            RAINBOW: '🌈'
        };
        this.BOARD_SIZE = 9;
        this.MIN_MATCH_SIZE = 3;
        this.MAX_RETRIES = 100; // Prevent infinite loops
        this.MIN_POSSIBLE_MOVES = 3; // Minimum moves to keep game playable
        this.SHUFFLE_ATTEMPTS = 10; // Maximum shuffle attempts before regeneration
    }

    // Input validation helper
    validateCoordinates(row, col) {
        return Number.isInteger(row) && Number.isInteger(col) && 
               row >= 0 && row < this.BOARD_SIZE && 
               col >= 0 && col < this.BOARD_SIZE;
    }

    // Validate board structure
    validateBoard(board) {
        if (!Array.isArray(board)) {
            console.error('Board is not an array');
            return false;
        }
        
        if (board.length !== this.BOARD_SIZE) {
            console.error(`Invalid board height: ${board.length}, expected ${this.BOARD_SIZE}`);
            return false;
        }
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            if (!Array.isArray(board[row])) {
                console.error(`Row ${row} is not an array`);
                return false;
            }
            
            if (board[row].length !== this.BOARD_SIZE) {
                console.error(`Row ${row} has invalid length: ${board[row].length}, expected ${this.BOARD_SIZE}`);
                return false;
            }
            
            // Check that all positions have valid gems
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const gem = board[row][col];
                if (gem !== null && !this.validateGem(gem)) {
                    console.error(`Invalid gem at position ${row},${col}:`, gem);
                    return false;
                }
            }
        }
        
        return true;
    }

    // Validate gem object
    validateGem(gem) {
        if (!gem || typeof gem !== 'object') {
            return false;
        }
        
        const requiredProps = ['type', 'colors', 'id'];
        if (!requiredProps.every(prop => gem.hasOwnProperty(prop))) {
            return false;
        }
        
        // Validate gem type
        if (!this.gemTypes.includes(gem.type)) {
            console.warn(`Invalid gem type: ${gem.type}`);
            return false;
        }
        
        // Validate colors
        if (!Array.isArray(gem.colors) || gem.colors.length < 2) {
            console.warn(`Invalid gem colors:`, gem.colors);
            return false;
        }
        
        return true;
    }

    // Create a random divine gem with validation
    createRandomGem() {
        try {
            const type = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
            const gem = {
                type: type,
                colors: this.gemColors[type] || ['#808080', '#A0A0A0'], // Fallback colors
                isPowerUp: false,
                powerUpType: null,
                id: this.generateGemId()
            };
            
            if (!this.validateGem(gem)) {
                console.error('Created invalid gem:', gem);
                throw new Error('Failed to create valid gem');
            }
            
            return gem;
        } catch (error) {
            console.error('Error creating random gem:', error);
            // Return a safe fallback gem
            return {
                type: '🔮',
                colors: ['#9932CC', '#8A2BE2'],
                isPowerUp: false,
                powerUpType: null,
                id: this.generateGemId()
            };
        }
    }

    // Create a power-up gem based on match size with validation
    createPowerUpGem(matchSize, type, position) {
        try {
            // Validate inputs
            if (!Number.isInteger(matchSize) || matchSize < 4) {
                throw new Error(`Invalid match size for power-up: ${matchSize}`);
            }
            
            if (!this.gemTypes.includes(type)) {
                throw new Error(`Invalid gem type for power-up: ${type}`);
            }
            
            if (position && !this.validateCoordinates(position.row, position.col)) {
                throw new Error(`Invalid position for power-up: ${position}`);
            }
            
            let powerUpType = null;
            let powerUpName = '';
            
            // Power-up creation based on match size with bounds checking
            if (matchSize >= 6) {
                powerUpType = this.powerUpTypes.BOMB;
                powerUpName = 'BOMB';
            } else if (matchSize === 5) {
                powerUpType = this.powerUpTypes.RAINBOW;
                powerUpName = 'RAINBOW';
            } else if (matchSize === 4) {
                powerUpType = this.powerUpTypes.LIGHTNING;
                powerUpName = 'LIGHTNING';
            } else {
                throw new Error(`Match size ${matchSize} does not create power-up`);
            }

            const gem = {
                type: type,
                colors: this.gemColors[type] || ['#808080', '#A0A0A0'],
                isPowerUp: true,
                powerUpType: powerUpType,
                powerUpName: powerUpName,
                position: position,
                id: this.generateGemId(),
                createdAt: Date.now(),
                matchSize: matchSize
            };
            
            if (!this.validateGem(gem)) {
                throw new Error('Created invalid power-up gem');
            }
            
            return gem;
            
        } catch (error) {
            console.error('Error creating power-up gem:', error);
            // Return regular gem as fallback
            return this.createRandomGem();
        }
    }

    // Generate unique gem ID with collision detection
    generateGemId() {
        const maxAttempts = 1000;
        let attempts = 0;
        let id;
        
        do {
            id = `gem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            attempts++;
            
            if (attempts >= maxAttempts) {
                console.warn('Gem ID generation took many attempts, using timestamp fallback');
                return `gem_${Date.now()}_${attempts}`;
            }
        } while (document.getElementById(id)); // Check for DOM collision
        
        return id;
    }

    // Check if placing a gem would create an immediate match with bounds checking
    wouldCreateMatch(board, row, col, gemType) {
        try {
            // Validate inputs
            if (!this.validateBoard(board)) {
                throw new Error('Invalid board provided to wouldCreateMatch');
            }
            
            if (!this.validateCoordinates(row, col)) {
                throw new Error(`Invalid coordinates: ${row}, ${col}`);
            }
            
            if (!this.gemTypes.includes(gemType)) {
                throw new Error(`Invalid gem type: ${gemType}`);
            }
            
            // Store original gem
            const originalGem = board[row][col];
            
            // Temporarily place the gem
            board[row][col] = { type: gemType };
            
            // Check horizontal matches (left and right)
            let horizontalCount = 1;
            
            // Count left
            for (let c = col - 1; c >= 0 && board[row][c] && board[row][c].type === gemType; c--) {
                horizontalCount++;
            }
            
            // Count right
            for (let c = col + 1; c < this.BOARD_SIZE && board[row][c] && board[row][c].type === gemType; c++) {
                horizontalCount++;
            }
            
            // Check vertical matches (up and down)
            let verticalCount = 1;
            
            // Count up
            for (let r = row - 1; r >= 0 && board[r][col] && board[r][col].type === gemType; r--) {
                verticalCount++;
            }
            
            // Count down
            for (let r = row + 1; r < this.BOARD_SIZE && board[r][col] && board[r][col].type === gemType; r++) {
                verticalCount++;
            }
            
            // Restore original gem
            board[row][col] = originalGem;
            
            // Return true if either direction has 3+ in a row
            return horizontalCount >= this.MIN_MATCH_SIZE || verticalCount >= this.MIN_MATCH_SIZE;
            
        } catch (error) {
            console.error('Error in wouldCreateMatch:', error);
            return false;
        }
    }

    // Enhanced comprehensive match finding for 9x9 board
    findMatches(board) {
        if (!this.validateBoard(board)) {
            console.error('Invalid board provided to findMatches');
            return [];
        }

        const matches = [];
        const visited = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(false));

        // Find horizontal matches
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            let currentMatch = [];
            let currentType = null;

            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const gem = board[row][col];
                
                if (gem && gem.type === currentType && !gem.isPowerUp) {
                    currentMatch.push({ row, col, gem });
                } else {
                    // Process completed match
                    if (currentMatch.length >= this.MIN_MATCH_SIZE) {
                        matches.push({
                            type: 'horizontal',
                            gems: [...currentMatch],
                            points: this.calculateMatchPoints(currentMatch.length)
                        });
                        
                        // Mark positions as matched
                        currentMatch.forEach(pos => {
                            visited[pos.row][pos.col] = true;
                        });
                    }
                    
                    // Start new potential match
                    currentMatch = gem && !gem.isPowerUp ? [{ row, col, gem }] : [];
                    currentType = gem && !gem.isPowerUp ? gem.type : null;
                }
            }
            
            // Check final match in row
            if (currentMatch.length >= this.MIN_MATCH_SIZE) {
                matches.push({
                    type: 'horizontal',
                    gems: [...currentMatch],
                    points: this.calculateMatchPoints(currentMatch.length)
                });
                
                currentMatch.forEach(pos => {
                    visited[pos.row][pos.col] = true;
                });
            }
        }

        // Find vertical matches
        for (let col = 0; col < this.BOARD_SIZE; col++) {
            let currentMatch = [];
            let currentType = null;

            for (let row = 0; row < this.BOARD_SIZE; row++) {
                const gem = board[row][col];
                
                if (gem && gem.type === currentType && !gem.isPowerUp && !visited[row][col]) {
                    currentMatch.push({ row, col, gem });
                } else {
                    // Process completed match
                    if (currentMatch.length >= this.MIN_MATCH_SIZE) {
                        matches.push({
                            type: 'vertical',
                            gems: [...currentMatch],
                            points: this.calculateMatchPoints(currentMatch.length)
                        });
                    }
                    
                    // Start new potential match (only if not already matched)
                    if (gem && !gem.isPowerUp && !visited[row][col]) {
                        currentMatch = [{ row, col, gem }];
                        currentType = gem.type;
                    } else {
                        currentMatch = [];
                        currentType = null;
                    }
                }
            }
            
            // Check final match in column
            if (currentMatch.length >= this.MIN_MATCH_SIZE) {
                matches.push({
                    type: 'vertical',
                    gems: [...currentMatch],
                    points: this.calculateMatchPoints(currentMatch.length)
                });
            }
        }

        console.log(`🔍 Found ${matches.length} matches on 9x9 board`);
        return matches;
    }

    // Calculate points for a match based on size
    calculateMatchPoints(matchSize) {
        const basePoints = 50;
        return basePoints * matchSize * (matchSize - 2); // Exponential scaling
    }

    // Enhanced score calculation with cascade multipliers
    calculateScore(matches, cascadeLevel = 0) {
        if (!Array.isArray(matches)) {
            console.error('Invalid matches array provided to calculateScore');
            return 0;
        }

        let totalScore = 0;
        const cascadeMultiplier = Math.max(1, cascadeLevel);
        const cascadeBonus = cascadeLevel * 0.5; // 50% bonus per cascade level

        matches.forEach(match => {
            if (match.gems && Array.isArray(match.gems)) {
                const matchSize = match.gems.length;
                let baseScore = match.points || this.calculateMatchPoints(matchSize);
                
                // Apply cascade multiplier
                baseScore *= (1 + cascadeBonus);
                
                // Bonus for larger matches
                if (matchSize >= 5) {
                    baseScore *= 2; // Double points for 5+ matches
                }
                if (matchSize >= 7) {
                    baseScore *= 1.5; // Additional 50% for 7+ matches
                }
                
                totalScore += Math.floor(baseScore * cascadeMultiplier);
            }
        });

        return totalScore;
    }

    // Enhanced gravity system for 9x9 board
    applyGravity(board) {
        if (!this.validateBoard(board)) {
            console.error('Invalid board provided to applyGravity');
            return false;
        }

        let gemsMovedCount = 0;
        let anyGemMoved = false;

        // Apply gravity column by column
        for (let col = 0; col < this.BOARD_SIZE; col++) {
            const column = [];
            
            // Collect all non-null gems from this column (bottom to top)
            for (let row = this.BOARD_SIZE - 1; row >= 0; row--) {
                if (board[row][col] !== null) {
                    column.push(board[row][col]);
                }
            }
            
            // Clear the column
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                board[row][col] = null;
            }
            
            // Place gems at the bottom, maintaining order
            for (let i = 0; i < column.length; i++) {
                const targetRow = this.BOARD_SIZE - 1 - i;
                board[targetRow][col] = column[i];
                
                // Check if gem moved from its original position
                const originalRow = this.BOARD_SIZE - 1 - (column.length - 1 - i);
                if (targetRow !== originalRow) {
                    anyGemMoved = true;
                    gemsMovedCount++;
                }
            }
        }

        if (anyGemMoved) {
            console.log(`🌍 Gravity applied: ${gemsMovedCount} gems moved`);
        }

        return anyGemMoved;
    }

    // Enhanced board filling system
    fillEmptySpaces(board) {
        if (!this.validateBoard(board)) {
            console.error('Invalid board provided to fillEmptySpaces');
            return false;
        }

        let newGemsCount = 0;
        let attempts = 0;
        const maxAttempts = this.BOARD_SIZE * this.BOARD_SIZE * 3; // Prevent infinite loops

        // Fill from top to bottom to simulate gems falling from above
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (board[row][col] === null) {
                    let newGem;
                    let gemAttempts = 0;
                    
                    // Try to create a gem that doesn't immediately match
                    do {
                        newGem = this.createRandomGem();
                        gemAttempts++;
                        attempts++;
                        
                        if (attempts >= maxAttempts) {
                            console.warn('Max attempts reached in fillEmptySpaces, using fallback');
                            break;
                        }
                    } while (gemAttempts < 10 && this.wouldCreateMatch(board, row, col, newGem.type));
                    
                    board[row][col] = newGem;
                    newGemsCount++;
                }
            }
        }

        if (newGemsCount > 0) {
            console.log(`✨ Filled ${newGemsCount} empty spaces on 9x9 board`);
        }

        return newGemsCount > 0;
    }

    // Remove matched gems from board
    removeMatches(board, matches) {
        if (!this.validateBoard(board) || !Array.isArray(matches)) {
            console.error('Invalid board or matches provided to removeMatches');
            return 0;
        }

        let removedCount = 0;
        const removedPositions = [];

        matches.forEach((match, matchIndex) => {
            if (match.gems && Array.isArray(match.gems)) {
                console.log(`🔍 Processing match ${matchIndex + 1}: ${match.type} with ${match.gems.length} gems`);
                
                match.gems.forEach(gemPos => {
                    if (this.validateCoordinates(gemPos.row, gemPos.col)) {
                        const currentGem = board[gemPos.row][gemPos.col];
                        if (currentGem !== null) {
                            console.log(`💥 Removing gem ${currentGem.type} at (${gemPos.row}, ${gemPos.col})`);
                            board[gemPos.row][gemPos.col] = null;
                            removedCount++;
                            removedPositions.push({ row: gemPos.row, col: gemPos.col, type: currentGem.type });
                        } else {
                            console.warn(`⚠️ Attempted to remove already null gem at (${gemPos.row}, ${gemPos.col})`);
                        }
                    } else {
                        console.error(`❌ Invalid coordinates for gem removal: (${gemPos.row}, ${gemPos.col})`);
                    }
                });
            }
        });

        console.log(`🗑️ Successfully removed ${removedCount} matched gems from positions:`, removedPositions);
        return removedCount;
    }

    // Find all possible moves on the current board
    findPossibleMoves(board) {
        if (!this.validateBoard(board)) {
            console.error('Invalid board provided to findPossibleMoves');
            return [];
        }

        const possibleMoves = [];

        // Check every position and its adjacent positions
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const gem = board[row][col];
                if (!gem) continue;

                // Check adjacent positions (right and down to avoid duplicates)
                const adjacents = [
                    { row: row, col: col + 1 }, // Right
                    { row: row + 1, col: col }  // Down
                ];

                adjacents.forEach(adj => {
                    if (this.validateCoordinates(adj.row, adj.col)) {
                        const adjGem = board[adj.row][adj.col];
                        if (adjGem && this.isValidSwap(board, row, col, adj.row, adj.col)) {
                            possibleMoves.push({
                                from: { row, col },
                                to: { row: adj.row, col: adj.col },
                                gems: [gem, adjGem]
                            });
                        }
                    }
                });
            }
        }

        console.log(`🎯 Found ${possibleMoves.length} possible moves on 9x9 board`);
        return possibleMoves;
    }

    // Check if two positions are adjacent
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    // Validate a swap is legal
    isValidSwap(board, row1, col1, row2, col2) {
        // Check if positions are adjacent
        if (!this.isAdjacent(row1, col1, row2, col2)) {
            return false;
        }
        
        // Check if both positions have gems
        const gem1 = board[row1][col1];
        const gem2 = board[row2][col2];
        
        if (!gem1 || !gem2) {
            return false;
        }
        
        // Simulate the swap
        board[row1][col1] = gem2;
        board[row2][col2] = gem1;
        
        // Check if this creates any matches
        const matches = this.findMatches(board);
        const isValid = matches.length > 0;
        
        // Restore original positions
        board[row1][col1] = gem1;
        board[row2][col2] = gem2;
        
        return isValid;
    }

    // Process power-up activation with enhanced 9x9 support
    activatePowerUp(board, row, col, powerUpType) {
        const affectedPositions = [];
        const powerUpInfo = {
            type: powerUpType,
            activatedAt: { row, col },
            effectDescription: '',
            score: 0
        };
        
        // Store the power-up gem before clearing it
        const powerUpGem = board[row][col];
        
        switch (powerUpType) {
            case this.powerUpTypes.BOMB:
                // Remove 3x3 area around the power-up
                powerUpInfo.effectDescription = 'Bomb explodes in 3x3 area';
                for (let r = Math.max(0, row - 1); r <= Math.min(this.BOARD_SIZE - 1, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(this.BOARD_SIZE - 1, col + 1); c++) {
                        if (board[r][c]) {
                            affectedPositions.push({ 
                                row: r, 
                                col: c, 
                                effect: 'bomb',
                                delay: Math.abs(r - row) * 50 + Math.abs(c - col) * 50 // Ripple effect
                            });
                        }
                    }
                }
                
                // Clear all affected positions
                affectedPositions.forEach(pos => {
                    board[pos.row][pos.col] = null;
                });
                
                powerUpInfo.score = affectedPositions.length * 100;
                break;
                
            case this.powerUpTypes.LIGHTNING:
                // Remove entire row and column with enhanced visual tracking
                powerUpInfo.effectDescription = 'Lightning strikes entire row and column';
                
                // Clear the entire row
                for (let c = 0; c < this.BOARD_SIZE; c++) {
                    if (board[row][c]) {
                        affectedPositions.push({ 
                            row: row, 
                            col: c, 
                            effect: 'lightning-horizontal',
                            delay: Math.abs(c - col) * 25 // Stagger from center outward
                        });
                    }
                }
                
                // Clear the entire column  
                for (let r = 0; r < this.BOARD_SIZE; r++) {
                    if (board[r][col]) {
                        // Avoid double-counting the intersection
                        const alreadyAffected = affectedPositions.some(pos => pos.row === r && pos.col === col);
                        if (!alreadyAffected) {
                            affectedPositions.push({ 
                                row: r, 
                                col: col, 
                                effect: 'lightning-vertical',
                                delay: Math.abs(r - row) * 25 // Stagger from center outward
                            });
                        }
                    }
                }
                
                // Clear all affected positions
                affectedPositions.forEach(pos => {
                    board[pos.row][pos.col] = null;
                });
                
                powerUpInfo.score = affectedPositions.length * 75;
                break;
                
            case this.powerUpTypes.RAINBOW:
                // Remove all gems of the selected type (click on any gem to target that type)
                // If clicked on the rainbow power-up itself, use the most common gem type
                let targetType = null;
                
                if (powerUpGem && !powerUpGem.isPowerUp) {
                    targetType = powerUpGem.type;
                } else {
                    // Find the most common gem type on the board
                    const gemCounts = {};
                    for (let r = 0; r < this.BOARD_SIZE; r++) {
                        for (let c = 0; c < this.BOARD_SIZE; c++) {
                            const gem = board[r][c];
                            if (gem && !gem.isPowerUp) {
                                gemCounts[gem.type] = (gemCounts[gem.type] || 0) + 1;
                            }
                        }
                    }
                    
                    targetType = Object.keys(gemCounts).reduce((a, b) => 
                        gemCounts[a] > gemCounts[b] ? a : b, null);
                }
                
                powerUpInfo.effectDescription = `Rainbow clears all ${targetType} gems`;
                
                if (targetType) {
                    for (let r = 0; r < this.BOARD_SIZE; r++) {
                        for (let c = 0; c < this.BOARD_SIZE; c++) {
                            const gem = board[r][c];
                            if (gem && gem.type === targetType && !gem.isPowerUp) {
                                affectedPositions.push({ 
                                    row: r, 
                                    col: c, 
                                    effect: 'rainbow',
                                    delay: Math.random() * 300 // Random animation timing
                                });
                            }
                        }
                    }
                    
                    // Clear all affected positions
                    affectedPositions.forEach(pos => {
                        board[pos.row][pos.col] = null;
                    });
                }
                
                powerUpInfo.score = affectedPositions.length * 125;
                break;
        }
        
        console.log(`⚡ Power-up ${powerUpType} activated: ${affectedPositions.length} gems affected`);
        
        return {
            affectedPositions,
            powerUpInfo
        };
    }

    // Check if board has any possible moves (deadlock detection)
    hasPossibleMoves(board) {
        const moves = this.findPossibleMoves(board);
        return moves.length >= this.MIN_POSSIBLE_MOVES;
    }

    // Shuffle board when no moves are available
    shuffleBoard(board) {
        if (!this.validateBoard(board)) {
            console.error('Invalid board provided to shuffleBoard');
            return false;
        }

        console.log('🔄 Shuffling board - no possible moves detected');

        // Collect all non-power-up gems
        const gems = [];
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const gem = board[row][col];
                if (gem && !gem.isPowerUp) {
                    gems.push(gem);
                }
            }
        }

        // Shuffle the gems array
        for (let i = gems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gems[i], gems[j]] = [gems[j], gems[i]];
        }

        // Place shuffled gems back on board, preserving power-ups
        let gemIndex = 0;
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const currentGem = board[row][col];
                if (currentGem && !currentGem.isPowerUp && gemIndex < gems.length) {
                    board[row][col] = gems[gemIndex];
                    gemIndex++;
                }
            }
        }

        // Verify shuffle created possible moves
        let attempts = 0;
        while (!this.hasPossibleMoves(board) && attempts < this.SHUFFLE_ATTEMPTS) {
            console.log(`🔄 Shuffle attempt ${attempts + 1}: re-shuffling for possible moves`);
            
            // Re-shuffle
            for (let i = gems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gems[i], gems[j]] = [gems[j], gems[i]];
            }

            // Re-place gems
            gemIndex = 0;
            for (let row = 0; row < this.BOARD_SIZE; row++) {
                for (let col = 0; col < this.BOARD_SIZE; col++) {
                    const currentGem = board[row][col];
                    if (currentGem && !currentGem.isPowerUp && gemIndex < gems.length) {
                        board[row][col] = gems[gemIndex];
                        gemIndex++;
                    }
                }
            }
            
            attempts++;
        }

        if (!this.hasPossibleMoves(board)) {
            console.warn('⚠️ Shuffle failed to create possible moves, regenerating board');
            return this.regenerateBoard(board);
        }

        console.log(`✅ Board shuffled successfully with ${this.findPossibleMoves(board).length} possible moves`);
        return true;
    }

    // Regenerate board completely if shuffle fails
    regenerateBoard(board) {
        console.log('🔄 Regenerating entire 9x9 board');

        // Preserve power-ups in their current positions
        const powerUps = [];
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const gem = board[row][col];
                if (gem && gem.isPowerUp) {
                    powerUps.push({ gem, row, col });
                }
            }
        }

        // Create fresh board
        const newBoard = this.createInitialBoard();

        // Restore power-ups to their original positions
        powerUps.forEach(({ gem, row, col }) => {
            newBoard[row][col] = gem;
        });

        // Copy new board to original board
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                board[row][col] = newBoard[row][col];
            }
        }

        console.log('✅ Board regenerated successfully');
        return true;
    }

    // Enhanced board validation and management
    ensureBoardPlayability(board) {
        if (!this.validateBoard(board)) {
            console.error('Cannot ensure playability of invalid board');
            return false;
        }

        // Check if board has enough moves
        if (!this.hasPossibleMoves(board)) {
            return this.shuffleBoard(board);
        }

        // Check if board is properly filled
        let hasEmptySpaces = false;
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (board[row][col] === null) {
                    hasEmptySpaces = true;
                    break;
                }
            }
            if (hasEmptySpaces) break;
        }

        if (hasEmptySpaces) {
            this.fillEmptySpaces(board);
            this.applyGravity(board);
            
            // Verify playability after filling
            if (!this.hasPossibleMoves(board)) {
                return this.shuffleBoard(board);
            }
        }

        return true;
    }

    // Ensure board playability without processing existing matches (for initialization)
    ensureBoardPlayabilityWithoutCascade(board) {
        if (!this.validateBoard(board)) {
            console.error('Cannot ensure playability of invalid board');
            return false;
        }

        // Remove any existing matches without processing them
        let matchesFound = true;
        let safetyCounter = 0;
        
        while (matchesFound && safetyCounter < 20) {
            const matches = this.findMatches(board);
            if (matches.length === 0) {
                matchesFound = false;
                break;
            }
            
            // Simply remove matches without scoring or cascading
            this.removeMatches(board, matches);
            this.applyGravity(board);
            this.fillEmptySpaces(board);
            
            safetyCounter++;
        }
        
        if (safetyCounter >= 20) {
            console.warn('⚠️ Reached safety limit removing matches, shuffling board');
            this.shuffleBoard(board);
        }

        // Ensure board has possible moves
        if (!this.hasPossibleMoves(board)) {
            return this.shuffleBoard(board);
        }

        return true;
    }

    // Create a fallback board with minimal matches
    createFallbackBoard() {
        console.log('🔧 Creating fallback board with match prevention...');
        
        const board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(null));
        
        // Create a simple pattern that avoids immediate matches
        const gemTypes = this.gemTypes;
        let gemIndex = 0;
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                let attempts = 0;
                let newGem;
                
                do {
                    // Use cycling pattern with randomization to avoid matches
                    const baseIndex = (row * this.BOARD_SIZE + col + attempts) % gemTypes.length;
                    const randomOffset = Math.floor(Math.random() * 3);
                    const typeIndex = (baseIndex + randomOffset) % gemTypes.length;
                    const type = gemTypes[typeIndex];
                    
                    newGem = {
                        type: type,
                        colors: this.gemColors[type] || ['#808080', '#A0A0A0'],
                        isPowerUp: false,
                        powerUpType: null,
                        id: this.generateGemId()
                    };
                    
                    attempts++;
                } while (this.wouldCreateMatch(board, row, col, newGem.type) && attempts < 10);
                
                // If we can't avoid a match after 10 attempts, just place a random gem
                if (attempts >= 10) {
                    newGem = this.createRandomGem();
                }
                
                board[row][col] = newGem;
            }
        }
        
        console.log('✅ Fallback board created');
        return board;
    }

    // Create initial 9x9 board ensuring no initial matches and possible moves
    createInitialBoard() {
        console.log('🎮 Creating new 9x9 board...');
        
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            const board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(null));
            
            // Fill board position by position
            let boardValid = true;
            for (let row = 0; row < this.BOARD_SIZE && boardValid; row++) {
                for (let col = 0; col < this.BOARD_SIZE && boardValid; col++) {
                    let gemAttempts = 0;
                    let newGem;
                    
                    do {
                        newGem = this.createRandomGem();
                        gemAttempts++;
                        
                        if (gemAttempts >= 20) {
                            console.warn(`Failed to place gem at ${row},${col} after ${gemAttempts} attempts`);
                            boardValid = false;
                            break;
                        }
                    } while (this.wouldCreateMatch(board, row, col, newGem.type));
                    
                    if (boardValid) {
                        board[row][col] = newGem;
                    }
                }
            }
            
            if (boardValid && this.hasPossibleMoves(board)) {
                console.log(`✅ 9x9 board created successfully with ${this.findPossibleMoves(board).length} possible moves`);
                return board;
            }
            
            attempts++;
            console.log(`🔄 Board creation attempt ${attempts}/${maxAttempts} failed, retrying...`);
        }
        
        // Fallback: create basic board without matches and shuffle until playable
        console.log('⚠️ Using fallback board creation method');
        const fallbackBoard = this.createFallbackBoard();
        
        // Ensure playability without processing existing matches
        this.ensureBoardPlayabilityWithoutCascade(fallbackBoard);
        return fallbackBoard;
    }

    // Complete cascade processing for match-3 gameplay
    async processCascade(board) {
        let cascadeLevel = 0;
        let totalScore = 0;
        let cascadeResults = [];

        while (true) {
            // Find matches
            const matches = this.findMatches(board);
            if (matches.length === 0) break;

            // Calculate score for this cascade level
            const cascadeScore = this.calculateScore(matches, cascadeLevel);
            totalScore += cascadeScore;

            // Store cascade information
            cascadeResults.push({
                level: cascadeLevel,
                matches: matches.length,
                score: cascadeScore,
                totalMatches: matches.reduce((sum, match) => sum + match.gems.length, 0)
            });

            // Remove matches
            this.removeMatches(board, matches);

            // Apply gravity
            this.applyGravity(board);

            // Fill empty spaces
            this.fillEmptySpaces(board);

            cascadeLevel++;
            
            // Prevent infinite cascade loops
            if (cascadeLevel > 10) {
                console.warn('⚠️ Cascade level exceeded limit, breaking');
                break;
            }
        }

        // Ensure board is still playable after cascade
        this.ensureBoardPlayability(board);

        return {
            totalScore,
            cascadeLevel,
            cascadeResults
        };
    }
}

// Global gem system instance
export const gemSystem = new GemSystem(); 