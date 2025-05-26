// Main Application Entry Point
// Coordinates all modules and handles application initialization

import { gameEngine } from './core/game-engine.js';
import { gameState } from './core/game-state.js';
import { storageManager } from './utils/storage.js';
import { helpers } from './utils/helpers.js';
import { uiInterface } from './ui/interface.js';
import { menuSystem } from './ui/menu-system.js';
import { modalSystem } from './ui/modals.js';
import { audioSystem } from './features/audio-system.js';
import { inputHandler } from './features/input-handler.js';

// Application state
let isApplicationInitialized = false;
let currentMenuMode = null;

// Main application class
class GemsRushApp {
    constructor() {
        this.modules = new Map();
        this.loadingPromises = new Map();
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

        // Load modules in background without blocking
        preloadList.forEach(({ path, name }) => {
            this.loadModule(path, name).catch(() => {
                // Silently fail for preloaded modules
                console.warn(`⚠️ Failed to preload module: ${name}`);
            });
        });
    }

    // Setup global event listeners
    setupEventListeners() {
        // Menu button handlers
        document.addEventListener('click', this.handleMenuClick.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Window events
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        window.addEventListener('resize', helpers.debounce(this.handleResize.bind(this), 250));

        // Visibility change (for pausing/resuming)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Listen for game mode selection events
        document.addEventListener('gameModeSelected', (event) => {
            const { mode } = event.detail;
            this.initializeGameMode(mode);
        });
    }

    // Handle menu button clicks
    async handleMenuClick(event) {
        const target = event.target.closest('.menu-btn');
        
        // Game mode selection
        if (target?.classList.contains('mode-normal')) {
            await this.selectGameMode('normal');
        } else if (target?.classList.contains('mode-time')) {
            await this.selectGameMode('timeAttack');
        } else if (target?.classList.contains('mode-daily')) {
            await this.selectGameMode('dailyChallenge');
        } else if (target?.classList.contains('mode-campaign')) {
            await this.selectGameMode('campaign');
        }

        // Utility buttons (check original target for IDs)
        const originalTarget = event.target;
        if (originalTarget.id === 'gameGuideBtn') {
            await this.showGameGuide();
        } else if (originalTarget.id === 'settingsBtn' || originalTarget.classList.contains('settings-btn')) {
            await this.showSettings();
        } else if (originalTarget.id === 'creditsBtn') {
            await this.showCredits();
        } else if (originalTarget.id === 'restartBtn') {
            this.restartGame();
        } else if (originalTarget.id === 'hintBtn') {
            gameEngine.showHint();
        } else if (originalTarget.id === 'undoBtn') {
            gameEngine.undoLastMove();
        } else if (originalTarget.classList.contains('back-to-menu')) {
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
                gameEngine.showHint();
                break;
            case 'u':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    gameEngine.undoLastMove();
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
                    gameEngine.saveGameState();
                }
                break;
        }
    }

    // Handle window before unload
    handleBeforeUnload() {
        // Save game state before closing
        gameEngine.saveGameState();
    }

    // Handle window resize
    handleResize() {
        // Responsive adjustments would go here
        // Layout adjustments handled by CSS
    }

    // Handle visibility change (tab switching)
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause timers, save state
            gameEngine.saveGameState();
        } else {
            // Resume timers if needed
        }
    }

    // Game mode selection
    async selectGameMode(mode) {
        currentMenuMode = mode;
        
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
        // Set game mode in engine
        gameEngine.setGameMode(mode);
        
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
    }

    // Game mode starters
    startNormalMode() {
        gameEngine.restart();
    }

    startTimeAttack() {
        gameState.setGameMode('timeAttack');
        gameEngine.restart();
    }

    startDailyChallenge() {
        gameState.setGameMode('dailyChallenge');
        gameEngine.restart();
    }

    async startCampaign() {
        const campaignModule = await this.loadModule('./modes/campaign.js', 'campaign');
        if (campaignModule?.startCampaign) {
            campaignModule.startCampaign();
        }
    }

    // UI Management
    hideMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const gameInterface = document.getElementById('gameInterface');
        
        if (mainMenu && gameInterface) {
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
        }
    }

    showMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const gameInterface = document.getElementById('gameInterface');
        
        if (mainMenu && gameInterface) {
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
        // Game guide is handled by the modal system
        const event = new CustomEvent('showModal', {
            detail: { type: 'gameGuide' }
        });
        document.dispatchEvent(event);
    }

    async showSettings() {
        // Settings are handled by the modal system
        const event = new CustomEvent('showModal', {
            detail: { type: 'settings' }
        });
        document.dispatchEvent(event);
    }

    async showCredits() {
        // Credits are handled by the modal system
        const event = new CustomEvent('showModal', {
            detail: { type: 'credits' }
        });
        document.dispatchEvent(event);
    }

    closeAllModals() {
        // Close any open modals
        const modals = document.querySelectorAll('[id$="Modal"]');
        modals.forEach(modal => modal.remove());
    }

    // Game management
    restartGame() {
        gameEngine.restart();
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
            initialized: isApplicationInitialized
        };
    }
}

// Create global application instance
const app = new GemsRushApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
    app.initialize();
}

// Export for global access
window.GemsRushApp = app;
export default app; 