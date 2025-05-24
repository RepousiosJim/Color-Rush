// Difficulty Management and Block Generation Algorithm
// Color Rush: Cascade Challenge - Modern 2025 Edition

export const DifficultyManager = {
  // Difficulty settings by level
  getDifficultySettings(level) {
    const baseLevel = Math.floor((level - 1) / 10); // Every 10 levels increase difficulty
    
    return {
      // Block generation control
      minPossibleMoves: Math.max(3, 8 - baseLevel), // Start with 8 moves, reduce to minimum 3
      maxPossibleMoves: Math.max(6, 15 - baseLevel), // Start with 15 moves, reduce to minimum 6
      
      // Cascade control
      maxCascadePotential: Math.max(2, 5 - Math.floor(baseLevel / 2)), // Reduce easy cascades
      
      // Piece type control
      pieceTypeVariety: Math.max(4, 6 - Math.floor(baseLevel / 3)), // Reduce variety for harder matching
      
      // Match size control
      preferredMatchSizes: baseLevel < 2 ? [3, 4] : [3], // Later levels prefer only 3-matches
      
      // Generation attempts
      maxGenerationAttempts: 100 + (baseLevel * 20), // More attempts for complex arrangements
      
      // Difficulty modifiers
      difficultyMultiplier: 1 + (baseLevel * 0.2),
      obstacleProbability: Math.min(0.3, baseLevel * 0.05), // Introduce obstacles later
      
      // Score requirements
      scoreMultiplier: 1 + (baseLevel * 0.5),
      
      // Time pressure
      timePressure: Math.max(0.8, 1 - (baseLevel * 0.1)) // Reduce time limits
    };
  },

  // Smart block generation that controls move potential
  generateSmartBoard(gameState, settings) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    let attempts = 0;
    
    do {
      this.fillBoardWithControlledMoves(board, settings);
      attempts++;
      
      if (attempts > settings.maxGenerationAttempts) {
        console.warn('Max generation attempts reached, using current board');
        break;
      }
    } while (!this.validateBoardDifficulty(board, settings));
    
    return board;
  },

  // Fill board with controlled move potential
  fillBoardWithControlledMoves(board, settings) {
    // First pass: Fill with basic pieces avoiding immediate matches
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        board[row][col] = this.generateControlledPiece(board, row, col, settings);
      }
    }
    
    // Second pass: Adjust to meet move requirements
    this.adjustForMoveRequirements(board, settings);
  },

  // Generate a piece that considers difficulty settings
  generateControlledPiece(board, row, col, settings) {
    const availableTypes = this.getAvailablePieceTypes(settings.pieceTypeVariety);
    let attempts = 0;
    let piece;
    
    do {
      const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      piece = this.createPieceFromType(randomType);
      attempts++;
      
      if (attempts > 50) {
        // If we can't find a good piece, just use the last generated one
        break;
      }
    } while (this.wouldCreateImmediateMatch(board, row, col, piece.type));
    
    return piece;
  },

  // Get available piece types based on difficulty
  getAvailablePieceTypes(varietyCount) {
    const allTypes = ['●', '■', '▲', '◆', '★', '♥'];
    return allTypes.slice(0, varietyCount);
  },

  // Create piece object from type
  createPieceFromType(type) {
    const SHAPES = {
      '●': { symbol: '●', class: 'circle', points: 100, color: '#FF6B6B', name: 'Cherry' },
      '■': { symbol: '■', class: 'square', points: 150, color: '#4ECDC4', name: 'Mint' },
      '▲': { symbol: '▲', class: 'triangle', points: 200, color: '#45B7D1', name: 'Sapphire' },
      '◆': { symbol: '◆', class: 'diamond', points: 250, color: '#96CEB4', name: 'Emerald' },
      '★': { symbol: '★', class: 'star', points: 300, color: '#FFEEAD', name: 'Gold' },
      '♥': { symbol: '♥', class: 'heart', points: 400, color: '#FF69B4', name: 'Ruby' }
    };
    
    const shape = SHAPES[type];
    return {
      type: shape.symbol,
      class: shape.class,
      color: shape.color,
      name: shape.name,
      points: shape.points,
      special: null,
      id: Math.random().toString(36).substr(2, 9),
      animated: true
    };
  },

  // Check if placing a piece would create immediate match
  wouldCreateImmediateMatch(board, row, col, pieceType) {
    // Check horizontal
    let horizontalCount = 1;
    
    // Count left
    for (let c = col - 1; c >= 0 && board[row][c] && board[row][c].type === pieceType; c--) {
      horizontalCount++;
    }
    
    // Count right
    for (let c = col + 1; c < 8 && board[row][c] && board[row][c].type === pieceType; c++) {
      horizontalCount++;
    }
    
    if (horizontalCount >= 3) return true;
    
    // Check vertical
    let verticalCount = 1;
    
    // Count up
    for (let r = row - 1; r >= 0 && board[r][col] && board[r][col].type === pieceType; r--) {
      verticalCount++;
    }
    
    // Count down
    for (let r = row + 1; r < 8 && board[r][col] && board[r][col].type === pieceType; r++) {
      verticalCount++;
    }
    
    return verticalCount >= 3;
  },

  // Adjust board to meet move requirements
  adjustForMoveRequirements(board, settings) {
    let possibleMoves = this.countPossibleMoves(board);
    let adjustmentAttempts = 0;
    
    while ((possibleMoves < settings.minPossibleMoves || possibleMoves > settings.maxPossibleMoves) 
           && adjustmentAttempts < 50) {
      
      if (possibleMoves < settings.minPossibleMoves) {
        this.addPossibleMoves(board, settings);
      } else if (possibleMoves > settings.maxPossibleMoves) {
        this.reducePossibleMoves(board, settings);
      }
      
      possibleMoves = this.countPossibleMoves(board);
      adjustmentAttempts++;
    }
  },

  // Add possible moves to the board
  addPossibleMoves(board, settings) {
    // Find positions where we can create potential matches
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (Math.random() < 0.3) { // 30% chance to modify this position
          // Try to place a piece that would create a move opportunity
          const potentialTypes = this.getAvailablePieceTypes(settings.pieceTypeVariety);
          for (const type of potentialTypes) {
            if (this.wouldCreateMoveOpportunity(board, row, col, type)) {
              board[row][col] = this.createPieceFromType(type);
              break;
            }
          }
        }
      }
    }
  },

  // Reduce possible moves on the board
  reducePossibleMoves(board, settings) {
    // Replace pieces that create too many opportunities
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (Math.random() < 0.2) { // 20% chance to modify this position
          const currentType = board[row][col]?.type;
          const availableTypes = this.getAvailablePieceTypes(settings.pieceTypeVariety);
          const differentTypes = availableTypes.filter(type => type !== currentType);
          
          if (differentTypes.length > 0) {
            const newType = differentTypes[Math.floor(Math.random() * differentTypes.length)];
            if (!this.wouldCreateImmediateMatch(board, row, col, newType)) {
              board[row][col] = this.createPieceFromType(newType);
            }
          }
        }
      }
    }
  },

  // Check if placing a piece would create a move opportunity
  wouldCreateMoveOpportunity(board, row, col, pieceType) {
    // Temporarily place the piece
    const originalPiece = board[row][col];
    board[row][col] = { type: pieceType };
    
    // Check adjacent positions for potential swaps
    const adjacent = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 }
    ];
    
    let createsOpportunity = false;
    
    for (const adj of adjacent) {
      if (adj.row >= 0 && adj.row < 8 && adj.col >= 0 && adj.col < 8 && board[adj.row][adj.col]) {
        // Simulate swap
        [board[row][col], board[adj.row][adj.col]] = [board[adj.row][adj.col], board[row][col]];
        
        // Check if this creates a match
        if (this.hasMatches(board)) {
          createsOpportunity = true;
        }
        
        // Revert swap
        [board[row][col], board[adj.row][adj.col]] = [board[adj.row][adj.col], board[row][col]];
        
        if (createsOpportunity) break;
      }
    }
    
    // Restore original piece
    board[row][col] = originalPiece;
    
    return createsOpportunity;
  },

  // Count total possible moves on board
  countPossibleMoves(board) {
    let moveCount = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!board[row][col]) continue;
        
        const adjacent = [
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 }
        ];
        
        for (const adj of adjacent) {
          if (adj.row >= 0 && adj.row < 8 && adj.col >= 0 && adj.col < 8 && board[adj.row][adj.col]) {
            // Simulate swap
            [board[row][col], board[adj.row][adj.col]] = [board[adj.row][adj.col], board[row][col]];
            
            if (this.hasMatches(board)) {
              moveCount++;
            }
            
            // Revert swap
            [board[row][col], board[adj.row][adj.col]] = [board[adj.row][adj.col], board[row][col]];
          }
        }
      }
    }
    
    return Math.floor(moveCount / 2); // Each move is counted twice (from both pieces)
  },

  // Check if board has any matches
  hasMatches(board) {
    // Check horizontal matches
    for (let row = 0; row < 8; row++) {
      let consecutiveCount = 1;
      let currentType = board[row][0]?.type;
      
      for (let col = 1; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === currentType) {
          consecutiveCount++;
        } else {
          if (consecutiveCount >= 3) return true;
          consecutiveCount = piece ? 1 : 0;
          currentType = piece?.type;
        }
      }
      if (consecutiveCount >= 3) return true;
    }
    
    // Check vertical matches
    for (let col = 0; col < 8; col++) {
      let consecutiveCount = 1;
      let currentType = board[0][col]?.type;
      
      for (let row = 1; row < 8; row++) {
        const piece = board[row][col];
        if (piece && piece.type === currentType) {
          consecutiveCount++;
        } else {
          if (consecutiveCount >= 3) return true;
          consecutiveCount = piece ? 1 : 0;
          currentType = piece?.type;
        }
      }
      if (consecutiveCount >= 3) return true;
    }
    
    return false;
  },

  // Validate board meets difficulty requirements
  validateBoardDifficulty(board, settings) {
    const possibleMoves = this.countPossibleMoves(board);
    const cascadePotential = this.calculateCascadePotential(board);
    
    return possibleMoves >= settings.minPossibleMoves && 
           possibleMoves <= settings.maxPossibleMoves &&
           cascadePotential <= settings.maxCascadePotential;
  },

  // Calculate potential for cascade reactions
  calculateCascadePotential(board) {
    let potential = 0;
    
    // Count near-matches (2 consecutive pieces of same type)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 7; col++) {
        if (board[row][col] && board[row][col + 1] && 
            board[row][col].type === board[row][col + 1].type) {
          potential++;
        }
      }
    }
    
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 7; row++) {
        if (board[row][col] && board[row + 1][col] && 
            board[row][col].type === board[row + 1][col].type) {
          potential++;
        }
      }
    }
    
    return potential;
  },

  // Generate pieces for filling empty spaces with difficulty control
  generateReplacementPieces(gameState, emptyPositions) {
    const level = gameState.adventureLevel || 1;
    const settings = this.getDifficultySettings(level);
    
    return emptyPositions.map(pos => {
      return this.generateControlledPiece(gameState.board, pos.row, pos.col, settings);
    });
  },

  // Analyze current board state for difficulty adjustment
  analyzeBoardDifficulty(board) {
    return {
      possibleMoves: this.countPossibleMoves(board),
      cascadePotential: this.calculateCascadePotential(board),
      pieceDistribution: this.analyzePieceDistribution(board),
      difficultyScore: this.calculateDifficultyScore(board)
    };
  },

  // Analyze piece type distribution
  analyzePieceDistribution(board) {
    const distribution = {};
    let totalPieces = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col]) {
          const type = board[row][col].type;
          distribution[type] = (distribution[type] || 0) + 1;
          totalPieces++;
        }
      }
    }
    
    // Calculate entropy (higher = more balanced, lower = clustered)
    let entropy = 0;
    for (const count of Object.values(distribution)) {
      const probability = count / totalPieces;
      entropy -= probability * Math.log2(probability);
    }
    
    return { distribution, entropy, totalPieces };
  },

  // Calculate overall difficulty score
  calculateDifficultyScore(board) {
    const possibleMoves = this.countPossibleMoves(board);
    const cascadePotential = this.calculateCascadePotential(board);
    const { entropy } = this.analyzePieceDistribution(board);
    
    // Higher score = more difficult
    // Fewer moves = harder, less cascade potential = harder, lower entropy = harder
    return (10 - possibleMoves) + (10 - cascadePotential) + (5 - entropy);
  }
};

// Export for use in main game
export default DifficultyManager; 