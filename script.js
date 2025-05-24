// Elemental Bejeweled - Working Core Version
// Simplified elemental match-3 without complex systems

// Game configuration
const BOARD_SIZE = 8;

// Simplified Elemental Gems
const ELEMENTAL_GEMS = [
    { symbol: '🔥', name: 'fire', color: '#FF4500' },
    { symbol: '💧', name: 'water', color: '#1E90FF' },
    { symbol: '🌍', name: 'earth', color: '#8B4513' },
    { symbol: '💨', name: 'air', color: '#87CEEB' },
    { symbol: '⚡', name: 'lightning', color: '#FFD700' },
    { symbol: '🌿', name: 'nature', color: '#32CD32' },
    { symbol: '🔮', name: 'magic', color: '#9932CC' }
];

// Game state
let board = [];
let score = 0;
let level = 1;
let targetScore = 1000;
let selectedGem = null;
let isAnimating = false;
let moves = 0;
let comboMultiplier = 1;

// DOM elements
let gameBoard;
let scoreDisplay;
let levelDisplay;
let targetDisplay;
let movesDisplay;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚡ Initializing Elemental Bejeweled...');
    
    gameBoard = document.querySelector('.game-board');
    initializeUI();
    
    if (!gameBoard) {
        console.error('Game board not found!');
        return;
    }
    
    initializeGame();
});

// Initialize UI elements
function initializeUI() {
    scoreDisplay = document.getElementById('score') || createDisplay('score', 'Score: 0');
    levelDisplay = document.getElementById('level') || createDisplay('level', 'Level: 1');
    targetDisplay = document.getElementById('target') || createDisplay('target', 'Target: 1000');
    movesDisplay = document.getElementById('moves') || createDisplay('moves', 'Moves: 0');
}

// Create display element
function createDisplay(id, text) {
    const display = document.createElement('div');
    display.id = id;
    display.className = 'game-stat';
    display.textContent = text;
    
    // Add to existing game stats container or create one
    let statsContainer = document.querySelector('.game-stats');
    if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'game-stats';
        document.body.insertBefore(statsContainer, gameBoard);
    }
    statsContainer.appendChild(display);
    
    return display;
}

// Initialize the complete game
function initializeGame() {
    console.log('🎯 Starting new Elemental Bejeweled game...');
    
    // Reset game state
    gameBoard.innerHTML = '';
    board = [];
    score = 0;
    level = 1;
    targetScore = 1000;
    selectedGem = null;
    isAnimating = false;
    moves = 0;
    comboMultiplier = 1;
    
    // Create initial board without matches
    createBoard();
    
    // Render the board
    renderBoard();
    
    // Update displays
    updateAllDisplays();
    
    console.log('✅ Elemental Bejeweled initialized successfully!');
}

// Create the game board data structure
function createBoard() {
    console.log('💎 Creating elemental gem board...');
    
    // Initialize empty board structure first
    board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
    }
    
    // Fill board with elemental gems, avoiding initial matches
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            let gem;
            let attempts = 0;
            
            do {
                gem = createRandomElementalGem();
                attempts++;
            } while (wouldCreateMatch(row, col, gem.type) && attempts < 50);
            
            board[row][col] = gem;
        }
    }
    
    console.log('💎 Elemental gem board created successfully');
}

// Create a random elemental gem
function createRandomElementalGem() {
    const gemType = ELEMENTAL_GEMS[Math.floor(Math.random() * ELEMENTAL_GEMS.length)];
    return {
        type: gemType.name,
        symbol: gemType.symbol,
        color: gemType.color,
        id: Math.random().toString(36).substr(2, 9)
    };
}

// Check if placing a gem would create an immediate match
function wouldCreateMatch(row, col, gemType) {
    // Check horizontal matches
    let horizontalCount = 1;
    
    // Check left
    for (let c = col - 1; c >= 0; c--) {
        if (board[row] && board[row][c] && board[row][c].type === gemType) {
            horizontalCount++;
        } else {
            break;
        }
    }
    
    // Check right
    for (let c = col + 1; c < BOARD_SIZE; c++) {
        if (board[row] && board[row][c] && board[row][c].type === gemType) {
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
        if (board[r] && board[r][col] && board[r][col].type === gemType) {
            verticalCount++;
        } else {
            break;
        }
    }
    
    // Check down
    for (let r = row + 1; r < BOARD_SIZE; r++) {
        if (board[r] && board[r][col] && board[r][col].type === gemType) {
            verticalCount++;
        } else {
            break;
        }
    }
    
    if (verticalCount >= 3) return true;
    
    return false;
}

// Render the board to DOM
function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const gem = board[row][col];
            if (gem) {
                const gemElement = createGemElement(gem, row, col);
                gameBoard.appendChild(gemElement);
            }
        }
    }
}

// Create a gem DOM element
function createGemElement(gem, row, col) {
    const element = document.createElement('div');
    element.className = `gem ${gem.type}`;
    
    element.textContent = gem.symbol;
    element.dataset.row = row;
    element.dataset.col = col;
    element.dataset.type = gem.type;
    element.style.backgroundColor = gem.color;
    element.style.gridRow = row + 1;
    element.style.gridColumn = col + 1;
    
    // Add click handler
    element.addEventListener('click', handleGemClick);
    
    return element;
}

// Handle gem click for selection and swapping
function handleGemClick(event) {
    if (isAnimating) return;
    
    const clickedElement = event.target;
    const row = parseInt(clickedElement.dataset.row);
    const col = parseInt(clickedElement.dataset.col);
    
    console.log(`💎 Clicked gem at [${row}][${col}]`);
    
    if (!selectedGem) {
        // Select this gem
        selectGem(clickedElement, row, col);
    } else {
        // Try to swap with selected gem
        const selectedRow = selectedGem.row;
        const selectedCol = selectedGem.col;
        
        if (row === selectedRow && col === selectedCol) {
            // Clicking same gem - deselect
            deselectGem();
        } else if (isAdjacent(selectedRow, selectedCol, row, col)) {
            // Adjacent gem - attempt swap
            attemptSwap(selectedRow, selectedCol, row, col);
        } else {
            // Not adjacent - select new gem
            deselectGem();
            selectGem(clickedElement, row, col);
        }
    }
}

// Select a gem
function selectGem(element, row, col) {
    selectedGem = { element, row, col };
    element.classList.add('selected');
    console.log(`✅ Selected gem at [${row}][${col}]`);
}

// Deselect current gem
function deselectGem() {
    if (selectedGem) {
        selectedGem.element.classList.remove('selected');
        selectedGem = null;
        console.log('❌ Deselected gem');
    }
}

// Check if two positions are adjacent
function isAdjacent(row1, col1, row2, col2) {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Attempt to swap two gems
async function attemptSwap(row1, col1, row2, col2) {
    console.log(`🔄 Attempting swap: [${row1}][${col1}] ↔ [${row2}][${col2}]`);
    
    isAnimating = true;
    moves++;
    updateMovesDisplay();
    
    // Swap in board
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    // Check for matches
    const matches = findMatches();
    
    if (matches.length > 0) {
        console.log(`✅ Valid swap! Found ${matches.length} matches`);
        
        // Valid move - update visuals and process matches
        renderBoard();
        deselectGem();
        
        // Process all matches and cascades
        comboMultiplier = 1;
        await processMatches();
        
        // Check for level completion
        checkLevelCompletion();
        
    } else {
        console.log('❌ Invalid swap - no matches created');
        
        // Invalid move - swap back
        board[row1][col1] = board[row2][col2];
        board[row2][col2] = temp;
        moves--; // Don't count invalid moves
        
        // Show invalid move feedback
        showInvalidMove();
        deselectGem();
        updateMovesDisplay();
    }
    
    isAnimating = false;
}

// Find all matches on the board
function findMatches() {
    const matches = [];
    
    // Find horizontal matches
    for (let row = 0; row < BOARD_SIZE; row++) {
        let count = 1;
        let currentType = board[row][0]?.type;
        
        for (let col = 1; col < BOARD_SIZE; col++) {
            if (board[row][col]?.type === currentType && currentType) {
                count++;
            } else {
                if (count >= 3 && currentType) {
                    const match = [];
                    for (let i = col - count; i < col; i++) {
                        match.push({ row, col: i });
                    }
                    matches.push({ positions: match, size: count });
                }
                count = 1;
                currentType = board[row][col]?.type;
            }
        }
        
        // Check end of row
        if (count >= 3 && currentType) {
            const match = [];
            for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
                match.push({ row, col: i });
            }
            matches.push({ positions: match, size: count });
        }
    }
    
    // Find vertical matches
    for (let col = 0; col < BOARD_SIZE; col++) {
        let count = 1;
        let currentType = board[0][col]?.type;
        
        for (let row = 1; row < BOARD_SIZE; row++) {
            if (board[row][col]?.type === currentType && currentType) {
                count++;
            } else {
                if (count >= 3 && currentType) {
                    const match = [];
                    for (let i = row - count; i < row; i++) {
                        match.push({ row: i, col });
                    }
                    matches.push({ positions: match, size: count });
                }
                count = 1;
                currentType = board[row][col]?.type;
            }
        }
        
        // Check end of column
        if (count >= 3 && currentType) {
            const match = [];
            for (let i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
                match.push({ row: i, col });
            }
            matches.push({ positions: match, size: count });
        }
    }
    
    return matches;
}

// Process matches and handle cascades
async function processMatches() {
    let totalMatches = 0;
    
    while (true) {
        const matches = findMatches();
        if (matches.length === 0) break;
        
        totalMatches += matches.length;
        
        // Remove matched gems
        removeMatches(matches);
        
        // Calculate and add score with combo multiplier
        const matchScore = calculateScore(matches) * comboMultiplier;
        updateScore(matchScore);
        comboMultiplier++;
        
        // Wait for removal animation
        await sleep(300);
        
        // Apply gravity
        applyGravity();
        
        // Fill empty spaces
        fillEmptySpaces();
        
        // Re-render board
        renderBoard();
        
        // Wait for drop animation
        await sleep(400);
    }
    
    if (totalMatches > 0) {
        console.log(`💎 Processed ${totalMatches} total matches with ${comboMultiplier - 1}x combo!`);
    }
}

// Remove matched gems from board
function removeMatches(matches) {
    matches.forEach(match => {
        match.positions.forEach(pos => {
            if (board[pos.row] && board[pos.row][pos.col]) {
                console.log(`💥 Removing gem at [${pos.row}][${pos.col}]`);
                board[pos.row][pos.col] = null;
                
                // Add visual effect
                const element = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
                if (element) {
                    element.classList.add('matched');
                }
            }
        });
    });
}

// Calculate score for matches
function calculateScore(matches) {
    let totalScore = 0;
    matches.forEach(match => {
        // Base score increases with match size
        const baseScore = match.size === 3 ? 50 : 
                         match.size === 4 ? 150 : 
                         match.size === 5 ? 300 : 
                         match.size * 100;
        totalScore += baseScore;
    });
    return totalScore;
}

// Apply gravity - make gems fall down
function applyGravity() {
    for (let col = 0; col < BOARD_SIZE; col++) {
        // Get all non-null gems in this column
        const gems = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (board[row][col]) {
                gems.push(board[row][col]);
                board[row][col] = null;
            }
        }
        
        // Place gems at bottom
        for (let i = 0; i < gems.length; i++) {
            board[BOARD_SIZE - 1 - i][col] = gems[gems.length - 1 - i];
        }
    }
}

// Fill empty spaces with new gems
function fillEmptySpaces() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (!board[row][col]) {
                board[row][col] = createRandomElementalGem();
            }
        }
    }
}

// Check for level completion
function checkLevelCompletion() {
    if (score >= targetScore) {
        level++;
        targetScore = level * 1000 + (level - 1) * 500; // Progressive target
        
        console.log(`🎉 Level ${level - 1} complete! Advancing to level ${level}`);
        
        // Show level completion message
        showLevelComplete();
        
        // Update displays
        updateAllDisplays();
    }
}

// Show level completion animation
function showLevelComplete() {
    const message = document.createElement('div');
    message.className = 'level-complete';
    message.textContent = `Level ${level - 1} Complete!`;
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: white;
        padding: 20px 40px;
        font-size: 24px;
        font-weight: bold;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 1000;
        animation: levelComplete 3s ease-in-out forwards;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Update all game displays
function updateAllDisplays() {
    updateScore(0);
    updateLevelDisplay();
    updateTargetDisplay();
    updateMovesDisplay();
}

// Update score display
function updateScore(points) {
    score += points;
    if (scoreDisplay) {
        scoreDisplay.textContent = `Score: ${score.toLocaleString()}`;
    }
    
    if (points > 0) {
        console.log(`💎 +${points} points! Total: ${score}`);
    }
}

// Update level display
function updateLevelDisplay() {
    if (levelDisplay) {
        levelDisplay.textContent = `Level: ${level}`;
    }
}

// Update target display
function updateTargetDisplay() {
    if (targetDisplay) {
        const remaining = Math.max(0, targetScore - score);
        targetDisplay.textContent = `Target: ${remaining.toLocaleString()}`;
    }
}

// Update moves display
function updateMovesDisplay() {
    if (movesDisplay) {
        movesDisplay.textContent = `Moves: ${moves}`;
    }
}

// Show invalid move feedback
function showInvalidMove() {
    if (selectedGem) {
        const element = selectedGem.element;
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Utility function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Restart game function (for global access)
function restartGame() {
    console.log('🔄 Restarting Elemental Bejeweled...');
    initializeGame();
}

// Global functions
window.restartGame = restartGame;
window.initGame = function(mode) { initializeGame(); };

console.log('⚡ Elemental Bejeweled Core loaded successfully!'); 