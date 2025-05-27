/**
 * @fileoverview Settings UI System
 * @description Comprehensive settings interface with tabbed navigation,
 * real-time preview, and accessibility support
 */

import { settingsSystem } from '../features/settings-system.js';
import { eventManager } from '../utils/event-manager.js';
import { modalSystem } from './modals.js';
import { performanceUtils } from '../utils/performance-utils.js';

export class SettingsUI {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'audio';
        this.unsavedChanges = new Map();
        this.previewMode = false;
        
        // UI elements cache
        this.elements = {
            modal: null,
            tabs: new Map(),
            panels: new Map(),
            controls: new Map()
        };
        
        this.initialize();
    }

    /**
     * Initialize settings UI
     */
    initialize() {
        console.log('⚙️ Initializing Settings UI...');
        
        // Listen for settings events
        this.setupEventListeners();
        
        console.log('✅ Settings UI initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for settings open requests
        eventManager.on('ui:open-settings', () => this.openSettings());
        eventManager.on('ui:close-settings', () => this.closeSettings());
        
        // Listen for setting changes
        eventManager.on('settings:changed', (change) => this.handleSettingChange(change));
        
        // Listen for keyboard shortcuts
        eventManager.on('input:key-action', (action) => {
            if (action.action === 'settings' && !this.isOpen) {
                this.openSettings();
            }
        });
    }

    /**
     * Open settings modal
     */
    async openSettings(initialTab = 'audio') {
        if (this.isOpen) return;
        
        console.log('🔧 Opening settings UI...');
        
        try {
            // Create settings modal
            this.createSettingsModal();
            
            // Switch to initial tab
            this.switchTab(initialTab);
            
            // Show modal
            this.showModal();
            
            this.isOpen = true;
            eventManager.emit('settings-ui:opened');
            
        } catch (error) {
            console.error('❌ Failed to open settings:', error);
        }
    }

    /**
     * Close settings modal
     */
    async closeSettings() {
        if (!this.isOpen) return;
        
        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            const shouldDiscard = await this.confirmDiscardChanges();
            if (!shouldDiscard) return;
        }
        
        // Close modal
        this.hideModal();
        
        // Clean up
        this.cleanup();
        
        this.isOpen = false;
        eventManager.emit('settings-ui:closed');
    }

    /**
     * Create settings modal structure
     */
    createSettingsModal() {
        const modalContent = this.createModalContent();
        
        this.elements.modal = modalSystem.createModal({
            id: 'settings-modal',
            title: '⚙️ Game Settings',
            content: modalContent,
            size: 'large',
            closable: true,
            onClose: () => this.closeSettings()
        });
        
        // Setup tab navigation
        this.setupTabNavigation();
        
        // Setup control handlers
        this.setupControlHandlers();
    }

    /**
     * Create modal content HTML
     */
    createModalContent() {
        return `
            <div class="settings-container">
                <!-- Tab Navigation -->
                <div class="settings-tabs" role="tablist" aria-label="Settings Categories">
                    ${this.createTabsHTML()}
                </div>
                
                <!-- Tab Panels -->
                <div class="settings-panels">
                    ${this.createPanelsHTML()}
                </div>
                
                <!-- Action Buttons -->
                <div class="settings-actions">
                    <button type="button" class="btn btn-secondary" id="settings-reset">
                        🔄 Reset to Defaults
                    </button>
                    <button type="button" class="btn btn-secondary" id="settings-export">
                        📤 Export Settings
                    </button>
                    <button type="button" class="btn btn-secondary" id="settings-import">
                        📥 Import Settings
                    </button>
                    <div class="settings-actions-right">
                        <button type="button" class="btn btn-secondary" id="settings-cancel">
                            ❌ Cancel
                        </button>
                        <button type="button" class="btn btn-primary" id="settings-save">
                            💾 Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create tabs HTML
     */
    createTabsHTML() {
        const tabs = [
            { id: 'audio', icon: '🔊', label: 'Audio', description: 'Volume and sound settings' },
            { id: 'visual', icon: '👁️', label: 'Visual', description: 'Graphics and animations' },
            { id: 'gameplay', icon: '🎮', label: 'Gameplay', description: 'Game mechanics' },
            { id: 'theme', icon: '🎨', label: 'Themes', description: 'Visual themes' },
            { id: 'accessibility', icon: '♿', label: 'Accessibility', description: 'Accessibility features' },
            { id: 'input', icon: '📱', label: 'Input', description: 'Controls and gestures' }
        ];

        return tabs.map(tab => `
            <button 
                type="button"
                class="settings-tab ${tab.id === this.currentTab ? 'active' : ''}"
                role="tab"
                aria-selected="${tab.id === this.currentTab}"
                aria-controls="panel-${tab.id}"
                id="tab-${tab.id}"
                data-tab="${tab.id}"
                tabindex="${tab.id === this.currentTab ? 0 : -1}"
            >
                <span class="tab-icon">${tab.icon}</span>
                <span class="tab-label">${tab.label}</span>
                <span class="tab-description">${tab.description}</span>
            </button>
        `).join('');
    }

    /**
     * Create panels HTML
     */
    createPanelsHTML() {
        return `
            ${this.createAudioPanel()}
            ${this.createVisualPanel()}
            ${this.createGameplayPanel()}
            ${this.createThemePanel()}
            ${this.createAccessibilityPanel()}
            ${this.createInputPanel()}
        `;
    }

    /**
     * Create audio settings panel
     */
    createAudioPanel() {
        const audio = settingsSystem.settings.audio;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'audio' ? 'active' : ''}"
                role="tabpanel"
                id="panel-audio"
                aria-labelledby="tab-audio"
            >
                <h3>🔊 Audio Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">
                        Master Volume
                        <span class="setting-value" id="master-volume-value">${Math.round(audio.masterVolume * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        class="setting-slider" 
                        id="master-volume"
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value="${audio.masterVolume}"
                        aria-describedby="master-volume-desc"
                    />
                    <small id="master-volume-desc" class="setting-description">
                        Controls overall game volume
                    </small>
                </div>

                <div class="setting-group">
                    <label class="setting-label">
                        Sound Effects Volume
                        <span class="setting-value" id="sfx-volume-value">${Math.round(audio.sfxVolume * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        class="setting-slider" 
                        id="sfx-volume"
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value="${audio.sfxVolume}"
                        aria-describedby="sfx-volume-desc"
                    />
                    <small id="sfx-volume-desc" class="setting-description">
                        Volume for game sound effects
                    </small>
                </div>

                <div class="setting-group">
                    <label class="setting-label">
                        Background Music Volume
                        <span class="setting-value" id="music-volume-value">${Math.round(audio.musicVolume * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        class="setting-slider" 
                        id="music-volume"
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value="${audio.musicVolume}"
                        aria-describedby="music-volume-desc"
                    />
                    <small id="music-volume-desc" class="setting-description">
                        Volume for background music
                    </small>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="audio-muted"
                            ${audio.muted ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Mute All Audio
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="sfx-enabled"
                            ${audio.sfxEnabled ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enable Sound Effects
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="music-enabled"
                            ${audio.musicEnabled ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enable Background Music
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Create visual settings panel
     */
    createVisualPanel() {
        const visual = settingsSystem.settings.visual;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'visual' ? 'active' : ''}"
                role="tabpanel"
                id="panel-visual"
                aria-labelledby="tab-visual"
            >
                <h3>👁️ Visual Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Graphics Quality</label>
                    <select class="setting-select" id="graphics-quality" aria-describedby="graphics-quality-desc">
                        <option value="low" ${visual.quality === 'low' ? 'selected' : ''}>Low (Better Performance)</option>
                        <option value="medium" ${visual.quality === 'medium' ? 'selected' : ''}>Medium (Balanced)</option>
                        <option value="high" ${visual.quality === 'high' ? 'selected' : ''}>High (Best Quality)</option>
                    </select>
                    <small id="graphics-quality-desc" class="setting-description">
                        Affects overall visual quality and performance
                    </small>
                </div>

                <div class="setting-group">
                    <label class="setting-label">Target Frame Rate</label>
                    <select class="setting-select" id="target-fps">
                        <option value="30" ${visual.targetFPS === 30 ? 'selected' : ''}>30 FPS (Battery Saving)</option>
                        <option value="60" ${visual.targetFPS === 60 ? 'selected' : ''}>60 FPS (Smooth)</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="animations-enabled"
                            ${visual.animationsEnabled ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enable Animations
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="particle-effects"
                            ${visual.particleEffects ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enable Particle Effects
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="hardware-acceleration"
                            ${visual.hardwareAcceleration ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Hardware Acceleration (GPU)
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="high-contrast"
                            ${visual.highContrast ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        High Contrast Mode
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Create theme settings panel
     */
    createThemePanel() {
        const theme = settingsSystem.settings.theme;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'theme' ? 'active' : ''}"
                role="tabpanel"
                id="panel-theme"
                aria-labelledby="tab-theme"
            >
                <h3>🎨 Theme Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Board Theme</label>
                    <div class="theme-grid">
                        ${theme.available.map(themeName => `
                            <button 
                                type="button"
                                class="theme-option ${theme.current === themeName ? 'selected' : ''}"
                                data-theme="${themeName}"
                                aria-pressed="${theme.current === themeName}"
                            >
                                <div class="theme-preview theme-preview-${themeName}"></div>
                                <span class="theme-name">${this.getThemeName(themeName)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="dark-mode"
                            ${theme.darkMode ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Dark Mode
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Create accessibility panel
     */
    createAccessibilityPanel() {
        const a11y = settingsSystem.settings.accessibility;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'accessibility' ? 'active' : ''}"
                role="tabpanel"
                id="panel-accessibility"
                aria-labelledby="tab-accessibility"
            >
                <h3>♿ Accessibility Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="reduced-motion"
                            ${a11y.reducedMotion ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Reduce Motion
                    </label>
                    <small class="setting-description">
                        Reduces or disables animations for motion sensitivity
                    </small>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="large-text"
                            ${a11y.largeText ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Large Text
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="colorblind-friendly"
                            ${a11y.colorBlindFriendly ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Colorblind Friendly Mode
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="focus-indicators"
                            ${a11y.focusIndicators ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enhanced Focus Indicators
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="keyboard-navigation"
                            ${a11y.keyboardNavigation ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Full Keyboard Navigation
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Create input settings panel
     */
    createInputPanel() {
        const input = settingsSystem.settings.input;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'input' ? 'active' : ''}"
                role="tabpanel"
                id="panel-input"
                aria-labelledby="tab-input"
            >
                <h3>📱 Input Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="touch-gestures"
                            ${input.touchGestures ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Enable Touch Gestures
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="swipe-controls"
                            ${input.swipeControls ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Swipe Controls
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="keyboard-shortcuts"
                            ${input.keyboardShortcuts ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Keyboard Shortcuts
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="haptic-feedback"
                            ${input.hapticFeedback ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Haptic Feedback (Vibration)
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-label">
                        Touch Sensitivity
                        <span class="setting-value" id="touch-sensitivity-value">${Math.round(input.touchSensitivity * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        class="setting-slider" 
                        id="touch-sensitivity"
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value="${input.touchSensitivity}"
                    />
                </div>
            </div>
        `;
    }

    /**
     * Create gameplay settings panel
     */
    createGameplayPanel() {
        const gameplay = settingsSystem.settings.gameplay;
        
        return `
            <div 
                class="settings-panel ${this.currentTab === 'gameplay' ? 'active' : ''}"
                role="tabpanel"
                id="panel-gameplay"
                aria-labelledby="tab-gameplay"
            >
                <h3>🎮 Gameplay Settings</h3>
                
                <div class="setting-group">
                    <label class="setting-label">Difficulty Level</label>
                    <select class="setting-select" id="difficulty">
                        <option value="easy" ${gameplay.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                        <option value="normal" ${gameplay.difficulty === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="hard" ${gameplay.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                    </select>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="hints-enabled"
                            ${gameplay.hintsEnabled ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Show Hints
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="auto-save"
                            ${gameplay.autoSave ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Auto-Save Progress
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-checkbox">
                        <input 
                            type="checkbox" 
                            id="confirm-moves"
                            ${gameplay.confirmMoves ? 'checked' : ''}
                        />
                        <span class="checkmark"></span>
                        Confirm Destructive Moves
                    </label>
                </div>

                <div class="setting-group">
                    <label class="setting-label">
                        Swap Animation Speed
                        <span class="setting-value" id="swap-speed-value">${Math.round(gameplay.swapSpeed * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        class="setting-slider" 
                        id="swap-speed"
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value="${gameplay.swapSpeed}"
                    />
                </div>
            </div>
        `;
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        const tabs = this.elements.modal.querySelectorAll('.settings-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
            
            tab.addEventListener('keydown', (e) => {
                this.handleTabKeyNavigation(e);
            });
        });
    }

    /**
     * Handle tab keyboard navigation
     */
    handleTabKeyNavigation(event) {
        const tabs = Array.from(this.elements.modal.querySelectorAll('.settings-tab'));
        const currentIndex = tabs.findIndex(tab => tab === event.target);
        
        let newIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = tabs.length - 1;
                break;
            default:
                return;
        }
        
        event.preventDefault();
        this.switchTab(tabs[newIndex].dataset.tab);
        tabs[newIndex].focus();
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabId) {
        // Update current tab
        this.currentTab = tabId;
        
        // Update tab states
        const tabs = this.elements.modal.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            const isActive = tab.dataset.tab === tabId;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
            tab.setAttribute('tabindex', isActive ? 0 : -1);
        });
        
        // Update panel states
        const panels = this.elements.modal.querySelectorAll('.settings-panel');
        panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${tabId}`);
        });
        
        // Emit tab change event
        eventManager.emit('settings-ui:tab-changed', tabId);
    }

    /**
     * Setup control handlers
     */
    setupControlHandlers() {
        // Setup all form controls
        this.setupSliders();
        this.setupCheckboxes();
        this.setupSelects();
        this.setupButtons();
        this.setupThemeSelector();
    }

    /**
     * Setup slider controls
     */
    setupSliders() {
        const sliders = this.elements.modal.querySelectorAll('.setting-slider');
        
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                this.handleSliderChange(e);
            });
        });
    }

    /**
     * Handle slider value changes
     */
    handleSliderChange(event) {
        const slider = event.target;
        const value = parseFloat(slider.value);
        const settingPath = this.getSettingPath(slider.id);
        
        // Update value display
        const valueDisplay = this.elements.modal.querySelector(`#${slider.id}-value`);
        if (valueDisplay) {
            if (slider.id.includes('volume') || slider.id.includes('sensitivity') || slider.id.includes('speed')) {
                valueDisplay.textContent = `${Math.round(value * 100)}%`;
            } else {
                valueDisplay.textContent = value;
            }
        }
        
        // Apply setting change
        this.applySetting(settingPath, value);
    }

    /**
     * Setup checkbox controls
     */
    setupCheckboxes() {
        const checkboxes = this.elements.modal.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handleCheckboxChange(e);
            });
        });
    }

    /**
     * Handle checkbox changes
     */
    handleCheckboxChange(event) {
        const checkbox = event.target;
        const value = checkbox.checked;
        const settingPath = this.getSettingPath(checkbox.id);
        
        this.applySetting(settingPath, value);
    }

    /**
     * Setup select controls
     */
    setupSelects() {
        const selects = this.elements.modal.querySelectorAll('.setting-select');
        
        selects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleSelectChange(e);
            });
        });
    }

    /**
     * Handle select changes
     */
    handleSelectChange(event) {
        const select = event.target;
        const value = select.value;
        const settingPath = this.getSettingPath(select.id);
        
        // Convert numeric values
        const numericValue = select.id === 'target-fps' ? parseInt(value) : value;
        
        this.applySetting(settingPath, numericValue);
    }

    /**
     * Setup button controls
     */
    setupButtons() {
        // Action buttons
        const resetBtn = this.elements.modal.querySelector('#settings-reset');
        const exportBtn = this.elements.modal.querySelector('#settings-export');
        const importBtn = this.elements.modal.querySelector('#settings-import');
        const cancelBtn = this.elements.modal.querySelector('#settings-cancel');
        const saveBtn = this.elements.modal.querySelector('#settings-save');

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportSettings());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.importSettings());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeSettings());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAllSettings());
        }
    }

    /**
     * Setup theme selector
     */
    setupThemeSelector() {
        const themeOptions = this.elements.modal.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const themeName = e.currentTarget.dataset.theme;
                if (themeName) {
                    this.selectTheme(themeName);
                }
            });
        });
    }

    /**
     * Select a theme
     */
    selectTheme(themeName) {
        // Update UI
        const themeOptions = this.elements.modal.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.toggle('selected', option.dataset.theme === themeName);
            option.setAttribute('aria-pressed', option.dataset.theme === themeName);
        });

        // Apply setting
        this.applySetting('theme.current', themeName);
    }

    /**
     * Reset all settings to defaults
     */
    async resetToDefaults() {
        const confirmed = await this.confirmAction(
            'Reset Settings',
            'Are you sure you want to reset all settings to their default values? This cannot be undone.'
        );

        if (confirmed) {
            try {
                await settingsSystem.resetToDefaults();
                this.closeSettings();
                // Reopen to show updated values
                setTimeout(() => this.openSettings(), 300);
            } catch (error) {
                console.error('Failed to reset settings:', error);
            }
        }
    }

    /**
     * Export settings
     */
    exportSettings() {
        try {
            const settingsJson = settingsSystem.exportSettings();
            const blob = new Blob([settingsJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gems-rush-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Settings exported successfully');
        } catch (error) {
            console.error('❌ Failed to export settings:', error);
        }
    }

    /**
     * Import settings
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const success = await settingsSystem.importSettings(text);
                
                if (success) {
                    this.closeSettings();
                    // Reopen to show updated values
                    setTimeout(() => this.openSettings(), 300);
                    console.log('✅ Settings imported successfully');
                } else {
                    alert('Failed to import settings. Please check the file format.');
                }
            } catch (error) {
                console.error('❌ Failed to import settings:', error);
                alert('Failed to import settings. Please check the file format.');
            }
        });
        
        input.click();
    }

    /**
     * Save all current settings
     */
    async saveAllSettings() {
        try {
            // All settings are already saved automatically when changed
            // This button is mainly for UI feedback
            this.unsavedChanges.clear();
            this.updateSaveButtonState();
            
            // Show brief success feedback
            const saveBtn = this.elements.modal.querySelector('#settings-save');
            if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '✅ Saved!';
                saveBtn.disabled = true;
                
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                    saveBtn.disabled = false;
                }, 2000);
            }
            
            console.log('✅ All settings saved');
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
        }
    }

    /**
     * Confirm action with user
     */
    async confirmAction(title, message) {
        return new Promise((resolve) => {
            if (confirm(`${title}\n\n${message}`)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Map control IDs to setting paths
     */
    getSettingPath(controlId) {
        const pathMap = {
            // Audio
            'master-volume': 'audio.masterVolume',
            'sfx-volume': 'audio.sfxVolume',
            'music-volume': 'audio.musicVolume',
            'audio-muted': 'audio.muted',
            'sfx-enabled': 'audio.sfxEnabled',
            'music-enabled': 'audio.musicEnabled',
            
            // Visual
            'graphics-quality': 'visual.quality',
            'target-fps': 'visual.targetFPS',
            'animations-enabled': 'visual.animationsEnabled',
            'particle-effects': 'visual.particleEffects',
            'hardware-acceleration': 'visual.hardwareAcceleration',
            'high-contrast': 'visual.highContrast',
            
            // Gameplay
            'difficulty': 'gameplay.difficulty',
            'hints-enabled': 'gameplay.hintsEnabled',
            'auto-save': 'gameplay.autoSave',
            'confirm-moves': 'gameplay.confirmMoves',
            'swap-speed': 'gameplay.swapSpeed',
            
            // Theme
            'dark-mode': 'theme.darkMode',
            
            // Accessibility
            'reduced-motion': 'accessibility.reducedMotion',
            'large-text': 'accessibility.largeText',
            'colorblind-friendly': 'accessibility.colorBlindFriendly',
            'focus-indicators': 'accessibility.focusIndicators',
            'keyboard-navigation': 'accessibility.keyboardNavigation',
            
            // Input
            'touch-gestures': 'input.touchGestures',
            'swipe-controls': 'input.swipeControls',
            'keyboard-shortcuts': 'input.keyboardShortcuts',
            'haptic-feedback': 'input.hapticFeedback',
            'touch-sensitivity': 'input.touchSensitivity'
        };
        
        return pathMap[controlId];
    }

    /**
     * Apply setting change
     */
    async applySetting(path, value) {
        if (!path) return;
        
        try {
            // Apply the setting
            await settingsSystem.set(path, value);
            
            // Track unsaved changes for UI feedback
            this.unsavedChanges.set(path, value);
            this.updateSaveButtonState();
            
        } catch (error) {
            console.error(`Failed to apply setting ${path}:`, error);
        }
    }

    /**
     * Get theme display name
     */
    getThemeName(themeId) {
        const names = {
            space: '🌌 Space',
            forest: '🌲 Forest',
            ocean: '🌊 Ocean',
            fire: '🔥 Fire',
            celestial: '✨ Celestial'
        };
        return names[themeId] || themeId;
    }

    /**
     * Utility methods
     */
    hasUnsavedChanges() {
        return this.unsavedChanges.size > 0;
    }

    updateSaveButtonState() {
        const saveButton = this.elements.modal?.querySelector('#settings-save');
        if (saveButton) {
            saveButton.disabled = !this.hasUnsavedChanges();
        }
    }

    async confirmDiscardChanges() {
        return new Promise(resolve => {
            modalSystem.showConfirm({
                title: 'Unsaved Changes',
                message: 'You have unsaved changes. Are you sure you want to discard them?',
                confirmText: 'Discard',
                cancelText: 'Keep Editing',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    showModal() {
        if (this.elements.modal) {
            modalSystem.showModal(this.elements.modal);
        }
    }

    hideModal() {
        if (this.elements.modal) {
            modalSystem.hideModal(this.elements.modal);
        }
    }

    cleanup() {
        this.unsavedChanges.clear();
        this.elements.modal = null;
    }

    handleSettingChange(change) {
        // Update UI to reflect setting changes from other sources
        if (this.isOpen && this.elements.modal) {
            this.updateUIForSetting(change.path, change.newValue);
        }
    }
}

// Create singleton instance
export const settingsUI = new SettingsUI(); 