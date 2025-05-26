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
    }

    // Create a random divine gem
    createRandomGem() {
        const type = this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
        return {
            type: type,
            colors: this.gemColors[type],
            isPowerUp: false,
            powerUpType: null,
            id: this.generateGemId()
        };
    }

    // Create a power-up gem based on match size
    createPowerUpGem(matchSize, type, position) {
        let powerUpType = null;
        
        if (matchSize >= 5) {
            powerUpType = this.powerUpTypes.RAINBOW;
        } else if (matchSize === 4) {
            powerUpType = this.powerUpTypes.LIGHTNING;
        } else if (matchSize >= 6) {
            powerUpType = this.powerUpTypes.BOMB;
        }

        return {
            type: type,
            colors: this.gemColors[type],
            isPowerUp: true,
            powerUpType: powerUpType,
            position: position,
            id: this.generateGemId()
        };
    }

    // Generate unique gem ID
    generateGemId() {
        return `gem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Check if placing a gem would create an immediate match
    wouldCreateMatch(board, row, col, gemType) {
        // Check horizontal matches
        let horizontalCount = 1;
        
        // Check left
        for (let c = col - 1; c >= 0; c--) {
            if (board[row][c] && board[row][c].type === gemType) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        // Check right
        for (let c = col + 1; c < 8; c++) {
            if (board[row][c] && board[row][c].type === gemType) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        if (horizontalCount >= 3) return true;
        
        // Check vertical matches
        let verticalCount = 1;
        
        // Check up
        for (let r = row - 1; r >= 0; r--) {
            if (board[r][col] && board[r][col].type === gemType) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        // Check down
        for (let r = row + 1; r < 8; r++) {
            if (board[r][col] && board[r][col].type === gemType) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        return verticalCount >= 3;
    }

    // Find all matches on the board
    findMatches(board) {
        const matches = [];
        
        // Check horizontal matches (left to right)
        for (let row = 0; row < 8; row++) {
            let matchGroup = [];
            let currentType = null;
            
            for (let col = 0; col < 8; col++) {
                const gem = board[row][col];
                if (gem && gem.type === currentType) {
                    matchGroup.push({ row, col });
                } else {
                    if (matchGroup.length >= 3) {
                        matches.push([...matchGroup]);
                    }
                    matchGroup = gem ? [{ row, col }] : [];
                    currentType = gem ? gem.type : null;
                }
            }
            
            if (matchGroup.length >= 3) {
                matches.push([...matchGroup]);
            }
        }
        
        // Check vertical matches (top to bottom)  
        for (let col = 0; col < 8; col++) {
            let matchGroup = [];
            let currentType = null;
            
            for (let row = 0; row < 8; row++) {
                const gem = board[row][col];
                if (gem && gem.type === currentType) {
                    matchGroup.push({ row, col });
                } else {
                    if (matchGroup.length >= 3) {
                        matches.push([...matchGroup]);
                    }
                    matchGroup = gem ? [{ row, col }] : [];
                    currentType = gem ? gem.type : null;
                }
            }
            
            if (matchGroup.length >= 3) {
                matches.push([...matchGroup]);
            }
        }
        
        return matches;
    }

    // Calculate score for matches
    calculateScore(matches, cascadeLevel = 0) {
        let totalScore = 0;
        let matchDetails = [];
        
        matches.forEach(match => {
            const matchSize = match.length;
            let baseScore = 0;
            
            // Base scoring system
            switch (matchSize) {
                case 3:
                    baseScore = 50;
                    break;
                case 4:
                    baseScore = 150;
                    break;
                case 5:
                    baseScore = 300;
                    break;
                default:
                    baseScore = 500 + (matchSize - 6) * 200;
            }
            
            // Apply cascade multiplier
            const cascadeMultiplier = 1 + (cascadeLevel * 0.5);
            const finalScore = Math.round(baseScore * cascadeMultiplier);
            
            totalScore += finalScore;
            matchDetails.push({
                size: matchSize,
                baseScore: baseScore,
                finalScore: finalScore,
                positions: match
            });
        });
        
        return {
            totalScore,
            matches: matchDetails
        };
    }

    // Apply gravity to make gems fall
    applyGravity(board) {
        let changed = false;
        
        for (let col = 0; col < 8; col++) {
            // Collect all non-null gems in this column
            const gems = [];
            for (let row = 7; row >= 0; row--) {
                if (board[row][col]) {
                    gems.push(board[row][col]);
                    board[row][col] = null;
                }
            }
            
            // Place gems at the bottom
            for (let i = 0; i < gems.length; i++) {
                const targetRow = 7 - i;
                board[targetRow][col] = gems[i];
            }
            
            if (gems.length > 0) {
                changed = true;
            }
        }
        
        return changed;
    }

    // Fill empty spaces with new gems
    fillEmptySpaces(board) {
        let newGemsAdded = false;
        
        for (let col = 0; col < 8; col++) {
            for (let row = 0; row < 8; row++) {
                if (!board[row][col]) {
                    // Try to create a gem that doesn't immediately match
                    let attempts = 0;
                    let newGem;
                    
                    do {
                        newGem = this.createRandomGem();
                        attempts++;
                    } while (attempts < 10 && this.wouldCreateMatch(board, row, col, newGem.type));
                    
                    board[row][col] = newGem;
                    newGemsAdded = true;
                }
            }
        }
        
        return newGemsAdded;
    }

    // Remove matches from the board
    removeMatches(board, matches) {
        const removedGems = [];
        
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                if (board[row][col]) {
                    removedGems.push({
                        gem: board[row][col],
                        position: { row, col }
                    });
                    board[row][col] = null;
                }
            });
        });
        
        return removedGems;
    }

    // Find possible moves for hints
    findPossibleMoves(board) {
        const possibleMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const gem = board[row][col];
                if (!gem) continue;
                
                // Check adjacent positions
                const directions = [
                    [-1, 0], [1, 0], [0, -1], [0, 1]
                ];
                
                directions.forEach(([dRow, dCol]) => {
                    const newRow = row + dRow;
                    const newCol = col + dCol;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const adjacentGem = board[newRow][newCol];
                        if (adjacentGem) {
                            // Simulate swap and check for matches
                            board[row][col] = adjacentGem;
                            board[newRow][newCol] = gem;
                            
                            const matches = this.findMatches(board);
                            if (matches.length > 0) {
                                possibleMoves.push({
                                    from: { row, col },
                                    to: { row: newRow, col: newCol },
                                    matches: matches.length
                                });
                            }
                            
                            // Restore original positions
                            board[row][col] = gem;
                            board[newRow][newCol] = adjacentGem;
                        }
                    }
                });
            }
        }
        
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

    // Process power-up activation
    activatePowerUp(board, row, col, powerUpType) {
        const affectedPositions = [];
        
        switch (powerUpType) {
            case this.powerUpTypes.BOMB:
                // Remove 3x3 area around the power-up
                for (let r = Math.max(0, row - 1); r <= Math.min(7, row + 1); r++) {
                    for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
                        if (board[r][c]) {
                            affectedPositions.push({ row: r, col: c });
                            board[r][c] = null;
                        }
                    }
                }
                break;
                
            case this.powerUpTypes.LIGHTNING:
                // Remove entire row and column
                for (let c = 0; c < 8; c++) {
                    if (board[row][c]) {
                        affectedPositions.push({ row, col: c });
                        board[row][c] = null;
                    }
                }
                for (let r = 0; r < 8; r++) {
                    if (board[r][col]) {
                        affectedPositions.push({ row: r, col });
                        board[r][col] = null;
                    }
                }
                break;
                
            case this.powerUpTypes.RAINBOW:
                // Remove all gems of the target type
                const targetType = board[row][col]?.type;
                if (targetType) {
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            if (board[r][c] && board[r][c].type === targetType) {
                                affectedPositions.push({ row: r, col: c });
                                board[r][c] = null;
                            }
                        }
                    }
                }
                break;
        }
        
        return affectedPositions;
    }

    // Create initial board ensuring no initial matches
    createInitialBoard() {
        const board = Array(8).fill().map(() => Array(8));
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let attempts = 0;
                let newGem;
                
                do {
                    newGem = this.createRandomGem();
                    attempts++;
                } while (attempts < 20 && this.wouldCreateMatch(board, row, col, newGem.type));
                
                board[row][col] = newGem;
            }
        }
        
        return board;
    }
}

// Global gem system instance
export const gemSystem = new GemSystem(); 