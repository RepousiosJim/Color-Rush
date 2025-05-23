// Game State Management Module
// Color Rush: Cascade Challenge - Modern 2025 Edition

export const gameState = {
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
  
  // Boosters/Power-ups
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
  processingTimeout: null
};

// Game state management functions
export const resetGameState = (mode) => {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
  
  if (gameState.processingTimeout) {
    clearTimeout(gameState.processingTimeout);
    gameState.processingTimeout = null;
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
};

export const selectShape = (row, col) => {
  gameState.selectedShape = { row, col };
  const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (element) {
    element.classList.add('selected');
  }
};

export const deselectShape = () => {
  if (gameState.selectedShape) {
    const element = document.querySelector(`[data-row="${gameState.selectedShape.row}"][data-col="${gameState.selectedShape.col}"]`);
    if (element) {
      element.classList.remove('selected');
    }
    gameState.selectedShape = null;
  }
};

export const updateMoveCount = () => {
  if (gameState.currentObjective?.type === 'moves_limit') {
    gameState.movesLeft--;
  }
};

export const addExtraMoves = () => {
  if (gameState.currentObjective?.type === 'moves_limit') {
    gameState.movesLeft += 5;
  }
};

export const addExtraTime = () => {
  if (gameState.currentObjective?.type === 'time_limit') {
    gameState.timeLeft += 30;
  }
};

export const checkObjectiveProgress = () => {
  if (!gameState.currentObjective) return;
  
  const obj = gameState.currentObjective;
  
  switch (obj.type) {
    case 'score':
      obj.progress = gameState.score;
      break;
      
    case 'moves_limit':
      // Progress is tracked by remaining moves (inverse progress)
      obj.progress = Math.max(0, obj.target - gameState.movesLeft);
      break;
      
    case 'time_limit':
      // Progress is tracked by elapsed time (inverse progress)
      obj.progress = Math.max(0, obj.target - gameState.timeLeft);
      break;
      
    default:
      // TODO: Add support for additional objective types as they are implemented
      // Examples: collect specific items, clear obstacles, achieve cascades, etc.
      console.warn(`Objective type '${obj.type}' not implemented in checkObjectiveProgress`);
      break;
  }
  
  // Check if objective is completed
  if (obj.type === 'score' && gameState.score >= obj.target) {
    obj.completed = true;
  } else if (obj.type === 'moves_limit' && gameState.movesLeft <= 0) {
    // For moves_limit, completion depends on achieving other goals within moves
    obj.completed = gameState.score >= (obj.scoreTarget || 5000);
  } else if (obj.type === 'time_limit' && gameState.timeLeft <= 0) {
    // For time_limit, completion depends on achieving goals within time
    obj.completed = gameState.score >= (obj.scoreTarget || 5000);
  }
}; 