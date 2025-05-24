// Elemental Bejeweled - GitHub Pages Compatible Version
// Enhanced compatibility for all browsers and GitHub Pages

// Compatibility checks and polyfills
(function() {
    'use strict';
    
    // Console polyfill for older browsers
    if (!window.console) {
        window.console = {
            log: function() {},
            error: function() {},
            warn: function() {}
        };
    }
    
    // Basic Promise polyfill check
    if (!window.Promise) {
        console.warn('Promise not supported, some animations may be synchronous');
        window.Promise = function(executor) {
            executor(function(){}, function(){});
        };
        Promise.prototype.then = function(callback) {
            if (callback) callback();
            return this;
        };
    }
})();

// Game configuration
var BOARD_SIZE = 8;

// Simplified Elemental Gems (using var for compatibility)
var ELEMENTAL_GEMS = [
    { symbol: '🔥', name: 'fire', color: '#FF4500' },
    { symbol: '💧', name: 'water', color: '#1E90FF' },
    { symbol: '🌍', name: 'earth', color: '#8B4513' },
    { symbol: '💨', name: 'air', color: '#87CEEB' },
    { symbol: '⚡', name: 'lightning', color: '#FFD700' },
    { symbol: '🌿', name: 'nature', color: '#32CD32' },
    { symbol: '🔮', name: 'magic', color: '#9932CC' }
];

// Game state (using var for older browser compatibility)
var board = [];
var score = 0;
var level = 1;
var targetScore = 1000;
var selectedGem = null;
var isAnimating = false;
var moves = 0;
var comboMultiplier = 1;

// DOM elements
var gameBoard;
var scoreDisplay;
var levelDisplay;
var targetDisplay;
var movesDisplay;

// Initialize game when DOM is loaded (enhanced compatibility)
function initializeOnLoad() {
    console.log('⚡ Initializing Elemental Bejeweled...');
    
    gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
    initializeUI();
    
    if (!gameBoard) {
        console.error('Game board not found!');
        // Try to create game board if it doesn't exist
        gameBoard = document.createElement('div');
        gameBoard.className = 'game-board';
        gameBoard.id = 'gameBoard';
        var container = document.querySelector('.game-container') || document.body;
        container.appendChild(gameBoard);
    }
    
    try {
        initializeGame();
    } catch (error) {
        console.error('Game initialization failed:', error);
        // Fallback initialization
        setTimeout(function() {
            try {
                initializeGame();
            } catch (e) {
                console.error('Fallback initialization also failed:', e);
                alert('Game failed to load. Please refresh the page.');
            }
        }, 1000);
    }
}

// Enhanced DOM ready detection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnLoad);
} else {
    // Document already loaded
    setTimeout(initializeOnLoad, 100);
}

// Fallback for very old browsers
window.addEventListener ? 
    window.addEventListener('load', initializeOnLoad) : 
    window.attachEvent('onload', initializeOnLoad);

// Initialize UI elements
function initializeUI() {
    scoreDisplay = document.getElementById('score') || createDisplay('score', 'Score: 0');
    levelDisplay = document.getElementById('level') || createDisplay('level', 'Level: 1');
    targetDisplay = document.getElementById('target') || createDisplay('target', 'Target: 1000');
    movesDisplay = document.getElementById('moves') || createDisplay('moves', 'Moves: 0');
}

// Create display element
function createDisplay(id, text) {
    var display = document.createElement('div');
    display.id = id;
    display.className = 'game-stat';
    display.textContent = text;
    
    // Add to existing game stats container or create one
    var statsContainer = document.querySelector('.game-stats');
    if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'game-stats';
        var gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
        if (gameBoard && gameBoard.parentNode) {
            gameBoard.parentNode.insertBefore(statsContainer, gameBoard);
        } else {
            document.body.appendChild(statsContainer);
        }
    }
    statsContainer.appendChild(display);
    
    return display;
}

// Initialize the complete game
function initializeGame() {
    console.log('🎯 Starting new Elemental Bejeweled game...');
    
    // Reset game state
    if (gameBoard) {
        gameBoard.innerHTML = '';
    }
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
    for (var row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
    }
    
    // Fill board with elemental gems, avoiding initial matches
    for (var row = 0; row < BOARD_SIZE; row++) {
        for (var col = 0; col < BOARD_SIZE; col++) {
            var gem;
            var attempts = 0;
            
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
    var gemType = ELEMENTAL_GEMS[Math.floor(Math.random() * ELEMENTAL_GEMS.length)];
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
    var horizontalCount = 1;
    
    // Check left
    for (var c = col - 1; c >= 0; c--) {
        if (board[row] && board[row][c] && board[row][c].type === gemType) {
            horizontalCount++;
  } else {
            break;
        }
    }
    
    // Check right
    for (var c = col + 1; c < BOARD_SIZE; c++) {
        if (board[row] && board[row][c] && board[row][c].type === gemType) {
            horizontalCount++;
    } else {
            break;
        }
    }
    
    if (horizontalCount >= 3) return true;
    
    // Check vertical matches
    var verticalCount = 1;
    
    // Check up
    for (var r = row - 1; r >= 0; r--) {
        if (board[r] && board[r][col] && board[r][col].type === gemType) {
            verticalCount++;
      } else {
            break;
        }
    }
    
    // Check down
    for (var r = row + 1; r < BOARD_SIZE; r++) {
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
    if (!gameBoard) return;
    
    gameBoard.innerHTML = '';
    
    for (var row = 0; row < BOARD_SIZE; row++) {
        for (var col = 0; col < BOARD_SIZE; col++) {
            var gem = board[row][col];
            if (gem) {
                var gemElement = createGemElement(gem, row, col);
                gameBoard.appendChild(gemElement);
            }
        }
    }
}

// Create a gem DOM element
function createGemElement(gem, row, col) {
    var element = document.createElement('div');
    element.className = 'gem ' + gem.type;
    
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
    
    var clickedElement = event.target;
    var row = parseInt(clickedElement.dataset.row);
    var col = parseInt(clickedElement.dataset.col);
    
    console.log('💎 Clicked gem at [' + row + '][' + col + ']');
    
    if (!selectedGem) {
        // Select this gem
        selectGem(clickedElement, row, col);
    } else {
        // Try to swap with selected gem
        var selectedRow = selectedGem.row;
        var selectedCol = selectedGem.col;
        
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
    console.log('✅ Selected gem at [' + row + '][' + col + ']');
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
    var rowDiff = Math.abs(row1 - row2);
    var colDiff = Math.abs(col1 - col2);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Attempt to swap two gems
async function attemptSwap(row1, col1, row2, col2) {
    console.log('🔄 Attempting swap: [' + row1 + '][' + col1 + '] ↔ [' + row2 + '][' + col2 + ']');
    
    isAnimating = true;
    moves++;
    updateMovesDisplay();
    
    // Swap in board
    var temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    // Check for matches
    var matches = findMatches();
    
  if (matches.length > 0) {
        console.log('✅ Valid swap! Found ' + matches.length + ' matches');
        
        // Valid move - update visuals and process matches
        renderBoard();
        deselectGem();
        
        // Process all matches and cascades
        comboMultiplier = 1;
        processMatches();
        
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
    var matches = [];
    
    // Find horizontal matches
    for (var row = 0; row < BOARD_SIZE; row++) {
        var count = 1;
        var currentType = board[row][0]?.type;
        
        for (var col = 1; col < BOARD_SIZE; col++) {
            if (board[row][col]?.type === currentType && currentType) {
                count++;
  } else {
                if (count >= 3 && currentType) {
                    var match = [];
                    for (var i = col - count; i < col; i++) {
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
            var match = [];
            for (var i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
                match.push({ row, col: i });
            }
            matches.push({ positions: match, size: count });
        }
    }
    
    // Find vertical matches
    for (var col = 0; col < BOARD_SIZE; col++) {
        var count = 1;
        var currentType = board[0][col]?.type;
        
        for (var row = 1; row < BOARD_SIZE; row++) {
            if (board[row][col]?.type === currentType && currentType) {
                count++;
            } else {
                if (count >= 3 && currentType) {
                    var match = [];
                    for (var i = row - count; i < row; i++) {
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
            var match = [];
            for (var i = BOARD_SIZE - count; i < BOARD_SIZE; i++) {
                match.push({ row: i, col });
            }
            matches.push({ positions: match, size: count });
        }
    }
    
    return matches;
}

// Process matches and handle cascades
function processMatches() {
    var totalMatches = 0;
    
    while (true) {
        var matches = findMatches();
        if (matches.length === 0) break;
        
        totalMatches += matches.length;
        
        // Remove matched gems
        removeMatches(matches);
        
        // Calculate and add score with combo multiplier
        var matchScore = calculateScore(matches) * comboMultiplier;
        updateScore(matchScore);
        comboMultiplier++;
        
        // Wait for removal animation
        sleep(300);
        
        // Apply gravity
        applyGravity();
        
        // Fill empty spaces
        fillEmptySpaces();
        
        // Re-render board
        renderBoard();
        
        // Wait for drop animation
        sleep(400);
    }
    
    if (totalMatches > 0) {
        console.log('💎 Processed ' + totalMatches + ' total matches with ' + (comboMultiplier - 1) + 'x combo!');
    }
}

// Remove matched gems from board
function removeMatches(matches) {
    matches.forEach(function(match) {
        match.positions.forEach(function(pos) {
            if (board[pos.row] && board[pos.row][pos.col]) {
                console.log('💥 Removing gem at [' + pos.row + '][' + pos.col + ']');
                board[pos.row][pos.col] = null;
                
                // Add visual effect
                var element = document.querySelector('[data-row="' + pos.row + '"][data-col="' + pos.col + '"]');
                if (element) {
                    element.classList.add('matched');
                }
            }
        });
    });
}

// Calculate score for matches
function calculateScore(matches) {
    var totalScore = 0;
    matches.forEach(function(match) {
        // Base score increases with match size
        var baseScore = match.size === 3 ? 50 : 
                         match.size === 4 ? 150 : 
                         match.size === 5 ? 300 : 
                         match.size * 100;
        totalScore += baseScore;
    });
    return totalScore;
}

// Apply gravity - make gems fall down
function applyGravity() {
    for (var col = 0; col < BOARD_SIZE; col++) {
        // Get all non-null gems in this column
        var gems = [];
        for (var row = 0; row < BOARD_SIZE; row++) {
            if (board[row][col]) {
                gems.push(board[row][col]);
                board[row][col] = null;
            }
        }
        
        // Place gems at bottom
        for (var i = 0; i < gems.length; i++) {
            board[BOARD_SIZE - 1 - i][col] = gems[gems.length - 1 - i];
        }
    }
}

// Fill empty spaces with new gems
function fillEmptySpaces() {
    for (var row = 0; row < BOARD_SIZE; row++) {
        for (var col = 0; col < BOARD_SIZE; col++) {
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
        
        console.log('✅ Level ' + (level - 1) + ' complete! Advancing to level ' + level);
        
        // Show level completion message
        showLevelComplete();
        
        // Update displays
        updateAllDisplays();
    }
}

// Show level completion animation
function showLevelComplete() {
    var message = document.createElement('div');
    message.className = 'level-complete';
    message.textContent = 'Level ' + (level - 1) + ' Complete!';
    message.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(45deg, #FFD700, #FFA500); color: white; padding: 20px 40px; font-size: 24px; font-weight: bold; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; animation: levelComplete 3s ease-in-out forwards;';
    
    document.body.appendChild(message);
    
    setTimeout(function() {
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
        scoreDisplay.textContent = 'Score: ' + score.toLocaleString();
    }
    
    if (points > 0) {
        console.log('💎 +' + points + ' points! Total: ' + score);
    }
}

// Update level display
function updateLevelDisplay() {
    if (levelDisplay) {
        levelDisplay.textContent = 'Level: ' + level;
    }
}

// Update target display
function updateTargetDisplay() {
    if (targetDisplay) {
        var remaining = Math.max(0, targetScore - score);
        targetDisplay.textContent = 'Target: ' + remaining.toLocaleString();
    }
}

// Update moves display
function updateMovesDisplay() {
    if (movesDisplay) {
        movesDisplay.textContent = 'Moves: ' + moves;
    }
}

// Show invalid move feedback
function showInvalidMove() {
    if (selectedGem) {
        var element = selectedGem.element;
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(function() {
            element.style.animation = '';
        }, 500);
    }
}

// Utility function for delays
function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// Restart game function (for global access)
function restartGame() {
    console.log('🔄 Restarting Elemental Bejeweled...');
    initializeGame();
}

// Global functions
window.restartGame = restartGame;
window.initGame = function(mode) { initializeGame(); };

// Settings Management System
var gameSettings = {
    audio: {
        masterVolume: 75,
        soundEffects: true,
        backgroundMusic: true
    },
    visual: {
        animations: true,
        particleEffects: true,
        highContrast: false,
        reducedMotion: false,
        boardTheme: 'space'
    },
    gameplay: {
        difficulty: 'normal',
        showHints: true,
        autoSave: true,
        showComboText: true
    },
    display: {
        boardSize: 'large',
        fullscreen: false,
        showStats: true
    },
    controls: {
        keyboardShortcuts: true,
        clickFeedback: true,
        doubleClickSpeed: 400
    }
};

// Settings Functions - Moved to global scope
function openSettings() {
    var modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'flex';
        loadSettingsToUI();
        setupSettingsEventListeners();
    }
}

function closeSettings() {
    var modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveSettings() {
    // Collect all settings from UI
    var masterVolume = document.getElementById('masterVolume');
    var soundEffects = document.getElementById('soundEffects');
    var backgroundMusic = document.getElementById('backgroundMusic');
    
    if (masterVolume) gameSettings.audio.masterVolume = parseInt(masterVolume.value);
    if (soundEffects) gameSettings.audio.soundEffects = soundEffects.checked;
    if (backgroundMusic) gameSettings.audio.backgroundMusic = backgroundMusic.checked;
    
    var animations = document.getElementById('animations');
    var particleEffects = document.getElementById('particleEffects');
    var highContrast = document.getElementById('highContrast');
    var reducedMotion = document.getElementById('reducedMotion');
    var boardTheme = document.getElementById('boardTheme');
    
    if (animations) gameSettings.visual.animations = animations.checked;
    if (particleEffects) gameSettings.visual.particleEffects = particleEffects.checked;
    if (highContrast) gameSettings.visual.highContrast = highContrast.checked;
    if (reducedMotion) gameSettings.visual.reducedMotion = reducedMotion.checked;
    if (boardTheme) gameSettings.visual.boardTheme = boardTheme.value;
    
    var difficulty = document.getElementById('difficulty');
    var showHints = document.getElementById('showHints');
    var autoSave = document.getElementById('autoSave');
    var showComboText = document.getElementById('showComboText');
    
    if (difficulty) gameSettings.gameplay.difficulty = difficulty.value;
    if (showHints) gameSettings.gameplay.showHints = showHints.checked;
    if (autoSave) gameSettings.gameplay.autoSave = autoSave.checked;
    if (showComboText) gameSettings.gameplay.showComboText = showComboText.checked;
    
    var boardSize = document.getElementById('boardSize');
    var fullscreen = document.getElementById('fullscreen');
    var showStats = document.getElementById('showStats');
    
    if (boardSize) gameSettings.display.boardSize = boardSize.value;
    if (fullscreen) gameSettings.display.fullscreen = fullscreen.checked;
    if (showStats) gameSettings.display.showStats = showStats.checked;
    
    var keyboardShortcuts = document.getElementById('keyboardShortcuts');
    var clickFeedback = document.getElementById('clickFeedback');
    var doubleClickSpeed = document.getElementById('doubleClickSpeed');
    
    if (keyboardShortcuts) gameSettings.controls.keyboardShortcuts = keyboardShortcuts.checked;
    if (clickFeedback) gameSettings.controls.clickFeedback = clickFeedback.checked;
    if (doubleClickSpeed) gameSettings.controls.doubleClickSpeed = parseInt(doubleClickSpeed.value);
    
    // Save to localStorage
    try {
        localStorage.setItem('elementalBejeweledSettings', JSON.stringify(gameSettings));
        console.log('Settings saved successfully!');
        
        // Apply settings immediately
        applySettings();
        
        // Show success message
        showSettingsMessage('Settings saved successfully! ✅', 'success');
        
        // Close modal after saving
        setTimeout(function() {
            closeSettings();
        }, 1000);
        
    } catch (e) {
        console.error('Failed to save settings:', e);
        showSettingsMessage('Failed to save settings ❌', 'error');
    }
}

function resetSettings() {
    // Reset to default settings
    gameSettings = {
        audio: {
            masterVolume: 75,
            soundEffects: true,
            backgroundMusic: true
        },
        visual: {
            animations: true,
            particleEffects: true,
            highContrast: false,
            reducedMotion: false,
            boardTheme: 'space'
        },
        gameplay: {
            difficulty: 'normal',
            showHints: true,
            autoSave: true,
            showComboText: true
        },
        display: {
            boardSize: 'large',
            fullscreen: false,
            showStats: true
        },
        controls: {
            keyboardShortcuts: true,
            clickFeedback: true,
            doubleClickSpeed: 400
        }
    };
    
    // Update UI
    loadSettingsToUI();
    
    // Remove from localStorage
    localStorage.removeItem('elementalBejeweledSettings');
    
    // Apply default settings
    applySettings();
    
    showSettingsMessage('Settings reset to defaults! 🔄', 'success');
}

function loadSettingsToUI() {
    // Load settings from localStorage
    var savedSettings = localStorage.getItem('elementalBejeweledSettings');
    if (savedSettings) {
        try {
            gameSettings = Object.assign(gameSettings, JSON.parse(savedSettings));
        } catch (e) {
            console.warn('Failed to parse saved settings, using defaults');
        }
    }
    
    // Audio Settings
    var masterVolume = document.getElementById('masterVolume');
    var soundEffects = document.getElementById('soundEffects');
    var backgroundMusic = document.getElementById('backgroundMusic');
    
    if (masterVolume) {
        masterVolume.value = gameSettings.audio.masterVolume;
        updateVolumeDisplay(gameSettings.audio.masterVolume);
    }
    if (soundEffects) soundEffects.checked = gameSettings.audio.soundEffects;
    if (backgroundMusic) backgroundMusic.checked = gameSettings.audio.backgroundMusic;
    
    // Visual Settings
    var animations = document.getElementById('animations');
    var particleEffects = document.getElementById('particleEffects');
    var highContrast = document.getElementById('highContrast');
    var reducedMotion = document.getElementById('reducedMotion');
    var boardTheme = document.getElementById('boardTheme');
    
    if (animations) animations.checked = gameSettings.visual.animations;
    if (particleEffects) particleEffects.checked = gameSettings.visual.particleEffects;
    if (highContrast) highContrast.checked = gameSettings.visual.highContrast;
    if (reducedMotion) reducedMotion.checked = gameSettings.visual.reducedMotion;
    if (boardTheme) boardTheme.value = gameSettings.visual.boardTheme;
    
    // Gameplay Settings
    var difficulty = document.getElementById('difficulty');
    var showHints = document.getElementById('showHints');
    var autoSave = document.getElementById('autoSave');
    var showComboText = document.getElementById('showComboText');
    
    if (difficulty) difficulty.value = gameSettings.gameplay.difficulty;
    if (showHints) showHints.checked = gameSettings.gameplay.showHints;
    if (autoSave) autoSave.checked = gameSettings.gameplay.autoSave;
    if (showComboText) showComboText.checked = gameSettings.gameplay.showComboText;
    
    // Display Settings
    var boardSize = document.getElementById('boardSize');
    var fullscreen = document.getElementById('fullscreen');
    var showStats = document.getElementById('showStats');
    
    if (boardSize) boardSize.value = gameSettings.display.boardSize;
    if (fullscreen) fullscreen.checked = gameSettings.display.fullscreen;
    if (showStats) showStats.checked = gameSettings.display.showStats;
    
    // Controls Settings
    var keyboardShortcuts = document.getElementById('keyboardShortcuts');
    var clickFeedback = document.getElementById('clickFeedback');
    var doubleClickSpeed = document.getElementById('doubleClickSpeed');
    
    if (keyboardShortcuts) keyboardShortcuts.checked = gameSettings.controls.keyboardShortcuts;
    if (clickFeedback) clickFeedback.checked = gameSettings.controls.clickFeedback;
    if (doubleClickSpeed) {
        doubleClickSpeed.value = gameSettings.controls.doubleClickSpeed;
        updateSpeedDisplay(gameSettings.controls.doubleClickSpeed);
    }
}

function setupSettingsEventListeners() {
    // Volume slider
    var masterVolume = document.getElementById('masterVolume');
    if (masterVolume) {
        masterVolume.addEventListener('input', function() {
            updateVolumeDisplay(this.value);
        });
    }
    
    // Speed slider
    var doubleClickSpeed = document.getElementById('doubleClickSpeed');
    if (doubleClickSpeed) {
        doubleClickSpeed.addEventListener('input', function() {
            updateSpeedDisplay(this.value);
        });
    }
    
    // Close modal when clicking outside
    var modal = document.getElementById('settingsModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeSettings();
            }
        });
    }
}

function updateVolumeDisplay(value) {
    var volumeValue = document.querySelector('.volume-value');
    if (volumeValue) {
        volumeValue.textContent = value + '%';
    }
}

function updateSpeedDisplay(value) {
    var speedValue = document.querySelector('.speed-value');
    if (speedValue) {
        var speed = value <= 300 ? 'Fast' : 
                   value <= 500 ? 'Normal' : 
                   value <= 700 ? 'Slow' : 'Very Slow';
        speedValue.textContent = speed;
    }
}

function applySettings() {
    // Apply board size
    applyBoardSize();
    
    // Apply visual settings
    applyVisualSettings();
    
    // Apply display settings
    applyDisplaySettings();
    
    // Apply theme
    applyBoardTheme();
    
    console.log('Settings applied successfully!');
}

function applyBoardSize() {
    if (!gameBoard) return;
    
    var sizes = {
        'small': { width: '320px', height: '320px', fontSize: '18px' },
        'medium': { width: '400px', height: '400px', fontSize: '22px' },
        'large': { width: '480px', height: '480px', fontSize: '26px' },
        'xlarge': { width: '560px', height: '560px', fontSize: '30px' }
    };
    
    var size = sizes[gameSettings.display.boardSize] || sizes.large;
    
    gameBoard.style.width = size.width;
    gameBoard.style.height = size.height;
    
    // Update gem sizes
    var gems = document.querySelectorAll('.gem');
    for (var i = 0; i < gems.length; i++) {
        gems[i].style.fontSize = size.fontSize;
    }
}

function applyVisualSettings() {
    var body = document.body;
    
    // High contrast mode
    if (gameSettings.visual.highContrast) {
        body.classList.add('high-contrast');
    } else {
        body.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (gameSettings.visual.reducedMotion) {
        body.classList.add('reduced-motion');
    } else {
        body.classList.remove('reduced-motion');
    }
    
    // Animations
    if (!gameSettings.visual.animations) {
        body.classList.add('no-animations');
    } else {
        body.classList.remove('no-animations');
    }
}

function applyDisplaySettings() {
    var statsContainer = document.querySelector('.game-stats');
    
    // Show/hide statistics
    if (statsContainer) {
        statsContainer.style.display = gameSettings.display.showStats ? 'flex' : 'none';
    }
    
    // Fullscreen mode
    if (gameSettings.display.fullscreen && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function(err) {
            console.log('Fullscreen request failed:', err);
        });
    } else if (!gameSettings.display.fullscreen && document.exitFullscreen) {
        document.exitFullscreen().catch(function(err) {
            console.log('Exit fullscreen failed:', err);
        });
    }
}

function applyBoardTheme() {
    var body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-space', 'theme-forest', 'theme-ocean', 'theme-fire');
    
    // Add new theme class
    body.classList.add('theme-' + gameSettings.visual.boardTheme);
}

function showSettingsMessage(message, type) {
    var messageEl = document.createElement('div');
    messageEl.className = 'settings-message ' + type;
    messageEl.textContent = message;
    messageEl.style.cssText = 'position: fixed; top: 20px; right: 20px; background: ' + 
        (type === 'success' ? '#4CAF50' : '#f44336') + 
        '; color: white; padding: 12px 20px; border-radius: 8px; z-index: 3000; ' +
        'box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: slideIn 0.3s ease-out;';
    
    document.body.appendChild(messageEl);
    
    setTimeout(function() {
        messageEl.remove();
    }, 3000);
}

// Enhanced keyboard shortcuts based on settings
function handleKeyboardShortcuts(event) {
    if (!gameSettings.controls.keyboardShortcuts) return;
    
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    switch(event.key.toLowerCase()) {
        case 'r': 
            if (typeof restartGame !== 'undefined') restartGame(); 
            break;
        case 'h': 
            showInstructions(); 
            break;
        case 's':
            if (event.ctrlKey) {
                event.preventDefault();
                openSettings();
            }
            break;
        case 'escape':
            if (document.getElementById('settingsModal').style.display === 'flex') {
                closeSettings();
            } else if (document.getElementById('instructions').style.display === 'block') {
                document.getElementById('instructions').style.display = 'none';
            }
            break;
        case 'f':
            if (event.ctrlKey) {
                event.preventDefault();
                toggleFullscreen();
            }
            break;
    }
}

function toggleFullscreen() {
    gameSettings.display.fullscreen = !gameSettings.display.fullscreen;
    applyDisplaySettings();
}

// Initialize settings on game load
function initializeSettings() {
    loadSettingsToUI();
    applySettings();
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log('Settings system initialized!');
}

// Global settings functions
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;

// Initialize settings when game loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeSettings, 500);
    });
} else {
    setTimeout(initializeSettings, 500);
}

console.log('⚡ Elemental Bejeweled Core loaded successfully!');

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚡ Initializing Elemental Bejeweled...');
    initializeGame();
    initializeSettings(); // Initialize settings system
});

// Expose functions to global scope for compatibility
window.restartGame = restartGame;
window.showInstructions = showInstructions;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;

console.log('⚡ Elemental Bejeweled Core loaded successfully!'); 