/**
 * @fileoverview Comprehensive Settings System
 * @description Manages all game settings including audio, visual, gameplay, themes, and accessibility
 * Implements performance-optimized settings with proper persistence and validation
 */

import { storageManager } from '../utils/storage.js';
import { eventManager } from '../utils/event-manager.js';
import { performanceUtils } from '../utils/performance-utils.js';

/**
 * @typedef {Object} GameSettings
 * @property {AudioSettings} audio - Audio configuration
 * @property {VisualSettings} visual - Visual effects configuration  
 * @property {GameplaySettings} gameplay - Gameplay preferences
 * @property {ThemeSettings} theme - Visual theme configuration
 * @property {AccessibilitySettings} accessibility - Accessibility options
 * @property {InputSettings} input - Input method preferences
 */

/**
 * @typedef {Object} AudioSettings
 * @property {number} masterVolume - Master volume (0-1)
 * @property {number} sfxVolume - Sound effects volume (0-1)
 * @property {number} musicVolume - Background music volume (0-1)
 * @property {boolean} muted - Global mute state
 * @property {boolean} sfxEnabled - Sound effects enabled
 * @property {boolean} musicEnabled - Background music enabled
 */

/**
 * @typedef {Object} VisualSettings
 * @property {boolean} animationsEnabled - Enable/disable animations
 * @property {boolean} particleEffects - Enable/disable particle effects
 * @property {boolean} hardwareAcceleration - Use GPU acceleration
 * @property {boolean} highContrast - High contrast mode
 * @property {boolean} reducedMotion - Respect reduced motion preference
 * @property {number} targetFPS - Target frame rate (30/60)
 * @property {string} quality - Graphics quality ('low'|'medium'|'high')
 */

/**
 * @typedef {Object} GameplaySettings
 * @property {string} difficulty - Difficulty level ('easy'|'normal'|'hard')
 * @property {boolean} hintsEnabled - Show hints
 * @property {boolean} autoSave - Auto-save progress
 * @property {boolean} showTutorial - Show tutorial on first play
 * @property {number} swapSpeed - Gem swap animation speed
 * @property {boolean} confirmMoves - Confirm destructive moves
 */

export class SettingsSystem {
    constructor() {
        this.isInitialized = false;
        this.settings = this.getDefaultSettings();
        this.settingsChangeCallbacks = new Map();
        this.debounceTimers = new Map();
        
        // Performance optimization
        this.settingsCache = new Map();
        this.batchedUpdates = [];
        
        this.initialize();
    }

    /**
     * Initialize the settings system
     */
    async initialize() {
        try {
            console.log('⚙️ Initializing Settings System...');
            
            // Load saved settings
            await this.loadSettings();
            
            // Apply initial settings
            this.applyAllSettings();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply system preferences
            this.applySystemPreferences();
            
            this.isInitialized = true;
            console.log('✅ Settings System initialized successfully');
            
            // Notify components
            eventManager.emit('settings:initialized', this.settings);
            
        } catch (error) {
            console.error('❌ Failed to initialize Settings System:', error);
            throw error;
        }
    }

    /**
     * Get default settings configuration
     * @returns {GameSettings} Default settings object
     */
    getDefaultSettings() {
        return {
            audio: {
                masterVolume: 0.8,
                sfxVolume: 0.7,
                musicVolume: 0.5,
                muted: false,
                sfxEnabled: true,
                musicEnabled: true
            },
            visual: {
                animationsEnabled: true,
                particleEffects: true,
                hardwareAcceleration: true,
                highContrast: false,
                reducedMotion: false,
                targetFPS: 60,
                quality: 'high'
            },
            gameplay: {
                difficulty: 'normal',
                hintsEnabled: true,
                autoSave: true,
                showTutorial: true,
                swapSpeed: 1.0,
                confirmMoves: false
            },
            theme: {
                current: 'space',
                available: ['space', 'forest', 'ocean', 'fire', 'celestial'],
                customColors: null,
                darkMode: false
            },
            accessibility: {
                reducedMotion: false,
                highContrast: false,
                keyboardNavigation: true,
                screenReaderSupport: true,
                largeText: false,
                colorBlindFriendly: false,
                focusIndicators: true
            },
            input: {
                touchGestures: true,
                swipeControls: true,
                keyboardShortcuts: true,
                mouseAcceleration: true,
                touchSensitivity: 1.0,
                hapticFeedback: true
            }
        };
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const savedSettings = await storageManager.getGameData('settings');
            if (savedSettings) {
                // Merge with defaults to handle new settings
                this.settings = this.mergeSettings(this.getDefaultSettings(), savedSettings);
                console.log('📥 Settings loaded from storage');
            } else {
                console.log('🆕 Using default settings (first run)');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load settings, using defaults:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    /**
     * Save settings to storage with debouncing
     */
    async saveSettings() {
        // Debounce saves to prevent excessive storage writes
        if (this.saveTimer) {
            clearTimeout(this.saveTimer);
        }
        
        this.saveTimer = setTimeout(async () => {
            try {
                await storageManager.saveGameData('settings', this.settings);
                console.log('💾 Settings saved successfully');
                eventManager.emit('settings:saved', this.settings);
            } catch (error) {
                console.error('❌ Failed to save settings:', error);
                eventManager.emit('settings:save-error', error);
            }
        }, 500); // 500ms debounce
    }

    /**
     * Merge settings objects recursively
     */
    mergeSettings(defaults, saved) {
        const merged = { ...defaults };
        
        for (const [key, value] of Object.entries(saved)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                merged[key] = this.mergeSettings(defaults[key] || {}, value);
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }

    /**
     * Get a specific setting value with caching
     */
    get(path) {
        if (this.settingsCache.has(path)) {
            return this.settingsCache.get(path);
        }
        
        const value = this.getNestedValue(this.settings, path);
        this.settingsCache.set(path, value);
        return value;
    }

    /**
     * Set a specific setting value
     */
    async set(path, value) {
        const oldValue = this.get(path);
        
        // Validate the new value
        if (!this.validateSetting(path, value)) {
            console.warn(`⚠️ Invalid setting value for ${path}:`, value);
            return false;
        }
        
        // Update the setting
        this.setNestedValue(this.settings, path, value);
        
        // Clear cache for this path
        this.settingsCache.delete(path);
        
        // Apply the setting change
        await this.applySetting(path, value, oldValue);
        
        // Save settings
        await this.saveSettings();
        
        // Notify listeners
        this.notifySettingChange(path, value, oldValue);
        
        return true;
    }

    /**
     * Batch update multiple settings
     */
    async updateBatch(updates) {
        const changes = [];
        
        try {
            // Apply all updates
            for (const [path, value] of Object.entries(updates)) {
                const oldValue = this.get(path);
                if (this.validateSetting(path, value)) {
                    this.setNestedValue(this.settings, path, value);
                    this.settingsCache.delete(path);
                    changes.push({ path, value, oldValue });
                }
            }
            
            // Apply all setting changes
            for (const { path, value, oldValue } of changes) {
                await this.applySetting(path, value, oldValue);
            }
            
            // Save once
            await this.saveSettings();
            
            // Notify all changes
            for (const { path, value, oldValue } of changes) {
                this.notifySettingChange(path, value, oldValue);
            }
            
            console.log(`✅ Batch updated ${changes.length} settings`);
            return true;
            
        } catch (error) {
            console.error('❌ Batch update failed:', error);
            return false;
        }
    }

    /**
     * Apply a specific setting change
     */
    async applySetting(path, value, oldValue) {
        const [category, setting] = path.split('.');
        
        switch (category) {
            case 'audio':
                this.applyAudioSetting(setting, value);
                break;
            case 'visual':
                this.applyVisualSetting(setting, value);
                break;
            case 'gameplay':
                this.applyGameplaySetting(setting, value);
                break;
            case 'theme':
                await this.applyThemeSetting(setting, value);
                break;
            case 'accessibility':
                this.applyAccessibilitySetting(setting, value);
                break;
            case 'input':
                this.applyInputSetting(setting, value);
                break;
        }
    }

    /**
     * Apply all settings
     */
    applyAllSettings() {
        performance.mark('settings-apply-start');
        
        // Apply in optimal order for performance
        this.applyVisualSettings();
        this.applyAccessibilitySettings();
        this.applyAudioSettings();
        this.applyThemeSettings();
        this.applyGameplaySettings();
        this.applyInputSettings();
        
        performance.mark('settings-apply-end');
        performance.measure('settings-apply', 'settings-apply-start', 'settings-apply-end');
    }

    /**
     * Apply audio settings
     */
    applyAudioSettings() {
        const audio = this.settings.audio;
        
        // Apply to audio system if available
        eventManager.emit('audio:volume-change', {
            master: audio.masterVolume,
            sfx: audio.sfxVolume,
            music: audio.musicVolume,
            muted: audio.muted
        });
        
        eventManager.emit('audio:toggle-sfx', audio.sfxEnabled);
        eventManager.emit('audio:toggle-music', audio.musicEnabled);
    }

    /**
     * Apply specific audio setting
     */
    applyAudioSetting(setting, value) {
        switch (setting) {
            case 'masterVolume':
            case 'sfxVolume':
            case 'musicVolume':
                eventManager.emit('audio:volume-change', {
                    [setting.replace('Volume', '')]: value
                });
                break;
            case 'muted':
                eventManager.emit('audio:mute', value);
                break;
            case 'sfxEnabled':
                eventManager.emit('audio:toggle-sfx', value);
                break;
            case 'musicEnabled':
                eventManager.emit('audio:toggle-music', value);
                break;
        }
    }

    /**
     * Apply visual settings with performance optimization
     */
    applyVisualSettings() {
        const visual = this.settings.visual;
        const body = document.body;
        
        // Hardware acceleration
        if (visual.hardwareAcceleration) {
            performanceUtils.enableHardwareAcceleration(document.querySelector('.game-board'));
            body.classList.add('hardware-accelerated');
        } else {
            body.classList.remove('hardware-accelerated');
        }
        
        // Animation settings
        body.classList.toggle('animations-disabled', !visual.animationsEnabled);
        body.classList.toggle('particles-disabled', !visual.particleEffects);
        body.classList.toggle('high-contrast', visual.highContrast);
        body.classList.toggle('reduced-motion', visual.reducedMotion);
        
        // Quality settings
        body.className = body.className.replace(/quality-\w+/g, '');
        body.classList.add(`quality-${visual.quality}`);
        
        // FPS target
        eventManager.emit('performance:fps-target', visual.targetFPS);
    }

    /**
     * Apply specific visual setting
     */
    applyVisualSetting(setting, value) {
        const body = document.body;
        
        switch (setting) {
            case 'animationsEnabled':
                body.classList.toggle('animations-disabled', !value);
                break;
            case 'particleEffects':
                body.classList.toggle('particles-disabled', !value);
                break;
            case 'hardwareAcceleration':
                if (value) {
                    performanceUtils.enableHardwareAcceleration(document.querySelector('.game-board'));
                    body.classList.add('hardware-accelerated');
                } else {
                    body.classList.remove('hardware-accelerated');
                }
                break;
            case 'highContrast':
                body.classList.toggle('high-contrast', value);
                break;
            case 'reducedMotion':
                body.classList.toggle('reduced-motion', value);
                this.settings.accessibility.reducedMotion = value; // Sync with accessibility
                break;
            case 'quality':
                body.className = body.className.replace(/quality-\w+/g, '');
                body.classList.add(`quality-${value}`);
                break;
            case 'targetFPS':
                eventManager.emit('performance:fps-target', value);
                break;
        }
    }

    /**
     * Apply theme settings with lazy loading
     */
    async applyThemeSettings() {
        const theme = this.settings.theme;
        await this.loadTheme(theme.current);
        
        document.body.classList.toggle('dark-mode', theme.darkMode);
    }

    /**
     * Load theme with dynamic imports for performance
     */
    async loadTheme(themeName) {
        try {
            // Remove existing theme classes
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            
            // Add new theme class
            document.body.classList.add(`theme-${themeName}`);
            
            // Lazy load theme-specific resources if needed
            if (themeName !== 'space') { // 'space' is default, already loaded
                await this.loadThemeResources(themeName);
            }
            
            eventManager.emit('theme:changed', themeName);
            console.log(`🎨 Theme changed to: ${themeName}`);
            
        } catch (error) {
            console.error(`❌ Failed to load theme ${themeName}:`, error);
            // Fallback to default theme
            document.body.classList.add('theme-space');
        }
    }

    /**
     * Load theme-specific resources
     */
    async loadThemeResources(themeName) {
        // This would load theme-specific CSS, images, etc.
        // For now, just simulate async loading
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`🎨 Theme resources loaded for: ${themeName}`);
                resolve();
            }, 100);
        });
    }

    /**
     * Apply accessibility settings
     */
    applyAccessibilitySettings() {
        const a11y = this.settings.accessibility;
        const body = document.body;
        
        body.classList.toggle('reduced-motion', a11y.reducedMotion);
        body.classList.toggle('high-contrast', a11y.highContrast);
        body.classList.toggle('large-text', a11y.largeText);
        body.classList.toggle('colorblind-friendly', a11y.colorBlindFriendly);
        body.classList.toggle('focus-indicators', a11y.focusIndicators);
        
        // Sync with CSS media query preferences
        if (a11y.reducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        } else {
            document.documentElement.style.removeProperty('--animation-duration');
        }
    }

    /**
     * Apply specific accessibility setting
     */
    applyAccessibilitySetting(setting, value) {
        const body = document.body;
        
        switch (setting) {
            case 'reducedMotion':
                body.classList.toggle('reduced-motion', value);
                this.settings.visual.reducedMotion = value; // Sync with visual settings
                if (value) {
                    document.documentElement.style.setProperty('--animation-duration', '0s');
                } else {
                    document.documentElement.style.removeProperty('--animation-duration');
                }
                break;
            case 'highContrast':
                body.classList.toggle('high-contrast', value);
                this.settings.visual.highContrast = value; // Sync with visual settings
                break;
            case 'largeText':
                body.classList.toggle('large-text', value);
                break;
            case 'colorBlindFriendly':
                body.classList.toggle('colorblind-friendly', value);
                break;
            case 'focusIndicators':
                body.classList.toggle('focus-indicators', value);
                break;
        }
    }

    /**
     * Apply system preferences automatically
     */
    applySystemPreferences() {
        // Respect system reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.set('accessibility.reducedMotion', true);
            this.set('visual.reducedMotion', true);
        }
        
        // Respect system color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.set('theme.darkMode', true);
        }
        
        // Listen for system preference changes
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                if (e.matches) {
                    this.set('accessibility.reducedMotion', true);
                }
            });
            
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                this.set('theme.darkMode', e.matches);
            });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for game events that might affect settings
        eventManager.on('game:performance-warning', () => {
            console.log('🐌 Performance warning detected, suggesting lower quality settings');
            this.suggestPerformanceSettings();
        });
        
        // Listen for mobile device detection
        eventManager.on('device:mobile-detected', () => {
            this.applyMobileOptimizations();
        });
        
        // Listen for focus events for accessibility
        document.addEventListener('focusin', (e) => {
            if (this.settings.accessibility.focusIndicators) {
                e.target.classList.add('focused');
            }
        });
        
        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focused');
        });
    }

    /**
     * Suggest performance optimizations
     */
    suggestPerformanceSettings() {
        const suggestions = {
            'visual.quality': 'medium',
            'visual.particleEffects': false,
            'visual.targetFPS': 30
        };
        
        eventManager.emit('settings:performance-suggestions', suggestions);
    }

    /**
     * Apply mobile-specific optimizations
     */
    applyMobileOptimizations() {
        console.log('📱 Applying mobile optimizations');
        
        const mobileSettings = {
            'visual.particleEffects': false,
            'visual.quality': 'medium',
            'input.touchGestures': true,
            'input.hapticFeedback': true
        };
        
        this.updateBatch(mobileSettings);
    }

    /**
     * Utility methods
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Validate setting values
     */
    validateSetting(path, value) {
        // Basic validation - could be expanded
        const [category, setting] = path.split('.');
        
        switch (category) {
            case 'audio':
                if (setting.includes('Volume')) {
                    return typeof value === 'number' && value >= 0 && value <= 1;
                }
                return typeof value === 'boolean';
            case 'visual':
                if (setting === 'targetFPS') {
                    return [30, 60].includes(value);
                }
                if (setting === 'quality') {
                    return ['low', 'medium', 'high'].includes(value);
                }
                return typeof value === 'boolean';
            default:
                return true; // Allow other values for now
        }
    }

    /**
     * Register callback for setting changes
     */
    onSettingChange(path, callback) {
        if (!this.settingsChangeCallbacks.has(path)) {
            this.settingsChangeCallbacks.set(path, []);
        }
        this.settingsChangeCallbacks.get(path).push(callback);
    }

    /**
     * Notify listeners of setting changes
     */
    notifySettingChange(path, newValue, oldValue) {
        const callbacks = this.settingsChangeCallbacks.get(path) || [];
        callbacks.forEach(callback => {
            try {
                callback(newValue, oldValue, path);
            } catch (error) {
                console.error(`Error in setting change callback for ${path}:`, error);
            }
        });
        
        // Emit global event
        eventManager.emit('settings:changed', { path, newValue, oldValue });
    }

    /**
     * Reset all settings to defaults
     */
    async resetToDefaults() {
        console.log('🔄 Resetting all settings to defaults');
        this.settings = this.getDefaultSettings();
        this.settingsCache.clear();
        this.applyAllSettings();
        await this.saveSettings();
        eventManager.emit('settings:reset');
    }

    /**
     * Export settings for backup
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from backup
     */
    async importSettings(settingsJson) {
        try {
            const importedSettings = JSON.parse(settingsJson);
            this.settings = this.mergeSettings(this.getDefaultSettings(), importedSettings);
            this.settingsCache.clear();
            this.applyAllSettings();
            await this.saveSettings();
            console.log('📥 Settings imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import settings:', error);
            return false;
        }
    }

    /**
     * Get settings summary for debugging
     */
    getSettingsSummary() {
        return {
            audio: `Master: ${Math.round(this.settings.audio.masterVolume * 100)}%, Muted: ${this.settings.audio.muted}`,
            visual: `Quality: ${this.settings.visual.quality}, Animations: ${this.settings.visual.animationsEnabled}`,
            theme: this.settings.theme.current,
            accessibility: `Reduced Motion: ${this.settings.accessibility.reducedMotion}`,
            performance: `FPS Target: ${this.settings.visual.targetFPS}, Hardware Accel: ${this.settings.visual.hardwareAcceleration}`
        };
    }
}

// Create singleton instance
export const settingsSystem = new SettingsSystem();

// Quick access methods
export const getSetting = (path) => settingsSystem.get(path);
export const setSetting = (path, value) => settingsSystem.set(path, value);
export const updateSettings = (updates) => settingsSystem.updateBatch(updates);
export const resetSettings = () => settingsSystem.resetToDefaults(); 