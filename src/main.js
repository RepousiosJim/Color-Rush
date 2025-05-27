// Main Application Entry Point
// Coordinates all modules and handles application initialization

import { gameEngine } from './core/game-engine.js';
import { gameState } from './core/game-state.js';
import { stageSystem } from './modes/stage-system.js';
import { storageManager } from './utils/storage.js';
import { helpers } from './utils/helpers.js';
import { uiInterface } from './ui/interface.js';
import { menuSystem } from './ui/menu-system.js';
import { modalSystem } from './ui/modals.js';
import { audioSystem } from './features/audio-system.js';
import { inputHandler } from './features/input-handler.js';
import { eventManager } from './utils/event-manager.js';
import { performanceMonitor } from './utils/performance-monitor.js';
import { performanceUtils, performanceHelpers } from './utils/performance-utils.js';
import { GAME_CONFIG } from './core/constants.js';
import { gameModeSelector } from './ui/game-mode-selector.js';

// Application state
let isApplicationInitialized = false;
let currentMenuMode = null;

// Main application class
class GemsRushApp {
    constructor() {
        this.modules = new Map();
        this.loadingPromises = new Map();
        this.eventListeners = new Map(); // Track event listeners for cleanup
        this.timers = new Set(); // Track active timers
        this.animationFrames = new Set(); // Track animation frames
        this.isDestroyed = false; // Prevent operations after cleanup
    }

    // Initialize the complete application
    async initialize() {
        if (isApplicationInitialized) {
            console.log('⚠️ Application already initialized');
            return;
        }

        try {
            // Initialize core modules first (critical path)
            await this.initializeCoreModules();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize UI
            this.initializeUI();

            // Load saved settings
            this.loadSettings();

            // Lazy load non-critical modules in background
            this.preloadModules();

            isApplicationInitialized = true;

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showErrorMessage('Failed to initialize game. Please refresh the page.');
        }
    }

    // Initialize critical path modules
    async initializeCoreModules() {
        // Initialize UI interface first
        const uiInitialized = uiInterface.initialize();
        if (!uiInitialized) {
            throw new Error('Failed to initialize UI interface');
        }

        // Initialize menu system
        const menuInitialized = menuSystem.initialize();
        if (!menuInitialized) {
            throw new Error('Failed to initialize menu system');
        }

        // Initialize modal system
        const modalsInitialized = modalSystem.initialize();
        if (!modalsInitialized) {
            throw new Error('Failed to initialize modal system');
        }

        // Initialize audio system
        const audioInitialized = await audioSystem.initialize();
        if (!audioInitialized) {
            console.warn('⚠️ Audio system failed to initialize');
        }

        // Initialize input handler
        const inputInitialized = inputHandler.initialize();
        if (!inputInitialized) {
            console.warn('⚠️ Input handler failed to initialize');
        }

        // Initialize settings system
        try {
            const { settingsSystem } = await import('./features/settings-system.js');
            const settingsInitialized = await settingsSystem.initialize();
            if (!settingsInitialized) {
                console.warn('⚠️ Settings system failed to initialize');
            }
            // Make settings system globally available
            window.settingsSystem = settingsSystem;
        } catch (error) {
            console.error('❌ Error initializing settings system:', error);
        }

        // Initialize advanced input system
        try {
            const { advancedInputSystem } = await import('./features/advanced-input-system.js');
            const advancedInputInitialized = await advancedInputSystem.initialize();
            if (!advancedInputInitialized) {
                console.warn('⚠️ Advanced input system failed to initialize');
            }
            // Make advanced input system globally available
            window.advancedInputSystem = advancedInputSystem;
        } catch (error) {
            console.error('❌ Error initializing advanced input system:', error);
        }
        
        // Initialize stage system
        const stageInitialized = stageSystem.initialize();
        if (!stageInitialized) {
            console.warn('⚠️ Stage system failed to initialize');
        }
        
        // Initialize game mode selector
        try {
            const selectorInitialized = gameModeSelector.initialize();
            if (!selectorInitialized) {
                console.warn('⚠️ Game mode selector failed to initialize');
            }
        } catch (error) {
            console.error('❌ Error initializing game mode selector:', error);
        }
        
        // Initialize game engine
        const engineInitialized = await gameEngine.initialize();
        if (!engineInitialized) {
            throw new Error('Failed to initialize game engine');
        }
    }

    // Lazy load and cache modules
    async loadModule(modulePath, moduleName) {
        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const loadPromise = import(modulePath).then(module => {
            this.modules.set(moduleName, module);
            return module;
        }).catch(error => {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        });

        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }

    // Preload modules in background
    async preloadModules() {
        const preloadList = [
            { path: './modes/game-modes.js', name: 'gameModes' },
            { path: './modes/campaign.js', name: 'campaign' }
        ];

        // Load and initialize campaign module immediately
        try {
            const campaignModule = await this.loadModule('./modes/campaign.js', 'campaign');
            if (campaignModule?.campaignMode) {
                campaignModule.campaignMode.initialize();
            }
        } catch (error) {
            console.warn('⚠️ Failed to initialize campaign module:', error);
        }

        // Load other modules in background without blocking
        preloadList.forEach(({ path, name }) => {
            if (name !== 'campaign') { // Already loaded above
                this.loadModule(path, name).catch(() => {
                    console.warn(`⚠️ Failed to preload module: ${name}`);
                });
            }
        });
    }

    // Setup global event listeners
    setupEventListeners() {
        // Create bound methods to track for cleanup
        const menuClickHandler = this.handleMenuClick.bind(this);
        const keyDownHandler = this.handleKeyDown.bind(this);
        const beforeUnloadHandler = this.handleBeforeUnload.bind(this);
        const resizeHandler = helpers.debounce(this.handleResize.bind(this), 250);
        const visibilityChangeHandler = this.handleVisibilityChange.bind(this);
        
        const gameModeHandler = (event) => {
            const { mode } = event.detail;
            this.initializeGameMode(mode);
        };

        const stageCompleteHandler = (event) => {
            const { stageNumber, score, timeElapsed } = event.detail;
            this.onStageComplete(stageNumber, score, timeElapsed);
        };

        const settingsModalHandler = (event) => {
            const settingsModal = document.getElementById('settingsModal');
            const closeBtn = event.target.closest('.close-btn');
            
            if (closeBtn && settingsModal) {
                settingsModal.style.display = 'none';
                console.log('✅ Settings modal closed via close button');
            }
            
            // Click outside to close
            if (event.target === settingsModal) {
                settingsModal.style.display = 'none';
                console.log('✅ Settings modal closed via backdrop click');
            }
        };

        const instructionsHandler = (event) => {
            const instructions = document.getElementById('instructions');
            if (instructions && instructions.style.display === 'block') {
                const closeBtn = event.target.closest('.close-btn');
                if (closeBtn || (!instructions.contains(event.target) && !event.target.classList.contains('btn-secondary'))) {
                    instructions.style.display = 'none';
                    console.log('✅ Instructions closed');
                }
            }
        };

        // Add event listeners and track them
        this.addEventListenerWithCleanup(document, 'click', menuClickHandler);
        this.addEventListenerWithCleanup(document, 'keydown', keyDownHandler);
        this.addEventListenerWithCleanup(window, 'beforeunload', beforeUnloadHandler);
        this.addEventListenerWithCleanup(window, 'resize', resizeHandler);
        this.addEventListenerWithCleanup(document, 'visibilitychange', visibilityChangeHandler);
        this.addEventListenerWithCleanup(document, 'gameModeSelected', gameModeHandler);
        this.addEventListenerWithCleanup(document, 'stageComplete', stageCompleteHandler);
        
        // Track modal handlers separately since they use the same event type
        document.addEventListener('click', settingsModalHandler);
        document.addEventListener('click', instructionsHandler);
        
        // Store modal handlers for cleanup
        this.modalHandlers = {
            settings: settingsModalHandler,
            instructions: instructionsHandler
        };
    }

    // Helper method to add event listeners with cleanup tracking
    addEventListenerWithCleanup(target, event, handler) {
        target.addEventListener(event, handler);
        
        // Store for cleanup
        const key = `${target === document ? 'document' : 'window'}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ target, handler });
    }

    // Handle menu button clicks
    async handleMenuClick(event) {
        const clickedElement = event.target;
        
        // Skip gem clicks - let the game engine handle them
        if (clickedElement.closest('.gem')) {
            return;
        }
        
        const actualTarget = clickedElement.closest('button') || clickedElement;
        
        console.log('🖱️ Button clicked:', {
            target: actualTarget,
            id: actualTarget.id,
            classes: Array.from(actualTarget.classList || []),
            textContent: actualTarget.textContent?.trim()
        });

        // Get button containers and types
        const menuBtn = actualTarget.closest('.menu-btn');
        const controlBtn = actualTarget.closest('.control-btn');
        const playBtn = actualTarget.closest('.play-button');
        const buttonId = actualTarget.id || actualTarget.closest('[id]')?.id;

        // Play button - highest priority
        if (buttonId === 'playStageBtn' || playBtn || actualTarget.textContent?.includes('Play Stage')) {
            console.log('🎮 Play button detected, starting current stage...');
            await this.playCurrentStage();
            return;
        }

        // Game mode selection buttons
        if (menuBtn?.classList.contains('mode-normal') || actualTarget.classList.contains('mode-normal')) {
            await this.selectGameMode('normal');
            return;
        } else if (menuBtn?.classList.contains('mode-time') || actualTarget.classList.contains('mode-time')) {
            await this.selectGameMode('timeAttack');
            return;
        } else if (menuBtn?.classList.contains('mode-daily') || actualTarget.classList.contains('mode-daily')) {
            await this.selectGameMode('dailyChallenge');
            return;
        } else if (menuBtn?.classList.contains('mode-campaign') || actualTarget.classList.contains('mode-campaign')) {
            await this.selectGameMode('campaign');
            return;
        }

        // Stage system control buttons
        if (controlBtn?.classList.contains('mode-time')) {
            console.log('⏱️ Time Attack mode button clicked');
            await this.selectGameMode('timeAttack');
            return;
        } else if (controlBtn?.classList.contains('mode-daily')) {
            console.log('📅 Daily Challenge mode button clicked');
            await this.selectGameMode('dailyChallenge');
            return;
        } else if (controlBtn?.classList.contains('mode-normal')) {
            console.log('🎯 Normal mode button clicked');
            await this.selectGameMode('normal');
            return;
        }

        // Handle by button ID
        switch (buttonId) {
            case 'stageSelectBtn':
                console.log('🗺️ Stage Selection button clicked');
                await this.showStageSelection();
                break;
            case 'gameGuideBtn':
                console.log('📖 Game Guide button clicked');
                await this.showGameGuide();
                break;
            case 'settingsBtn':
                console.log('⚙️ Settings button clicked');
                await this.showSettings();
                break;
            case 'creditsBtn':
                console.log('👥 Credits button clicked');
                await this.showCredits();
                break;
            case 'statsBtn':
                console.log('📊 Statistics button clicked');
                await this.showStageStatistics();
                break;
            case 'restartBtn':
                this.restartGame();
                break;
            case 'hintBtn':
                try {
                    if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.showHint) {
                        gameEngine.showHint();
                    } else {
                        console.warn('⚠️ Hint functionality not available');
                    }
                } catch (error) {
                    console.error('❌ Error showing hint:', error);
                }
                break;
            case 'undoBtn':
                try {
                    if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.undoLastMove) {
                        gameEngine.undoLastMove();
                    } else {
                        console.warn('⚠️ Undo functionality not available');
                    }
                } catch (error) {
                    console.error('❌ Error undoing move:', error);
                }
                break;
        }

        // Check for class-based actions
        if (actualTarget.classList.contains('back-to-menu') || 
            actualTarget.closest('.back-to-menu')) {
            this.showMainMenu();
        }
    }

    // Handle keyboard shortcuts
    handleKeyDown(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return; // Don't handle shortcuts when typing
        }

        switch (event.key.toLowerCase()) {
            case 'r':
                if (!event.ctrlKey && !event.metaKey) {
                    event.preventDefault();
                    this.restartGame();
                }
                break;
            case 'h':
                event.preventDefault();
                try {
                    if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.showHint) {
                        gameEngine.showHint();
                    }
                } catch (error) {
                    console.error('❌ Error showing hint:', error);
                }
                break;
            case 'u':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    try {
                        if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.undoLastMove) {
                            gameEngine.undoLastMove();
                        }
                    } catch (error) {
                        console.error('❌ Error undoing move:', error);
                    }
                }
                break;
            case 'escape':
                event.preventDefault();
                this.closeAllModals();
                break;
            case 'm':
                event.preventDefault();
                this.showMainMenu();
                break;
            case 's':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    try {
                        if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.saveGameState) {
                            gameEngine.saveGameState();
                        }
                    } catch (error) {
                        console.error('❌ Error saving game state:', error);
                    }
                }
                break;
        }
    }

    // Handle window before unload
    handleBeforeUnload() {
        try {
            // Save game state before closing
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.saveGameState) {
                gameEngine.saveGameState();
            }
        } catch (error) {
            console.error('❌ Error saving game state on unload:', error);
        }
        
        // Perform cleanup before page unload
        this.cleanup();
    }

    // Handle window resize
    handleResize() {
        // Responsive adjustments would go here
        // Layout adjustments handled by CSS
    }

    // Handle visibility change (tab switching)
    handleVisibilityChange() {
        if (document.hidden) {
            try {
                // Pause timers, save state
                if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.saveGameState) {
                    gameEngine.saveGameState();
                }
            } catch (error) {
                console.error('❌ Error saving game state on visibility change:', error);
            }
        } else {
            // Resume timers if needed
        }
    }

    // Game mode selection
    async selectGameMode(mode) {
        currentMenuMode = mode;
        
        // Update game mode selector
        if (gameModeSelector.isInitialized) {
            gameModeSelector.setMode(mode);
        }
        
        // Add visual feedback
        this.animateMenuSelection(mode);
        
        // Load game mode module if needed
        if (mode === 'campaign') {
            await this.loadModule('./modes/campaign.js', 'campaign');
        } else if (mode === 'timeAttack' || mode === 'dailyChallenge') {
            await this.loadModule('./modes/game-modes.js', 'gameModes');
        }
        
        // Transition to game
        setTimeout(() => {
            this.hideMainMenu();
            setTimeout(() => {
                this.initializeGameMode(mode);
            }, 300);
        }, 800);
    }

    // Animate menu selection
    animateMenuSelection(mode) {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            btn.style.transform = 'scale(0.95)';
            btn.style.opacity = '0.7';
        });
        
        // Map mode to CSS class
        const modeClassMap = {
            'normal': 'mode-normal',
            'timeAttack': 'mode-time',
            'dailyChallenge': 'mode-daily',
            'campaign': 'mode-campaign'
        };
        
        const selectedBtn = document.querySelector(`.${modeClassMap[mode]}`);
        if (selectedBtn) {
            selectedBtn.style.transform = 'scale(1.1)';
            selectedBtn.style.opacity = '1';
            selectedBtn.style.borderColor = '#FFD700';
            selectedBtn.style.boxShadow = '0 15px 35px rgba(255, 215, 0, 0.5)';
        }
    }

    // Initialize specific game mode
    initializeGameMode(mode) {
        try {
            // Set game mode in engine
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.setGameMode) {
                gameEngine.setGameMode(mode);
            }
            
            // Mode-specific initialization would go here
            switch (mode) {
                case 'normal':
                    this.startNormalMode();
                    break;
                case 'timeAttack':
                    this.startTimeAttack();
                    break;
                case 'dailyChallenge':
                    this.startDailyChallenge();
                    break;
                case 'campaign':
                    this.startCampaign();
                    break;
                default:
                    console.warn('Unknown game mode:', mode);
                    this.startNormalMode();
            }
        } catch (error) {
            console.error('❌ Error initializing game mode:', error);
            // Fallback to normal mode
            this.startNormalMode();
        }
    }

    // Game mode starters
    startNormalMode() {
        try {
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.restart) {
                gameEngine.restart();
            }
        } catch (error) {
            console.error('❌ Error starting normal mode:', error);
        }
    }

    startTimeAttack() {
        try {
            if (typeof gameState !== 'undefined' && gameState && gameState.setGameMode) {
                gameState.setGameMode('timeAttack');
            }
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.restart) {
                gameEngine.restart();
            }
        } catch (error) {
            console.error('❌ Error starting time attack mode:', error);
        }
    }

    startDailyChallenge() {
        try {
            if (typeof gameState !== 'undefined' && gameState && gameState.setGameMode) {
                gameState.setGameMode('dailyChallenge');
            }
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.restart) {
                gameEngine.restart();
            }
        } catch (error) {
            console.error('❌ Error starting daily challenge mode:', error);
        }
    }

    async startCampaign() {
        const campaignModule = await this.loadModule('./modes/campaign.js', 'campaign');
        if (campaignModule?.startCampaign) {
            campaignModule.startCampaign();
        }
    }

    // UI Management
    hideMainMenu() {
        try {
            const mainMenu = document.getElementById('mainMenu');
            const gameInterface = document.getElementById('gameInterface');
            
            if (!mainMenu || !gameInterface) {
                console.warn('⚠️ Main menu or game interface elements not found');
                return;
            }
            
            mainMenu.style.transform = 'scale(0.9)';
            mainMenu.style.opacity = '0';
            mainMenu.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                mainMenu.style.display = 'none';
                gameInterface.style.display = 'block';
                gameInterface.style.opacity = '0';
                gameInterface.style.transform = 'scale(1.1)';
                gameInterface.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    gameInterface.style.opacity = '1';
                    gameInterface.style.transform = 'scale(1)';
                }, 50);
            }, 500);
        } catch (error) {
            console.error('❌ Error hiding main menu:', error);
        }
    }

    showMainMenu() {
        try {
            const mainMenu = document.getElementById('mainMenu');
            const gameInterface = document.getElementById('gameInterface');
            
            if (!mainMenu || !gameInterface) {
                console.warn('⚠️ Main menu or game interface elements not found');
                return;
            }
            
            gameInterface.style.opacity = '0';
            gameInterface.style.transform = 'scale(0.9)';
            gameInterface.style.transition = 'all 0.4s ease';
            
            setTimeout(() => {
                gameInterface.style.display = 'none';
                mainMenu.style.display = 'flex';
                mainMenu.style.opacity = '0';
                mainMenu.style.transform = 'scale(1.1)';
                mainMenu.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    mainMenu.style.opacity = '1';
                    mainMenu.style.transform = 'scale(1)';
                    this.resetMenuButtons();
                }, 50);
            }, 400);
        } catch (error) {
            console.error('❌ Error showing main menu:', error);
        }
    }

    resetMenuButtons() {
        const buttons = document.querySelectorAll('.menu-btn');
        buttons.forEach(btn => {
            btn.style.transform = '';
            btn.style.opacity = '';
            btn.style.borderColor = '';
            btn.style.boxShadow = '';
        });
    }

    // Modal management
    async showGameGuide() {
        try {
            console.log('📖 Attempting to show game guide...');
            
            // Check if instructions element exists in DOM
            const instructionsEl = document.getElementById('instructions');
            if (instructionsEl) {
                if (instructionsEl.style.display === 'none' || !instructionsEl.style.display) {
                    instructionsEl.style.display = 'block';
                    instructionsEl.style.cssText = `
                        display: block;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: linear-gradient(145deg, rgba(26, 26, 58, 0.98), rgba(13, 13, 26, 0.95));
                        border: 3px solid rgba(255, 255, 255, 0.4);
                        border-radius: 20px;
                        padding: 30px;
                        max-width: 600px;
                        max-height: 80vh;
                        overflow-y: auto;
                        color: #f0f0f0;
                        box-shadow: 0 25px 50px rgba(0,0,0,0.7);
                        backdrop-filter: blur(15px);
                        z-index: 1000;
                        text-align: left;
                        font-family: Georgia, serif;
                    `;
                    console.log('✅ Game guide shown');
                } else {
                    instructionsEl.style.display = 'none';
                    console.log('✅ Game guide hidden');
                }
                return;
            }

            // Fallback
            console.log('❓ Instructions element not found, using fallback');
            alert('Game Guide\n\nMatch 3 or more gems of the same type!\nCreate longer matches for higher scores.\nUse mouse or touch to swap adjacent gems.');
            
        } catch (error) {
            console.error('❌ Error showing game guide:', error);
        }
    }

    async showSettings() {
        try {
            console.log('⚙️ Opening comprehensive settings UI...');
            
            // Import settings UI if not already available
            if (typeof settingsUI === 'undefined') {
                const { settingsUI } = await import('./ui/settings-ui.js');
                window.settingsUI = settingsUI;
            }
            
            // Open the new settings UI
            settingsUI.openSettings();
            
            console.log('✅ Settings UI opened successfully');
            
        } catch (error) {
            console.error('❌ Error showing settings:', error);
            // Fallback to simple alert if our advanced settings fail
            alert('Settings\n\nAudio: Enable/Disable\nVisual Effects: On/Off\nDifficulty: Normal\n\nSettings will be saved automatically.');
        }
    }

    async showCredits() {
        try {
            console.log('👥 Attempting to show credits...');
            
            // Simple credits display
            alert('Credits\n\n🎮 Gems Rush: Divine Teams\n⚡ A modern match-3 adventure\n\n👨‍💻 Developed with dedication\n🎨 Beautiful divine theme\n🎵 Immersive audio experience\n\n💎 Thanks for playing!\n🌟 Enjoy your divine journey!');
            
        } catch (error) {
            console.error('❌ Error showing credits:', error);
        }
    }

    closeAllModals() {
        // Close any open modals
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => modal.remove());
    }

    // Game management
    restartGame() {
        try {
            if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.restart) {
                gameEngine.restart();
            } else {
                console.warn('⚠️ Game engine not available for restart');
            }
        } catch (error) {
            console.error('❌ Error restarting game:', error);
        }
    }

    // Settings management
    loadSettings() {
        const settings = storageManager.loadSettings();
        this.applySettings(settings);
    }

    applySettings(settings) {
        // Apply settings to the application
        // Settings are applied by individual modules
    }

    // UI initialization
    initializeUI() {
        // Add animations to UI interface
        uiInterface.addAnimations();
        
        // Add menu animations
        menuSystem.addMenuAnimations();
        
        // Initialize stage map display
        setTimeout(() => {
            this.updateStageMapDisplay();
        }, 100); // Small delay to ensure DOM is ready
    }

    // Stage System Methods

    // Play the current stage
    async playCurrentStage() {
        try {
            console.log('🎮 Play Current Stage called...');
            
            const currentStage = stageSystem.getCurrentStageForMap();
            console.log(`🎮 Starting Stage ${currentStage.stageNumber}...`, currentStage);
            
            // Start the stage
            const started = await stageSystem.startStage(currentStage.stageNumber);
            if (!started) {
                console.error('❌ Failed to start stage');
                modalSystem.showModal('error', {
                    title: 'Stage Start Failed',
                    message: 'Failed to start the stage. Please try again.',
                    buttons: ['OK']
                });
                return;
            }
            
            // Initialize game mode as stage mode
            console.log('🎯 Setting game mode to stageMode...');
            try {
                if (typeof gameState !== 'undefined' && gameState && gameState.setGameMode) {
                    gameState.setGameMode('stageMode');
                }
                if (typeof gameEngine !== 'undefined' && gameEngine && gameEngine.setGameMode) {
                    gameEngine.setGameMode('stageMode');
                }
            } catch (error) {
                console.error('❌ Error setting stage mode:', error);
            }
            
            // Hide main menu and show game interface
            console.log('🎨 Transitioning to game interface...');
            this.hideMainMenu();
            
            console.log('✅ Stage started successfully');
            
        } catch (error) {
            console.error('❌ Error starting stage:', error);
            modalSystem.showModal('error', {
                title: 'Stage Start Failed',
                message: `Failed to start stage: ${error.message}. Please try again.`,
                buttons: ['OK']
            });
        }
    }

    // Show stage selection map
    async showStageSelection() {
        try {
            const availableStages = stageSystem.getAvailableStages(20);
            
            modalSystem.showModal('stageSelection', {
                title: 'Stage Selection',
                stages: availableStages,
                currentStage: stageSystem.currentStage,
                onStageSelect: (stageNumber) => {
                    if (stageSystem.canPlayStage(stageNumber)) {
                        stageSystem.currentStage = stageNumber;
                        this.updateStageMapDisplay();
                        modalSystem.closeModal();
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error showing stage selection:', error);
        }
    }

    // Show stage statistics
    async showStageStatistics() {
        try {
            const stats = stageSystem.getStageStatistics();
            
            modalSystem.showModal('stageStats', {
                title: 'Stage Statistics',
                stats,
                buttons: ['Close']
            });
            
        } catch (error) {
            console.error('❌ Error showing stage statistics:', error);
        }
    }

    // Update the stage map display
    updateStageMapDisplay() {
        try {
            const currentStage = stageSystem.getCurrentStageForMap();
            const nextBossStage = Math.ceil(currentStage.stageNumber / 5) * 5;
            const completedStages = stageSystem.stagesCompleted.length;
            const progressPercent = Math.max(0, Math.min(100, (completedStages / stageSystem.maxStagesUnlocked) * 100));
            
            // Update stage information
            const stageNumberEl = document.getElementById('currentStageNumber');
            const stageTypeEl = document.getElementById('currentStageType');
            const previewTitleEl = document.getElementById('previewTitle');
            const previewTargetEl = document.getElementById('previewTarget');
            const previewTypeEl = document.getElementById('previewType');
            const bossIndicatorEl = document.getElementById('bossIndicator');
            const nextBossStageEl = document.getElementById('nextBossStage');
            const completedStagesEl = document.getElementById('completedStages');
            const totalStagesEl = document.getElementById('totalStages');
            const progressFillEl = document.getElementById('stageProgressFill');
            
            if (stageNumberEl) stageNumberEl.textContent = currentStage.stageNumber;
            if (stageTypeEl) stageTypeEl.textContent = currentStage.isBoss ? 'Divine Conquest Boss' : 'Divine Realm';
            if (previewTitleEl) previewTitleEl.textContent = currentStage.title;
            if (previewTargetEl) previewTargetEl.textContent = `Target: ${helpers.formatNumber(currentStage.targetScore)}`;
            if (previewTypeEl) previewTypeEl.textContent = currentStage.type;
            if (nextBossStageEl) nextBossStageEl.textContent = nextBossStage;
            if (completedStagesEl) completedStagesEl.textContent = completedStages;
            if (totalStagesEl) totalStagesEl.textContent = stageSystem.maxStagesUnlocked;
            if (progressFillEl) progressFillEl.style.width = `${progressPercent}%`;
            
            // Update play button text
            const playButton = document.getElementById('playStageBtn');
            if (playButton) {
                // Update both the text content and the play-text element
                const playTextEl = playButton.querySelector('.play-text');
                const playText = `PLAY STAGE ${currentStage.stageNumber}`;
                
                if (playTextEl) {
                    playTextEl.textContent = playText;
                } else {
                    // Fallback if structure is different
                    playButton.textContent = playText;
                }
                
                playButton.title = `Start ${currentStage.isBoss ? 'Boss ' : ''}Stage ${currentStage.stageNumber}: ${currentStage.title}`;
                playButton.setAttribute('aria-label', `Start ${currentStage.isBoss ? 'Boss ' : ''}Stage ${currentStage.stageNumber}`);
            }
            
            // Show/hide boss indicator
            if (bossIndicatorEl) {
                if (currentStage.isBoss) {
                    bossIndicatorEl.classList.remove('hidden');
                } else {
                    bossIndicatorEl.classList.add('hidden');
                }
            }
            
            // Update stage marker icon based on type
            const markerIconEl = document.querySelector('.marker-icon');
            if (markerIconEl) {
                markerIconEl.textContent = currentStage.isBoss ? '👑' : '⚡';
            }
            
            console.log('🗺️ Stage map display updated:', {
                stage: currentStage.stageNumber,
                type: currentStage.type,
                target: currentStage.targetScore,
                playButtonText: playButton?.textContent
            });
            
        } catch (error) {
            console.error('❌ Failed to update stage map display:', error);
        }
    }

    // Handle stage completion
    onStageComplete(stageNumber, score, timeElapsed) {
        try {
            const result = stageSystem.completeStage(stageNumber, score, timeElapsed);
            
            if (result.success) {
                // Show completion modal
                modalSystem.showModal('stageComplete', {
                    title: result.stageInfo.isBoss ? 'Boss Defeated!' : 'Stage Complete!',
                    stageNumber,
                    score,
                    rewards: result.rewards,
                    nextStageUnlocked: result.nextStageUnlocked,
                    onContinue: () => {
                        modalSystem.closeModal();
                        this.showMainMenu();
                        // Update stage map display with new current stage
                        setTimeout(() => {
                            this.updateStageMapDisplay();
                        }, 100);
                    }
                });
            } else {
                // Show failure modal
                modalSystem.showModal('stageFailed', {
                    title: 'Stage Failed',
                    targetScore: result.targetScore,
                    achievedScore: result.scoreAchieved,
                    stageNumber,
                    onRetry: () => {
                        modalSystem.closeModal();
                        this.playCurrentStage();
                    },
                    onMenu: () => {
                        modalSystem.closeModal();
                        this.showMainMenu();
                        // Update stage map display
                        setTimeout(() => {
                            this.updateStageMapDisplay();
                        }, 100);
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error handling stage completion:', error);
        }
    }

    // Cleanup methods
    
    // Main cleanup method - call this when shutting down the app
    cleanup() {
        if (this.isDestroyed) {
            console.log('⚠️ App already cleaned up');
            return;
        }

        console.log('🧹 Starting application cleanup...');

        // Clean up event listeners
        this.cleanupEventListeners();

        // Clean up timers
        this.cleanupTimers();

        // Clean up animation frames
        this.cleanupAnimationFrames();

        // Clean up modals
        this.cleanupModals();

        // Clean up floating elements
        this.cleanupFloatingElements();

        // Clean up modules
        this.cleanupModules();

        // Clean up game mode selector
        if (gameModeSelector && gameModeSelector.cleanup) {
            gameModeSelector.cleanup();
        }

        // Mark as destroyed
        this.isDestroyed = true;

        console.log('✅ Application cleanup completed');
    }

    // Clean up all tracked event listeners
    cleanupEventListeners() {
        console.log('🧹 Cleaning up event listeners...');

        // Remove tracked event listeners
        for (const [key, listeners] of this.eventListeners) {
            listeners.forEach(({ target, handler }) => {
                try {
                    target.removeEventListener(key.split('_')[1], handler);
                } catch (error) {
                    console.warn(`Failed to remove listener for ${key}:`, error);
                }
            });
        }
        this.eventListeners.clear();

        // Remove modal handlers
        if (this.modalHandlers) {
            document.removeEventListener('click', this.modalHandlers.settings);
            document.removeEventListener('click', this.modalHandlers.instructions);
            this.modalHandlers = null;
        }
    }

    // Clean up all tracked timers
    cleanupTimers() {
        console.log('🧹 Cleaning up timers...');
        
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
            clearInterval(timerId);
        });
        this.timers.clear();
    }

    // Clean up all tracked animation frames
    cleanupAnimationFrames() {
        console.log('🧹 Cleaning up animation frames...');
        
        this.animationFrames.forEach(frameId => {
            if (typeof frameId === 'number') {
                cancelAnimationFrame(frameId);
            }
        });
        this.animationFrames.clear();
    }

    // Clean up modals and UI elements
    cleanupModals() {
        console.log('🧹 Cleaning up modals...');
        
        // Remove all dynamic modals
        const modals = document.querySelectorAll('[id$="Modal"], .modal-overlay');
        modals.forEach(modal => {
            if (modal._clickOutsideHandler) {
                modal.removeEventListener('click', modal._clickOutsideHandler);
            }
            modal.remove();
        });

        // Hide settings modal and instructions
        const settingsModal = document.getElementById('settingsModal');
        const instructions = document.getElementById('instructions');
        
        if (settingsModal) settingsModal.style.display = 'none';
        if (instructions) instructions.style.display = 'none';
    }

    // Clean up floating elements (scores, particles, etc.)
    cleanupFloatingElements() {
        console.log('🧹 Cleaning up floating elements...');
        
        // Remove floating scores
        const floatingScores = document.querySelectorAll('.floating-score, .floating-score-element');
        floatingScores.forEach(el => el.remove());

        // Remove particles
        const particles = document.querySelectorAll('.particle');
        particles.forEach(el => el.remove());

        // Remove temporary UI elements
        const tempElements = document.querySelectorAll('[data-temporary="true"]');
        tempElements.forEach(el => el.remove());
    }

    // Clean up modules
    cleanupModules() {
        console.log('🧹 Cleaning up modules...');
        
        // Call cleanup methods on modules that have them
        for (const [name, module] of this.modules) {
            try {
                if (module.cleanup && typeof module.cleanup === 'function') {
                    module.cleanup();
                } else if (module.default && module.default.cleanup) {
                    module.default.cleanup();
                }
            } catch (error) {
                console.warn(`Failed to cleanup module ${name}:`, error);
            }
        }

        // Clear module references
        this.modules.clear();
        this.loadingPromises.clear();
    }

    // Helper methods for tracking resources

    // Track timer for cleanup
    trackTimer(timerId) {
        this.timers.add(timerId);
        return timerId;
    }

    // Track animation frame for cleanup
    trackAnimationFrame(frameId) {
        this.animationFrames.add(frameId);
        return frameId;
    }

    // Safe setTimeout that tracks for cleanup
    safeSetTimeout(callback, delay) {
        if (this.isDestroyed) return null;
        const timerId = setTimeout(() => {
            this.timers.delete(timerId);
            if (!this.isDestroyed) callback();
        }, delay);
        return this.trackTimer(timerId);
    }

    // Safe setInterval that tracks for cleanup
    safeSetInterval(callback, interval) {
        if (this.isDestroyed) return null;
        const timerId = setInterval(() => {
            if (this.isDestroyed) {
                clearInterval(timerId);
                this.timers.delete(timerId);
                return;
            }
            callback();
        }, interval);
        return this.trackTimer(timerId);
    }

    // Safe requestAnimationFrame that tracks for cleanup
    safeRequestAnimationFrame(callback) {
        if (this.isDestroyed) return null;
        const frameId = requestAnimationFrame(() => {
            this.animationFrames.delete(frameId);
            if (!this.isDestroyed) callback();
        });
        return this.trackAnimationFrame(frameId);
    }

    // Error handling
    showErrorMessage(message) {
        console.error('💥 Application Error:', message);
        // Could show a user-friendly error modal here
    }

    // Get application info
    getInfo() {
        return {
            name: 'Gems Rush: Divine Teams',
            version: '1.0.0',
            modules: Array.from(this.modules.keys()),
            initialized: isApplicationInitialized,
            eventListeners: this.eventListeners.size,
            timers: this.timers.size,
            animationFrames: this.animationFrames.size,
            isDestroyed: this.isDestroyed
        };
    }
}

// Create global application instance
const app = new GemsRushApp();

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🚨 Global JavaScript error:', event.error);
    console.error('Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent default browser error handling
});

// Auto-initialize when DOM is ready with error boundary
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            app.initialize();
        } catch (error) {
            console.error('❌ Critical error during app initialization:', error);
            app.showErrorMessage('Failed to start the game. Please refresh the page.');
        }
    });
} else {
    try {
        app.initialize();
    } catch (error) {
        console.error('❌ Critical error during app initialization:', error);
        app.showErrorMessage('Failed to start the game. Please refresh the page.');
    }
}

// Global cleanup function for manual testing
window.cleanupGemsRush = () => {
    console.log('🧹 Manual cleanup triggered');
    app.cleanup();
};

// Export for global access
window.GemsRushApp = app;
export default app; 