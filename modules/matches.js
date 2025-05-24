// Match Detection and Processing Module// Color Rush: Cascade Challenge - Modern 2025 Editionimport { gameState } from './gameState.js';import { BOARD_CONFIG, SCORING } from './constants.js';import { animateMatches, showScorePopup } from './animations.js';import { cascadeBoard, cascadeBoardOnly } from './board.js';import { updateAllUI, animateScoreGain } from './ui.js';

export const findMatches = () => {
  const matches = [];
  
  // Check horizontal matches (row by row) - only consecutive neighbors
  for (let row = 0; row < BOARD_CONFIG.rows; row++) {
    let consecutiveGroup = [];
    
    for (let col = 0; col < BOARD_CONFIG.cols; col++) {
      const shape = gameState.board[row][col];
      
      if (shape && consecutiveGroup.length > 0 && 
          shape.type === gameState.board[row][consecutiveGroup[0].col].type) {
        // Same type as current group - add to consecutive group
        consecutiveGroup.push({ row, col });
      } else if (shape) {
        // Different type or starting new group
        // First check if previous group was a match
        if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
          matches.push([...consecutiveGroup]);
        }
        // Start new group
        consecutiveGroup = [{ row, col }];
      } else {
        // Empty cell - breaks consecutive sequence
        if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
          matches.push([...consecutiveGroup]);
        }
        consecutiveGroup = [];
      }
    }
    
    // Check final group in row
    if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
      matches.push([...consecutiveGroup]);
    }
  }
  
  // Check vertical matches (column by column) - only consecutive neighbors
  for (let col = 0; col < BOARD_CONFIG.cols; col++) {
    let consecutiveGroup = [];
    
    for (let row = 0; row < BOARD_CONFIG.rows; row++) {
      const shape = gameState.board[row][col];
      
      if (shape && consecutiveGroup.length > 0 && 
          shape.type === gameState.board[consecutiveGroup[0].row][col].type) {
        // Same type as current group - add to consecutive group
        consecutiveGroup.push({ row, col });
      } else if (shape) {
        // Different type or starting new group
        // First check if previous group was a match
        if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
          matches.push([...consecutiveGroup]);
        }
        // Start new group
        consecutiveGroup = [{ row, col }];
      } else {
        // Empty cell - breaks consecutive sequence
        if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
          matches.push([...consecutiveGroup]);
        }
        consecutiveGroup = [];
      }
    }
    
    // Check final group in column
    if (consecutiveGroup.length >= BOARD_CONFIG.minMatch) {
      matches.push([...consecutiveGroup]);
    }
  }
  
  return matches;
};

export const calculateMatchScore = (match) => {
  // Classic match-3 scoring: bigger matches = exponentially more points
  let baseScore;
  switch(match.length) {
    case 3: baseScore = SCORING.match3; break;
    case 4: baseScore = SCORING.match4; break;
    case 5: baseScore = SCORING.match5; break;
    case 6: baseScore = SCORING.match6; break;
    default: baseScore = match.length * 500; break;
  }
  
  const cascadeBonus = gameState.cascadeMultiplier * SCORING.cascadeBonus;
  return baseScore + cascadeBonus;
};

export const processMatches = async (matches) => {
  try {
    let totalScore = 0;
    gameState.combo++;
    
    for (const match of matches) {
      const matchScore = calculateMatchScore(match);
      totalScore += matchScore;
    }
    
    const comboBonus = Math.min(gameState.combo, SCORING.comboMaxMultiplier) * 0.1;
    totalScore = Math.floor(totalScore * (1 + comboBonus));
    gameState.score += totalScore;
    
    showScorePopup(totalScore, matches[0][0]);
    
    await animateMatches(matches);
    removeMatchedPieces(matches);
    await cascadeBoard();
    
    const newMatches = findMatches();
    if (newMatches.length > 0) {
      await processMatches(newMatches);
    } else {
      gameState.combo = 0;
      gameState.cascadeMultiplier = 1;
      highlightPossibleMoves();
    }
    
    updateAllUI();
    gameState.checkObjectiveProgress?.();
  } catch (error) {
    console.error('Error in processMatches:', error);
    showMessage('Error processing matches. Game state may be inconsistent.', 'error');
    
    // Try to reset combo and multiplier
    gameState.combo = 0;
    gameState.cascadeMultiplier = 1;
    updateAllUI();
  }
};

export const processAutoMatches = async (matches) => {
  let totalScore = 0;
  gameState.combo++;
  
  for (const match of matches) {
    const matchScore = calculateMatchScore(match);
    totalScore += matchScore;
  }
  
  const comboBonus = Math.min(gameState.combo, SCORING.comboMaxMultiplier) * 0.1;
  totalScore = Math.floor(totalScore * (1 + comboBonus));
  gameState.score += totalScore;
  
  // Show score popup for auto-matches
  showScorePopup(totalScore, matches[0][0]);
  
  await animateMatches(matches);
  removeMatchedPieces(matches);
  await cascadeBoardOnly(); // Use a version that doesn't trigger auto-match checking
  
  updateAllUI();
  gameState.checkObjectiveProgress?.();
};

export const removeMatchedPieces = (matches) => {
  for (const match of matches) {
    for (const { row, col } of match) {
      gameState.board[row][col] = null;
    }
  }
};

export const createSpecialPiece = (match) => {
  if (match.length === 4) {
    const centerPos = match[Math.floor(match.length / 2)];
    const isHorizontal = match[0].row === match[1].row;
    gameState.board[centerPos.row][centerPos.col].special = 
      isHorizontal ? 'striped_horizontal' : 'striped_vertical';
  } else if (match.length === 5) {
    const centerPos = match[Math.floor(match.length / 2)];
    gameState.board[centerPos.row][centerPos.col].special = 'color_bomb';
  } else if (match.length >= 6) {
    const centerPos = match[Math.floor(match.length / 2)];
    gameState.board[centerPos.row][centerPos.col].special = 'wrapped';
  }
};

export const checkAndProcessAutoMatches = async () => {
  if (gameState.isProcessing) return;
  
  try {
    let foundMatches = true;
    
    while (foundMatches) {
      const matches = findMatches();
      
      if (matches.length > 0) {
        gameState.isProcessing = true;
        await processAutoMatches(matches);
        gameState.isProcessing = false;
      } else {
        foundMatches = false;
      }
    }
    
    // After all auto-matches are processed, highlight possible moves
    highlightPossibleMoves();
  } catch (error) {
    console.error('Error in checkAndProcessAutoMatches:', error);
    showMessage('Error during auto-match processing.', 'error');
    gameState.isProcessing = false;
  }
};

export const findPossibleMoves = () => {
  const moves = [];
  
  for (let row = 0; row < BOARD_CONFIG.rows; row++) {
    for (let col = 0; col < BOARD_CONFIG.cols; col++) {
      if (!gameState.board[row][col]) continue;
      
      const adjacent = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
      ];
      
      for (const adj of adjacent) {
        if (adj.row >= 0 && adj.row < BOARD_CONFIG.rows && 
            adj.col >= 0 && adj.col < BOARD_CONFIG.cols && 
            gameState.board[adj.row][adj.col]) {
          
          [gameState.board[row][col], gameState.board[adj.row][adj.col]] = 
          [gameState.board[adj.row][adj.col], gameState.board[row][col]];
          
          if (findMatches().length > 0) {
            moves.push({
              pos1: { row, col },
              pos2: { row: adj.row, col: adj.col }
            });
          }
          
          [gameState.board[row][col], gameState.board[adj.row][adj.col]] = 
          [gameState.board[adj.row][adj.col], gameState.board[row][col]];
        }
      }
    }
  }
  
  return moves;
};

export const highlightPossibleMoves = () => {
  document.querySelectorAll('.possible-move').forEach(el => {
    el.classList.remove('possible-move');
  });
  
  const possibleMoves = findPossibleMoves();
  
  if (possibleMoves.length === 0) {
    setTimeout(() => shuffleBoard(), 1000);
    showMessage('No moves available! Shuffling...', 'warning');
  } else {
    possibleMoves.slice(0, 2).forEach(move => {
      const element1 = document.querySelector(`[data-row="${move.pos1.row}"][data-col="${move.pos1.col}"]`);
      const element2 = document.querySelector(`[data-row="${move.pos2.row}"][data-col="${move.pos2.col}"]`);
      if (element1) element1.classList.add('possible-move');
      if (element2) element2.classList.add('possible-move');
    });
  }
}; 