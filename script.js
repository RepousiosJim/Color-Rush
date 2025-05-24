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

// ============================================================================
// IMMEDIATE GLOBAL FUNCTION STUBS (to prevent ReferenceError in HTML)
// ============================================================================
window.initGame = function(mode) { console.log('initGame stub called'); };
window.restartGame = function() { console.log('restartGame stub called'); };
window.useBooster = function(type) { console.log('useBooster stub called'); };
window.checkDailyReward = function() { console.log('checkDailyReward stub called'); };
window.claimDailyReward = function() { console.log('claimDailyReward stub called'); };
window.toggleSettingsPanel = function() { console.log('toggleSettingsPanel stub called'); };
window.toggleReducedMotion = function() { console.log('toggleReducedMotion stub called'); };
window.toggleHighContrast = function() { console.log('toggleHighContrast stub called'); };
window.toggleLargeText = function() { console.log('toggleLargeText stub called'); };
window.toggleAutoHints = function() { console.log('toggleAutoHints stub called'); };
window.toggleShowMoves = function() { console.log('toggleShowMoves stub called'); };
window.toggleParticleEffects = function() { console.log('toggleParticleEffects stub called'); };
window.exportGameData = function() { console.log('exportGameData stub called'); };
window.clearGameData = function() { console.log('clearGameData stub called'); };
window.showPerformanceStats = function() { console.log('showPerformanceStats stub called'); };
window.closeStatsModal = function() { 
  console.log('closeStatsModal stub called'); 
  const modal = document.querySelector('.stats-modal');
  if (modal) modal.remove();
};
console.log('✅ Emergency function stubs loaded');
// ============================================================================

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

// Fallback definitions for modern features (will be replaced by dynamic imports)
let AIHintSystem = {
  showHint: () => console.log('💡 AI Hints not loaded - using basic hint system'),
  findBestMove: () => {
    const moves = findPossibleMoves();
    return moves.length > 0 ? moves[0] : null;
  }
};
let SocialSystem = {
  shareScore: (score, level) => {
    if (navigator.share) {
      navigator.share({
        title: 'Color Rush Score',
        text: `I scored ${score.toLocaleString()} points on level ${level}!`,
        url: window.location.href
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback to clipboard
      const text = `I scored ${score.toLocaleString()} points on Color Rush level ${level}!`;
      navigator.clipboard?.writeText(text).then(() => {
        showMessage('Score copied to clipboard! 📋', 'success');
      }).catch(() => {
        console.log('Score sharing not available');
      });
    }
  }
};
let ModernProgression = {
  calculatePlayerLevel: () => ({ level: 1, progress: 0, currentExp: 0, requiredExp: 100 }),
  unlockFeatures: () => [],
  showLevelUpNotification: () => {}
};
let PerformanceTracker = {
  addScore: (score) => {
    const scores = JSON.parse(localStorage.getItem('recentScores') || '[]');
    scores.push(score);
    if (scores.length > 20) scores.shift();
    localStorage.setItem('recentScores', JSON.stringify(scores));
  },
  trackGameMetrics: () => ({ avgSessionTime: 120, completionRate: 75, skillProgression: 5 }),
  getRecentScores: () => JSON.parse(localStorage.getItem('recentScores') || '[]')
};
let AccessibilityFeatures = {
  loadAccessibilitySettings: () => {
    if (localStorage.getItem('reducedMotion') === 'true') {
      document.body.classList.add('reduced-motion');
    }
    if (localStorage.getItem('highContrast') === 'true') {
      document.body.classList.add('high-contrast');
    }
    if (localStorage.getItem('largeText') === 'true') {
      document.body.classList.add('large-text');
    }
  },
  addKeyboardNavigation: () => {
    console.log('🎹 Basic keyboard navigation enabled');
  },
  enableReducedMotion: () => {
    document.body.classList.add('reduced-motion');
    localStorage.setItem('reducedMotion', 'true');
  },
  enableHighContrast: () => {
    document.body.classList.add('high-contrast');
    localStorage.setItem('highContrast', 'true');
  },
  enableLargeText: () => {
    document.body.classList.add('large-text');
    localStorage.setItem('largeText', 'true');
  }
};

// Try to load modern features dynamically (non-blocking)
if (typeof window !== 'undefined') {
  console.log('🔄 Attempting to load modern features...');
  try {
    import('./modules/modernFeatures.js').then(({ 
      AIHintSystem: AIS, 
      SocialSystem: SS, 
      ModernProgression: MP, 
      PerformanceTracker: PT, 
      AccessibilityFeatures: AF 
    }) => {
      console.log('✅ Advanced modern features loaded successfully');
      AIHintSystem = AIS;
      SocialSystem = SS;
      ModernProgression = MP;
      PerformanceTracker = PT;
      AccessibilityFeatures = AF;
      
      // Make them globally available
      window.AIHintSystem = AIHintSystem;
      window.SocialSystem = SocialSystem;
      window.ModernProgression = ModernProgression;
      window.PerformanceTracker = PerformanceTracker;
      window.AccessibilityFeatures = AccessibilityFeatures;
    }).catch(error => {
      console.log('💡 Advanced features not available, using basic fallbacks');
    });
  } catch (error) {
    console.log('💡 Using basic feature set');
  }
}

// Initialize game
function initGame(mode = 'adventure') {
  resetGameState(mode);
  loadPlayerProgress();
  updateLivesSystem();
  initializeBoard();
  updateAllUI();
  checkDailyReward();
  startGameSession();
  
  // Initialize modern 2025 features
  AccessibilityFeatures.loadAccessibilitySettings();
  AccessibilityFeatures.addKeyboardNavigation();
  
  // Track game start
  PerformanceTracker.addScore(0); // Initialize score tracking
  
  // Check for feature unlocks
  const unlockedFeatures = ModernProgression.unlockFeatures();
  updateModernUI(unlockedFeatures);
}
// Make immediately available
window.initGame = initGame;

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
  console.log(`🎯 Setting objective for mode: ${mode}`);
  // Always use fallback method to avoid module dependency issues
  setLevelObjectiveFallback(mode);
}

// Fallback objective setting
function setLevelObjectiveFallback(mode) {
  switch (mode) {
    case 'adventure':
      const levelType = (gameState.adventureLevel % 3);
      switch (levelType) {
        case 1: 
          const scoreTarget = 8000 * gameState.adventureLevel; // Increased from 5000
          gameState.currentObjective = { type: 'score', target: scoreTarget };
          // Set star thresholds: 40%, 70%, 100% for more challenging progression
          gameState.starThresholds = [
            Math.floor(scoreTarget * 0.4),   // Increased from 33% to 40%
            Math.floor(scoreTarget * 0.7),   // Increased from 66% to 70%
            scoreTarget
          ];
          break;
        case 2: 
          gameState.currentObjective = { type: 'moves_limit', target: 25 };
          gameState.movesLeft = 25;
          // For move-based levels, increased score targets within moves
          const moveScoreTarget = 5000 * gameState.adventureLevel; // Increased from 3000
          gameState.starThresholds = [
            Math.floor(moveScoreTarget * 0.4),   // Increased threshold percentages
            Math.floor(moveScoreTarget * 0.7),
            moveScoreTarget
          ];
          break;
        case 0: 
          gameState.currentObjective = { type: 'time_limit', target: 60 };
          gameState.timeLeft = 60;
          startTimer();
          // For time-based levels, increased score targets within time
          const timeScoreTarget = 6000 * gameState.adventureLevel; // Increased from 4000
          gameState.starThresholds = [
            Math.floor(timeScoreTarget * 0.4),   // Increased threshold percentages
            Math.floor(timeScoreTarget * 0.7),
            timeScoreTarget
          ];
          break;
      }
      break;
    case 'challenge':
      gameState.currentObjective = { type: 'moves_limit', target: 30 };
      gameState.movesLeft = 30;
      // Challenge mode star thresholds - more challenging
      const challengeScoreTarget = 12000; // Increased from 8000
      gameState.starThresholds = [
        Math.floor(challengeScoreTarget * 0.4),   // 40% threshold
        Math.floor(challengeScoreTarget * 0.7),   // 70% threshold
        challengeScoreTarget
      ];
      break;
    case 'endless':
      gameState.currentObjective = { type: 'score', target: Infinity };
      // Endless mode progressive thresholds
      gameState.starThresholds = [5000, 15000, 30000];
      break;
    case 'speed':
      gameState.currentObjective = { type: 'time_limit', target: 60 };
      gameState.timeLeft = 60;
      startTimer();
      // Speed mode star thresholds - more challenging
      const speedScoreTarget = 8000; // Increased from 6000
      gameState.starThresholds = [
        Math.floor(speedScoreTarget * 0.4),   // 40% threshold
        Math.floor(speedScoreTarget * 0.7),   // 70% threshold
        speedScoreTarget
      ];
      break;
  }
}

function initializeBoard() {
  console.log('🎯 Initializing game board...');
  const board = document.querySelector('.game-board');
  
  if (!board) {
    console.error('❌ Game board element not found!');
    return;
  }
  
  board.innerHTML = '';
  
  // Always use the reliable fallback method
  initializeBoardFallback();
}

// Fallback initialization method
function initializeBoardFallback() {
  console.log('🔧 Creating 8x8 game board with fallback method...');
  
  const board = document.querySelector('.game-board');
  if (!board) {
    console.error('❌ Game board element not found in fallback!');
    return;
  }
  
  // Clear any existing content
  board.innerHTML = '';
  
  // Initialize the 2D array
  gameState.board = [];
  
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
          console.warn(`⚠️ Max attempts reached for position [${row}][${col}]`);
          break;
        }
      } while (wouldCreateMatch(row, col, shape.type));
      
      // Mark initial pieces as already animated
      shape.animated = true;
      
      // Create and append the visual element
      const shapeElement = createShapeElement(shape, row, col);
      board.appendChild(shapeElement);
    }
  }
  
  console.log('✅ Board created successfully! 64 shapes generated.');
  console.log('📊 Board state:', gameState.board);
  
  // Start continuous immediate match checking after board creation
  setTimeout(() => {
    startContinuousMatchScanning();
    console.log('🔄 Match scanning started');
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
  
  // Add modern drag feedback - highlight potential drop targets
  highlightDropTargets(row, col);
  
  // Create a subtle drag preview effect
  const rect = e.target.getBoundingClientRect();
  e.dataTransfer.setDragImage(e.target, rect.width / 2, rect.height / 2);
  e.dataTransfer.effectAllowed = 'move';
}

function highlightDropTargets(row, col) {
  // Highlight adjacent cells as potential drop targets
  const adjacent = [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 }
  ];
  
  adjacent.forEach(pos => {
    if (pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8) {
      const element = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
      if (element) {
        element.classList.add('drop-target');
      }
    }
  });
}

function handleDragEnd(e) {
  gameState.isDragging = false;
  gameState.dragStartElement = null;
  e.target.classList.remove('dragging');
  
  // Remove all drop target highlights
  document.querySelectorAll('.drop-target').forEach(el => {
    el.classList.remove('drop-target');
  });
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
    
    // Track previous level for modern progression
    const previousLevel = ModernProgression.calculatePlayerLevel().level;
    
    for (const match of matches) {
      const matchScore = calculateMatchScore(match);
      totalScore += matchScore;
    }
    
    // Reduced combo bonus: max 50% instead of 100%
    const comboBonus = Math.min(gameState.combo, 10) * 0.05; // Reduced from 0.1
    totalScore = Math.floor(totalScore * (1 + comboBonus));
    
    // Store previous stars before updating score
    const previousStars = calculateCurrentStars();
    gameState.score += totalScore;
    
    // Modern progression tracking
    PerformanceTracker.addScore(gameState.score);
    
    showScorePopup(totalScore, matches[0][0]);
    
    // Check for star progress and show celebration if new star earned
    const currentStars = calculateCurrentStars();
    if (currentStars > previousStars) {
      showStarEarnedAnimation(currentStars);
    }
    
    // Check for level up and feature unlocks
    const currentLevel = ModernProgression.calculatePlayerLevel().level;
    if (currentLevel > previousLevel) {
      ModernProgression.showLevelUpNotification(currentLevel);
      const newFeatures = ModernProgression.unlockFeatures();
      updateModernUI(newFeatures);
    }
    
    await animateMatches(matches);
    removeMatchedPieces(matches);
    
    // Increased delay before cascade to make the break more visible
    await new Promise(resolve => setTimeout(resolve, 400)); // Increased from 200ms
    await cascadeBoard();
    
    const newMatches = findMatches();
    if (newMatches.length > 0) {
      // Increased delay between consecutive match processing
      await new Promise(resolve => setTimeout(resolve, 600)); // Increased from 300ms
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
  // Rebalanced scoring: more challenging progression
  let baseScore;
  switch(match.length) {
    case 3: baseScore = 50; break;   // Reduced from 100
    case 4: baseScore = 150; break;  // Reduced from 400  
    case 5: baseScore = 400; break;  // Reduced from 1000
    case 6: baseScore = 800; break;  // Reduced from 2000
    default: baseScore = match.length * 200; break; // Reduced multiplier
  }
  
  // Reduced cascade bonus to prevent easy score inflation
  const cascadeBonus = gameState.cascadeMultiplier * 25; // Reduced from 50
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
  
  // Longer animation to make breaks more visible
  await new Promise(resolve => setTimeout(resolve, 700)); // Increased from 500ms
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
                  element.style.transition = 'transform 0.3s ease-in'; // Increased from 0.2s
                  element.style.transform = `translateY(${(row - sourceRow) * 60}px)`;
                  setTimeout(() => {
                    element.style.transition = '';
                    element.style.transform = '';
                    // Check for matches immediately after each piece lands
                    checkForImmediateMatches();
                  }, 300); // Increased from 200ms
                }
                
                hasMovement = true;
                break;
              }
            }
          }
        }
      }
      
      if (hasMovement) {
        await new Promise(resolve => setTimeout(resolve, 300)); // Increased from 200ms
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
  try {
    // Import difficulty manager for controlled piece generation
    const { DifficultyManager } = await import('./modules/difficulty.js');
    
    // Find empty positions
    const emptyPositions = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (!gameState.board[row][col]) {
          emptyPositions.push({ row, col });
        }
      }
    }
    
    // Generate controlled pieces based on current difficulty
    const level = gameState.adventureLevel || 1;
    const settings = DifficultyManager.getDifficultySettings(level);
    
    // Fill empty spaces with difficulty-controlled pieces
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 8; row++) {
        if (!gameState.board[row][col]) {
          const newShape = DifficultyManager.generateControlledPiece(gameState.board, row, col, settings);
          gameState.board[row][col] = newShape;
        }
      }
    }
    
    // Log board analysis after filling
    const analysis = DifficultyManager.analyzeBoardDifficulty(gameState.board);
    console.log(`After refill - Possible moves: ${analysis.possibleMoves}, Difficulty: ${analysis.difficultyScore.toFixed(1)}`);
    
  } catch (error) {
    console.warn('Difficulty manager not available, using random generation:', error);
    // Fallback to random generation
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 8; row++) {
        if (!gameState.board[row][col]) {
          const newShape = createRandomShape();
          gameState.board[row][col] = newShape;
        }
      }
    }
  }
  
  // Update the entire board visual to prevent size issues
  updateBoardVisual();
  
  // Animate new pieces falling in
  const newElements = document.querySelectorAll('.shape');
  newElements.forEach((element, index) => {
    const row = parseInt(element.dataset.row);
    const col = parseInt(element.dataset.col);
    
    // Only animate pieces that were just added
    if (element.classList.contains('new-piece') || !gameState.board[row][col].animated) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-60px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.2s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 10);
      
      gameState.board[row][col].animated = true;
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Final check for any remaining auto-matches
  await checkAndProcessAutoMatches();
}

// Cascade without triggering auto-match (for use in auto-match processing)
async function fillEmptySpacesOnly() {
  // Fill empty spaces in game state
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (!gameState.board[row][col]) {
        const newShape = createRandomShape();
        gameState.board[row][col] = newShape;
      }
    }
  }
  
  // Update the entire board visual to prevent size issues
  updateBoardVisual();
  
  // Animate new pieces falling in
  const newElements = document.querySelectorAll('.shape');
  newElements.forEach((element, index) => {
    const row = parseInt(element.dataset.row);
    const col = parseInt(element.dataset.col);
    
    // Only animate pieces that were just added
    if (!gameState.board[row][col].animated) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(-60px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.3s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 15);
      
      gameState.board[row][col].animated = true;
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, 300));
}

// Immediate match detection - checks and breaks matches with visible delay
function checkForImmediateMatches() {
  if (gameState.isProcessing) return;
  
  const matches = findMatches();
  if (matches.length > 0) {
    // Increased delay to make matches more visible
    setTimeout(() => processAutoMatches(matches), 300); // Increased from 150ms
  }
}

// Continuous match scanning - constantly looks for matches to break
function startContinuousMatchScanning() {
  // Initial scan
  checkForImmediateMatches();
  
  // Set up continuous scanning every 300ms (slower for more visible breaks)
  const scanInterval = setInterval(() => {
    if (!gameState.isProcessing) {
      checkForImmediateMatches();
    }
  }, 300); // Increased from 200ms
  
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
  
  // Store previous stars before updating score
  const previousStars = calculateCurrentStars();
  gameState.score += totalScore;
  
  // Show score popup for auto-matches
  showScorePopup(totalScore, matches[0][0]);
  
  // Check for star progress and show celebration if new star earned
  const currentStars = calculateCurrentStars();
  if (currentStars > previousStars) {
    showStarEarnedAnimation(currentStars);
  }
  
  await animateMatches(matches);
  removeMatchedPieces(matches);
  
  // Increased delay before cascade to make the break more visible
  await new Promise(resolve => setTimeout(resolve, 400)); // Increased from 200ms
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
// Make immediately available
window.useBooster = useBooster;

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
// Make immediately available
window.checkDailyReward = checkDailyReward;

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
// Make immediately available
window.claimDailyReward = claimDailyReward;

// UI Updates
function updateAllUI() {
  updateScoreDisplay();
  updateLivesDisplay();
  updateCurrencyDisplay();
  updateBoosterDisplay();
  updateObjectiveDisplay();
  updateTimeDisplay();
  updateMovesDisplay();
  updateStarProgress();
  updateDifficultyDisplay();
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
    
    // Add difficulty level indicator
    const level = gameState.adventureLevel || 1;
    const difficultyLevel = Math.floor((level - 1) / 10) + 1;
    const difficultyStars = '⭐'.repeat(Math.min(difficultyLevel, 5));
    
    objectiveElement.textContent = `${objType.icon} ${objType.description} ${difficultyStars}`;
  }
}

// Add difficulty analysis display
function updateDifficultyDisplay() {
  import('./modules/difficulty.js').then(({ DifficultyManager }) => {
    const analysis = DifficultyManager.analyzeBoardDifficulty(gameState.board);
    
    // Create or update difficulty display element
    let difficultyElement = document.querySelector('.difficulty-info');
    if (!difficultyElement) {
      difficultyElement = document.createElement('div');
      difficultyElement.className = 'difficulty-info';
      difficultyElement.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        color: white;
        z-index: 100;
        display: none; /* Hidden by default, can be toggled for debugging */
      `;
      document.body.appendChild(difficultyElement);
    }
    
    difficultyElement.innerHTML = `
      <div>🎯 Moves: ${analysis.possibleMoves}</div>
      <div>⚡ Cascade: ${analysis.cascadePotential}</div>
      <div>📊 Difficulty: ${analysis.difficultyScore.toFixed(1)}</div>
    `;
    
    // Show difficulty info in console for debugging
    console.log('Board Difficulty Analysis:', analysis);
  }).catch(() => {
    // Ignore if module not available
  });
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

function updateStarProgress() {
  const currentScore = gameState.score;
  const thresholds = gameState.starThresholds;
  
  // Calculate current stars earned
  let starsEarned = 0;
  if (currentScore >= thresholds[2]) starsEarned = 3;
  else if (currentScore >= thresholds[1]) starsEarned = 2;
  else if (currentScore >= thresholds[0]) starsEarned = 1;
  
  // Update stars earned display
  const starsEarnedElement = document.querySelector('.stars-earned');
  if (starsEarnedElement) {
    starsEarnedElement.textContent = `${starsEarned}/3`;
  }
  
  // Calculate progress percentage for the progress bar
  let progressPercentage = 0;
  let nextThreshold = thresholds[0];
  
  if (currentScore >= thresholds[2]) {
    progressPercentage = 100;
  } else if (currentScore >= thresholds[1]) {
    // Between star 2 and star 3
    const progressBetweenStars = (currentScore - thresholds[1]) / (thresholds[2] - thresholds[1]);
    progressPercentage = 66.6 + (progressBetweenStars * 33.4);
    nextThreshold = thresholds[2];
  } else if (currentScore >= thresholds[0]) {
    // Between star 1 and star 2
    const progressBetweenStars = (currentScore - thresholds[0]) / (thresholds[1] - thresholds[0]);
    progressPercentage = 33.3 + (progressBetweenStars * 33.3);
    nextThreshold = thresholds[1];
  } else {
    // Before first star
    progressPercentage = (currentScore / thresholds[0]) * 33.3;
    nextThreshold = thresholds[0];
  }
  
  // Update progress bar
  const progressFill = document.querySelector('.star-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    
    // Add smooth animation
    progressFill.style.transition = 'width 0.5s ease-out';
  }
  
  // Update individual star indicators
  const starIcons = document.querySelectorAll('.star-icon');
  starIcons.forEach((starIcon, index) => {
    const starNumber = index + 1;
    if (starNumber <= starsEarned) {
      starIcon.classList.remove('inactive');
      starIcon.classList.add('active');
      // Add sparkle animation for newly earned stars
      if (starNumber === starsEarned && !starIcon.dataset.animated) {
        starIcon.style.animation = 'starEarned 0.8s ease-out';
        starIcon.dataset.animated = 'true';
        setTimeout(() => {
          starIcon.style.animation = '';
        }, 800);
      }
    } else {
      starIcon.classList.add('inactive');
      starIcon.classList.remove('active');
    }
  });
  
  // Update gameState
  gameState.starsEarned = starsEarned;
  
  // Show progress tooltip on hover
  updateProgressTooltip(currentScore, nextThreshold, starsEarned);
}

function updateProgressTooltip(currentScore, nextThreshold, starsEarned) {
  const starProgress = document.querySelector('.star-progress');
  if (!starProgress) return;
  
  // Remove existing tooltip
  const existingTooltip = starProgress.querySelector('.progress-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create new tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'progress-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 1000;
  `;
  
  if (starsEarned === 3) {
    tooltip.textContent = `Perfect! Level 100% completed! 🌟`;
  } else {
    const pointsNeeded = nextThreshold - currentScore;
    const starNumber = starsEarned + 1;
    const percentage = starNumber === 3 ? '100%' : starNumber === 2 ? '70%' : '40%';
    tooltip.textContent = `${pointsNeeded.toLocaleString()} more points for ${percentage} completion (⭐${starNumber})`;
  }
  
  starProgress.appendChild(tooltip);
  
  // Show tooltip on hover
  starProgress.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
  });
  
  starProgress.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
}

function animateScoreGain(scoreGained, position) {
  // This function can be called when score is gained to show visual feedback
  // It can trigger the star progress update with animation
  updateStarProgress();
  
  // Check if a new star was just earned
  const previousStars = gameState.starsEarned || 0;
  const currentStars = calculateCurrentStars();
  
  if (currentStars > previousStars) {
    showStarEarnedAnimation(currentStars);
  }
}

function calculateCurrentStars() {
  const currentScore = gameState.score;
  const thresholds = gameState.starThresholds;
  
  if (currentScore >= thresholds[2]) return 3;
  if (currentScore >= thresholds[1]) return 2;
  if (currentScore >= thresholds[0]) return 1;
  return 0;
}

function showStarEarnedAnimation(starNumber) {
  // Create a celebration popup for earning a new star
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 2000;
    animation: starCelebration 2s ease-out forwards;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
  `;
  
  const percentage = starNumber === 3 ? '100%' : starNumber === 2 ? '70%' : '40%';
  popup.innerHTML = `
    <div>⭐ STAR EARNED! ⭐</div>
    <div style="font-size: 16px; margin-top: 10px;">${'★'.repeat(starNumber)} ${starNumber}/3 Stars</div>
    <div style="font-size: 14px; margin-top: 5px;">${percentage} Level Completion!</div>
  `;
  
  document.body.appendChild(popup);
  
  // Remove popup after animation
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 2000);
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

// Debug toggle for difficulty display
function toggleDifficultyDisplay() {
  const difficultyElement = document.querySelector('.difficulty-info');
  if (difficultyElement) {
    difficultyElement.style.display = difficultyElement.style.display === 'none' ? 'block' : 'none';
  }
}

// Add keyboard shortcut for debugging (press 'D' key)
document.addEventListener('keydown', function(e) {
  if (e.key.toLowerCase() === 'd' && e.ctrlKey) {
    e.preventDefault();
    toggleDifficultyDisplay();
    console.log('Difficulty display toggled');
  }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initGame('adventure');
});

// Add modern UI update function
function updateModernUI(unlockedFeatures) {
  // Update hint button availability
  updateHintButton();
  
  // Update player level display
  updatePlayerLevelDisplay();
  
  // Update social sharing options
  updateSocialFeatures();
  
  // Show newly unlocked features
  if (unlockedFeatures.length > 0) {
    showUnlockedFeaturesNotification(unlockedFeatures);
  }
}

function updateHintButton() {
  const hintButton = document.getElementById('hintButton');
  const unlockedFeatures = ModernProgression.unlockFeatures();
  
  if (unlockedFeatures.includes('ai_hints')) {
    if (!hintButton) {
      createHintButton();
    }
    document.getElementById('hintButton').style.display = 'block';
  } else {
    if (hintButton) {
      hintButton.style.display = 'none';
    }
  }
}

function createHintButton() {
  const gameContainer = document.querySelector('.game-container');
  const hintButton = document.createElement('button');
  hintButton.id = 'hintButton';
  hintButton.className = 'modern-button';
  hintButton.innerHTML = '🤖 AI Hint';
  hintButton.onclick = () => AIHintSystem.showHint();
  hintButton.title = 'Get AI-powered move suggestion (Press H)';
  
  hintButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: none;
  `;
  
  gameContainer.appendChild(hintButton);
}

function updatePlayerLevelDisplay() {
  const levelInfo = ModernProgression.calculatePlayerLevel();
  const levelDisplay = document.getElementById('playerLevelDisplay');
  
  if (!levelDisplay) {
    createPlayerLevelDisplay();
  }
  
  document.getElementById('playerLevelDisplay').innerHTML = `
    <div class="player-level">
      <span class="level-number">Lv.${levelInfo.level}</span>
      <div class="exp-bar">
        <div class="exp-progress" style="width: ${levelInfo.progress}%"></div>
      </div>
      <span class="exp-text">${levelInfo.currentExp}/${levelInfo.requiredExp}</span>
    </div>
  `;
}

function createPlayerLevelDisplay() {
  const header = document.querySelector('.header');
  const levelDisplay = document.createElement('div');
  levelDisplay.id = 'playerLevelDisplay';
  levelDisplay.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.3);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
  `;
  header.appendChild(levelDisplay);
}

function updateSocialFeatures() {
  const shareButton = document.getElementById('shareButton');
  
  if (!shareButton) {
    createShareButton();
  }
}

function createShareButton() {
  const gameContainer = document.querySelector('.game-container');
  const shareButton = document.createElement('button');
  shareButton.id = 'shareButton';
  shareButton.className = 'modern-button';
  shareButton.innerHTML = '📱 Share Score';
  shareButton.onclick = () => SocialSystem.shareScore(gameState.score, gameState.adventureLevel);
  shareButton.title = 'Share your amazing score!';
  
  shareButton.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
  `;
  
  gameContainer.appendChild(shareButton);
}

function showUnlockedFeaturesNotification(features) {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div class="unlock-notification">
      <h3>🎉 New Features Unlocked!</h3>
      <ul>
        ${features.map(feature => `<li>${formatFeatureName(feature)}</li>`).join('')}
      </ul>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    z-index: 3000;
    animation: slideInDown 0.5s ease-out;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

function formatFeatureName(feature) {
  const featureNames = {
    'speed_mode': '⚡ Speed Mode',
    'daily_challenges': '📅 Daily Challenges', 
    'tournament_mode': '🏆 Tournament Mode',
    'custom_themes': '🎨 Custom Themes',
    'ai_hints': '🤖 AI Hints'
  };
  return featureNames[feature] || feature;
}

// Add CSS for slide in animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInDown {
    0% {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    100% {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  .exp-bar {
    width: 100px;
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    margin: 2px 0;
    overflow: hidden;
  }
  
  .exp-progress {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.5s ease;
  }
  
  .player-level {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  
  .level-number {
    font-weight: bold;
    font-size: 14px;
  }
  
  .exp-text {
    font-size: 10px;
    opacity: 0.8;
  }
`;
document.head.appendChild(styleSheet);

// Modern Settings Panel Functions
function toggleSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    loadSettingStates();
  } else {
    panel.style.display = 'none';
  }
}
// Make immediately available
window.toggleSettingsPanel = toggleSettingsPanel;

function loadSettingStates() {
  // Load saved settings
  document.getElementById('reducedMotion').checked = localStorage.getItem('reducedMotion') === 'true';
  document.getElementById('highContrast').checked = localStorage.getItem('highContrast') === 'true';
  document.getElementById('largeText').checked = localStorage.getItem('largeText') === 'true';
  document.getElementById('autoHints').checked = localStorage.getItem('autoHints') === 'true';
  document.getElementById('showPossibleMoves').checked = localStorage.getItem('showPossibleMoves') !== 'false';
  document.getElementById('particleEffects').checked = localStorage.getItem('particleEffects') !== 'false';
}

function toggleReducedMotion() {
  const enabled = document.getElementById('reducedMotion').checked;
  if (enabled) {
    AccessibilityFeatures.enableReducedMotion();
  } else {
    document.body.classList.remove('reduced-motion');
    localStorage.setItem('reducedMotion', 'false');
  }
}
// Make immediately available
window.toggleReducedMotion = toggleReducedMotion;

function toggleHighContrast() {
  const enabled = document.getElementById('highContrast').checked;
  if (enabled) {
    AccessibilityFeatures.enableHighContrast();
  } else {
    document.body.classList.remove('high-contrast');
    localStorage.setItem('highContrast', 'false');
  }
}
// Make immediately available
window.toggleHighContrast = toggleHighContrast;

function toggleLargeText() {
  const enabled = document.getElementById('largeText').checked;
  if (enabled) {
    AccessibilityFeatures.enableLargeText();
  } else {
    document.body.classList.remove('large-text');
    localStorage.setItem('largeText', 'false');
  }
}
// Make immediately available
window.toggleLargeText = toggleLargeText;

function toggleAutoHints() {
  const enabled = document.getElementById('autoHints').checked;
  localStorage.setItem('autoHints', enabled.toString());
  
  if (enabled && ModernProgression.unlockFeatures().includes('ai_hints')) {
    startAutoHintTimer();
  } else {
    clearAutoHintTimer();
  }
}
// Make immediately available
window.toggleAutoHints = toggleAutoHints;

let autoHintTimer = null;

function startAutoHintTimer() {
  clearAutoHintTimer();
  autoHintTimer = setTimeout(() => {
    if (findPossibleMoves().length > 0 && localStorage.getItem('autoHints') === 'true') {
      AIHintSystem.showHint();
    }
  }, 15000); // Show hint after 15 seconds of inactivity
}

function clearAutoHintTimer() {
  if (autoHintTimer) {
    clearTimeout(autoHintTimer);
    autoHintTimer = null;
  }
}

function toggleShowMoves() {
  const enabled = document.getElementById('showPossibleMoves').checked;
  localStorage.setItem('showPossibleMoves', enabled.toString());
  
  if (enabled) {
    highlightPossibleMoves();
  } else {
    document.querySelectorAll('.possible-move').forEach(el => {
      el.classList.remove('possible-move');
    });
  }
}
// Make immediately available
window.toggleShowMoves = toggleShowMoves;

function toggleParticleEffects() {
  const enabled = document.getElementById('particleEffects').checked;
  localStorage.setItem('particleEffects', enabled.toString());
  document.body.classList.toggle('no-particles', !enabled);
}
// Make immediately available
window.toggleParticleEffects = toggleParticleEffects;

function exportGameData() {
  const gameData = {
    version: '2025.1',
    timestamp: new Date().toISOString(),
    gameState: gameState,
    settings: {
      reducedMotion: localStorage.getItem('reducedMotion'),
      highContrast: localStorage.getItem('highContrast'),
      largeText: localStorage.getItem('largeText'),
      autoHints: localStorage.getItem('autoHints'),
      showPossibleMoves: localStorage.getItem('showPossibleMoves'),
      particleEffects: localStorage.getItem('particleEffects')
    },
    metrics: JSON.parse(localStorage.getItem('gameMetrics') || '{}'),
    recentScores: JSON.parse(localStorage.getItem('recentScores') || '[]')
  };
  
  const dataStr = JSON.stringify(gameData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `color-rush-save-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showMessage('Game data exported successfully! 💾', 'success');
}
// Make immediately available
window.exportGameData = exportGameData;

function clearGameData() {
  if (confirm('⚠️ This will delete ALL your progress, settings, and statistics. This cannot be undone. Are you sure?')) {
    localStorage.clear();
    showMessage('All game data cleared. Refreshing game...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}
// Make immediately available
window.clearGameData = clearGameData;

function showPerformanceStats() {
  const metrics = PerformanceTracker.trackGameMetrics();
  const playerLevel = ModernProgression.calculatePlayerLevel();
  const recentScores = PerformanceTracker.getRecentScores();
  
  const statsModal = document.createElement('div');
  statsModal.className = 'stats-modal';
  statsModal.innerHTML = `
    <div class="stats-content">
      <h3>📊 Performance Statistics</h3>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${playerLevel.level}</div>
          <div class="stat-label">Player Level</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gameState.score.toLocaleString()}</div>
          <div class="stat-label">Total Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gameState.gamesPlayed || 1}</div>
          <div class="stat-label">Games Played</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${metrics.avgSessionTime}s</div>
          <div class="stat-label">Avg Session Time</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${metrics.completionRate.toFixed(1)}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${metrics.skillProgression > 0 ? '+' : ''}${metrics.skillProgression.toFixed(1)}%</div>
          <div class="stat-label">Skill Progression</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${gameState.adventureLevel || 1}</div>
          <div class="stat-label">Adventure Level</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${recentScores.length > 0 ? Math.max(...recentScores).toLocaleString() : '0'}</div>
          <div class="stat-label">Best Score</div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button class="modern-button" onclick="closeStatsModal()">✅ Close</button>
        <button class="modern-button" onclick="SocialSystem.shareScore(${gameState.score}, ${gameState.adventureLevel || 1})">
          📱 Share Stats
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(statsModal);
  
  // Close modal when clicking outside
  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) {
      closeStatsModal();
    }
  });
}
// Make immediately available
window.showPerformanceStats = showPerformanceStats;

function closeStatsModal() {
  const modal = document.querySelector('.stats-modal');
  if (modal) {
    modal.remove();
  }
}
// Make immediately available
window.closeStatsModal = closeStatsModal;

function restartGame() {
  if (confirm('🔄 Restart current game? Your progress in this level will be lost.')) {
    initGame(gameState.gameMode);
    showMessage('Game restarted! 🎮', 'info');
  }
}
// Make immediately available
window.restartGame = restartGame;

// Make modern features globally accessible
window.AIHintSystem = AIHintSystem;
window.SocialSystem = SocialSystem;
window.ModernProgression = ModernProgression;
window.PerformanceTracker = PerformanceTracker;
window.AccessibilityFeatures = AccessibilityFeatures;

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================
// Initialize the game automatically when the script loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎮 Color Rush: Cascade Challenge starting...');
  
  // Initialize immediately with basic features
  setTimeout(() => {
    initGame('adventure');
    console.log('🚀 Game initialized successfully!');
  }, 100);
});

// Also initialize if DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  console.log('🎮 Document already loaded, initializing now...');
  setTimeout(() => {
    initGame('adventure');
    console.log('🚀 Game auto-initialized!');
  }, 100);
}