// Menu System Module
// Handles main menu navigation, mode selection, and menu interactions

import { uiInterface } from './interface.js';
import { helpers } from '../utils/helpers.js';

export class MenuSystem {
    constructor() {
        this.isInitialized = false;
        this.currentMode = null;
        this.menuAnimations = {};
        this.backgroundEffects = [];
    }

    // Initialize menu system
    initialize() {
        try {
            this.setupMenuEvents();
            this.initializeBackgroundEffects();
            this.setupKeyboardNavigation();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Menu System:', error);
            return false;
        }
    }

    // Setup menu event listeners
    setupMenuEvents() {
        // Game mode selection buttons
        const modeButtons = document.querySelectorAll('.menu-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this.handleModeSelection(event);
            });

            button.addEventListener('mouseenter', (event) => {
                this.handleModeHover(event);
            });

            button.addEventListener('mouseleave', (event) => {
                this.handleModeLeave(event);
            });

            // Add keyboard support
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleModeSelection(event);
                }
            });
        });

        // Footer button events
        this.setupFooterButtons();
    }

    // Setup footer buttons
    setupFooterButtons() {
        const footerButtons = document.querySelectorAll('.footer-btn');
        footerButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this.handleFooterClick(event);
            });
        });
    }

    // Handle game mode selection
    handleModeSelection(event) {
        const button = event.target.closest('.menu-btn');
        if (!button) return;

        const mode = this.extractModeFromButton(button);
        if (!mode) return;

        this.currentMode = mode;

        // Visual feedback
        this.animateSelection(button);

        // Transition to game after animation
        setTimeout(() => {
            this.transitionToGame(mode);
        }, 1200);
    }

    // Extract game mode from button class
    extractModeFromButton(button) {
        const classList = Array.from(button.classList);
        const modeClass = classList.find(cls => cls.startsWith('mode-'));
        
        if (modeClass) {
            const mode = modeClass.replace('mode-', '');
            // Map CSS classes to game mode names
            const modeMap = {
                'normal': 'normal',
                'time': 'timeAttack',
                'daily': 'dailyChallenge',
                'campaign': 'campaign'
            };
            return modeMap[mode] || mode;
        }
        return null;
    }

    // Handle button hover effects
    handleModeHover(event) {
        const button = event.target.closest('.menu-btn');
        if (!button) return;

        // Add hover class
        button.classList.add('menu-btn-hover');
    }

    // Handle button leave effects
    handleModeLeave(event) {
        const button = event.target.closest('.menu-btn');
        if (!button) return;

        // Remove hover class
        button.classList.remove('menu-btn-hover');
    }

    // Animate mode selection
    animateSelection(selectedButton) {
        const allButtons = document.querySelectorAll('.menu-btn');
        
        // Animate all buttons
        allButtons.forEach(button => {
            if (button === selectedButton) {
                // Selected button animation
                button.style.animation = 'selectedPulse 0.8s ease-in-out';
                button.style.transform = 'scale(1.1)';
                button.style.borderColor = '#FFD700';
                button.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
                button.style.zIndex = '10';
            } else {
                // Other buttons fade out
                button.style.opacity = '0.3';
                button.style.transform = 'scale(0.95)';
                button.style.filter = 'grayscale(0.7)';
            }
        });

        // Add ripple effect
        this.addRippleEffect(selectedButton);

        // Animate menu background
        this.animateMenuBackground();
    }

    // Add ripple effect to button
    addRippleEffect(button) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.5;
        
        ripple.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleExpand 1s ease-out;
            pointer-events: none;
            z-index: 0;
        `;
        
        button.style.position = 'relative';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1000);
    }

    // Animate menu background during selection
    animateMenuBackground() {
        const menuBackground = document.querySelector('.menu-background');
        if (menuBackground) {
            menuBackground.style.animation = 'backgroundShift 1s ease-in-out';
        }

        const floatingGems = document.querySelectorAll('.floating-gem');
        floatingGems.forEach((gem, index) => {
            setTimeout(() => {
                gem.style.animation = 'gemExcitement 0.6s ease-in-out';
            }, index * 100);
        });
    }

    // Transition to game interface
    transitionToGame(mode) {
        // Use UI interface for transition
        if (uiInterface.isInitialized) {
            uiInterface.showGameInterface();
        }

        // Trigger game mode initialization
        this.initializeGameMode(mode);
    }

    // Initialize specific game mode
    initializeGameMode(mode) {
        // This will be handled by the main application
        const event = new CustomEvent('gameModeSelected', {
            detail: { mode: mode }
        });
        document.dispatchEvent(event);
    }

    // Handle footer button clicks
    handleFooterClick(event) {
        const button = event.target.closest('.footer-btn');
        if (!button) return;

        const buttonText = button.textContent.toLowerCase();
        
        if (buttonText.includes('guide')) {
            this.showGameGuide();
        } else if (buttonText.includes('settings')) {
            this.showSettings();
        } else if (buttonText.includes('credits')) {
            this.showCredits();
        }
    }

    // Show game guide
    async showGameGuide() {
        // Trigger event for modals module
        const event = new CustomEvent('showModal', {
            detail: { type: 'gameGuide' }
        });
        document.dispatchEvent(event);
    }

    // Show settings
    async showSettings() {
        try {
            console.log('⚙️ MenuSystem: Opening comprehensive settings UI...');
            
            // Import settings UI if not already available
            if (typeof settingsUI === 'undefined') {
                const { settingsUI } = await import('./settings-ui.js');
                window.settingsUI = settingsUI;
            }
            
            // Open the new settings UI
            settingsUI.openSettings();
            
            console.log('✅ MenuSystem: Settings UI opened successfully');
            
        } catch (error) {
            console.error('❌ MenuSystem: Error showing settings:', error);
            // Fallback to old event system
            const event = new CustomEvent('showModal', {
                detail: { type: 'settings' }
            });
            document.dispatchEvent(event);
        }
    }

    // Show credits
    async showCredits() {
        // Trigger event for modals module
        const event = new CustomEvent('showModal', {
            detail: { type: 'credits' }
        });
        document.dispatchEvent(event);
    }

    // Setup keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            if (!this.isMenuVisible()) return;

            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    event.preventDefault();
                    this.navigateMenu(event.key);
                    break;
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    this.activateFocusedButton();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.resetMenuSelection();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    event.preventDefault();
                    this.selectModeByNumber(parseInt(event.key));
                    break;
            }
        });
    }

    // Navigate menu with keyboard
    navigateMenu(direction) {
        const buttons = Array.from(document.querySelectorAll('.menu-btn'));
        const currentFocused = document.activeElement;
        let currentIndex = buttons.indexOf(currentFocused);

        if (currentIndex === -1) {
            // No button focused, focus first one
            buttons[0]?.focus();
            return;
        }

        let nextIndex;
        switch (direction) {
            case 'ArrowUp':
            case 'ArrowLeft':
                nextIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                nextIndex = Math.min(buttons.length - 1, currentIndex + 1);
                break;
        }

        if (nextIndex !== undefined) {
            buttons[nextIndex]?.focus();
        }
    }

    // Activate focused button
    activateFocusedButton() {
        const focusedButton = document.activeElement;
        if (focusedButton && focusedButton.classList.contains('menu-btn')) {
            focusedButton.click();
        }
    }

    // Select mode by number key
    selectModeByNumber(number) {
        const buttons = document.querySelectorAll('.menu-btn');
        const targetButton = buttons[number - 1];
        if (targetButton) {
            targetButton.focus();
            setTimeout(() => targetButton.click(), 100);
        }
    }

    // Reset menu selection
    resetMenuSelection() {
        const allButtons = document.querySelectorAll('.menu-btn');
        allButtons.forEach(button => {
            button.style.opacity = '';
            button.style.transform = '';
            button.style.filter = '';
            button.style.borderColor = '';
            button.style.boxShadow = '';
            button.style.animation = '';
            button.style.zIndex = '';
        });
    }

    // Check if menu is visible
    isMenuVisible() {
        const mainMenu = document.getElementById('mainMenu');
        return mainMenu && mainMenu.style.display !== 'none';
    }

    // Initialize background effects
    initializeBackgroundEffects() {
        this.createParticleSystem();
        this.animateFloatingGems();
        this.setupBackgroundInteractions();
    }

    // Create particle system
    createParticleSystem() {
        const particleField = document.querySelector('.particle-field');
        if (!particleField) return;

        // Create additional floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'menu-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: radial-gradient(circle, rgba(255, 215, 0, ${Math.random() * 0.5 + 0.3}), transparent);
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: floatParticle ${8 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
                pointer-events: none;
                filter: blur(${Math.random() * 0.5}px);
            `;
            particleField.appendChild(particle);
            this.backgroundEffects.push(particle);
        }
    }

    // Animate floating gems
    animateFloatingGems() {
        const floatingGems = document.querySelectorAll('.floating-gem');
        floatingGems.forEach((gem, index) => {
            // Add subtle rotation
            gem.style.animation = `floatGem ${6 + Math.random() * 2}s ease-in-out infinite`;
            gem.style.animationDelay = `${index * 0.3}s`;
        });
    }

    // Setup background interactions
    setupBackgroundInteractions() {
        const floatingGems = document.querySelectorAll('.floating-gem');
        floatingGems.forEach(gem => {
            gem.addEventListener('mouseenter', () => {
                gem.style.transform = 'scale(1.3) rotate(15deg)';
                gem.style.textShadow = `0 0 30px ${gem.style.getPropertyValue('--color')}`;
                gem.style.zIndex = '10';
            });

            gem.addEventListener('mouseleave', () => {
                gem.style.transform = '';
                gem.style.textShadow = `0 0 20px ${gem.style.getPropertyValue('--color')}`;
                gem.style.zIndex = '';
            });

            gem.addEventListener('click', () => {
                this.createGemClickEffect(gem);
            });
        });
    }

    // Create gem click effect
    createGemClickEffect(gem) {
        const rect = gem.getBoundingClientRect();
        const burst = document.createElement('div');
        
        burst.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, ${gem.style.getPropertyValue('--color')}, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: burstEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        document.body.appendChild(burst);
        
        setTimeout(() => {
            if (burst.parentNode) {
                burst.parentNode.removeChild(burst);
            }
        }, 600);
    }

    // Add menu animations CSS
    addMenuAnimations() {
        // Check if menu animations already exist
        const existingStyle = document.querySelector('style[data-menu-animations]');
        if (existingStyle) {
            return;
        }

        const style = document.createElement('style');
        style.setAttribute('data-menu-animations', 'true');
        style.textContent = `
            @keyframes selectedPulse {
                0%, 100% { transform: scale(1.1); }
                50% { transform: scale(1.15); }
            }
            
            @keyframes rippleExpand {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
            
            @keyframes backgroundShift {
                0%, 100% { filter: hue-rotate(0deg); }
                50% { filter: hue-rotate(30deg); }
            }
            
            @keyframes gemExcitement {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.1) rotate(5deg); }
                50% { transform: scale(1.2) rotate(-5deg); }
                75% { transform: scale(1.1) rotate(3deg); }
            }
            
            @keyframes floatParticle {
                0%, 100% { 
                    transform: translateY(0px) translateX(0px) scale(1); 
                    opacity: 0.3;
                }
                25% { 
                    transform: translateY(-20px) translateX(10px) scale(1.2); 
                    opacity: 0.8;
                }
                50% { 
                    transform: translateY(-10px) translateX(-15px) scale(0.8); 
                    opacity: 0.6;
                }
                75% { 
                    transform: translateY(-30px) translateX(5px) scale(1.1); 
                    opacity: 0.9;
                }
            }
            
            @keyframes floatGem {
                0%, 100% { 
                    transform: translateY(0px) rotate(0deg); 
                }
                50% { 
                    transform: translateY(-10px) rotate(180deg); 
                }
            }
            
            @keyframes burstEffect {
                0% { transform: scale(0); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.8; }
                100% { transform: scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Show main menu
    showMainMenu() {
        if (uiInterface.isInitialized) {
            uiInterface.showMainMenu();
        }
        this.resetMenuSelection();
    }

    // Get current mode
    getCurrentMode() {
        return this.currentMode;
    }

    // Clean up background effects and resources
    cleanup() {
        this.backgroundEffects.forEach(effect => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        });
        this.backgroundEffects = [];
        
        // Reset current mode
        this.currentMode = null;
        
        // Remove any style elements created by this class
        const menuAnimationStyle = document.querySelector('style[data-menu-animations]');
        if (menuAnimationStyle) {
            menuAnimationStyle.remove();
        }
    }
}

// Global menu system instance
export const menuSystem = new MenuSystem();

// Note: Initialization handled by main.js 