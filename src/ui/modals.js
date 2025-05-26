// Modals Module
// Handles settings, credits, game info modals and overlay management

import { storageManager } from '../utils/storage.js';
import { helpers } from '../utils/helpers.js';

export class ModalSystem {
    constructor() {
        this.activeModals = [];
        this.isInitialized = false;
        this.settingsCache = null;
    }

    // Initialize modal system
    initialize() {
        try {
            this.setupEventListeners();
            this.addModalStyles();
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Modal System:', error);
            return false;
        }
    }

    // Setup global event listeners
    setupEventListeners() {
        // Listen for modal events from other modules
        document.addEventListener('showModal', (event) => {
            const { type, data } = event.detail;
            this.showModal(type, data);
        });

        // Global escape key listener
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeTopModal();
            }
        });
    }

    // Show modal by type
    showModal(type, data = {}) {
        switch (type) {
            case 'gameGuide':
                this.showGameGuide();
                break;
            case 'settings':
                this.showSettings();
                break;
            case 'credits':
                this.showCredits();
                break;
            case 'achievements':
                this.showAchievements(data);
                break;
            case 'confirmation':
                return this.showConfirmation(data);
            default:
                console.warn('Unknown modal type:', type);
        }
    }

    // Create modal base structure
    createModal(id, title, content, options = {}) {
        // Remove existing modal with same ID
        this.removeModal(id);

        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'game-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', `${id}-title`);
        modal.setAttribute('aria-modal', 'true');

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';

        const modalTitle = document.createElement('h2');
        modalTitle.id = `${id}-title`;
        modalTitle.textContent = title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.onclick = () => this.removeModal(id);

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = content;

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);

        // Add footer if provided
        if (options.footer) {
            const modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modalFooter.innerHTML = options.footer;
            modalContent.appendChild(modalFooter);
        }

        modal.appendChild(modalContent);

        // Click outside to close
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.removeModal(id);
            }
        });

        document.body.appendChild(modal);
        this.activeModals.push(modal);

        // Animate in
        setTimeout(() => {
            modal.classList.add('modal-visible');
        }, 10);

        // Focus management
        closeBtn.focus();

        return modal;
    }

    // Show game guide modal
    showGameGuide() {
        const content = `
            <div class="guide-section">
                <h3>🎯 Divine Battle Rules</h3>
                <ul>
                    <li>🔄 <strong>Swap adjacent gems</strong> to create matches of 3 or more identical divine powers</li>
                    <li>🎯 <strong>Reach target scores</strong> to advance through divine realms</li>
                    <li>💎 <strong>Create bigger matches</strong> for higher scores and divine combo multipliers</li>
                    <li>⚡ <strong>Chain reactions</strong> occur when new gems fall and create more celestial matches</li>
                    <li>💡 <strong>Use hints</strong> when stuck - they'll show you possible moves</li>
                    <li>↩️ <strong>Undo moves</strong> if you make a mistake (limited uses)</li>
                </ul>
            </div>

            <div class="guide-section">
                <h3>🎮 Game Modes</h3>
                <div class="mode-grid">
                    <div class="mode-card">
                        <div class="mode-icon">🎯</div>
                        <div class="mode-title">Normal Mode</div>
                        <div class="mode-desc">Classic gameplay with unlimited time to plan your divine strategy</div>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">⏱️</div>
                        <div class="mode-title">Time Attack</div>
                        <div class="mode-desc">Score as much as possible in 60 seconds of intense divine combat</div>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">📅</div>
                        <div class="mode-title">Daily Quest</div>
                        <div class="mode-desc">Special daily divine challenges with unique objectives and rewards</div>
                    </div>
                    <div class="mode-card">
                        <div class="mode-icon">⚔️</div>
                        <div class="mode-title">Divine Conquest</div>
                        <div class="mode-desc">Epic campaign through mystical realms with increasing difficulty</div>
                    </div>
                </div>
            </div>

            <div class="guide-section">
                <h3>🌟 Divine Gem Powers</h3>
                <div class="gems-grid">
                    <div class="gem-info">
                        <span class="gem-icon">🔥</span>
                        <div>
                            <strong>Fire Gem</strong>
                            <p>Blazing divine gem with sacred flames of purification</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">💧</span>
                        <div>
                            <strong>Water Gem</strong>
                            <p>Sacred waters of divine healing and flow</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">🌍</span>
                        <div>
                            <strong>Earth Gem</strong>
                            <p>Ancient divine foundation stone of eternal strength</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">💨</span>
                        <div>
                            <strong>Air Gem</strong>
                            <p>Celestial winds of the heavens bringing divine freedom</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">⚡</span>
                        <div>
                            <strong>Lightning Gem</strong>
                            <p>Divine thunderbolt of the gods with pure energy</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">🌿</span>
                        <div>
                            <strong>Nature Gem</strong>
                            <p>Sacred life force of creation and divine growth</p>
                        </div>
                    </div>
                    <div class="gem-info">
                        <span class="gem-icon">🔮</span>
                        <div>
                            <strong>Magic Gem</strong>
                            <p>Pure divine essence and mystical power beyond comprehension</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="guide-section">
                <h3>🏆 Divine Scoring System</h3>
                <div class="scoring-table">
                    <div class="score-row">
                        <span class="score-type">💎 3-match:</span>
                        <span class="score-points">50 divine points</span>
                    </div>
                    <div class="score-row">
                        <span class="score-type">💎 4-match:</span>
                        <span class="score-points">150 divine points</span>
                    </div>
                    <div class="score-row">
                        <span class="score-type">💎 5+ match:</span>
                        <span class="score-points">300+ divine points</span>
                    </div>
                    <div class="score-row">
                        <span class="score-type">🔥 Rush Multiplier:</span>
                        <span class="score-points">Each cascade increases divine power</span>
                    </div>
                </div>
            </div>

            <div class="guide-section">
                <h3>🕹️ Divine Controls</h3>
                <div class="controls-grid">
                    <div class="control-item">
                        <kbd>Click</kbd>
                        <span>Select divine gem</span>
                    </div>
                    <div class="control-item">
                        <kbd>Click Again</kbd>
                        <span>Swap with adjacent gem</span>
                    </div>
                    <div class="control-item">
                        <kbd>R</kbd>
                        <span>Restart divine battle</span>
                    </div>
                    <div class="control-item">
                        <kbd>H</kbd>
                        <span>Show hint</span>
                    </div>
                    <div class="control-item">
                        <kbd>Ctrl+U</kbd>
                        <span>Undo last move</span>
                    </div>
                    <div class="control-item">
                        <kbd>Esc</kbd>
                        <span>Close menus</span>
                    </div>
                </div>
            </div>
        `;

        return this.createModal('gameGuideModal', '📖 Divine Game Guide', content);
    }

    // Show settings modal
    showSettings() {
        // Load current settings
        const settings = storageManager.loadSettings();
        this.settingsCache = { ...settings };

        const content = `
            <div class="settings-section">
                <h3>🔊 Audio Settings</h3>
                <div class="setting-item">
                    <label for="modalMasterVolume">Master Volume</label>
                    <div class="volume-control">
                        <input type="range" id="modalMasterVolume" min="0" max="100" value="${settings.volume * 100}" class="volume-slider">
                        <span class="volume-value">${Math.round(settings.volume * 100)}%</span>
                    </div>
                </div>
                <div class="setting-item">
                    <label for="modalSoundEffects">Sound Effects</label>
                    <input type="checkbox" id="modalSoundEffects" ${settings.soundEnabled ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalBackgroundMusic">Background Music</label>
                    <input type="checkbox" id="modalBackgroundMusic" ${settings.musicEnabled ? 'checked' : ''} class="toggle-switch">
                </div>
            </div>

            <div class="settings-section">
                <h3>👁️ Visual Settings</h3>
                <div class="setting-item">
                    <label for="modalAnimations">Animations</label>
                    <input type="checkbox" id="modalAnimations" ${settings.animationsEnabled ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalParticleEffects">Particle Effects</label>
                    <input type="checkbox" id="modalParticleEffects" ${settings.particleEffects !== false ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalHighContrast">High Contrast Mode</label>
                    <input type="checkbox" id="modalHighContrast" ${settings.highContrast ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalTheme">Board Theme</label>
                    <select id="modalTheme" class="theme-select">
                        <option value="space" ${settings.theme === 'space' ? 'selected' : ''}>🌌 Space (Default)</option>
                        <option value="forest" ${settings.theme === 'forest' ? 'selected' : ''}>🌲 Forest</option>
                        <option value="ocean" ${settings.theme === 'ocean' ? 'selected' : ''}>🌊 Ocean</option>
                        <option value="fire" ${settings.theme === 'fire' ? 'selected' : ''}>🔥 Fire</option>
                    </select>
                </div>
            </div>

            <div class="settings-section">
                <h3>🎮 Gameplay Settings</h3>
                <div class="setting-item">
                    <label for="modalDifficulty">Difficulty Level</label>
                    <select id="modalDifficulty" class="difficulty-select">
                        <option value="easy" ${settings.difficulty === 'easy' ? 'selected' : ''}>😊 Easy</option>
                        <option value="normal" ${settings.difficulty === 'normal' ? 'selected' : ''}>😐 Normal</option>
                        <option value="hard" ${settings.difficulty === 'hard' ? 'selected' : ''}>😤 Hard</option>
                        <option value="expert" ${settings.difficulty === 'expert' ? 'selected' : ''}>🔥 Expert</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label for="modalShowHints">Show Hints</label>
                    <input type="checkbox" id="modalShowHints" ${settings.hintsEnabled ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalAutoSave">Auto Save Progress</label>
                    <input type="checkbox" id="modalAutoSave" ${settings.autoSave ? 'checked' : ''} class="toggle-switch">
                </div>
                <div class="setting-item">
                    <label for="modalNotifications">Show Notifications</label>
                    <input type="checkbox" id="modalNotifications" ${settings.notifications ? 'checked' : ''} class="toggle-switch">
                </div>
            </div>
        `;

        const footer = `
            <button class="btn btn-secondary" data-action="reset">
                🔄 Reset to Defaults
            </button>
            <button class="btn btn-primary" data-action="save">
                💾 Save Settings
            </button>
        `;

        const modal = this.createModal('settingsModal', '⚙️ Game Settings', content, { footer });
        
        // Setup setting change listeners
        this.setupSettingsListeners(modal);
        
        // Setup footer button handlers
        this.setupSettingsFooterListeners(modal);
        
        return modal;
    }

    // Setup settings change listeners
    setupSettingsListeners(modal) {
        // Volume slider
        const volumeSlider = modal.querySelector('#modalMasterVolume');
        const volumeValue = modal.querySelector('.volume-value');
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (event) => {
                const value = event.target.value;
                volumeValue.textContent = `${value}%`;
                this.settingsCache.volume = value / 100;
            });
        }

        // All checkboxes and selects
        const inputs = modal.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateSettingsCache(input);
            });
        });
    }

    // Setup footer button listeners
    setupSettingsFooterListeners(modal) {
        const footer = modal.querySelector('.modal-footer');
        if (footer) {
            footer.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                if (action === 'save') {
                    this.saveSettings();
                } else if (action === 'reset') {
                    this.resetSettings();
                }
            });
        }
    }

    // Update settings cache
    updateSettingsCache(input) {
        const settingMap = {
            'modalSoundEffects': 'soundEnabled',
            'modalBackgroundMusic': 'musicEnabled',
            'modalAnimations': 'animationsEnabled',
            'modalParticleEffects': 'particleEffects',
            'modalHighContrast': 'highContrast',
            'modalTheme': 'theme',
            'modalDifficulty': 'difficulty',
            'modalShowHints': 'hintsEnabled',
            'modalAutoSave': 'autoSave',
            'modalNotifications': 'notifications'
        };

        const settingKey = settingMap[input.id];
        if (settingKey) {
            if (input.type === 'checkbox') {
                this.settingsCache[settingKey] = input.checked;
            } else {
                this.settingsCache[settingKey] = input.value;
            }
        }
    }

    // Save settings
    saveSettings() {
        if (this.settingsCache) {
            storageManager.saveSettings(this.settingsCache);
            
            // Apply settings immediately
            this.applySettings(this.settingsCache);
            
            // Show confirmation
            this.showNotification('⚙️ Settings saved successfully!', 'success');
            
            // Close settings modal
            this.removeModal('settingsModal');
        }
    }

    // Reset settings to defaults
    resetSettings() {
        const defaultSettings = storageManager.loadSettings();
        Object.keys(defaultSettings).forEach(key => {
            this.settingsCache[key] = defaultSettings[key];
        });
        
        // Remove and recreate settings modal
        this.removeModal('settingsModal');
        this.showSettings();
        
        this.showNotification('🔄 Settings reset to defaults', 'info');
    }

    // Apply settings
    applySettings(settings) {
        // Trigger settings applied event
        const event = new CustomEvent('settingsApplied', {
            detail: { settings }
        });
        document.dispatchEvent(event);
    }

    // Show credits modal
    showCredits() {
        const content = `
            <div class="credits-section">
                <div class="credits-header">
                    <h3>✨ Gems Rush: Divine Teams ✨</h3>
                    <p class="version">Version 1.0.0 - Modular Architecture Edition</p>
                </div>

                <div class="credits-group">
                    <h4>🎮 Game Design & Development</h4>
                    <div class="credit-item">
                        <strong>Lead Developer:</strong> AI Assistant (Claude)
                    </div>
                    <div class="credit-item">
                        <strong>Game Concept:</strong> Match-3 Divine Teams Battle System
                    </div>
                    <div class="credit-item">
                        <strong>Architecture:</strong> Modern ES6 Modular System
                    </div>
                </div>

                <div class="credits-group">
                    <h4>🎨 Visual Design</h4>
                    <div class="credit-item">
                        <strong>UI/UX Design:</strong> Glassmorphism Divine Theme
                    </div>
                    <div class="credit-item">
                        <strong>Divine Gems:</strong> Unicode Emoji System
                    </div>
                    <div class="credit-item">
                        <strong>Animations:</strong> CSS3 Hardware Acceleration
                    </div>
                </div>

                <div class="credits-group">
                    <h4>🔧 Technical Stack</h4>
                    <div class="tech-grid">
                        <div class="tech-item">HTML5</div>
                        <div class="tech-item">CSS3</div>
                        <div class="tech-item">JavaScript ES6+</div>
                        <div class="tech-item">Web APIs</div>
                        <div class="tech-item">LocalStorage</div>
                        <div class="tech-item">Responsive Design</div>
                    </div>
                </div>

                <div class="credits-group">
                    <h4>🌟 Special Features</h4>
                    <ul class="features-list">
                        <li>🎯 Multiple Divine Game Modes</li>
                        <li>⚡ Rush Cascade System</li>
                        <li>💎 7 Unique Divine Gem Types</li>
                        <li>🏆 Progressive Realm System</li>
                        <li>📊 Comprehensive Statistics</li>
                        <li>♿ Full Accessibility Support</li>
                        <li>📱 Mobile-Responsive Design</li>
                        <li>💾 Persistent Game Progress</li>
                    </ul>
                </div>

                <div class="credits-group">
                    <h4>🎵 Audio & Effects</h4>
                    <div class="credit-item">
                        <strong>Sound System:</strong> Web Audio API Integration
                    </div>
                    <div class="credit-item">
                        <strong>Visual Effects:</strong> CSS Animations & Transitions
                    </div>
                    <div class="credit-item">
                        <strong>Particle System:</strong> Custom JavaScript Implementation
                    </div>
                </div>

                <div class="credits-footer">
                    <p>🎮 Built with passion for divine gaming experiences</p>
                    <p>📅 ${new Date().getFullYear()} - Gems Rush: Divine Teams</p>
                    <p>⚡ Powered by Modern Web Technologies</p>
                </div>
            </div>
        `;

        return this.createModal('creditsModal', '👥 Game Credits', content);
    }

    // Show achievements modal
    showAchievements(achievementsData = {}) {
        const achievements = achievementsData.achievements || {};
        
        const content = `
            <div class="achievements-grid">
                ${this.generateAchievementCards(achievements)}
            </div>
        `;

        return this.createModal('achievementsModal', '🏆 Divine Achievements', content);
    }

    // Generate achievement cards
    generateAchievementCards(achievements) {
        const achievementsList = [
            { id: 'firstMatch', icon: '🔥', title: 'First Divine Match', desc: 'Create your first divine gem combination' },
            { id: 'bigMatch', icon: '💫', title: 'Divine Mastery', desc: 'Create a match of 5 or more gems' },
            { id: 'perfectGame', icon: '✨', title: 'Perfect Harmony', desc: 'Complete a level without invalid moves' },
            { id: 'speedDemon', icon: '⚡', title: 'Lightning Speed', desc: 'Complete a level in under 30 seconds' },
            { id: 'cascadeMaster', icon: '🌊', title: 'Cascade Master', desc: 'Achieve a 5x cascade multiplier' },
            { id: 'gemCollector', icon: '💎', title: 'Divine Collector', desc: 'Match every type of divine gem' },
            { id: 'streakKing', icon: '🔥', title: 'Streak Champion', desc: 'Achieve a 10-move winning streak' },
            { id: 'scoremaster', icon: '🏆', title: 'Score Master', desc: 'Reach 100,000 divine points' }
        ];

        return achievementsList.map(achievement => {
            const unlocked = achievements[achievement.id]?.unlocked || false;
            const date = achievements[achievement.id]?.date || null;
            
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-desc">${achievement.desc}</div>
                        ${unlocked && date ? `<div class="achievement-date">Unlocked: ${helpers.formatDate(date)}</div>` : ''}
                    </div>
                    <div class="achievement-status">
                        ${unlocked ? '✅' : '🔒'}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Show confirmation modal
    showConfirmation({ title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) {
        return new Promise((resolve) => {
            const content = `
                <div class="confirmation-content">
                    <p>${message}</p>
                </div>
            `;

            const footer = `
                <button class="btn btn-secondary" onclick="modalSystem.resolveConfirmation(false)">
                    ${cancelText}
                </button>
                <button class="btn btn-primary" onclick="modalSystem.resolveConfirmation(true)">
                    ${confirmText}
                </button>
            `;

            this.confirmationResolver = resolve;
            this.createModal('confirmationModal', title, content, { footer });
        });
    }

    // Resolve confirmation
    resolveConfirmation(result) {
        if (this.confirmationResolver) {
            this.confirmationResolver(result);
            this.confirmationResolver = null;
        }
        this.removeModal('confirmationModal');
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `modal-notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            z-index: 3000;
            font-weight: bold;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 50);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Get notification color
    getNotificationColor(type) {
        const colors = {
            'info': 'linear-gradient(135deg, #667eea, #764ba2)',
            'success': 'linear-gradient(135deg, #2ed573, #17a2b8)',
            'warning': 'linear-gradient(135deg, #ffa502, #ff6348)',
            'error': 'linear-gradient(135deg, #ff4757, #c44569)'
        };
        return colors[type] || colors.info;
    }

    // Remove modal
    removeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('modal-visible');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                const index = this.activeModals.indexOf(modal);
                if (index > -1) {
                    this.activeModals.splice(index, 1);
                }
            }, 300);
        }
    }

    // Close top modal
    closeTopModal() {
        if (this.activeModals.length > 0) {
            const topModal = this.activeModals[this.activeModals.length - 1];
            this.removeModal(topModal.id);
        }
    }

    // Close all modals
    closeAllModals() {
        [...this.activeModals].forEach(modal => {
            this.removeModal(modal.id);
        });
    }

    // Add modal styles
    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                backdrop-filter: blur(5px);
            }
            
            .game-modal.modal-visible {
                opacity: 1;
            }
            
            .modal-content {
                background: linear-gradient(145deg, rgba(26, 26, 58, 0.98), rgba(13, 13, 26, 0.95));
                border: 3px solid rgba(255, 255, 255, 0.4);
                border-radius: 20px;
                max-width: 90vw;
                max-height: 90vh;
                width: 700px;
                color: #f0f0f0;
                box-shadow: 0 25px 50px rgba(0,0,0,0.7);
                backdrop-filter: blur(15px);
                overflow: hidden;
                transform: scale(0.9);
                transition: transform 0.3s ease-in-out;
            }
            
            .game-modal.modal-visible .modal-content {
                transform: scale(1);
            }
            
            .modal-header {
                padding: 20px 30px;
                border-bottom: 2px solid rgba(255, 255, 255, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
            }
            
            .modal-header h2 {
                margin: 0;
                color: #FFD700;
                font-size: 1.5em;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            }
            
            .modal-close-btn {
                background: linear-gradient(145deg, #ff4757, #ff3742);
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 50%;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            
            .modal-close-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 12px rgba(0,0,0,0.4);
            }
            
            .modal-body {
                padding: 30px;
                max-height: 60vh;
                overflow-y: auto;
                line-height: 1.6;
            }
            
            .modal-footer {
                padding: 20px 30px;
                border-top: 2px solid rgba(255, 255, 255, 0.2);
                display: flex;
                justify-content: flex-end;
                gap: 15px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            /* Game Guide Styles */
            .guide-section {
                margin-bottom: 30px;
            }
            
            .guide-section h3 {
                color: #87CEEB;
                margin-bottom: 15px;
                font-size: 1.2em;
            }
            
            .mode-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .mode-card {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .mode-icon {
                font-size: 2em;
                margin-bottom: 10px;
            }
            
            .mode-title {
                font-weight: bold;
                color: #FFD700;
                margin-bottom: 5px;
            }
            
            .gems-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .gem-info {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
            }
            
            .gem-icon {
                font-size: 2em;
            }
            
            .scoring-table {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
            }
            
            .score-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .controls-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            
            .control-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px;
            }
            
            kbd {
                background: rgba(255, 255, 255, 0.2);
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            /* Settings Styles */
            .settings-section {
                margin-bottom: 25px;
            }
            
            .settings-section h3 {
                color: #98FB98;
                margin-bottom: 15px;
            }
            
            .setting-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .setting-item label {
                font-weight: 500;
            }
            
            .volume-control {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .volume-slider, .theme-select, .difficulty-select {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                color: white;
                padding: 5px;
            }
            
            .toggle-switch {
                width: 50px;
                height: 25px;
                appearance: none;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 25px;
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .toggle-switch:checked {
                background: linear-gradient(45deg, #2ed573, #17a2b8);
            }
            
            .toggle-switch::before {
                content: '';
                position: absolute;
                width: 21px;
                height: 21px;
                border-radius: 50%;
                background: white;
                top: 2px;
                left: 2px;
                transition: all 0.3s ease;
            }
            
            .toggle-switch:checked::before {
                transform: translateX(27px);
            }
            
            /* Credits Styles */
            .credits-section {
                text-align: center;
            }
            
            .credits-header {
                margin-bottom: 30px;
            }
            
            .version {
                color: #87CEEB;
                font-style: italic;
            }
            
            .credits-group {
                margin-bottom: 25px;
                text-align: left;
            }
            
            .credits-group h4 {
                color: #FFD700;
                margin-bottom: 10px;
                text-align: center;
            }
            
            .credit-item {
                padding: 5px 0;
            }
            
            .tech-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            .tech-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 8px;
                border-radius: 6px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .features-list {
                list-style: none;
                padding: 0;
            }
            
            .features-list li {
                padding: 5px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .credits-footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid rgba(255, 255, 255, 0.2);
                color: #87CEEB;
            }
            
            /* Achievements Styles */
            .achievements-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
            }
            
            .achievement-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.05);
                transition: all 0.3s ease;
            }
            
            .achievement-card.unlocked {
                border-color: #2ed573;
                background: rgba(46, 213, 115, 0.1);
            }
            
            .achievement-card.locked {
                opacity: 0.6;
                filter: grayscale(0.5);
            }
            
            .achievement-icon {
                font-size: 2.5em;
            }
            
            .achievement-info {
                flex: 1;
            }
            
            .achievement-title {
                font-weight: bold;
                color: #FFD700;
                margin-bottom: 5px;
            }
            
            .achievement-desc {
                font-size: 0.9em;
                color: #ccc;
            }
            
            .achievement-date {
                font-size: 0.8em;
                color: #87CEEB;
                margin-top: 5px;
            }
            
            .achievement-status {
                font-size: 1.5em;
            }
            
            /* Button Styles */
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn-primary {
                background: linear-gradient(145deg, #667eea, #764ba2);
                color: white;
            }
            
            .btn-secondary {
                background: linear-gradient(145deg, #6c757d, #5a6268);
                color: white;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            }
            
            /* Scrollbar Styles */
            .modal-body::-webkit-scrollbar {
                width: 8px;
            }
            
            .modal-body::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb {
                background: linear-gradient(145deg, #667eea, #764ba2);
                border-radius: 4px;
            }
            
            .modal-body::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(145deg, #764ba2, #667eea);
            }
        `;
        document.head.appendChild(style);
    }
}

// Global modal system instance
export const modalSystem = new ModalSystem();

// Note: Initialization handled by main.js

// Expose to global scope for HTML onclick handlers
window.modalSystem = modalSystem; 