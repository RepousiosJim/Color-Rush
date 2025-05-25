// Gems Rush: Divine Teams - Complete Enhanced Version
// All improvements implemented: sounds, hints, undo, streaks, achievements, power-ups, modes, swipes, particles, stats

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

// MAIN MENU SYSTEM
var currentMenuMode = null;
var gameInitialized = false;

// Main menu navigation functions
function selectGameMode(mode) {
    console.log('🎮 Selected game mode:', mode);
    currentMenuMode = mode;
    
    // Add selection animation
    var buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach(function(btn) {
        btn.style.transform = 'scale(0.95)';
        btn.style.opacity = '0.7';
    });
    
    // Highlight selected button
    var selectedBtn = document.querySelector('.mode-' + mode);
    if (selectedBtn) {
        selectedBtn.style.transform = 'scale(1.1)';
        selectedBtn.style.opacity = '1';
        selectedBtn.style.borderColor = '#FFD700';
        selectedBtn.style.boxShadow = '0 15px 35px rgba(255, 215, 0, 0.5)';
    }
    
    // Transition to game with delay for animation
    setTimeout(function() {
        hideMainMenu();
        setTimeout(function() {
            initializeGameMode(mode);
        }, 300);
    }, 800);
}

function hideMainMenu() {
    var mainMenu = document.getElementById('mainMenu');
    var gameInterface = document.getElementById('gameInterface');
    
    console.log('🎯 Hiding main menu and showing game interface...');
    
    if (mainMenu && gameInterface) {
        console.log('✅ Both menu elements found');
        mainMenu.style.transform = 'scale(0.9)';
        mainMenu.style.opacity = '0';
        mainMenu.style.transition = 'all 0.5s ease';
        
        setTimeout(function() {
            mainMenu.style.display = 'none';
            gameInterface.style.display = 'block';
            gameInterface.style.opacity = '0';
            gameInterface.style.transform = 'scale(1.1)';
            gameInterface.style.transition = 'all 0.5s ease';
            
            setTimeout(function() {
                gameInterface.style.opacity = '1';
                gameInterface.style.transform = 'scale(1)';
                console.log('✅ Game interface now visible');
            }, 50);
        }, 500);
    } else {
        console.error('❌ Menu elements not found:', { mainMenu: !!mainMenu, gameInterface: !!gameInterface });
    }
}

function showMainMenu() {
    var mainMenu = document.getElementById('mainMenu');
    var gameInterface = document.getElementById('gameInterface');
    
    if (mainMenu && gameInterface) {
        gameInterface.style.opacity = '0';
        gameInterface.style.transform = 'scale(0.9)';
        gameInterface.style.transition = 'all 0.4s ease';
        
        setTimeout(function() {
            gameInterface.style.display = 'none';
            mainMenu.style.display = 'flex';
            mainMenu.style.opacity = '0';
            mainMenu.style.transform = 'scale(1.1)';
            mainMenu.style.transition = 'all 0.5s ease';
            
            setTimeout(function() {
                mainMenu.style.opacity = '1';
                mainMenu.style.transform = 'scale(1)';
                resetMenuButtons();
            }, 50);
        }, 400);
    }
}

function resetMenuButtons() {
    var buttons = document.querySelectorAll('.menu-btn');
    buttons.forEach(function(btn) {
        btn.style.transform = '';
        btn.style.opacity = '';
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
    });
}

function initializeGameMode(mode) {
    console.log('🎯 Initializing game mode:', mode);
    
    // Ensure game board is available
    gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('Game board not found! Creating one...');
        gameBoard = document.createElement('div');
        gameBoard.className = 'game-board';
        gameBoard.id = 'gameBoard';
        var gameInterface = document.getElementById('gameInterface');
        if (gameInterface) {
            gameInterface.appendChild(gameBoard);
        } else {
            document.body.appendChild(gameBoard);
        }
    }
    
    // Initialize game if not already done
    if (!gameInitialized) {
        if (typeof initializeGameReal === 'function') {
            initializeGameReal();
            gameInitialized = true;
        }
    }
    
    // Start the appropriate game mode
    switch (mode) {
        case 'normal':
            if (typeof startNormalMode === 'function') startNormalMode();
            break;
        case 'timeAttack':
            if (typeof startTimeAttack === 'function') startTimeAttack();
            break;
        case 'dailyChallenge':
            if (typeof startDailyChallenge === 'function') startDailyChallenge();
            break;
        case 'campaign':
            if (typeof startDivineConquest === 'function') startDivineConquest();
            break;
        default:
            console.warn('Unknown game mode:', mode);
            if (typeof startNormalMode === 'function') startNormalMode();
    }
}

// Menu utility functions
function showGameInfo() {
    var existingModal = document.getElementById('gameInfoModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'gameInfoModal';
    modal.className = 'game-info-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📖 Game Guide - Divine Teams</h2>
                <button class="close-btn" onclick="closeGameInfo()">✕</button>
            </div>
            <div class="modal-body">
                <div class="guide-section">
                    <h3>🎯 Basic Gameplay</h3>
                    <ul>
                        <li>🔄 <strong>Swap adjacent gems</strong> to create matches of 3 or more</li>
                        <li>🎯 <strong>Reach target scores</strong> to advance through realms</li>
                        <li>⚡ <strong>Chain reactions</strong> create powerful cascades</li>
                        <li>💎 <strong>Bigger matches</strong> yield exponentially higher scores</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h3>🌟 Divine Gem Types</h3>
                    <div class="gems-grid">
                        <div class="gem-info"><span class="gem-icon">🔥</span> Fire - Sacred Flames</div>
                        <div class="gem-info"><span class="gem-icon">💧</span> Water - Divine Flow</div>
                        <div class="gem-info"><span class="gem-icon">🌍</span> Earth - Ancient Foundation</div>
                        <div class="gem-info"><span class="gem-icon">💨</span> Air - Celestial Winds</div>
                        <div class="gem-info"><span class="gem-icon">⚡</span> Lightning - Divine Power</div>
                        <div class="gem-info"><span class="gem-icon">🌿</span> Nature - Life Force</div>
                        <div class="gem-info"><span class="gem-icon">🔮</span> Magic - Pure Essence</div>
                    </div>
                </div>
                
                <div class="guide-section">
                    <h3>🎮 Game Modes</h3>
                    <ul>
                        <li>🎯 <strong>Normal:</strong> Classic gameplay, unlimited time</li>
                        <li>⏱️ <strong>Time Attack:</strong> 60 seconds of intense action</li>
                        <li>📅 <strong>Daily Challenge:</strong> Special objectives with rewards</li>
                        <li>⚔️ <strong>Divine Conquest:</strong> Epic campaign through mystical realms</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h3>🏆 Scoring System</h3>
                    <ul>
                        <li>💎 <strong>3-match:</strong> 50 divine points</li>
                        <li>💎 <strong>4-match:</strong> 150 divine points + power-up</li>
                        <li>💎 <strong>5+ match:</strong> 300+ divine points + special power-up</li>
                        <li>🔥 <strong>Cascades:</strong> Chain reactions multiply your score</li>
                        <li>🎯 <strong>Streaks:</strong> Consecutive matches build bonus multipliers</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
}

function closeGameInfo() {
    var modal = document.getElementById('gameInfoModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(function() {
            modal.remove();
        }, 300);
    }
}

function openSettingsFromMenu() {
    var existingModal = document.getElementById('settingsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚙️ Game Settings</h2>
                <button class="close-btn" onclick="closeSettings()">✕</button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h3>🔊 Audio Settings</h3>
                    <div class="setting-item">
                        <label for="masterVolume">Master Volume</label>
                        <input type="range" id="masterVolume" min="0" max="100" value="75" class="volume-slider">
                        <span class="volume-value">75%</span>
                    </div>
                    <div class="setting-item">
                        <label for="soundEffects">Sound Effects</label>
                        <input type="checkbox" id="soundEffects" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="backgroundMusic">Background Music</label>
                        <input type="checkbox" id="backgroundMusic" checked class="toggle-switch">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>👁️ Visual Settings</h3>
                    <div class="setting-item">
                        <label for="animations">Animations</label>
                        <input type="checkbox" id="animations" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="particleEffects">Particle Effects</label>
                        <input type="checkbox" id="particleEffects" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="highContrast">High Contrast Mode</label>
                        <input type="checkbox" id="highContrast" class="toggle-switch">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>🎮 Gameplay Settings</h3>
                    <div class="setting-item">
                        <label for="difficulty">Difficulty Level</label>
                        <select id="difficulty" class="settings-select">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="showHints">Show Hints</label>
                        <input type="checkbox" id="showHints" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="autoSave">Auto Save</label>
                        <input type="checkbox" id="autoSave" checked class="toggle-switch">
                    </div>
                </div>

                <div class="settings-buttons">
                    <button onclick="resetSettings()" class="btn btn-secondary">Reset to Defaults</button>
                    <button onclick="saveSettings()" class="btn btn-primary">Save Settings</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles (same as showGameInfo)
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    // Load current settings
    loadSettingsToUI();
}

function showCredits() {
    var existingModal = document.getElementById('creditsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'creditsModal';
    modal.className = 'credits-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>👥 Credits & Acknowledgments</h2>
                <button class="close-btn" onclick="closeCredits()">✕</button>
            </div>
            <div class="modal-body">
                <div class="credits-section">
                    <h3>🎮 Game Development</h3>
                    <p><strong>Gems Rush: Divine Teams</strong></p>
                    <p>An epic match-3 adventure game featuring divine elemental powers and strategic team-based gameplay.</p>
                </div>
                
                <div class="credits-section">
                    <h3>✨ Special Features</h3>
                    <ul>
                        <li>🔊 Dynamic Web Audio API sound system</li>
                        <li>🎨 Advanced CSS animations and particle effects</li>
                        <li>📱 Responsive design for all devices</li>
                        <li>♿ Full accessibility support</li>
                        <li>💾 Local storage progress saving</li>
                        <li>🏆 Comprehensive achievement system</li>
                    </ul>
                </div>
                
                <div class="credits-section">
                    <h3>🛠️ Technologies Used</h3>
                    <ul>
                        <li>HTML5 Canvas & Modern Web APIs</li>
                        <li>CSS3 with advanced animations</li>
                        <li>Vanilla JavaScript ES6+</li>
                        <li>Web Audio API for dynamic sounds</li>
                        <li>Local Storage for game persistence</li>
                    </ul>
                </div>
                
                <div class="credits-section">
                    <h3>🌟 Divine Elements</h3>
                    <p>Inspired by ancient mythologies and elemental powers from around the world. Each gem represents a fundamental force of nature, bringing balance and strategy to every match.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles (same as showGameInfo)
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
}

function closeCredits() {
    var modal = document.getElementById('creditsModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(function() {
            modal.remove();
        }, 300);
    }
}

// Add a back to menu function for in-game use
function backToMainMenu() {
    console.log('🏠 Returning to main menu...');
    
    // Save any current progress
    if (typeof saveGameStats === 'function' && (moves > 0 || score > 0)) {
        saveGameStats();
    }
    
    // Reset game mode
    currentGameMode = 'normal';
    currentMenuMode = null;
    
    // Clear any timers
    if (typeof clearGameTimer === 'function') {
        clearGameTimer();
    }
    
    // Show main menu
    showMainMenu();
}

// Global home button function (alias for backToMainMenu with enhanced features)
function goToMainMenu() {
    console.log('🏠 Home button pressed - returning to main menu...');
    
    // Close any open modals first
    closeAllModals();
    
    // Hide the home button temporarily during transition
    var homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.style.opacity = '0.5';
        homeButton.style.pointerEvents = 'none';
    }
    
    // Call the main back to menu function
    backToMainMenu();
    
    // Restore home button after transition
    setTimeout(function() {
        if (homeButton) {
            homeButton.style.opacity = '';
            homeButton.style.pointerEvents = '';
        }
    }, 1000);
}

// Helper function to close all modals
function closeAllModals() {
    // Close settings modal
    var settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        closeSettings();
    }
    
    // Close instructions
    var instructions = document.getElementById('instructions');
    if (instructions && instructions.style.display === 'block') {
        instructions.style.display = 'none';
    }
    
    // Close game info modal
    var gameInfoModal = document.getElementById('gameInfoModal');
    if (gameInfoModal) {
        closeGameInfo();
    }
    
    // Close credits modal
    var creditsModal = document.getElementById('creditsModal');
    if (creditsModal) {
        closeCredits();
    }
    
    // Close any campaign modals
    var levelSelectModal = document.querySelector('.level-select-modal');
    if (levelSelectModal && levelSelectModal.style.display !== 'none') {
        closeLevelSelect();
    }
    
    // Close any completion/failure modals
    var completionModal = document.querySelector('.campaign-completion-modal');
    var failureModal = document.querySelector('.campaign-failure-modal');
    if (completionModal) completionModal.remove();
    if (failureModal) failureModal.remove();
    
    // Hide campaign container if visible
    var campaignContainer = document.querySelector('.campaign-container');
    if (campaignContainer && campaignContainer.style.display !== 'none') {
        hideCampaignLevelSelect();
    }
}

// Make menu functions globally available
window.selectGameMode = selectGameMode;
window.hideMainMenu = hideMainMenu;
window.showMainMenu = showMainMenu;
window.initializeGameMode = initializeGameMode;
window.showGameInfo = showGameInfo;
window.closeGameInfo = closeGameInfo;
window.openSettingsFromMenu = openSettingsFromMenu;
window.showCredits = showCredits;
window.closeCredits = closeCredits;
window.backToMainMenu = backToMainMenu;
window.goToMainMenu = goToMainMenu;
window.closeAllModals = closeAllModals;

// Game configuration
var BOARD_SIZE = 8;

// Divine Gems
var DIVINE_GEMS = [
    { symbol: '🔥', name: 'fire', color: '#FF4500' },
    { symbol: '💧', name: 'water', color: '#1E90FF' },
    { symbol: '🌍', name: 'earth', color: '#8B4513' },
    { symbol: '💨', name: 'air', color: '#87CEEB' },
    { symbol: '⚡', name: 'lightning', color: '#FFD700' },
    { symbol: '🌿', name: 'nature', color: '#32CD32' },
    { symbol: '🔮', name: 'magic', color: '#9932CC' }
];

// Power-up definitions
var POWER_UPS = {
    BOMB: { symbol: '💥', name: 'bomb', effect: 'destroyArea' },
    LIGHTNING: { symbol: '⚡', name: 'lightning_power', effect: 'destroyLine' },
    RAINBOW: { symbol: '🌈', name: 'rainbow', effect: 'destroyAllOfType' }
};

// Achievement definitions
var ACHIEVEMENTS = [
    { id: 'first_match', name: 'First Divine Match', description: 'Make your first match', requirement: 'match_3', unlocked: false },
    { id: 'combo_master', name: 'Combo Master', description: 'Create a 5-match combo', requirement: 'match_5', unlocked: false },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a level in under 10 moves', requirement: 'level_in_10_moves', unlocked: false },
    { id: 'streak_legend', name: 'Streak Legend', description: 'Build a 10-match streak', requirement: 'streak_10', unlocked: false },
    { id: 'cascade_king', name: 'Cascade King', description: 'Create a 3+ cascade chain', requirement: 'cascade_3', unlocked: false },
    { id: 'divine_warrior', name: 'Divine Warrior', description: 'Reach level 5', requirement: 'level_5', unlocked: false }
];

// DIVINE CONQUEST CAMPAIGN SYSTEM
var DIVINE_REALMS = {
    fire: {
        id: 'fire',
        name: 'Infernal Forge',
        symbol: '🔥',
        description: 'Where divine flames burn eternal',
        color: '#FF4500',
        backgroundGradient: 'linear-gradient(135deg, #FF4500, #DC143C, #8B0000)',
        levels: [
            { id: 1, type: 'score', target: 1000, moves: 25, stars: 0, unlocked: true, completed: false },
            { id: 2, type: 'score', target: 1500, moves: 20, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'clear', targetGems: ['fire'], count: 30, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'survival', survivalMoves: 15, target: 2000, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 3000, moves: 35, specialMechanic: 'fireSpread', stars: 0, unlocked: false, completed: false }
        ]
    },
    water: {
        id: 'water',
        name: 'Celestial Ocean',
        symbol: '💧',
        description: 'Where divine waters flow with wisdom',
        color: '#1E90FF',
        backgroundGradient: 'linear-gradient(135deg, #1E90FF, #4169E1, #000080)',
        levels: [
            { id: 1, type: 'score', target: 1200, moves: 25, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'score', target: 1800, moves: 22, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'clear', targetGems: ['water'], count: 35, moves: 28, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'cascade', requiredCascades: 5, target: 2200, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 3500, moves: 40, specialMechanic: 'waterFlow', stars: 0, unlocked: false, completed: false }
        ]
    },
    earth: {
        id: 'earth',
        name: 'Ancient Stronghold',
        symbol: '🌍',
        description: 'Where divine foundations stand eternal',
        color: '#8B4513',
        backgroundGradient: 'linear-gradient(135deg, #8B4513, #A0522D, #654321)',
        levels: [
            { id: 1, type: 'score', target: 1400, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'endurance', target: 2000, maxMoves: 50, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'clear', targetGems: ['earth'], count: 40, moves: 35, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'score', target: 2800, moves: 25, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 4000, moves: 45, specialMechanic: 'earthQuake', stars: 0, unlocked: false, completed: false }
        ]
    },
    air: {
        id: 'air',
        name: 'Skyward Sanctuary',
        symbol: '💨',
        description: 'Where celestial winds carry divine freedom',
        color: '#87CEEB',
        backgroundGradient: 'linear-gradient(135deg, #87CEEB, #B0E0E6, #87CEFA)',
        levels: [
            { id: 1, type: 'score', target: 1600, moves: 20, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'speed', target: 2000, timeLimit: 90, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'clear', targetGems: ['air'], count: 25, moves: 25, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'combo', requiredCombos: 8, target: 2500, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 4500, moves: 35, specialMechanic: 'windStorm', stars: 0, unlocked: false, completed: false }
        ]
    },
    lightning: {
        id: 'lightning',
        name: 'Thunderous Peak',
        symbol: '⚡',
        description: 'Where divine power strikes with sacred force',
        color: '#FFD700',
        backgroundGradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
        levels: [
            { id: 1, type: 'score', target: 1800, moves: 18, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'speed', target: 2500, timeLimit: 80, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'powerup', requiredPowerUps: 3, target: 2200, moves: 25, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'chain', requiredChains: 10, target: 3000, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 5000, moves: 40, specialMechanic: 'lightningStrike', stars: 0, unlocked: false, completed: false }
        ]
    },
    nature: {
        id: 'nature',
        name: 'Garden of Renewal',
        symbol: '🌿',
        description: 'Where divine life force grows eternal',
        color: '#32CD32',
        backgroundGradient: 'linear-gradient(135deg, #32CD32, #228B22, #006400)',
        levels: [
            { id: 1, type: 'score', target: 2000, moves: 35, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'growth', target: 2800, healingMatches: 5, moves: 40, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'clear', targetGems: ['nature'], count: 50, moves: 45, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'harmony', balancedMatches: 15, target: 3200, moves: 35, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 5500, moves: 50, specialMechanic: 'lifeForce', stars: 0, unlocked: false, completed: false }
        ]
    },
    magic: {
        id: 'magic',
        name: 'Mystical Nexus',
        symbol: '🔮',
        description: 'Where infinite divine potential awaits',
        color: '#9932CC',
        backgroundGradient: 'linear-gradient(135deg, #9932CC, #8A2BE2, #4B0082)',
        levels: [
            { id: 1, type: 'score', target: 2500, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 2, type: 'mystery', target: 3000, randomObjectives: true, moves: 35, stars: 0, unlocked: false, completed: false },
            { id: 3, type: 'transformation', target: 3500, gemTransforms: 20, moves: 40, stars: 0, unlocked: false, completed: false },
            { id: 4, type: 'essence', target: 4000, essenceGems: 10, moves: 30, stars: 0, unlocked: false, completed: false },
            { id: 5, type: 'boss', target: 6000, moves: 45, specialMechanic: 'realityBend', stars: 0, unlocked: false, completed: false }
        ]
    }
};

// Campaign progression state
var campaignProgress = {
    currentRealm: 'fire',
    currentLevel: 1,
    unlockedRealms: ['fire'],
    divineEssence: 0,
    totalStars: 0,
    completedLevels: 0,
    achievements: [],
    artifacts: []
};

// Current level state for campaign mode
var currentCampaignLevel = null;
var levelObjectives = {
    clearedGems: {},
    cascadeCount: 0,
    comboCount: 0,
    powerUpsCreated: 0,
    chainCount: 0,
    specialCounter: 0
};

// Game state
var board = [];
var score = 0;
var level = 1;
var targetScore = 1000;
var selectedGem = null;
var isAnimating = false;
var moves = 0;
var comboMultiplier = 1;

// Enhanced game state
var currentStreak = 0;
var maxStreak = 0;
var gameHistory = [];
var currentGameMode = 'normal';
var timeLeft = 60;
var gameTimer = null;
var dailyChallengeData = null;
var hintsUsed = 0;
var undosUsed = 0;
var cascadeLevel = 0;
var totalMatches = 0;
var powerUpsCreated = 0;

// Sound system
var audioContext;
var soundEnabled = true;

// Touch/swipe handling
var touchStart = null;
var touchEnd = null;

// DOM elements
var gameBoard;
var scoreDisplay;
var levelDisplay;
var targetDisplay;
var movesDisplay;
var streakCounter;
var timerDisplay;
var dailyChallengeBadge;
var statsPanel;
var gameModeIndicator;
var hintBtn;
var undoBtn;

// IMPORTANT: Define game mode functions early so HTML can access them
function startNormalMode() {
    if (typeof clearGameTimer === 'function') clearGameTimer();
    currentGameMode = 'normal';
    
    var timerDisplayEl = document.getElementById('timerDisplay');
    var gameModeIndicatorEl = document.getElementById('gameModeIndicator');
    
    if (timerDisplayEl) timerDisplayEl.style.display = 'none';
    if (gameModeIndicatorEl) {
        gameModeIndicatorEl.textContent = '🎯 Normal Mode';
        gameModeIndicatorEl.style.display = 'block';
        gameModeIndicatorEl.className = 'game-mode-indicator';
    }
    
    if (typeof setActiveMode === 'function') setActiveMode('normalModeBtn');
    
    // Call the real initialization function directly
    if (typeof initializeGameReal === 'function') {
        initializeGameReal();
    } else if (typeof initializeGame === 'function') {
        initializeGame();
    }
}

function startTimeAttack() {
    currentGameMode = 'timeAttack';
    timeLeft = 60;
    
    var timerDisplayEl = document.getElementById('timerDisplay');
    var gameModeIndicatorEl = document.getElementById('gameModeIndicator');
    
    if (timerDisplayEl) {
        timerDisplayEl.textContent = '⏰ ' + timeLeft + 's';
        timerDisplayEl.style.display = 'block';
    }
    
    if (gameModeIndicatorEl) {
        gameModeIndicatorEl.textContent = '⏱️ Time Attack';
        gameModeIndicatorEl.style.display = 'block';
        gameModeIndicatorEl.className = 'game-mode-indicator time-attack';
    }
    
    if (typeof setActiveMode === 'function') setActiveMode('timeAttackBtn');
    
    // Call the real initialization function directly
    if (typeof initializeGameReal === 'function') {
        initializeGameReal();
    } else if (typeof initializeGame === 'function') {
        initializeGame();
    }
    
    if (typeof startGameTimer === 'function') startGameTimer();
}

function startDailyChallenge() {
    currentGameMode = 'dailyChallenge';
    var challenge = generateDailyChallenge();
    
    if (typeof clearGameTimer === 'function') clearGameTimer();
    
    var timerDisplayEl = document.getElementById('timerDisplay');
    var gameModeIndicatorEl = document.getElementById('gameModeIndicator');
    
    if (timerDisplayEl) timerDisplayEl.style.display = 'none';
    
    if (gameModeIndicatorEl) {
        gameModeIndicatorEl.textContent = '📅 Daily Divine Quest';
        gameModeIndicatorEl.style.display = 'block';
        gameModeIndicatorEl.className = 'game-mode-indicator daily-challenge';
    }
    
    if (typeof setActiveMode === 'function') setActiveMode('dailyModeBtn');
    
    targetScore = challenge.target;
    dailyChallengeData = challenge;
    
    // Call the real initialization function directly
    if (typeof initializeGameReal === 'function') {
        initializeGameReal();
    } else if (typeof initializeGame === 'function') {
        initializeGame();
    }
    
    // Simple daily challenge notification
    var message = document.createElement('div');
    message.className = 'achievement-notification';
    message.innerHTML = `
        <div>📅 Daily Divine Quest</div>
        <div>${challenge.description}</div>
        <div>🎯 Target: ${challenge.target} points</div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(function() {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
    
    // Mark challenge as attempted today
    localStorage.setItem('lastChallengeDate', new Date().toDateString());
    if (dailyChallengeBadge) {
        dailyChallengeBadge.style.display = 'none';
    }
}

// DIVINE CONQUEST CAMPAIGN FUNCTIONS
function startDivineConquest() {
    currentGameMode = 'campaign';
    
    if (typeof clearGameTimer === 'function') clearGameTimer();
    
    var timerDisplayEl = document.getElementById('timerDisplay');
    var gameModeIndicatorEl = document.getElementById('gameModeIndicator');
    
    if (timerDisplayEl) timerDisplayEl.style.display = 'none';
    
    if (gameModeIndicatorEl) {
        gameModeIndicatorEl.textContent = '⚔️ Divine Conquest';
        gameModeIndicatorEl.style.display = 'block';
        gameModeIndicatorEl.className = 'game-mode-indicator campaign';
    }
    
    // Show campaign level selection UI
    showCampaignLevelSelect();
}

function showCampaignLevelSelect() {
    // Hide main game elements
    var gameBoard = document.getElementById('gameBoard');
    var gameStats = document.querySelector('.game-stats');
    var gameControls = document.querySelector('.game-controls');
    var gameModeSelection = document.querySelector('.game-mode-selection');
    
    if (gameBoard) gameBoard.style.display = 'none';
    if (gameStats) gameStats.style.display = 'none';
    if (gameControls) gameControls.style.display = 'none';
    if (gameModeSelection) gameModeSelection.style.display = 'none';
    
    // Create campaign UI
    var campaignContainer = document.getElementById('campaignContainer');
    if (!campaignContainer) {
        campaignContainer = document.createElement('div');
        campaignContainer.id = 'campaignContainer';
        campaignContainer.className = 'campaign-container';
        document.querySelector('.game-container').appendChild(campaignContainer);
    }
    
    campaignContainer.innerHTML = `
        <div class="campaign-header">
            <h2>⚔️ Divine Conquest Campaign ⚔️</h2>
            <div class="campaign-progress">
                <div class="divine-essence">
                    💎 Divine Essence: <span id="divineEssenceCount">${campaignProgress.divineEssence}</span>
                </div>
                <div class="total-stars">
                    ⭐ Total Stars: <span id="totalStarsCount">${campaignProgress.totalStars}</span>
                </div>
            </div>
            <button class="btn btn-back" onclick="hideCampaignLevelSelect()">🔙 Back to Main Menu</button>
        </div>
        
        <div class="realms-grid" id="realmsGrid">
            ${generateRealmsHTML()}
        </div>
        
        <div id="levelSelectModal" class="level-select-modal" style="display: none;">
            <div class="level-select-content">
                <div class="level-select-header">
                    <h3 id="realmTitle"></h3>
                    <button class="close-btn" onclick="closeLevelSelect()">✕</button>
                </div>
                <div class="level-select-body" id="levelSelectBody">
                    <!-- Levels will be populated here -->
                </div>
            </div>
        </div>
    `;
    
    campaignContainer.style.display = 'block';
    loadCampaignProgress();
}

function hideCampaignLevelSelect() {
    var campaignContainer = document.getElementById('campaignContainer');
    
    if (campaignContainer) {
        campaignContainer.style.display = 'none';
    }
    
    // Return to main menu instead of starting normal mode
    backToMainMenu();
}

function generateRealmsHTML() {
    var html = '';
    var realmOrder = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic'];
    
    realmOrder.forEach(function(realmId) {
        var realm = DIVINE_REALMS[realmId];
        var isUnlocked = campaignProgress.unlockedRealms.includes(realmId);
        var completedLevels = realm.levels.filter(function(level) { return level.completed; }).length;
        var totalStars = realm.levels.reduce(function(sum, level) { return sum + level.stars; }, 0);
        
        var lockClass = isUnlocked ? '' : 'realm-locked';
        var clickHandler = isUnlocked ? `onclick="openRealmLevels('${realmId}')"` : '';
        
        html += `
            <div class="realm-card ${lockClass}" data-realm="${realmId}" ${clickHandler}>
                <div class="realm-symbol" style="color: ${realm.color};">${realm.symbol}</div>
                <h3 class="realm-name">${realm.name}</h3>
                <p class="realm-description">${realm.description}</p>
                <div class="realm-progress">
                    <div class="levels-completed">${completedLevels}/5 Levels</div>
                    <div class="stars-earned">⭐ ${totalStars}/15</div>
                </div>
                ${!isUnlocked ? '<div class="realm-lock">🔒</div>' : ''}
            </div>
        `;
    });
    
    return html;
}

function openRealmLevels(realmId) {
    var realm = DIVINE_REALMS[realmId];
    var modal = document.getElementById('levelSelectModal');
    var title = document.getElementById('realmTitle');
    var body = document.getElementById('levelSelectBody');
    
    title.innerHTML = `${realm.symbol} ${realm.name}`;
    body.innerHTML = generateLevelsHTML(realm);
    modal.style.display = 'flex';
    
    // Apply realm background
    modal.style.background = `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), ${realm.backgroundGradient}`;
}

function closeLevelSelect() {
    var modal = document.getElementById('levelSelectModal');
    modal.style.display = 'none';
}

function generateLevelsHTML(realm) {
    var html = '<div class="levels-grid">';
    
    realm.levels.forEach(function(levelData) {
        var isUnlocked = levelData.unlocked;
        var isCompleted = levelData.completed;
        var lockClass = isUnlocked ? '' : 'level-locked';
        var completedClass = isCompleted ? 'level-completed' : '';
        var clickHandler = isUnlocked ? `onclick="startCampaignLevel('${realm.id}', ${levelData.id})"` : '';
        
        var starsHTML = '';
        for (var i = 1; i <= 3; i++) {
            var starClass = i <= levelData.stars ? 'star-earned' : 'star-empty';
            starsHTML += `<span class="star ${starClass}">⭐</span>`;
        }
        
        var objectiveText = getLevelObjectiveText(levelData);
        
        html += `
            <div class="level-card ${lockClass} ${completedClass}" ${clickHandler}>
                <div class="level-number">${levelData.id}</div>
                <div class="level-type">${getLevelTypeIcon(levelData.type)}</div>
                <div class="level-objective">${objectiveText}</div>
                <div class="level-stars">${starsHTML}</div>
                ${!isUnlocked ? '<div class="level-lock">🔒</div>' : ''}
                ${levelData.type === 'boss' ? '<div class="boss-indicator">👑 BOSS</div>' : ''}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function getLevelTypeIcon(type) {
    var icons = {
        'score': '🎯',
        'clear': '🧹',
        'survival': '🛡️',
        'speed': '⚡',
        'cascade': '🌊',
        'combo': '🔗',
        'powerup': '💥',
        'chain': '⛓️',
        'boss': '👑',
        'endurance': '💪',
        'growth': '🌱',
        'harmony': '☯️',
        'mystery': '❓',
        'transformation': '🔄',
        'essence': '✨'
    };
    return icons[type] || '🎯';
}

function getLevelObjectiveText(levelData) {
    switch (levelData.type) {
        case 'score':
            return `Score ${levelData.target} in ${levelData.moves} moves`;
        case 'clear':
            return `Clear ${levelData.count} ${levelData.targetGems.join('/')} gems`;
        case 'survival':
            return `Survive ${levelData.survivalMoves} moves`;
        case 'speed':
            return `Score ${levelData.target} in ${levelData.timeLimit}s`;
        case 'cascade':
            return `Create ${levelData.requiredCascades} cascades`;
        case 'combo':
            return `Make ${levelData.requiredCombos} combos`;
        case 'powerup':
            return `Create ${levelData.requiredPowerUps} power-ups`;
        case 'chain':
            return `Create ${levelData.requiredChains} chains`;
        case 'boss':
            return `Defeat the Realm Guardian`;
        case 'endurance':
            return `Score ${levelData.target} (max ${levelData.maxMoves} moves)`;
        case 'growth':
            return `Make ${levelData.healingMatches} healing matches`;
        case 'harmony':
            return `Create ${levelData.balancedMatches} balanced matches`;
        case 'mystery':
            return `Complete mystery objectives`;
        case 'transformation':
            return `Transform ${levelData.gemTransforms} gems`;
        case 'essence':
            return `Collect ${levelData.essenceGems} essence gems`;
        default:
            return `Complete the challenge`;
    }
}

function startCampaignLevel(realmId, levelId) {
    var realm = DIVINE_REALMS[realmId];
    var levelData = realm.levels.find(function(l) { return l.id === levelId; });
    
    if (!levelData || !levelData.unlocked) {
        return;
    }
    
    currentCampaignLevel = {
        realm: realmId,
        level: levelId,
        data: levelData
    };
    
    // Set up level objectives
    resetLevelObjectives();
    
    // Configure game state for this level
    targetScore = levelData.target || 1000;
    moves = 0;
    score = 0;
    level = levelId;
    
    // Hide campaign UI and show game
    hideCampaignLevelSelect();
    
    // Apply realm theme
    applyRealmTheme(realm);
    
    // Initialize game with campaign level settings
    if (typeof initializeGame === 'function') initializeGame();
    
    // Show level start notification
    showLevelStartNotification(realm, levelData);
    
    // Start special mechanics if needed
    if (levelData.type === 'speed' && levelData.timeLimit) {
        startLevelTimer(levelData.timeLimit);
    }
}

function resetLevelObjectives() {
    levelObjectives = {
        clearedGems: {},
        cascadeCount: 0,
        comboCount: 0,
        powerUpsCreated: 0,
        chainCount: 0,
        specialCounter: 0
    };
    
    // Initialize cleared gems counter for all gem types
    DIVINE_GEMS.forEach(function(gem) {
        levelObjectives.clearedGems[gem.name] = 0;
    });
}

function applyRealmTheme(realm) {
    var gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.style.background = realm.backgroundGradient;
        gameContainer.classList.add('realm-theme-' + realm.id);
    }
}

function showLevelStartNotification(realm, levelData) {
    var notification = document.createElement('div');
    notification.className = 'level-start-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>${realm.symbol} ${realm.name}</h3>
            <h4>Level ${levelData.id}</h4>
            <p>${getLevelObjectiveText(levelData)}</p>
            <div class="notification-close">Tap to Continue</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    notification.addEventListener('click', function() {
        notification.remove();
    });
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function startLevelTimer(timeLimit) {
    timeLeft = timeLimit;
    var timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = '⏰ ' + timeLeft + 's';
        timerDisplay.style.display = 'block';
    }
    
    gameTimer = setInterval(function() {
        timeLeft--;
        if (timerDisplay) {
            timerDisplay.textContent = '⏰ ' + timeLeft + 's';
        }
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endCampaignLevel(false);
        }
    }, 1000);
}

// Make these functions globally available immediately
window.startNormalMode = startNormalMode;
window.startTimeAttack = startTimeAttack;
window.startDailyChallenge = startDailyChallenge;
window.startDivineConquest = startDivineConquest;

// Campaign functions
window.showCampaignLevelSelect = showCampaignLevelSelect;
window.hideCampaignLevelSelect = hideCampaignLevelSelect;
window.openRealmLevels = openRealmLevels;
window.closeLevelSelect = closeLevelSelect;
window.startCampaignLevel = startCampaignLevel;
window.replayCurrentLevel = replayCurrentLevel;
window.playNextLevel = playNextLevel;

// Essential helper functions - early definitions
function setActiveMode(activeId) {
    var modes = ['normalModeBtn', 'timeAttackBtn', 'dailyModeBtn'];
    modes.forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) {
            if (id === activeId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

function clearGameTimer() {
    if (typeof gameTimer !== 'undefined' && gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function generateDailyChallenge() {
    var today = new Date().toDateString();
    var seed = hashCode(today);
    var challengeType = Math.abs(seed) % 4;
    
    var challenges = [
        {
            type: 'score',
            description: '🔥 Forge of Divine Flames - Reach high scores with fire gems',
            target: 2500 + (Math.abs(seed) % 1000),
            bonus: 'fire'
        },
        {
            type: 'cascade',
            description: '💧 Ocean of Eternal Cascades - Create epic chain reactions',
            target: 2000 + (Math.abs(seed) % 800),
            bonus: 'cascade'
        },
        {
            type: 'speed',
            description: '⚡ Lightning Speed Challenge - Quick divine victories',
            target: 1800 + (Math.abs(seed) % 600),
            bonus: 'speed'
        },
        {
            type: 'balance',
            description: '🌿 Garden of Divine Balance - Use all gem types equally',
            target: 2200 + (Math.abs(seed) % 700),
            bonus: 'balance'
        }
    ];
    
    var challenge = challenges[challengeType];
    challenge.date = today;
    
    return challenge;
}

function startGameTimer() {
    clearGameTimer();
    
    gameTimer = setInterval(function() {
        timeLeft--;
        
        var timerDisplayEl = document.getElementById('timerDisplay');
        if (timerDisplayEl) {
            timerDisplayEl.textContent = '⏰ ' + timeLeft + 's';
            
            if (timeLeft <= 10) {
                timerDisplayEl.classList.add('timer-warning');
            }
        }
        
        if (timeLeft <= 0) {
            endTimeAttackMode();
        }
    }, 1000);
}

function endTimeAttackMode() {
    clearGameTimer();
    
    var message = document.createElement('div');
    message.className = 'achievement-notification';
    message.innerHTML = '<div>⏰ Time\'s Up!</div><div>Final Score: ' + (typeof score !== 'undefined' ? score.toLocaleString() : '0') + '</div><div>Level Reached: ' + (typeof level !== 'undefined' ? level : '1') + '</div>';
    
    document.body.appendChild(message);
    
    setTimeout(function() {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 4000);
    
    if (typeof saveGameStats === 'function') saveGameStats();
}

// Initialize the complete game
function initializeGameReal() {
    console.log('🎯 Starting new Gems Rush: Divine Teams battle...');
    
    // Ensure we have a game board
    if (!gameBoard) {
        gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
        if (!gameBoard) {
            console.error('⚠️ Game board element not found! Creating fallback...');
            gameBoard = document.createElement('div');
            gameBoard.className = 'game-board';
            gameBoard.id = 'gameBoard';
            
            // Try to add it to the game interface
            var gameInterface = document.getElementById('gameInterface');
            if (gameInterface) {
                gameInterface.appendChild(gameBoard);
            } else {
                // Fallback: add to body
                document.body.appendChild(gameBoard);
            }
        }
    }
    
    if (gameBoard) {
        gameBoard.innerHTML = '';
        console.log('✅ Game board ready');
    } else {
        console.error('❌ Could not create game board!');
        return;
    }
    
    // Initialize game state
    board = [];
    score = 0;
    level = 1;
    targetScore = 1000;
    selectedGem = null;
    isAnimating = false;
    moves = 0;
    comboMultiplier = 1;
    
    currentStreak = 0;
    hintsUsed = 0;
    undosUsed = 0;
    cascadeLevel = 0;
    totalMatches = 0;
    powerUpsCreated = 0;
    gameHistory = [];
    
    // Initialize UI elements if not already done
    initializeUI();
    
    // Create and render the game
    try {
    createBoard();
    renderBoard();
    updateAllDisplays();
    updateButtonStates();
    console.log('✅ Gems Rush: Divine Teams initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
    }
}

// Replace the placeholder with the real function
initializeGame = initializeGameReal;
window.initializeGameReal = initializeGameReal;

// Initialize game when DOM is loaded
function initializeOnLoad() {
    console.log('⚡ Initializing Gems Rush: Divine Teams...');
    
    // Show main menu first
    var mainMenu = document.getElementById('mainMenu');
    var gameInterface = document.getElementById('gameInterface');
    
    if (mainMenu) {
        mainMenu.style.display = 'flex';
    }
    if (gameInterface) {
        gameInterface.style.display = 'none';
    }
    
    // Pre-initialize UI elements but don't start the game
    gameBoard = document.querySelector('.game-board') || document.getElementById('gameBoard');
    initializeUI();
    initializeNewFeatures();
    initializeSoundSystem();
    initializeSwipeHandlers();
    initializeSettings();
    
    // Initialize home button event listeners
    var homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof goToMainMenu === 'function') {
                goToMainMenu();
            }
        });
        
        homeButton.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && typeof goToMainMenu === 'function') {
                e.preventDefault();
                goToMainMenu();
            }
        });
    }
    
    if (!gameBoard) {
        console.error('Game board not found!');
        gameBoard = document.createElement('div');
        gameBoard.className = 'game-board';
        gameBoard.id = 'gameBoard';
        var container = document.querySelector('.game-container') || document.body;
        container.appendChild(gameBoard);
    }
    
    try {
        // Load saved data but don't initialize game yet
        loadGameStats();
        loadAchievements();
        loadCampaignProgress();
        initializeDailyChallenge();
        updateStatisticsPanel();
        
        console.log('✅ Main menu ready - game will initialize when mode is selected');
    } catch (error) {
        console.error('Initialization failed:', error);
        alert('Failed to load game data. Some features may not work properly.');
    }
}

// Enhanced DOM ready detection
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnLoad);
} else {
    setTimeout(initializeOnLoad, 100);
}

window.addEventListener ? 
    window.addEventListener('load', initializeOnLoad) : 
    window.attachEvent('onload', initializeOnLoad);

// Initialize new features
function initializeNewFeatures() {
    streakCounter = document.getElementById('streakCounter');
    timerDisplay = document.getElementById('timerDisplay');
    dailyChallengeBadge = document.getElementById('dailyChallengeBadge');
    statsPanel = document.getElementById('statsPanel');
    gameModeIndicator = document.getElementById('gameModeIndicator');
    hintBtn = document.getElementById('hintBtn');
    undoBtn = document.getElementById('undoBtn');
    
    if (statsPanel) {
        statsPanel.style.display = 'block';
    }
}

// Initialize sound system
function initializeSoundSystem() {
    try {
        if (window.AudioContext || window.webkitAudioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle audio context state for user activation requirement
            if (audioContext.state === 'suspended') {
                document.addEventListener('click', function resumeAudio() {
                    if (audioContext && audioContext.state === 'suspended') {
                        audioContext.resume().then(function() {
                            console.log('Audio context resumed');
                        }).catch(function(err) {
                            console.warn('Could not resume audio context:', err);
                        });
                    }
                    document.removeEventListener('click', resumeAudio);
                }, { once: true });
            }
        } else {
            soundEnabled = false;
            console.warn('Web Audio API not supported');
        }
    } catch (e) {
        console.warn('Audio context not available:', e);
        soundEnabled = false;
    }
}

// Create simple sounds using Web Audio API
function createSound(frequency, duration, type) {
    if (!audioContext || !soundEnabled) return;
    
    try {
        // Check if audio context is suspended and try to resume
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(function() {
                createSoundInternal(frequency, duration, type);
            }).catch(function(err) {
                console.warn('Could not resume audio context for sound:', err);
            });
            return;
        }
        
        createSoundInternal(frequency, duration, type);
    } catch (e) {
        console.warn('Sound creation failed:', e);
    }
}

function createSoundInternal(frequency, duration, type) {
    try {
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type || 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.warn('Internal sound creation failed:', e);
    }
}

// Play sound effects
function playSound(type) {
    if (!soundEnabled) return;
    
    switch (type) {
        case 'match3':
            createSound(440, 0.2, 'sine');
            break;
        case 'match4':
            createSound(660, 0.3, 'triangle');
            break;
        case 'match5':
            createSound(880, 0.4, 'square');
            break;
        case 'cascade':
            createSound(220, 0.15, 'sawtooth');
            break;
        case 'levelUp':
            createSound(523, 0.5, 'sine');
            setTimeout(() => createSound(659, 0.5, 'sine'), 200);
            setTimeout(() => createSound(784, 0.8, 'sine'), 400);
            break;
        case 'powerUp':
            createSound(1047, 0.3, 'square');
            break;
        case 'achievement':
            createSound(523, 0.2, 'sine');
            setTimeout(() => createSound(659, 0.2, 'sine'), 100);
            setTimeout(() => createSound(784, 0.2, 'sine'), 200);
            setTimeout(() => createSound(1047, 0.4, 'sine'), 300);
            break;
        case 'gameOver':
            createSound(200, 0.5, 'triangle');
            setTimeout(() => createSound(150, 0.5, 'triangle'), 200);
            setTimeout(() => createSound(100, 0.8, 'triangle'), 400);
            break;
    }
}

// Initialize swipe handlers for mobile
function initializeSwipeHandlers() {
    if (gameBoard) {
        gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
        gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
}

// Handle touch start
function handleTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        element: e.target
    };
    
    if (e.target.classList.contains('gem')) {
        e.target.classList.add('touch-feedback');
    }
}

// Handle touch move
function handleTouchMove(e) {
    e.preventDefault();
}

// Handle touch end
function handleTouchEnd(e) {
    e.preventDefault();
    
    if (touchStart && touchStart.element && touchStart.element.classList.contains('gem')) {
        touchStart.element.classList.remove('touch-feedback');
    }
    
    if (!touchStart) return;
    
    var touch = e.changedTouches[0];
    touchEnd = {
        x: touch.clientX,
        y: touch.clientY
    };
    
    var deltaX = touchEnd.x - touchStart.x;
    var deltaY = touchEnd.y - touchStart.y;
    var minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        var swipeDirection;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            swipeDirection = deltaX > 0 ? 'right' : 'left';
        } else {
            swipeDirection = deltaY > 0 ? 'down' : 'up';
        }
        
        handleSwipeGesture(touchStart.element, swipeDirection);
    } else {
        if (touchStart.element && touchStart.element.classList.contains('gem')) {
            handleGemClick({ target: touchStart.element });
        }
    }
    
    touchStart = null;
    touchEnd = null;
}

// Handle swipe gestures
function handleSwipeGesture(element, direction) {
    if (!element || !element.classList.contains('gem')) return;
    
    var row = parseInt(element.dataset.row);
    var col = parseInt(element.dataset.col);
    var newRow = row;
    var newCol = col;
    
    switch (direction) {
        case 'up': newRow = row - 1; break;
        case 'down': newRow = row + 1; break;
        case 'left': newCol = col - 1; break;
        case 'right': newCol = col + 1; break;
    }
    
    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
        saveGameState();
        attemptSwap(row, col, newRow, newCol);
    }
}

// Initialize UI elements
function initializeUI() {
    scoreDisplay = document.getElementById('score') || createDisplay('score', 'Score: 0');
    levelDisplay = document.getElementById('level') || createDisplay('level', 'Realm: 1');
    targetDisplay = document.getElementById('target') || createDisplay('target', 'Target: 1000');
    movesDisplay = document.getElementById('moves') || createDisplay('moves', 'Moves: 0');
}

// Create display element
function createDisplay(id, text) {
    var display = document.createElement('div');
    display.id = id;
    display.className = 'game-stat';
    display.textContent = text;
    
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

// Create the game board data structure
function createBoard() {
    console.log('💎 Creating divine gem board...');
    
    board = [];
    for (var row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
    }
    
    for (var row = 0; row < BOARD_SIZE; row++) {
        for (var col = 0; col < BOARD_SIZE; col++) {
            var gem;
            var attempts = 0;
            
            do {
                gem = createRandomDivineGem();
                attempts++;
            } while (wouldCreateMatch(row, col, gem.type) && attempts < 50);
            
            board[row][col] = gem;
        }
    }
    
    console.log('💎 Divine gem board created successfully');
}

// Create a random divine gem
function createRandomDivineGem() {
    var gemType = DIVINE_GEMS[Math.floor(Math.random() * DIVINE_GEMS.length)];
    return {
        type: gemType.name,
        symbol: gemType.symbol,
        color: gemType.color,
        isPowerUp: false,
        powerUpType: null
    };
}

// Create power-up gem
function createPowerUpGem(matchSize, type, position) {
    var basePowerUp;
    
    if (matchSize >= 5) {
        basePowerUp = POWER_UPS.RAINBOW;
    } else if (matchSize === 4) {
        basePowerUp = POWER_UPS.LIGHTNING;
    } else {
        basePowerUp = POWER_UPS.BOMB;
    }
    
    return {
        type: type,
        symbol: basePowerUp.symbol,
        color: '#FFD700',
        isPowerUp: true,
        powerUpType: basePowerUp.name,
        powerUpEffect: basePowerUp.effect
    };
}

// Check if placing a gem would create an immediate match
function wouldCreateMatch(row, col, gemType) {
    var horizontalCount = 1;
    
    for (var i = col - 1; i >= 0; i--) {
        if (board[row][i] && board[row][i].type === gemType) {
            horizontalCount++;
        } else {
            break;
        }
    }
    
    for (var i = col + 1; i < BOARD_SIZE; i++) {
        if (board[row][i] && board[row][i].type === gemType) {
            horizontalCount++;
        } else {
            break;
        }
    }
    
    if (horizontalCount >= 3) return true;
    
    var verticalCount = 1;
    
    for (var i = row - 1; i >= 0; i--) {
        if (board[i][col] && board[i][col].type === gemType) {
            verticalCount++;
        } else {
            break;
        }
    }
    
    for (var i = row + 1; i < BOARD_SIZE; i++) {
        if (board[i][col] && board[i][col].type === gemType) {
            verticalCount++;
        } else {
            break;
        }
    }
    
    return verticalCount >= 3;
}

// Render the game board to the DOM
function renderBoard() {
    if (!gameBoard) {
        console.error('❌ Cannot render board: gameBoard element not found');
        return;
    }
    
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
    
    console.log('✅ Board rendered with', BOARD_SIZE * BOARD_SIZE, 'gems');
}

// Create a gem DOM element
function createGemElement(gem, row, col) {
    var element = document.createElement('div');
    element.className = 'gem ' + gem.type;
    element.textContent = gem.symbol;
    element.dataset.row = row;
    element.dataset.col = col;
    element.style.gridRow = row + 1;
    element.style.gridColumn = col + 1;
    
    if (gem.isPowerUp) {
        element.classList.add('power-up');
        element.title = 'Power-up: ' + gem.powerUpType;
    }
    
    element.addEventListener('click', handleGemClick);
    
    return element;
}

// Handle gem clicks
function handleGemClick(event) {
    if (isAnimating) return;
    
    var element = event.target;
    var row = parseInt(element.dataset.row);
    var col = parseInt(element.dataset.col);
    
    if (selectedGem) {
        var selectedRow = parseInt(selectedGem.dataset.row);
        var selectedCol = parseInt(selectedGem.dataset.col);
        
        if (row === selectedRow && col === selectedCol) {
            deselectGem();
        } else if (isAdjacent(selectedRow, selectedCol, row, col)) {
            saveGameState();
            attemptSwap(selectedRow, selectedCol, row, col);
            deselectGem();
        } else {
            deselectGem();
            selectGem(element, row, col);
        }
    } else {
        selectGem(element, row, col);
    }
}

// Select a gem
function selectGem(element, row, col) {
    selectedGem = element;
    element.classList.add('selected');
}

// Deselect current gem
function deselectGem() {
    if (selectedGem) {
        selectedGem.classList.remove('selected');
        selectedGem = null;
    }
}

// Check if two positions are adjacent
function isAdjacent(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
}

// Attempt to swap two gems
async function attemptSwap(row1, col1, row2, col2) {
    isAnimating = true;
    moves++;
    updateMovesDisplay();
    
    var temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
    
    renderBoard();
    
    var matches = findMatches();
    
    if (matches.length > 0) {
        await processMatchesWithCascade();
        
        // Check level completion (campaign-aware)
        if (currentGameMode === 'campaign' && currentCampaignLevel) {
            checkCampaignLevelCompletion();
        } else {
        checkLevelCompletion();
        }
    } else {
        board[row1][col1] = board[row2][col2];
        board[row2][col2] = temp;
        renderBoard();
        showInvalidMove();
        moves--;
        updateMovesDisplay();
    }
    
    updateButtonStates();
    isAnimating = false;
}

// Process matches with enhanced cascade handling
async function processMatchesWithCascade() {
    cascadeLevel = 0;
    var hasMatches = true;
    
    while (hasMatches) {
        var matches = findMatches();
        if (matches.length === 0) {
            hasMatches = false;
            break;
        }
        
        cascadeLevel++;
        await processMatches(matches);
        
        await sleep(300);
        
        applyGravity();
        fillEmptySpaces();
        renderBoard();
        
        await sleep(200);
        
        if (cascadeLevel > 1) {
            playSound('cascade');
        }
    }
    
    updateStreak(cascadeLevel > 0);
    checkAchievements('cascade', { level: cascadeLevel });
    
    cascadeLevel = 0;
}

// Find all matches on the board
function findMatches() {
    var matches = [];
    
    for (var row = 0; row < BOARD_SIZE; row++) {
        var matchGroup = [];
        var currentType = null;
        
        for (var col = 0; col < BOARD_SIZE; col++) {
            var gem = board[row][col];
            if (gem && gem.type === currentType && !gem.isPowerUp) {
                matchGroup.push({ row: row, col: col });
            } else {
                if (matchGroup.length >= 3) {
                    matches.push([...matchGroup]);
                }
                matchGroup = (gem && !gem.isPowerUp) ? [{ row: row, col: col }] : [];
                currentType = (gem && !gem.isPowerUp) ? gem.type : null;
            }
        }
        
        if (matchGroup.length >= 3) {
            matches.push([...matchGroup]);
        }
    }
    
    for (var col = 0; col < BOARD_SIZE; col++) {
        var matchGroup = [];
        var currentType = null;
        
        for (var row = 0; row < BOARD_SIZE; row++) {
            var gem = board[row][col];
            if (gem && gem.type === currentType && !gem.isPowerUp) {
                matchGroup.push({ row: row, col: col });
            } else {
                if (matchGroup.length >= 3) {
                    matches.push([...matchGroup]);
                }
                matchGroup = (gem && !gem.isPowerUp) ? [{ row: row, col: col }] : [];
                currentType = (gem && !gem.isPowerUp) ? gem.type : null;
            }
        }
        
        if (matchGroup.length >= 3) {
            matches.push([...matchGroup]);
        }
    }
    
    return matches;
}

// Enhanced match processing
async function processMatches(matches) {
    if (matches.length === 0) return;
    
    totalMatches += matches.length;
    
    var totalPoints = 0;
    var powerUpsToCreate = [];
    
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        var matchSize = match.length;
        var points = calculateScore([match]);
        totalPoints += points;
        
        if (matchSize >= 4) {
            var centerPos = match[Math.floor(match.length / 2)];
            var gemType = board[centerPos.row][centerPos.col].type;
            powerUpsToCreate.push({
                position: centerPos,
                size: matchSize,
                type: gemType
            });
            powerUpsCreated++;
        }
        
        if (matchSize >= 5) {
            playSound('match5');
        } else if (matchSize === 4) {
            playSound('match4');
        } else {
            playSound('match3');
        }
        
        checkAchievements('match', { size: matchSize });
    }
    
    var cascadeBonus = cascadeLevel > 1 ? cascadeLevel * 0.5 : 1;
    totalPoints = Math.floor(totalPoints * cascadeBonus);
    
    updateScore(totalPoints);
    
    // Update campaign objectives if in campaign mode
    if (currentGameMode === 'campaign' && currentCampaignLevel) {
        updateLevelObjectives(matches, cascadeLevel);
    }
    
    await animateMatches(matches, totalPoints);
    
    removeMatches(matches);
    
    for (var j = 0; j < powerUpsToCreate.length; j++) {
        var powerUp = powerUpsToCreate[j];
        var powerUpGem = createPowerUpGem(powerUp.size, powerUp.type, powerUp.position);
        board[powerUp.position.row][powerUp.position.col] = powerUpGem;
        playSound('powerUp');
    }
    
    if (cascadeLevel > 1) {
        showComboText(cascadeLevel, totalPoints);
    }
}

// Enhanced match animations
async function animateMatches(matches, points) {
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        for (var j = 0; j < match.length; j++) {
            var pos = match[j];
            var element = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (element) {
                element.classList.add('match-pulse');
                
                createParticles(element, board[pos.row][pos.col].type);
                
                if (match.length >= 4) {
                    showFloatingScore(points / matches.length, pos.row, pos.col);
                }
            }
        }
    }
    
    if (matches.some(match => match.length >= 5)) {
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 400);
    }
    
    await sleep(300);
    
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        for (var j = 0; j < match.length; j++) {
            var pos = match[j];
            var element = document.querySelector(`[data-row="${pos.row}"][data-col="${pos.col}"]`);
            if (element) {
                element.classList.add('match-fade');
            }
        }
    }
    
    await sleep(500);
}

// Create particle effects
function createParticles(element, gemType) {
    var rect = element.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    
    for (var i = 0; i < 8; i++) {
        var particle = document.createElement('div');
        particle.className = 'particle ' + gemType;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        var angle = (i / 8) * Math.PI * 2;
        var distance = 20 + Math.random() * 30;
        var finalX = centerX + Math.cos(angle) * distance;
        var finalY = centerY + Math.sin(angle) * distance;
        
        particle.style.setProperty('--final-x', finalX + 'px');
        particle.style.setProperty('--final-y', finalY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

// Show floating score
function showFloatingScore(points, row, col) {
    var element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!element) return;
    
    var rect = element.getBoundingClientRect();
    var floatingScore = document.createElement('div');
    floatingScore.className = 'floating-score';
    floatingScore.textContent = '+' + Math.floor(points);
    floatingScore.style.left = (rect.left + rect.width / 2) + 'px';
    floatingScore.style.top = (rect.top + rect.height / 2) + 'px';
    
    document.body.appendChild(floatingScore);
    
    setTimeout(() => {
        if (floatingScore.parentNode) {
            floatingScore.parentNode.removeChild(floatingScore);
        }
    }, 1200);
}

// Show combo text
function showComboText(cascadeLevel, points) {
    var comboText = document.createElement('div');
    comboText.className = 'combo-text';
    
    if (cascadeLevel >= 5) {
        comboText.textContent = 'DIVINE! x' + cascadeLevel;
        comboText.style.color = '#FFD700';
    } else if (cascadeLevel >= 3) {
        comboText.textContent = 'COMBO! x' + cascadeLevel;
        comboText.style.color = '#FF6347';
    } else {
        comboText.textContent = 'Nice! x' + cascadeLevel;
        comboText.style.color = '#32CD32';
    }
    
    var gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
        var rect = gameBoard.getBoundingClientRect();
        comboText.style.left = (rect.left + rect.width / 2) + 'px';
        comboText.style.top = (rect.top + rect.height / 2) + 'px';
    }
    
    document.body.appendChild(comboText);
    
    setTimeout(() => {
        if (comboText.parentNode) {
            comboText.parentNode.removeChild(comboText);
        }
    }, 2000);
}

// Remove matched gems from the board
function removeMatches(matches) {
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        for (var j = 0; j < match.length; j++) {
            var pos = match[j];
            board[pos.row][pos.col] = null;
        }
    }
}

// Calculate score for matches
function calculateScore(matches) {
    var totalScore = 0;
    
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        var baseScore;
        
        if (match.length >= 6) {
            baseScore = 500 + (match.length - 6) * 100;
        } else if (match.length === 5) {
            baseScore = 300;
        } else if (match.length === 4) {
            baseScore = 150;
        } else {
            baseScore = 50;
        }
        
        // Simple daily challenge bonus
        if (currentGameMode === 'dailyChallenge' && dailyChallengeData) {
            switch (dailyChallengeData.bonus) {
                case 'fire':
                    if (board[match[0].row][match[0].col].name === 'fire') {
                        baseScore *= 1.5;
                    }
                    break;
                case 'cascade':
                    if (cascadeLevel > 0) {
                        baseScore *= (1 + cascadeLevel * 0.2);
                    }
                    break;
                case 'speed':
                    if (moves <= 20) {
                        baseScore *= 1.3;
                    }
                    break;
                case 'balance':
                    // Bonus for using different gem types
                    baseScore *= 1.2;
                    break;
            }
        }
        
        totalScore += Math.floor(baseScore);
    }
    
    return totalScore;
}

// Apply gravity to make gems fall
function applyGravity() {
    for (var col = 0; col < BOARD_SIZE; col++) {
        var emptyRow = BOARD_SIZE - 1;
        
        for (var row = BOARD_SIZE - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                if (row !== emptyRow) {
                    board[emptyRow][col] = board[row][col];
                    board[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
}

// Fill empty spaces with new gems
function fillEmptySpaces() {
    for (var col = 0; col < BOARD_SIZE; col++) {
        for (var row = 0; row < BOARD_SIZE; row++) {
            if (board[row][col] === null) {
                board[row][col] = createRandomDivineGem();
            }
        }
    }
}

// Check if level is complete
function checkLevelCompletion() {
    if (score >= targetScore) {
        // Handle daily challenge completion
        if (currentGameMode === 'dailyChallenge') {
            var message = document.createElement('div');
            message.className = 'achievement-notification';
            message.innerHTML = `
                <div>🎉 Daily Quest Complete! 🎉</div>
                <div>Divine Score: ${score.toLocaleString()}</div>
                <div>🏆 Quest Mastered!</div>
            `;
            
            document.body.appendChild(message);
            
            setTimeout(function() {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 4000);
            
            // Save completion
            localStorage.setItem('dailyQuestCompleted_' + dailyChallengeData.date, 'true');
            
            playSound('achievement');
            checkAchievements('level', { level: level, moves: moves });
            
            return;
        }
        
        // Normal mode progression
        level++;
        targetScore = level * 1000 + (level - 1) * 500;
        
        showLevelComplete();
        playSound('levelUp');
        checkAchievements('level', { level: level, moves: moves });
        
        updateAllDisplays();
    }
}

// Campaign-specific level completion check
function checkCampaignLevelCompletion() {
    if (!currentCampaignLevel) {
        return checkLevelCompletion(); // Fallback to normal mode
    }
    
    var levelData = currentCampaignLevel.data;
    var isCompleted = false;
    var objectives = [];
    
    // Check main objective completion
    switch (levelData.type) {
        case 'score':
            isCompleted = score >= levelData.target && moves <= levelData.moves;
            objectives.push({
                type: 'score',
                current: score,
                target: levelData.target,
                completed: score >= levelData.target
            });
            break;
            
        case 'clear':
            var clearedCount = 0;
            levelData.targetGems.forEach(function(gemType) {
                clearedCount += levelObjectives.clearedGems[gemType] || 0;
            });
            isCompleted = clearedCount >= levelData.count && moves <= levelData.moves;
            objectives.push({
                type: 'clear',
                current: clearedCount,
                target: levelData.count,
                completed: clearedCount >= levelData.count
            });
            break;
            
        case 'survival':
            isCompleted = moves >= levelData.survivalMoves && score >= levelData.target;
            objectives.push({
                type: 'survival',
                current: moves,
                target: levelData.survivalMoves,
                completed: moves >= levelData.survivalMoves
            });
            break;
            
        case 'speed':
            isCompleted = score >= levelData.target && timeLeft > 0;
            objectives.push({
                type: 'speed',
                current: score,
                target: levelData.target,
                completed: score >= levelData.target
            });
            break;
            
        case 'cascade':
            isCompleted = levelObjectives.cascadeCount >= levelData.requiredCascades && score >= levelData.target;
            objectives.push({
                type: 'cascade',
                current: levelObjectives.cascadeCount,
                target: levelData.requiredCascades,
                completed: levelObjectives.cascadeCount >= levelData.requiredCascades
            });
            break;
            
        case 'combo':
            isCompleted = levelObjectives.comboCount >= levelData.requiredCombos && score >= levelData.target;
            objectives.push({
                type: 'combo',
                current: levelObjectives.comboCount,
                target: levelData.requiredCombos,
                completed: levelObjectives.comboCount >= levelData.requiredCombos
            });
            break;
            
        case 'powerup':
            isCompleted = levelObjectives.powerUpsCreated >= levelData.requiredPowerUps && score >= levelData.target;
            objectives.push({
                type: 'powerup',
                current: levelObjectives.powerUpsCreated,
                target: levelData.requiredPowerUps,
                completed: levelObjectives.powerUpsCreated >= levelData.requiredPowerUps
            });
            break;
            
        case 'boss':
            isCompleted = score >= levelData.target && moves <= levelData.moves;
            objectives.push({
                type: 'boss',
                current: score,
                target: levelData.target,
                completed: score >= levelData.target
            });
            break;
            
        default:
            isCompleted = score >= levelData.target && moves <= levelData.moves;
    }
    
    if (isCompleted) {
        endCampaignLevel(true, objectives);
    }
    
    // Update objectives display
    updateObjectivesDisplay(objectives);
}

function endCampaignLevel(success, objectives) {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    
    if (!currentCampaignLevel) return;
    
    var levelData = currentCampaignLevel.data;
    var realm = DIVINE_REALMS[currentCampaignLevel.realm];
    
    if (success) {
        // Calculate stars based on performance
        var stars = calculateLevelStars(levelData, score, moves, timeLeft);
        
        // Update level data
        levelData.completed = true;
        levelData.stars = Math.max(levelData.stars, stars);
        
        // Award divine essence
        var essenceEarned = stars * 50 + Math.floor(score / 100);
        campaignProgress.divineEssence += essenceEarned;
        campaignProgress.totalStars += stars;
        campaignProgress.completedLevels++;
        
        // Unlock next level
        unlockNextLevel(currentCampaignLevel.realm, currentCampaignLevel.level);
        
        // Show completion screen
        showCampaignLevelComplete(realm, levelData, stars, essenceEarned);
        
        // Save progress
        saveCampaignProgress();
        
        playSound('levelUp');
    } else {
        // Show failure screen
        showCampaignLevelFailed(realm, levelData);
        playSound('gameOver');
    }
}

function calculateLevelStars(levelData, finalScore, movesTaken, timeRemaining) {
    var stars = 1; // Base completion star
    
    // Efficiency bonus (moves)
    if (levelData.moves) {
        var moveEfficiency = movesTaken / levelData.moves;
        if (moveEfficiency <= 0.7) stars++;
        if (moveEfficiency <= 0.5) stars++;
    }
    
    // Score bonus
    if (levelData.target) {
        var scoreRatio = finalScore / levelData.target;
        if (scoreRatio >= 1.5 && stars < 3) stars++;
        if (scoreRatio >= 2.0 && stars < 3) stars = 3;
    }
    
    // Time bonus for speed levels
    if (levelData.type === 'speed' && timeRemaining > 10) {
        stars = Math.max(stars, 2);
        if (timeRemaining > 30) stars = 3;
    }
    
    return Math.min(stars, 3);
}

function unlockNextLevel(realmId, currentLevelId) {
    var realm = DIVINE_REALMS[realmId];
    var nextLevel = realm.levels.find(function(l) { return l.id === currentLevelId + 1; });
    
    if (nextLevel) {
        nextLevel.unlocked = true;
    }
    
    // Check if realm is completed to unlock next realm
    var completedLevels = realm.levels.filter(function(l) { return l.completed; }).length;
    if (completedLevels >= 5) {
        unlockNextRealm(realmId);
    }
}

function unlockNextRealm(currentRealmId) {
    var realmOrder = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic'];
    var currentIndex = realmOrder.indexOf(currentRealmId);
    
    if (currentIndex >= 0 && currentIndex < realmOrder.length - 1) {
        var nextRealmId = realmOrder[currentIndex + 1];
        if (!campaignProgress.unlockedRealms.includes(nextRealmId)) {
            campaignProgress.unlockedRealms.push(nextRealmId);
            DIVINE_REALMS[nextRealmId].levels[0].unlocked = true;
            
            // Show realm unlock notification
            showRealmUnlockNotification(DIVINE_REALMS[nextRealmId]);
        }
    }
}

function showCampaignLevelComplete(realm, levelData, stars, essenceEarned) {
    var starsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var starClass = i <= stars ? 'star-earned' : 'star-empty';
        starsHTML += `<span class="completion-star ${starClass}">⭐</span>`;
    }
    
    var message = document.createElement('div');
    message.className = 'campaign-completion-modal';
    message.innerHTML = `
        <div class="completion-content">
            <h2>🏆 Level Complete! 🏆</h2>
            <div class="completion-realm">${realm.symbol} ${realm.name}</div>
            <div class="completion-level">Level ${levelData.id}</div>
            <div class="completion-stars">${starsHTML}</div>
            <div class="completion-stats">
                <div class="stat">
                    <span class="stat-label">Score:</span>
                    <span class="stat-value">${score.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Moves:</span>
                    <span class="stat-value">${moves}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Divine Essence:</span>
                    <span class="stat-value">+${essenceEarned}</span>
                </div>
            </div>
            <div class="completion-buttons">
                <button class="btn btn-primary" onclick="showCampaignLevelSelect()">🗺️ Level Select</button>
                <button class="btn btn-secondary" onclick="replayCurrentLevel()">🔄 Replay</button>
                <button class="btn btn-success" onclick="playNextLevel()">➡️ Next Level</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
}

function showCampaignLevelFailed(realm, levelData) {
    var message = document.createElement('div');
    message.className = 'campaign-failure-modal';
    message.innerHTML = `
        <div class="failure-content">
            <h2>💀 Level Failed 💀</h2>
            <div class="failure-realm">${realm.symbol} ${realm.name}</div>
            <div class="failure-level">Level ${levelData.id}</div>
            <div class="failure-objective">${getLevelObjectiveText(levelData)}</div>
            <div class="failure-stats">
                <div class="stat">
                    <span class="stat-label">Score:</span>
                    <span class="stat-value">${score.toLocaleString()}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Moves:</span>
                    <span class="stat-value">${moves}</span>
                </div>
            </div>
            <div class="failure-buttons">
                <button class="btn btn-primary" onclick="replayCurrentLevel()">🔄 Try Again</button>
                <button class="btn btn-secondary" onclick="showCampaignLevelSelect()">🗺️ Level Select</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
}

function showRealmUnlockNotification(realm) {
    var notification = document.createElement('div');
    notification.className = 'realm-unlock-notification';
    notification.innerHTML = `
        <div class="unlock-content">
            <h2>🔓 New Realm Unlocked! 🔓</h2>
            <div class="unlock-realm">
                <div class="unlock-symbol" style="color: ${realm.color};">${realm.symbol}</div>
                <div class="unlock-name">${realm.name}</div>
                <div class="unlock-description">${realm.description}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

function replayCurrentLevel() {
    // Close any modal
    var modals = document.querySelectorAll('.campaign-completion-modal, .campaign-failure-modal');
    modals.forEach(function(modal) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
    
    if (currentCampaignLevel) {
        startCampaignLevel(currentCampaignLevel.realm, currentCampaignLevel.level);
    }
}

function playNextLevel() {
    // Close any modal
    var modals = document.querySelectorAll('.campaign-completion-modal, .campaign-failure-modal');
    modals.forEach(function(modal) {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
    
    if (currentCampaignLevel) {
        var nextLevelId = currentCampaignLevel.level + 1;
        var realm = DIVINE_REALMS[currentCampaignLevel.realm];
        var nextLevel = realm.levels.find(function(l) { return l.id === nextLevelId; });
        
        if (nextLevel && nextLevel.unlocked) {
            startCampaignLevel(currentCampaignLevel.realm, nextLevelId);
        } else {
            showCampaignLevelSelect();
        }
    }
}

function updateObjectivesDisplay(objectives) {
    var display = document.getElementById('objectivesDisplay');
    if (!display) {
        display = document.createElement('div');
        display.id = 'objectivesDisplay';
        display.className = 'objectives-display';
        document.querySelector('.game-stats').appendChild(display);
    }
    
    var html = '<h4>📋 Objectives</h4>';
    objectives.forEach(function(obj) {
        var checkmark = obj.completed ? '✅' : '⏳';
        var progressText = '';
        
        switch (obj.type) {
            case 'score':
                progressText = `${obj.current.toLocaleString()} / ${obj.target.toLocaleString()}`;
                break;
            case 'clear':
                progressText = `${obj.current} / ${obj.target}`;
                break;
            case 'survival':
                progressText = `${obj.current} / ${obj.target} moves`;
                break;
            default:
                progressText = `${obj.current} / ${obj.target}`;
        }
        
        html += `<div class="objective-item">${checkmark} ${progressText}</div>`;
    });
    
    display.innerHTML = html;
}

function saveCampaignProgress() {
    try {
        localStorage.setItem('gemsRush_campaignProgress', JSON.stringify(campaignProgress));
        localStorage.setItem('gemsRush_divineRealms', JSON.stringify(DIVINE_REALMS));
    } catch (e) {
        console.warn('Could not save campaign progress:', e);
    }
}

function loadCampaignProgress() {
    try {
        var savedProgress = localStorage.getItem('gemsRush_campaignProgress');
        var savedRealms = localStorage.getItem('gemsRush_divineRealms');
        
        if (savedProgress) {
            var loadedProgress = JSON.parse(savedProgress);
            // Merge with defaults to handle new properties
            campaignProgress = Object.assign(campaignProgress, loadedProgress);
        }
        
        if (savedRealms) {
            var loadedRealms = JSON.parse(savedRealms);
            // Update realm progress while preserving structure
            Object.keys(DIVINE_REALMS).forEach(function(realmId) {
                if (loadedRealms[realmId]) {
                    DIVINE_REALMS[realmId].levels.forEach(function(level, index) {
                        if (loadedRealms[realmId].levels[index]) {
                            Object.assign(level, loadedRealms[realmId].levels[index]);
                        }
                    });
                }
            });
        }
        
        updateCampaignProgressDisplay();
    } catch (e) {
        console.warn('Could not load campaign progress:', e);
    }
}

function updateCampaignProgressDisplay() {
    var essenceEl = document.getElementById('divineEssenceCount');
    var starsEl = document.getElementById('totalStarsCount');
    
    if (essenceEl) essenceEl.textContent = campaignProgress.divineEssence;
    if (starsEl) starsEl.textContent = campaignProgress.totalStars;
}

// Update level objectives during campaign gameplay
function updateLevelObjectives(matches, currentCascadeLevel) {
    if (!currentCampaignLevel || !matches) return;
    
    // Track cleared gems
    matches.forEach(function(match) {
        match.forEach(function(pos) {
            var gem = board[pos.row][pos.col];
            if (gem && gem.type) {
                if (!levelObjectives.clearedGems[gem.type]) {
                    levelObjectives.clearedGems[gem.type] = 0;
                }
                levelObjectives.clearedGems[gem.type]++;
            }
        });
    });
    
    // Track cascade count
    if (currentCascadeLevel > 1) {
        levelObjectives.cascadeCount++;
    }
    
    // Track combo count
    var totalMatchSize = matches.reduce(function(sum, match) { return sum + match.length; }, 0);
    if (totalMatchSize >= 4) {
        levelObjectives.comboCount++;
    }
    
    // Track power-ups created (already tracked in powerUpsCreated)
    levelObjectives.powerUpsCreated = powerUpsCreated;
    
    // Track chain reactions
    if (currentCascadeLevel >= 3) {
        levelObjectives.chainCount++;
    }
    
    // Update special counter for boss levels and special mechanics
    var levelData = currentCampaignLevel.data;
    if (levelData.type === 'boss' || levelData.specialMechanic) {
        // Boss-specific objective tracking can be added here
        levelObjectives.specialCounter++;
    }
}

// Show level completion message
function showLevelComplete() {
    var message = document.createElement('div');
    message.className = 'achievement-notification';
    message.innerHTML = `<div>🏆 Realm ${level - 1} Complete! 🏆</div><div>Ascending to Realm ${level}</div>`;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 3000);
}

// Update all displays
function updateAllDisplays() {
    updateScore(0);
    updateLevelDisplay();
    updateTargetDisplay();
    updateMovesDisplay();
    updateStreakDisplay();
    updateStatisticsPanel();
}

// Update score display
function updateScore(points) {
    score += points;
    if (scoreDisplay) {
        scoreDisplay.textContent = 'Score: ' + score.toLocaleString();
    }
}

// Update level display
function updateLevelDisplay() {
    if (levelDisplay) {
        levelDisplay.textContent = 'Realm: ' + level;
    }
}

// Update target score display
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

// Update streak display
function updateStreakDisplay() {
    if (streakCounter) {
        if (currentStreak > 0) {
            streakCounter.textContent = '🔥 Streak: ' + currentStreak;
            streakCounter.style.display = 'block';
        } else {
            streakCounter.style.display = 'none';
        }
    }
}

// Update streak
function updateStreak(hasMatches) {
    if (hasMatches) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
        
        if (currentStreak >= 5) {
            var bonus = currentStreak * 10;
            updateScore(bonus);
            showFloatingScore(bonus, 4, 4);
        }
        
        checkAchievements('streak', { streak: currentStreak });
    } else {
        currentStreak = 0;
    }
    
    updateStreakDisplay();
}

// Update button states
function updateButtonStates() {
    if (hintBtn) {
        hintBtn.disabled = hintsUsed >= 3 || findPossibleMoves().length === 0;
    }
    
    if (undoBtn) {
        undoBtn.disabled = undosUsed >= 3 || gameHistory.length === 0;
    }
}

// Show invalid move feedback
function showInvalidMove() {
    var message = document.createElement('div');
    message.className = 'floating-score';
    message.textContent = 'Invalid Move!';
    message.style.color = '#FF6347';
    message.style.left = '50%';
    message.style.top = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 1200);
}

// Sleep utility function
function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

// Save game state for undo functionality
function saveGameState() {
    if (gameHistory.length >= 5) {
        gameHistory.shift();
    }
    
    gameHistory.push({
        board: board.map(row => row.map(cell => cell ? {...cell} : null)),
        score: score,
        moves: moves,
        level: level,
        targetScore: targetScore,
        currentStreak: currentStreak
    });
}

// Undo last move
function undoLastMove() {
    if (gameHistory.length === 0 || undosUsed >= 3) return;
    
    var previousState = gameHistory.pop();
    board = previousState.board;
    score = previousState.score;
    moves = previousState.moves;
    level = previousState.level;
    targetScore = previousState.targetScore;
    currentStreak = previousState.currentStreak;
    
    undosUsed++;
    renderBoard();
    updateAllDisplays();
    updateButtonStates();
    
    deselectGem();
}

// Find possible moves for hint system
function findPossibleMoves() {
    var possibleMoves = [];
    
    for (var row = 0; row < BOARD_SIZE; row++) {
        for (var col = 0; col < BOARD_SIZE; col++) {
            var directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (var d = 0; d < directions.length; d++) {
                var dir = directions[d];
                var newRow = row + dir[0];
                var newCol = col + dir[1];
                
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    var temp = board[row][col];
                    board[row][col] = board[newRow][newCol];
                    board[newRow][newCol] = temp;
                    
                    var matches = findMatches();
                    if (matches.length > 0) {
                        possibleMoves.push({
                            from: { row: row, col: col },
                            to: { row: newRow, col: newCol }
                        });
                    }
                    
                    board[newRow][newCol] = board[row][col];
                    board[row][col] = temp;
                }
            }
        }
    }
    
    return possibleMoves;
}

// Show hint
function showHint() {
    if (hintsUsed >= 3) return;
    
    var possibleMoves = findPossibleMoves();
    if (possibleMoves.length === 0) return;
    
    var move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    var fromElement = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`);
    var toElement = document.querySelector(`[data-row="${move.to.row}"][data-col="${move.to.col}"]`);
    
    if (fromElement && toElement) {
        fromElement.classList.add('hint-glow');
        toElement.classList.add('hint-glow');
        
        setTimeout(() => {
            fromElement.classList.remove('hint-glow');
            toElement.classList.remove('hint-glow');
        }, 3000);
    }
    
    hintsUsed++;
    updateButtonStates();
}

// Initialize daily challenge
function initializeDailyChallenge() {
    var today = new Date().toDateString();
    var completedToday = localStorage.getItem('dailyQuestCompleted_' + today);
    
    if (dailyChallengeBadge) {
        if (completedToday) {
            dailyChallengeBadge.textContent = '✅ Quest Done';
            dailyChallengeBadge.style.background = 'linear-gradient(145deg, rgba(76,175,80,0.9), rgba(69,160,73,0.9))';
            dailyChallengeBadge.style.display = 'block';
        } else {
            dailyChallengeBadge.textContent = '📅 New Quest!';
            dailyChallengeBadge.style.background = 'linear-gradient(145deg, rgba(138,43,226,0.9), rgba(75,0,130,0.9))';
        dailyChallengeBadge.style.display = 'block';
        }
    }
}

// Achievement system
function checkAchievements(event, data) {
    ACHIEVEMENTS.forEach(function(achievement) {
        if (achievement.unlocked) return;
        
        var unlocked = false;
        
        switch (achievement.requirement) {
            case 'match_3':
                unlocked = event === 'match' && data.size >= 3;
                break;
            case 'match_5':
                unlocked = event === 'match' && data.size >= 5;
                break;
            case 'level_in_10_moves':
                unlocked = event === 'level' && data.moves <= 10;
                break;
            case 'streak_10':
                unlocked = event === 'streak' && data.streak >= 10;
                break;
            case 'cascade_3':
                unlocked = event === 'cascade' && data.level >= 3;
                break;
            case 'level_5':
                unlocked = event === 'level' && data.level >= 5;
                break;
        }
        
        if (unlocked) {
            unlockAchievement(achievement);
        }
    });
}

// Unlock achievement
function unlockAchievement(achievement) {
    achievement.unlocked = true;
    
    var notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div>🏆 Achievement Unlocked! 🏆</div>
        <div><strong>${achievement.name}</strong></div>
        <div>${achievement.description}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
    
    playSound('achievement');
    saveAchievements();
}

// Save achievements to localStorage
function saveAchievements() {
    try {
        localStorage.setItem('gameAchievements', JSON.stringify(ACHIEVEMENTS));
    } catch (e) {
        console.warn('Could not save achievements:', e);
    }
}

// Load achievements from localStorage
function loadAchievements() {
    try {
        var saved = localStorage.getItem('gameAchievements');
        if (saved) {
            var savedAchievements = JSON.parse(saved);
            savedAchievements.forEach(function(saved, index) {
                if (ACHIEVEMENTS[index]) {
                    ACHIEVEMENTS[index].unlocked = saved.unlocked;
                }
            });
        }
    } catch (e) {
        console.warn('Could not load achievements:', e);
    }
}

// Game statistics
function saveGameStats() {
    try {
        var stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
        
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + score;
        stats.bestScore = Math.max(stats.bestScore || 0, score);
        stats.highestLevel = Math.max(stats.highestLevel || 1, level);
        stats.bestStreak = Math.max(stats.bestStreak || 0, maxStreak);
        stats.totalMoves = (stats.totalMoves || 0) + moves;
        stats.totalMatches = (stats.totalMatches || 0) + totalMatches;
        stats.powerUpsCreated = (stats.powerUpsCreated || 0) + powerUpsCreated;
        
        localStorage.setItem('gameStats', JSON.stringify(stats));
        updateStatisticsPanel();
    } catch (e) {
        console.warn('Could not save game stats:', e);
    }
}

// Load game statistics
function loadGameStats() {
    try {
        var stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
        updateStatisticsPanel(stats);
        return stats;
    } catch (e) {
        console.warn('Could not load game stats:', e);
        return {};
    }
}

// Update statistics panel
function updateStatisticsPanel(stats) {
    stats = stats || loadGameStats();
    
    var elements = {
        'statGames': stats.gamesPlayed || 0,
        'statBestScore': (stats.bestScore || 0).toLocaleString(),
        'statTotalScore': (stats.totalScore || 0).toLocaleString(),
        'statHighestLevel': stats.highestLevel || 1,
        'statBestStreak': stats.bestStreak || 0
    };
    
    Object.keys(elements).forEach(function(id) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

// Restart game function
function restartGame() {
    console.log('🔄 Restarting Gems Rush: Divine Teams...');
    
    if (moves > 0 || score > 0) {
        saveGameStats();
    }
    
    clearGameTimer();
    
    hintsUsed = 0;
    undosUsed = 0;
    currentStreak = 0;
    cascadeLevel = 0;
    totalMatches = 0;
    powerUpsCreated = 0;
    gameHistory = [];
    
    initializeGame();
    
    if (currentGameMode === 'timeAttack') {
        timeLeft = 60;
        startGameTimer();
    }
}

// Settings system - simple modal approach (same as showGameInfo)
function showSettings() {
    var existingModal = document.getElementById('settingsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>⚙️ Game Settings</h2>
                <button class="close-btn" onclick="closeSettings()">✕</button>
            </div>
            <div class="modal-body">
                <div class="settings-section">
                    <h3>🔊 Audio Settings</h3>
                    <div class="setting-item">
                        <label for="masterVolume">Master Volume</label>
                        <input type="range" id="masterVolume" min="0" max="100" value="75" class="volume-slider">
                        <span class="volume-value">75%</span>
                    </div>
                    <div class="setting-item">
                        <label for="soundEffects">Sound Effects</label>
                        <input type="checkbox" id="soundEffects" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="backgroundMusic">Background Music</label>
                        <input type="checkbox" id="backgroundMusic" checked class="toggle-switch">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>👁️ Visual Settings</h3>
                    <div class="setting-item">
                        <label for="animations">Animations</label>
                        <input type="checkbox" id="animations" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="particleEffects">Particle Effects</label>
                        <input type="checkbox" id="particleEffects" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="highContrast">High Contrast Mode</label>
                        <input type="checkbox" id="highContrast" class="toggle-switch">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>🎮 Gameplay Settings</h3>
                    <div class="setting-item">
                        <label for="difficulty">Difficulty Level</label>
                        <select id="difficulty" class="settings-select">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="showHints">Show Hints</label>
                        <input type="checkbox" id="showHints" checked class="toggle-switch">
                    </div>
                    <div class="setting-item">
                        <label for="autoSave">Auto Save</label>
                        <input type="checkbox" id="autoSave" checked class="toggle-switch">
                    </div>
                </div>

                <div class="settings-buttons">
                    <button onclick="resetSettings()" class="btn btn-secondary">Reset to Defaults</button>
                    <button onclick="saveSettings()" class="btn btn-primary">Save Settings</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add modal styles (same as showGameInfo)
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    // Load current settings into the form
        loadSettingsToUI();
}

function closeSettings() {
    var modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(function() {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
}

function openSettings() {
    showSettings();
}

// Make functions globally available
window.restartGame = restartGame;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.showHint = showHint;
window.undoLastMove = undoLastMove;

// Initialize settings system (existing code)
function initializeSettings() {
    console.log('⚙️ Initializing settings system...');
    
    // Load saved settings or use defaults
    var savedSettings = {};
    try {
        savedSettings = JSON.parse(localStorage.getItem('gemsRushDivineTeamsSettings') || '{}');
    } catch (e) {
        console.warn('Could not load settings:', e);
    }
    
    // Default settings
    var defaultSettings = {
        masterVolume: 75,
        soundEffects: true,
        backgroundMusic: true,
        animations: true,
        particleEffects: true,
        highContrast: false,
        reducedMotion: false,
        boardTheme: 'space',
        difficulty: 'normal',
        showHints: true,
        autoSave: true,
        showComboText: true,
        boardSize: 'large',
        fullscreen: false,
        showStats: true,
        keyboardShortcuts: true
    };
    
    // Merge with saved settings
    var settings = Object.assign({}, defaultSettings, savedSettings);
    
    // Apply settings
    applySettings(settings);
    
    // Set up event listeners
    setupSettingsEventListeners();
    
    console.log('✅ Settings system initialized');
}

function setupSettingsEventListeners() {
    // This function is no longer needed as we use onclick handlers in the dynamic modal
}

function setupModalEventListeners() {
    // Volume slider real-time update
    var volumeSlider = document.getElementById('masterVolume');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            updateVolumeDisplay(this.value);
        });
    }
}

function saveSettings() {
    var masterVolumeEl = document.getElementById('masterVolume');
    var soundEffectsEl = document.getElementById('soundEffects');
    var backgroundMusicEl = document.getElementById('backgroundMusic');
    var animationsEl = document.getElementById('animations');
    var particleEffectsEl = document.getElementById('particleEffects');
    var highContrastEl = document.getElementById('highContrast');
    var reducedMotionEl = document.getElementById('reducedMotion');
    var boardThemeEl = document.getElementById('boardTheme');
    var difficultyEl = document.getElementById('difficulty');
    var showHintsEl = document.getElementById('showHints');
    var autoSaveEl = document.getElementById('autoSave');
    var showComboTextEl = document.getElementById('showComboText');
    var boardSizeEl = document.getElementById('boardSize');
    var fullscreenEl = document.getElementById('fullscreen');
    var showStatsEl = document.getElementById('showStats');
    var keyboardShortcutsEl = document.getElementById('keyboardShortcuts');
    
    var settings = {
        masterVolume: masterVolumeEl ? masterVolumeEl.value : 75,
        soundEffects: soundEffectsEl ? soundEffectsEl.checked : true,
        backgroundMusic: backgroundMusicEl ? backgroundMusicEl.checked : true,
        animations: animationsEl ? animationsEl.checked : true,
        particleEffects: particleEffectsEl ? particleEffectsEl.checked : true,
        highContrast: highContrastEl ? highContrastEl.checked : false,
        reducedMotion: reducedMotionEl ? reducedMotionEl.checked : false,
        boardTheme: boardThemeEl ? boardThemeEl.value : 'space',
        difficulty: difficultyEl ? difficultyEl.value : 'normal',
        showHints: showHintsEl ? showHintsEl.checked : true,
        autoSave: autoSaveEl ? autoSaveEl.checked : true,
        showComboText: showComboTextEl ? showComboTextEl.checked : true,
        boardSize: boardSizeEl ? boardSizeEl.value : 'large',
        fullscreen: fullscreenEl ? fullscreenEl.checked : false,
        showStats: showStatsEl ? showStatsEl.checked : true,
        keyboardShortcuts: keyboardShortcutsEl ? keyboardShortcutsEl.checked : true
    };
    
    try {
        localStorage.setItem('gemsRushDivineTeamsSettings', JSON.stringify(settings));
        applySettings(settings);
        showSettingsMessage('Settings saved successfully!', 'success');
    } catch (e) {
        console.error('Could not save settings:', e);
        showSettingsMessage('Failed to save settings', 'error');
    }
}

function resetSettings() {
    try {
        localStorage.removeItem('gemsRushDivineTeamsSettings');
        initializeSettings();
        loadSettingsToUI();
        showSettingsMessage('Settings reset to defaults', 'success');
    } catch (e) {
        console.error('Could not reset settings:', e);
        showSettingsMessage('Failed to reset settings', 'error');
    }
}

function loadSettingsToUI() {
    var savedSettings = {};
    try {
        savedSettings = JSON.parse(localStorage.getItem('gemsRushDivineTeamsSettings') || '{}');
    } catch (e) {
        console.warn('Could not load settings for UI:', e);
    }
    
    // Update UI elements
    var elements = {
        'masterVolume': savedSettings.masterVolume || 75,
        'soundEffects': savedSettings.soundEffects !== false,
        'backgroundMusic': savedSettings.backgroundMusic !== false,
        'animations': savedSettings.animations !== false,
        'particleEffects': savedSettings.particleEffects !== false,
        'highContrast': savedSettings.highContrast || false,
        'reducedMotion': savedSettings.reducedMotion || false,
        'boardTheme': savedSettings.boardTheme || 'space',
        'difficulty': savedSettings.difficulty || 'normal',
        'showHints': savedSettings.showHints !== false,
        'autoSave': savedSettings.autoSave !== false,
        'showComboText': savedSettings.showComboText !== false,
        'boardSize': savedSettings.boardSize || 'large',
        'fullscreen': savedSettings.fullscreen || false,
        'showStats': savedSettings.showStats !== false,
        'keyboardShortcuts': savedSettings.keyboardShortcuts !== false
    };
    
    Object.keys(elements).forEach(function(id) {
        var element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = elements[id];
            } else {
                element.value = elements[id];
            }
        }
    });
    
    // Update volume display
    updateVolumeDisplay(elements.masterVolume);
}

function updateVolumeDisplay(value) {
    var volumeValue = document.querySelector('.volume-value');
    if (volumeValue) {
        volumeValue.textContent = value + '%';
    }
}

function applySettings(settings) {
    // Apply sound settings
    soundEnabled = settings.soundEffects !== false;
    
    // Apply visual settings
    document.body.classList.toggle('no-animations', !settings.animations);
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Apply board theme
    var themeClasses = ['theme-space', 'theme-forest', 'theme-ocean', 'theme-fire'];
    themeClasses.forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add('theme-' + (settings.boardTheme || 'space'));
    
    // Apply stats panel visibility
    if (statsPanel) {
        statsPanel.style.display = settings.showStats !== false ? 'block' : 'none';
    }
}

function showSettingsMessage(message, type) {
    var messageDiv = document.createElement('div');
    messageDiv.className = 'settings-message ' + type;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1002;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Make settings functions globally available
window.saveSettings = saveSettings;
window.resetSettings = resetSettings;
window.initializeSettings = initializeSettings;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.openSettingsFromMenu = openSettingsFromMenu;
window.showSettings = showSettings;

// Make sure showCredits and closeCredits are globally available
window.showCredits = showCredits;
window.closeCredits = closeCredits;

console.log('🎮 Gems Rush: Divine Teams - All features loaded successfully!'); 