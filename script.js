// Color Rush: Cascade Challenge - Modern 2025 Edition
// Inspired by Candy Crush Saga, Bejeweled, and Homescapes

const gameState = {
  // Core game state
  board: [],
  selectedShape: null,
  score: 0,
  combo: 0,
  isProcessing: false,
  isDragging: false,
  dragStartElement: null,
  
  // Modern progression system
  level: 1,
  totalLevels: 100,
  starsEarned: 0,
  starThresholds: [1000, 5000, 10000],
  
  // Lives system (like Candy Crush)
  lives: 5,
  maxLives: 5,
  lastLifeTime: Date.now(),
  lifeRegenTime: 30 * 60 * 1000, // 30 minutes per life
  
  // Currency system
  coins: 100,
  gems: 10,
  
  // Boosters/Power-ups (like all top games)
  boosters: {
    hammer: 3,        // Remove single piece
    colorBomb: 2,     // Remove all of one color
    striped: 2,       // Clear row/column
    wrapped: 1,       // Clear 3x3 area
    shuffle: 1,       // Reshuffle board
    extraMoves: 2,    // +5 moves
    extraTime: 1      // +30 seconds
  },
  
  // Daily systems
  dailyReward: {
    day: 0,
    claimed: false,
    lastClaim: null
  },
  
  // Game modes with objectives
  gameMode: 'adventure',
  currentObjective: null,
  movesLeft: 30,
  timeLeft: 60,
  
  // Adventure mode progression
  adventureLevel: 1,
  worldMap: 1,
  
  // Achievement system
  achievements: {},
  
  // Settings
  soundEnabled: true,
  musicEnabled: true,
  
  // Analytics
  sessionStart: Date.now(),
  totalPlayTime: 0,
  gamesPlayed: 0,
  
  // Advanced match-3 features
  cascadeMultiplier: 1,
  matchStreak: 0,
  
  // Timers
  timer: null,
  processingTimeout: null,
  scanInterval: null
};

// Enhanced shape system
const SHAPES = {
  circle: { 
    symbol: '●', 
    class: 'circle', 
    points: 100, 
    color: '#FF6B6B',
    name: 'Cherry'
  },
  square: { 
    symbol: '■', 
    class: 'square', 
    points: 150, 
    color: '#4ECDC4',
    name: 'Mint'
  },
  triangle: { 
    symbol: '▲', 
    class: 'triangle', 
    points: 200, 
    color: '#45B7D1',
    name: 'Sapphire'
  },
  diamond: { 
    symbol: '◆', 
    class: 'diamond', 
    points: 250, 
    color: '#96CEB4',
    name: 'Emerald'
  },
  star: { 
    symbol: '★', 
    class: 'star', 
    points: 300, 
    color: '#FFEEAD',
    name: 'Gold'
  },
  heart: {
    symbol: '♥',
    class: 'heart',
    points: 400,
    color: '#FF69B4',
    name: 'Ruby'
  }
};

// Special pieces (like Candy Crush specials)
const SPECIAL_TYPES = {
  striped_horizontal: {
    name: 'Striped (Horizontal)',
    effect: 'clearRow',
    icon: '━',
    points: 1000
  },
  striped_vertical: {
    name: 'Striped (Vertical)', 
    effect: 'clearColumn',
    icon: '┃',
    points: 1000
  },
  wrapped: {
    name: 'Wrapped',
    effect: 'clear3x3',
    icon: '⊞',
    points: 1500
  },
  color_bomb: {
    name: 'Color Bomb',
    effect: 'clearColor',
    icon: '◉',
    points: 2000
  }
};

// Level objectives
const LEVEL_OBJECTIVES = {
  score: { description: 'Reach target score', icon: '🎯' },
  moves_limit: { description: 'Limited moves', icon: '👆' },
  time_limit: { description: 'Beat the clock', icon: '⏰' }
};

// Daily rewards
const DAILY_REWARDS = [
  { coins: 100, gems: 0, boosters: {} },
  { coins: 150, gems: 0, boosters: { hammer: 1 } },
  { coins: 200, gems: 1, boosters: {} },
  { coins: 250, gems: 0, boosters: { colorBomb: 1 } },
  { coins: 300, gems: 2, boosters: { striped: 1 } },
  { coins: 400, gems: 0, boosters: { shuffle: 1 } },
  { coins: 500, gems: 5, boosters: { hammer: 2, colorBomb: 1, striped: 1 } }
];

// Initialize game
function initGame(mode = 'adventure') {
  resetGameState(mode);
  loadPlayerProgress();
  updateLivesSystem();
  initializeBoard();
  updateAllUI();
  checkDailyReward();
  startGameSession();
}

function resetGameState(mode) {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  if (gameState.processingTimeout) {
    clearTimeout(gameState.processingTimeout);
    gameState.processingTimeout = null;
  }
  
  if (gameState.scanInterval) {
    clearInterval(gameState.scanInterval);
    gameState.scanInterval = null;
  }
  
  gameState.board = [];
  gameState.selectedShape = null;
  gameState.score = 0;
  gameState.combo = 0;
  gameState.isProcessing = false;
  gameState.isDragging = false;
  gameState.dragStartElement = null;
  gameState.gameMode = mode;
  gameState.cascadeMultiplier = 1;
  gameState.matchStreak = 0;
  
  setLevelObjective(mode);
}

function setLevelObjective(mode) {
  switch (mode) {
    case 'adventure':
      const levelType = (gameState.adventureLevel % 3);
      switch (levelType) {
        case 1: 
          gameState.currentObjective = { type: 'score', target: 5000 * gameState.adventureLevel };
          break;
        case 2: 
          gameState.currentObjective = { type: 'moves_limit', target: 25 };
          gameState.movesLeft = 25;
          break;
        case 0: 
          gameState.currentObjective = { type: 'time_limit', target: 60 };
          gameState.timeLeft = 60;
          startTimer();
          break;
      }
      break;
    case 'challenge':
      gameState.currentObjective = { type: 'moves_limit', target: 30 };
      gameState.movesLeft = 30;
      break;
    case 'endless':
      gameState.currentObjective = { type: 'score', target: Infinity };
      break;
    case 'speed':
      gameState.currentObjective = { type: 'time_limit', target: 60 };
      gameState.timeLeft = 60;
      startTimer();
      break;
  }
}

function initializeBoard() {
  const board = document.querySelector('.game-board');
  board.innerHTML = '';
  
  // Create board ensuring no initial matches
  for (let row = 0; row < 8; row++) {
    gameState.board[row] = [];
    for (let col = 0; col < 8; col++) {
      let shape;
      let attempts = 0;
      
      do {
        shape = createRandomShape();
        gameState.board[row][col] = shape;
        attempts++;
        
        // Prevent infinite loop
        if (attempts > 50) {
          break;
        }
      } while (wouldCreateMatch(row, col, shape.type));
      
      const shapeElement = createShapeElement(shape, row, col);
      board.appendChild(shapeElement);
    }
  }
  
  // Start continuous immediate match checking after board creation
  setTimeout(() => {
    startContinuousMatchScanning();
  }, 50);
}

// Helper function to check if placing a shape would create an initial match
function wouldCreateMatch(row, col, shapeType) {
  // Check horizontal match (left and right)
  let horizontalCount = 1;
  
  // Count to the left
  let leftCol = col - 1;
  while (leftCol >= 0 && 
         gameState.board[row] && 
         gameState.board[row][leftCol] && 
         gameState.board[row][leftCol].type === shapeType) {
    horizontalCount++;
    leftCol--;
  }
  
  // Count to the right (only check existing positions)
  let rightCol = col + 1;
  while (rightCol < 8 && 
         gameState.board[row] && 
         gameState.board[row][rightCol] && 
         gameState.board[row][rightCol].type === shapeType) {
    horizontalCount++;
    rightCol++;
  }
  
  if (horizontalCount >= 3) {
    return true;
  }
  
  // Check vertical match (up and down)
  let verticalCount = 1;
  
  // Count upward
  let upRow = row - 1;
  while (upRow >= 0 && 
         gameState.board[upRow] && 
         gameState.board[upRow][col] && 
         gameState.board[upRow][col].type === shapeType) {
    verticalCount++;
    upRow--;
  }
  
  // Count downward (only check existing positions)
  let downRow = row + 1;
  while (downRow < 8 && 
         gameState.board[downRow] && 
         gameState.board[downRow][col] && 
         gameState.board[downRow][col].type === shapeType) {
    verticalCount++;
    downRow++;
  }
  
  if (verticalCount >= 3) {
    return true;
  }
  
  return false;
}

function createRandomShape() {
  const shapeKeys = Object.keys(SHAPES);
  const randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
  const shape = SHAPES[randomShape];
  
  return {
    type: shape.symbol,
    class: shape.class,
    color: shape.color,
    name: shape.name,
    points: shape.points,
    special: null,
    id: Math.random().toString(36).substr(2, 9)
  };
}

function createShapeElement(shape, row, col) {
  const element = document.createElement('div');
  element.className = `shape ${shape.class} ${shape.special || ''}`;
  element.style.backgroundColor = shape.color;
  element.textContent = shape.type;
  element.dataset.row = row;
  element.dataset.col = col;
  element.dataset.id = shape.id;
  element.setAttribute('draggable', 'true');
  
  element.addEventListener('dragstart', handleDragStart);
  element.addEventListener('dragend', handleDragEnd);
  element.addEventListener('dragover', (e) => e.preventDefault());
  element.addEventListener('drop', handleDrop);
  element.addEventListener('click', handleShapeClick);
  
  return element;
}

function handleDragStart(e) {
  if (gameState.isProcessing) {
    e.preventDefault();
    return;
  }
  
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  
  gameState.isDragging = true;
  gameState.dragStartElement = { row, col };
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  gameState.isDragging = false;
  gameState.dragStartElement = null;
  e.target.classList.remove('dragging');
}

function handleDrop(e) {
  e.preventDefault();
  
  if (!gameState.isDragging || !gameState.dragStartElement) return;
  
  const targetRow = parseInt(e.currentTarget.dataset.row);
  const targetCol = parseInt(e.currentTarget.dataset.col);
  const { row: startRow, col: startCol } = gameState.dragStartElement;
  
  if (isAdjacent(startRow, startCol, targetRow, targetCol)) {
    attemptSwap(startRow, startCol, targetRow, targetCol);
  }
}

function handleShapeClick(e) {
  if (gameState.isProcessing) return;
  
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);
  
  if (!gameState.selectedShape) {
    selectShape(row, col);
  } else {
    if (gameState.selectedShape.row === row && gameState.selectedShape.col === col) {
      deselectShape();
    } else if (isAdjacent(gameState.selectedShape.row, gameState.selectedShape.col, row, col)) {
      attemptSwap(gameState.selectedShape.row, gameState.selectedShape.col, row, col);
      deselectShape();
    } else {
      deselectShape();
      selectShape(row, col);
    }
  }
}

function selectShape(row, col) {
  gameState.selectedShape = { row, col };
  const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (element) {
    element.classList.add('selected');
  }
}

function deselectShape() {
  if (gameState.selectedShape) {
    const element = document.querySelector(`[data-row="${gameState.selectedShape.row}"][data-col="${gameState.selectedShape.col}"]`);
    if (element) {
      element.classList.remove('selected');
    }
    gameState.selectedShape = null;
  }
}

function isAdjacent(row1, col1, row2, col2) {
  return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
         (Math.abs(col1 - col2) === 1 && row1 === row2);
}

async function attemptSwap(row1, col1, row2, col2) {
  if (gameState.isProcessing) return;
  
  try {
    gameState.isProcessing = true;
    
    [gameState.board[row1][col1], gameState.board[row2][col2]] = 
    [gameState.board[row2][col2], gameState.board[row1][col1]];
    
    const matches = findMatches();
    
    if (matches.length > 0) {
      await animateSwap(row1, col1, row2, col2);
      
      // Process matches immediately after swap
      setTimeout(() => {
        processMatches(matches);
      }, 50);
      
      updateMoveCount();
    } else {
      [gameState.board[row1][col1], gameState.board[row2][col2]] = 
      [gameState.board[row2][col2], gameState.board[row1][col1]];
      await animateInvalidSwap(row1, col1, row2, col2);
    }
    
    checkGameState();
  } catch (error) {
    console.error('Error in attemptSwap:', error);
    showMessage('Game error occurred. Please try again.', 'error');
    
    // Try to revert the swap if it happened
    try {
      [gameState.board[row1][col1], gameState.board[row2][col2]] = 
      [gameState.board[row2][col2], gameState.board[row1][col1]];
    } catch (revertError) {
      console.error('Failed to revert swap:', revertError);
    }
  } finally {
    gameState.isProcessing = false;
  }
}

async function animateSwap(row1, col1, row2, col2) {
  try {
    const shape1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const shape2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
    if (!shape1 || !shape2) return;
    
    const rect1 = shape1.getBoundingClientRect();
    const rect2 = shape2.getBoundingClientRect();
    
    shape1.style.transition = 'transform 0.3s ease-out';
    shape2.style.transition = 'transform 0.3s ease-out';
    
    shape1.style.transform = `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;
    shape2.style.transform = `translate(${rect1.left - rect2.left}px, ${rect1.top - rect2.top}px)`;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    shape1.dataset.row = row2;
    shape1.dataset.col = col2;
    shape2.dataset.row = row1;
    shape2.dataset.col = col1;
    
    shape1.style.transition = '';
    shape2.style.transition = '';
    shape1.style.transform = '';
    shape2.style.transform = '';
  } catch (error) {
    console.error('Error in animateSwap:', error);
    // Don't show user message for animation errors as they're not critical
  }
}

async function animateInvalidSwap(row1, col1, row2, col2) {
  const shape1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
  const shape2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
  
  if (!shape1 || !shape2) return;
  
  shape1.classList.add('invalid-move');
  shape2.classList.add('invalid-move');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  shape1.classList.remove('invalid-move');
  shape2.classList.remove('invalid-move');
}

function findMatches() {
  const matches = [];
  
  // Check horizontal matches (row by row) - only consecutive neighbors
  for (let row = 0; row < 8; row++) {
    let consecutiveGroup = [];
    
    for (let col = 0; col < 8; col++) {
      const shape = gameState.board[row][col];
      
      if (shape && consecutiveGroup.length > 0 && 
          shape.type === gameState.board[row][consecutiveGroup[0].col].type) {
        // Same type as current group - add to consecutive group
        consecutiveGroup.push({ row, col });
      } else if (shape) {
        // Different type or starting new group
        // First check if previous group was a match
        if (consecutiveGroup.length >= 3) {
          matches.push([...consecutiveGroup]);
        }
        // Start new group
        consecutiveGroup = [{ row, col }];
      } else {
        // Empty cell - breaks consecutive sequence
        if (consecutiveGroup.length >= 3) {
          matches.push([...consecutiveGroup]);
        }
        consecutiveGroup = [];
      }
    }
    
    // Check final group in row
    if (consecutiveGroup.length >= 3) {
      matches.push([...consecutiveGroup]);
    }
  }
  
  // Check vertical matches (column by column) - only consecutive neighbors
  for (let col = 0; col < 8; col++) {
    let consecutiveGroup = [];
    
    for (let row = 0; row < 8; row++) {
      const shape = gameState.board[row][col];
      
      if (shape && consecutiveGroup.length > 0 && 
          shape.type === gameState.board[consecutiveGroup[0].row][col].type) {
        // Same type as current group - add to consecutive group
        consecutiveGroup.push({ row, col });
      } else if (shape) {
        // Different type or starting new group
        // First check if previous group was a match
        if (consecutiveGroup.length >= 3) {
          matches.push([...consecutiveGroup]);
        }
        // Start new group
        consecutiveGroup = [{ row, col }];
      } else {
        // Empty cell - breaks consecutive sequence
        if (consecutiveGroup.length >= 3) {
          matches.push([...consecutiveGroup]);
        }
        consecutiveGroup = [];
      }
    }
    
    // Check final group in column
    if (consecutiveGroup.length >= 3) {
      matches.push([...consecutiveGroup]);
    }
  }
  
  return matches;
}

async function processMatches(matches) {
  try {
    let totalScore = 0;
    gameState.combo++;
    
    for (const match of matches) {
      const matchScore = calculateMatchScore(match);
      totalScore += matchScore;
    }
    
    const comboBonus = Math.min(gameState.combo, 10) * 0.1;
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
    checkObjectiveProgress();
  } catch (error) {
    console.error('Error in processMatches:', error);
    showMessage('Error processing matches. Game state may be inconsistent.', 'error');
    
    // Try to reset combo and multiplier
    gameState.combo = 0;
    gameState.cascadeMultiplier = 1;
    updateAllUI();
  }
}

function calculateMatchScore(match) {
  // Classic match-3 scoring: bigger matches = exponentially more points
  let baseScore;
  switch(match.length) {
    case 3: baseScore = 100; break;
    case 4: baseScore = 400; break;
    case 5: baseScore = 1000; break;
    case 6: baseScore = 2000; break;
    default: baseScore = match.length * 500; break;
  }
  
  const cascadeBonus = gameState.cascadeMultiplier * 50;
  return baseScore + cascadeBonus;
}

function createSpecialPiece(match) {
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
}

async function animateMatches(matches) {
  const elements = [];
  
  for (const match of matches) {
    for (const { row, col } of match) {
      const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      if (element) {
        element.classList.add('matched');
        elements.push(element);
      }
    }
  }
  
  // Faster animation for immediate breaking
  await new Promise(resolve => setTimeout(resolve, 200));
  elements.forEach(el => el.remove());
}

function removeMatchedPieces(matches) {
  for (const match of matches) {
    for (const { row, col } of match) {
      gameState.board[row][col] = null;
    }
  }
}

async function cascadeBoard() {
  try {
    let hasMovement = true;
    
    while (hasMovement) {
      hasMovement = false;
      
      for (let col = 0; col < 8; col++) {
        for (let row = 7; row >= 0; row--) {
          if (!gameState.board[row][col]) {
            for (let sourceRow = row - 1; sourceRow >= 0; sourceRow--) {
              if (gameState.board[sourceRow][col]) {
                gameState.board[row][col] = gameState.board[sourceRow][col];
                gameState.board[sourceRow][col] = null;
                
                const element = document.querySelector(`[data-row="${sourceRow}"][data-col="${col}"]`);
                if (element) {
                  element.dataset.row = row;
                  element.style.transition = 'transform 0.2s ease-in';
                  element.style.transform = `translateY(${(row - sourceRow) * 60}px)`;
                  setTimeout(() => {
                    element.style.transition = '';
                    element.style.transform = '';
                    // Check for matches immediately after each piece lands
                    checkForImmediateMatches();
                  }, 200);
                }
                
                hasMovement = true;
                break;
              }
            }
          }
        }
      }
      
      if (hasMovement) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    await fillEmptySpaces();
    gameState.cascadeMultiplier++;
  } catch (error) {
    console.error('Error in cascadeBoard:', error);
    showMessage('Error during cascade. Board may need refresh.', 'error');
    
    // Try to at least update the visual board
    try {
      updateBoardVisual();
    } catch (visualError) {
      console.error('Failed to update board visual:', visualError);
    }
  }
}

// Cascade without triggering auto-match checking (for use during auto-match processing)
async function cascadeBoardOnly() {
  let hasMovement = true;
  
  while (hasMovement) {
    hasMovement = false;
    
    for (let col = 0; col < 8; col++) {
      for (let row = 7; row >= 0; row--) {
        if (!gameState.board[row][col]) {
          for (let sourceRow = row - 1; sourceRow >= 0; sourceRow--) {
            if (gameState.board[sourceRow][col]) {
              gameState.board[row][col] = gameState.board[sourceRow][col];
              gameState.board[sourceRow][col] = null;
              
              const element = document.querySelector(`[data-row="${sourceRow}"][data-col="${col}"]`);
              if (element) {
                element.dataset.row = row;
                element.style.transition = 'transform 0.3s ease-in';
                element.style.transform = `translateY(${(row - sourceRow) * 60}px)`;
                setTimeout(() => {
                  element.style.transition = '';
                  element.style.transform = '';
                }, 300);
              }
              
              hasMovement = true;
              break;
            }
          }
        }
      }
    }
    
    if (hasMovement) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  await fillEmptySpacesOnly();
  gameState.cascadeMultiplier++;
}

async function fillEmptySpaces() {
  const board = document.querySelector('.game-board');
  
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (!gameState.board[row][col]) {
        const newShape = createRandomShape();
        gameState.board[row][col] = newShape;
        
        const element = createShapeElement(newShape, row, col);
        element.style.opacity = '0';
        element.style.transform = 'translateY(-60px)';
        board.appendChild(element);
        
        setTimeout(() => {
          element.style.transition = 'all 0.2s ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 25);
        
        // Check for immediate matches as each piece is placed
        setTimeout(() => {
          checkForImmediateMatches();
        }, 50);
      }
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Final check for any remaining auto-matches
  await checkAndProcessAutoMatches();
}

// Cascade without triggering auto-match (for use in auto-match processing)
async function fillEmptySpacesOnly() {
  const board = document.querySelector('.game-board');
  
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (!gameState.board[row][col]) {
        const newShape = createRandomShape();
        gameState.board[row][col] = newShape;
        
        const element = createShapeElement(newShape, row, col);
        element.style.opacity = '0';
        element.style.transform = 'translateY(-60px)';
        board.appendChild(element);
        
        setTimeout(() => {
          element.style.transition = 'all 0.3s ease-out';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 50);
      }
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
}

// Immediate match detection - checks and breaks matches instantly
function checkForImmediateMatches() {
  if (gameState.isProcessing) return;
  
  const matches = findMatches();
  if (matches.length > 0) {
    // Process matches immediately without delay
    setTimeout(() => processAutoMatches(matches), 10);
  }
}

// Continuous match scanning - constantly looks for matches to break
function startContinuousMatchScanning() {
  // Initial scan
  checkForImmediateMatches();
  
  // Set up continuous scanning every 100ms
  const scanInterval = setInterval(() => {
    if (!gameState.isProcessing) {
      checkForImmediateMatches();
    }
  }, 100);
  
  // Store interval ID for cleanup if needed
  gameState.scanInterval = scanInterval;
}

// Auto-completion logic: continuously check and process matches
async function checkAndProcessAutoMatches() {
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
}

// Process matches that occur automatically (not from user moves)
async function processAutoMatches(matches) {
  let totalScore = 0;
  gameState.combo++;
  
  for (const match of matches) {
    const matchScore = calculateMatchScore(match);
    totalScore += matchScore;
  }
  
  const comboBonus = Math.min(gameState.combo, 10) * 0.1;
  totalScore = Math.floor(totalScore * (1 + comboBonus));
  gameState.score += totalScore;
  
  // Show score popup for auto-matches
  showScorePopup(totalScore, matches[0][0]);
  
  await animateMatches(matches);
  removeMatchedPieces(matches);
  await cascadeBoardOnly(); // Use a version that doesn't trigger auto-match checking
  
  updateAllUI();
  checkObjectiveProgress();
}

function highlightPossibleMoves() {
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
}

function findPossibleMoves() {
  const moves = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (!gameState.board[row][col]) continue;
      
      const adjacent = [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
      ];
      
      for (const adj of adjacent) {
        if (adj.row >= 0 && adj.row < 8 && adj.col >= 0 && adj.col < 8 && gameState.board[adj.row][adj.col]) {
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
}

function shuffleBoard() {
  const pieces = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (gameState.board[row][col]) {
        pieces.push(gameState.board[row][col]);
      }
    }
  }
  
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  
  let pieceIndex = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (pieceIndex < pieces.length) {
        gameState.board[row][col] = pieces[pieceIndex++];
      }
    }
  }
  
  updateBoardVisual();
  
  // Check for auto-matches after shuffling
  setTimeout(() => {
    checkAndProcessAutoMatches();
  }, 100);
}

function updateBoardVisual() {
  const board = document.querySelector('.game-board');
  board.innerHTML = '';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (gameState.board[row][col]) {
        const element = createShapeElement(gameState.board[row][col], row, col);
        board.appendChild(element);
      }
    }
  }
}

// Lives system
function updateLivesSystem() {
  const now = Date.now();
  const timeSinceLastLife = now - gameState.lastLifeTime;
  const livesToAdd = Math.floor(timeSinceLastLife / gameState.lifeRegenTime);
  
  if (livesToAdd > 0 && gameState.lives < gameState.maxLives) {
    gameState.lives = Math.min(gameState.maxLives, gameState.lives + livesToAdd);
    gameState.lastLifeTime = now;
    savePlayerProgress();
  }
  
  updateLivesDisplay();
  
  if (gameState.lives < gameState.maxLives) {
    const timeToNextLife = gameState.lifeRegenTime - (now - gameState.lastLifeTime);
    setTimeout(updateLivesSystem, Math.min(timeToNextLife, 60000));
  }
}

// Booster system
function useBooster(boosterType) {
  if (gameState.boosters[boosterType] <= 0) {
    showMessage('Not enough boosters!', 'error');
    return false;
  }
  
  gameState.boosters[boosterType]--;
  
  switch (boosterType) {
    case 'hammer':
      activateHammer();
      break;
    case 'colorBomb':
      activateColorBomb();
      break;
    case 'shuffle':
      shuffleBoard();
      break;
    case 'extraMoves':
      addExtraMoves();
      break;
    case 'extraTime':
      addExtraTime();
      break;
  }
  
  updateAllUI();
  savePlayerProgress();
  return true;
}

function activateHammer() {
  showMessage('Tap any piece to remove it!', 'info');
  document.querySelector('.game-board').classList.add('hammer-mode');
  
  const shapes = document.querySelectorAll('.shape');
  shapes.forEach(shape => {
    shape.addEventListener('click', hammerClick, { once: true });
  });
}

function hammerClick(e) {
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);
  
  gameState.board[row][col] = null;
  e.currentTarget.remove();
  
  document.querySelector('.game-board').classList.remove('hammer-mode');
  
  setTimeout(async () => {
    await cascadeBoard();
    // Auto-match checking is handled by cascadeBoard -> fillEmptySpaces -> checkAndProcessAutoMatches
  }, 100);
}

// Timer system
function startTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
  }
  
  gameState.timer = setInterval(() => {
    gameState.timeLeft--;
    updateTimeDisplay();
    
    if (gameState.timeLeft <= 0) {
      clearInterval(gameState.timer);
      gameState.timer = null;
      showGameOver();
    }
  }, 1000);
}

// Daily reward system
function checkDailyReward() {
  const today = new Date().toDateString();
  const lastClaim = gameState.dailyReward.lastClaim;
  
  if (lastClaim !== today) {
    if (lastClaim) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClaim === yesterday.toDateString()) {
        gameState.dailyReward.day = (gameState.dailyReward.day + 1) % 7;
      } else {
        gameState.dailyReward.day = 0;
      }
    }
    
    showDailyRewardPopup();
  }
}

function claimDailyReward() {
  const reward = DAILY_REWARDS[gameState.dailyReward.day];
  
  gameState.coins += reward.coins;
  gameState.gems += reward.gems;
  
  Object.entries(reward.boosters).forEach(([booster, amount]) => {
    gameState.boosters[booster] += amount;
  });
  
  gameState.dailyReward.lastClaim = new Date().toDateString();
  gameState.dailyReward.claimed = true;
  
  savePlayerProgress();
  updateAllUI();
  
  showMessage(`Daily reward claimed! +${reward.coins} coins${reward.gems ? `, +${reward.gems} gems` : ''}`, 'success');
}

// UI Updates
function updateAllUI() {
  updateScoreDisplay();
  updateLivesDisplay();
  updateCurrencyDisplay();
  updateBoosterDisplay();
  updateObjectiveDisplay();
  updateTimeDisplay();
  updateMovesDisplay();
}

function updateScoreDisplay() {
  const scoreElement = document.querySelector('.score');
  if (scoreElement) {
    scoreElement.textContent = `Score: ${gameState.score.toLocaleString()}`;
  }
  
  const comboElement = document.querySelector('.combo');
  if (comboElement) {
    comboElement.textContent = gameState.combo > 1 ? `${gameState.combo}x Combo!` : '';
    comboElement.style.display = gameState.combo > 1 ? 'block' : 'none';
  }
}

function updateLivesDisplay() {
  const livesElement = document.querySelector('.lives-count');
  if (livesElement) {
    livesElement.textContent = `❤️ ${gameState.lives}/${gameState.maxLives}`;
  }
}

function updateCurrencyDisplay() {
  const coinsElement = document.querySelector('.coins-count');
  if (coinsElement) {
    coinsElement.textContent = `🪙 ${gameState.coins}`;
  }
  
  const gemsElement = document.querySelector('.gems-count');
  if (gemsElement) {
    gemsElement.textContent = `💎 ${gameState.gems}`;
  }
}

function updateBoosterDisplay() {
  Object.entries(gameState.boosters).forEach(([booster, count]) => {
    const element = document.querySelector(`.booster-${booster}`);
    if (element) {
      element.textContent = `${getBoosterIcon(booster)} ${count}`;
    }
  });
}

function updateObjectiveDisplay() {
  const objectiveElement = document.querySelector('.objective-text');
  if (objectiveElement && gameState.currentObjective) {
    const obj = gameState.currentObjective;
    const objType = LEVEL_OBJECTIVES[obj.type];
    objectiveElement.textContent = `${objType.icon} ${objType.description}`;
  }
}

function updateTimeDisplay() {
  const timeElement = document.querySelector('.timer');
  if (timeElement) {
    if (gameState.currentObjective?.type === 'time_limit') {
      timeElement.textContent = `⏰ ${gameState.timeLeft}s`;
      timeElement.style.display = 'block';
    } else {
      timeElement.style.display = 'none';
    }
  }
}

function updateMovesDisplay() {
  const movesElement = document.querySelector('.moves');
  if (movesElement) {
    if (gameState.currentObjective?.type === 'moves_limit') {
      movesElement.textContent = `👆 ${gameState.movesLeft} moves`;
      movesElement.style.display = 'block';
    } else {
      movesElement.style.display = 'none';
    }
  }
}

function getBoosterIcon(type) {
  const icons = {
    hammer: '🔨',
    colorBomb: '💣',
    striped: '⚡',
    wrapped: '💫',
    shuffle: '🔀',
    extraMoves: '➕',
    extraTime: '⏰'
  };
  return icons[type] || '🎁';
}

// Game state checks
function checkGameState() {
  if (gameState.currentObjective?.type === 'score' && gameState.score >= gameState.currentObjective.target) {
    showLevelComplete();
  }
  
  if (gameState.currentObjective?.type === 'moves_limit' && gameState.movesLeft <= 0) {
    if (gameState.score >= 5000) {
      showLevelComplete();
    } else {
      showGameOver();
    }
  }
  
  if (gameState.lives <= 0) {
    showGameOver();
  }
}

function updateMoveCount() {
  if (gameState.currentObjective?.type === 'moves_limit') {
    gameState.movesLeft--;
    updateMovesDisplay();
  }
}

function addExtraMoves() {
  if (gameState.currentObjective?.type === 'moves_limit') {
    gameState.movesLeft += 5;
    showMessage('+5 moves!', 'success');
    updateMovesDisplay();
  }
}

function addExtraTime() {
  if (gameState.currentObjective?.type === 'time_limit') {
    gameState.timeLeft += 30;
    showMessage('+30 seconds!', 'success');
    updateTimeDisplay();
  }
}

function checkObjectiveProgress() {
  if (!gameState.currentObjective) return;
  
  const obj = gameState.currentObjective;
  
  switch (obj.type) {
    case 'score':
      obj.progress = gameState.score;
      break;
  }
}

// Popup systems
function showMessage(text, type = 'info') {
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = text;
  messageElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 1000;
  `;
  
  const colors = {
    info: '#3498db',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  messageElement.style.backgroundColor = colors[type];
  
  document.body.appendChild(messageElement);
  
  setTimeout(() => messageElement.remove(), 3000);
}

function showScorePopup(score, position) {
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.textContent = `+${score}`;
  popup.style.cssText = `
    position: absolute;
    font-size: 24px;
    font-weight: bold;
    color: #f39c12;
    pointer-events: none;
    z-index: 100;
    animation: scoreFloat 1s ease-out forwards;
  `;
  
  const boardRect = document.querySelector('.game-board').getBoundingClientRect();
  popup.style.left = `${boardRect.left + position.col * 60 + 30}px`;
  popup.style.top = `${boardRect.top + position.row * 60 + 30}px`;
  
  document.body.appendChild(popup);
  
  setTimeout(() => popup.remove(), 1000);
}

function showDailyRewardPopup() {
  if (gameState.dailyReward.claimed) return;
  
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  const reward = DAILY_REWARDS[gameState.dailyReward.day];
  popup.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
      <h2>🎁 Daily Reward - Day ${gameState.dailyReward.day + 1}</h2>
      <div style="margin: 20px 0;">
        <div>🪙 ${reward.coins} Coins</div>
        ${reward.gems ? `<div>💎 ${reward.gems} Gems</div>` : ''}
        ${Object.keys(reward.boosters).length ? '<div>🎁 Boosters</div>' : ''}
      </div>
      <button onclick="claimDailyReward(); this.parentElement.parentElement.remove();" 
              style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Claim Reward
      </button>
    </div>
  `;
  
  document.body.appendChild(popup);
}

function showLevelComplete() {
  gameState.adventureLevel++;
  const stars = calculateStars();
  
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  popup.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
      <h2>🎉 Level Complete!</h2>
      <div style="font-size: 24px; margin: 20px 0;">
        ${'⭐'.repeat(stars)}
      </div>
      <p>Score: ${gameState.score.toLocaleString()}</p>
      <p>Level: ${gameState.adventureLevel}</p>
      <button onclick="initGame('adventure'); this.parentElement.parentElement.remove();" 
              style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Next Level
      </button>
    </div>
  `;
  
  document.body.appendChild(popup);
  savePlayerProgress();
}

function showGameOver() {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  popup.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 400px;">
      <h2>Game Over</h2>
      <p>Final Score: ${gameState.score.toLocaleString()}</p>
      <p>Level: ${gameState.adventureLevel}</p>
      <div style="margin: 20px 0;">
        <button onclick="initGame('adventure'); this.parentElement.parentElement.remove();" 
                style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
          Play Again
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
}

function calculateStars() {
  if (gameState.score >= gameState.starThresholds[2]) return 3;
  if (gameState.score >= gameState.starThresholds[1]) return 2;
  if (gameState.score >= gameState.starThresholds[0]) return 1;
  return 0;
}

// Save/Load system
function savePlayerProgress() {
  const saveData = {
    level: gameState.adventureLevel,
    worldMap: gameState.worldMap,
    coins: gameState.coins,
    gems: gameState.gems,
    boosters: gameState.boosters,
    lives: gameState.lives,
    lastLifeTime: gameState.lastLifeTime,
    achievements: gameState.achievements,
    dailyReward: gameState.dailyReward,
    totalPlayTime: gameState.totalPlayTime,
    gamesPlayed: gameState.gamesPlayed,
    settings: {
      soundEnabled: gameState.soundEnabled,
      musicEnabled: gameState.musicEnabled
    }
  };
  
  localStorage.setItem('colorRushProgress2025', JSON.stringify(saveData));
}

function loadPlayerProgress() {
  const saveData = localStorage.getItem('colorRushProgress2025');
  if (!saveData) return;
  
  try {
    const data = JSON.parse(saveData);
    
    gameState.adventureLevel = data.level || 1;
    gameState.worldMap = data.worldMap || 1;
    gameState.coins = data.coins || 100;
    gameState.gems = data.gems || 10;
    gameState.boosters = { ...gameState.boosters, ...data.boosters };
    gameState.lives = data.lives !== undefined ? data.lives : 5;
    gameState.lastLifeTime = data.lastLifeTime || Date.now();
    gameState.achievements = data.achievements || {};
    gameState.dailyReward = { ...gameState.dailyReward, ...data.dailyReward };
    gameState.totalPlayTime = data.totalPlayTime || 0;
    gameState.gamesPlayed = data.gamesPlayed || 0;
    
    if (data.settings) {
      gameState.soundEnabled = data.settings.soundEnabled;
      gameState.musicEnabled = data.settings.musicEnabled;
    }
  } catch (e) {
    console.warn('Failed to load save data:', e);
  }
}

function startGameSession() {
  gameState.sessionStart = Date.now();
  gameState.gamesPlayed++;
  
  setInterval(() => {
    gameState.totalPlayTime += Date.now() - gameState.sessionStart;
    gameState.sessionStart = Date.now();
    savePlayerProgress();
  }, 30000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initGame('adventure');
}); 