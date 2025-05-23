// Color Rush: Spectrum Challenge - Game Frame

/**
 * Game States
 * MENU: Main menu
 * PLAYING: Game in progress
 * PAUSED: Game paused
 * GAME_OVER: Game over screen
 */
const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
};

// Game configuration
const GRID_SIZE = 4; // 4x4 grid
const SHAPES = ['circle', 'triangle', 'square'];
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'];

let currentState = GAME_STATES.MENU;
let currentLevel = 1;
let moves = 0;
let selectedShape = null;
let gameBoard = [];
let targetPattern = [];

const gameRoot = document.getElementById('game-root');

// Generate a random shape with color
const generateShape = () => ({
  type: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  color: COLORS[Math.floor(Math.random() * COLORS.length)]
});

// Initialize game board
const initializeBoard = () => {
  gameBoard = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    gameBoard.push(generateShape());
  }
  // Create target pattern by shuffling the board
  targetPattern = [...gameBoard].sort(() => Math.random() - 0.5);
};

// Check if current board matches target pattern
const checkWin = () => {
  return gameBoard.every((shape, index) => 
    shape.type === targetPattern[index].type && 
    shape.color === targetPattern[index].color
  );
};

// Swap two shapes on the board
const swapShapes = (index1, index2) => {
  [gameBoard[index1], gameBoard[index2]] = [gameBoard[index2], gameBoard[index1]];
  moves++;
  if (checkWin()) {
    handleLevelComplete();
  }
};

const renderMenu = () => {
  gameRoot.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-6">
      <h1 class="text-4xl font-bold text-cyan-400 mb-2">Color Rush</h1>
      <p class="text-lg text-gray-300 mb-4">Spectrum Challenge</p>
      <button id="start-btn" class="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-300" aria-label="Start Game">Start Game</button>
    </div>
  `;
  document.getElementById('start-btn').addEventListener('click', handleStartGame);
};

const renderGame = () => {
  gameRoot.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-6 w-full">
      <div class="flex justify-between items-center w-full">
        <h2 class="text-2xl font-semibold text-cyan-300">Level ${currentLevel}</h2>
        <span class="text-cyan-200">Moves: ${moves}</span>
      </div>
      
      <div class="grid grid-cols-4 gap-2 mb-4">
        ${targetPattern.map((shape, index) => `
          <div class="w-16 h-16 flex items-center justify-center" style="background: ${shape.color}">
            <div class="w-12 h-12 ${shape.type === 'circle' ? 'rounded-full' : shape.type === 'triangle' ? 'triangle' : ''}" 
                 style="background: white; opacity: 0.3;"></div>
          </div>
        `).join('')}
      </div>

      <div class="grid grid-cols-4 gap-2">
        ${gameBoard.map((shape, index) => `
          <div class="w-16 h-16 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
               style="background: ${shape.color}"
               data-index="${index}"
               role="button"
               tabindex="0"
               aria-label="Shape ${index + 1}">
            <div class="w-12 h-12 ${shape.type === 'circle' ? 'rounded-full' : shape.type === 'triangle' ? 'triangle' : ''}" 
                 style="background: white; opacity: 0.3;"></div>
          </div>
        `).join('')}
      </div>

      <button id="menu-btn" class="mt-4 px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-300" aria-label="Back to Menu">Back to Menu</button>
    </div>
  `;

  // Add click and keyboard event listeners to shapes
  const shapes = gameRoot.querySelectorAll('[data-index]');
  shapes.forEach(shape => {
    shape.addEventListener('click', handleShapeClick);
    shape.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleShapeClick(e);
      }
    });
  });

  document.getElementById('menu-btn').addEventListener('click', handleBackToMenu);
};

const handleShapeClick = (e) => {
  const index = parseInt(e.currentTarget.dataset.index);
  
  if (selectedShape === null) {
    selectedShape = index;
    e.currentTarget.classList.add('ring-2', 'ring-white');
  } else {
    if (selectedShape !== index) {
      swapShapes(selectedShape, index);
      renderGame();
    }
    selectedShape = null;
  }
};

const handleLevelComplete = () => {
  setTimeout(() => {
    alert(`Level ${currentLevel} Complete! Moves: ${moves}`);
    currentLevel++;
    moves = 0;
    initializeBoard();
    renderGame();
  }, 100);
};

const handleStartGame = () => {
  currentLevel = 1;
  moves = 0;
  initializeBoard();
  currentState = GAME_STATES.PLAYING;
  render();
};

const handleBackToMenu = () => {
  currentState = GAME_STATES.MENU;
  render();
};

const render = () => {
  switch (currentState) {
    case GAME_STATES.MENU:
      renderMenu();
      break;
    case GAME_STATES.PLAYING:
      renderGame();
      break;
    default:
      renderMenu();
  }
};

// Initial render
render(); 