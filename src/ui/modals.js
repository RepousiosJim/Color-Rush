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
    // Helper method to escape HTML for security
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Helper method to safely set HTML content
    setSafeHtml(element, content, allowHtml = false) {
        if (allowHtml) {
            // Only for trusted content like static UI elements
            element.innerHTML = content;
        } else {
            // For user-provided content, escape HTML
            element.textContent = content;
        }
    }

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
        
        // Safe HTML handling - assume content is trusted for static UI
        // For dynamic user content, use setSafeHtml with allowHtml=false
        if (options.safeContent) {
            this.setSafeHtml(modalBody, content, false);
        } else {
            // Default behavior for trusted static content
            modalBody.innerHTML = content;
        }

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

        // Store event handler reference for cleanup
        const clickOutsideHandler = (event) => {
            if (event.target === modal) {
                this.removeModal(id);
            }
        };
        
        modal.addEventListener('click', clickOutsideHandler);
        
        // Store handler reference on modal for cleanup
        modal._clickOutsideHandler = clickOutsideHandler;

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
            // Create content safely using DOM methods instead of template strings
            const contentDiv = document.createElement('div');
            contentDiv.className = 'confirmation-content';
            
            const messageP = document.createElement('p');
            messageP.textContent = message; // Safe text content, no HTML injection
            contentDiv.appendChild(messageP);

            // Create footer buttons safely
            const footerDiv = document.createElement('div');
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = cancelText; // Safe text content
            cancelBtn.onclick = () => this.resolveConfirmation(false);
            
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = confirmText; // Safe text content
            confirmBtn.onclick = () => this.resolveConfirmation(true);
            
            footerDiv.appendChild(cancelBtn);
            footerDiv.appendChild(confirmBtn);

            this.confirmationResolver = resolve;
            
            // Use DOM elements directly instead of innerHTML
            const modal = this.createModal('confirmationModal', title, '', { safeContent: true });
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = ''; // Clear any default content
            modalBody.appendChild(contentDiv);
            
            const modalFooter = document.createElement('div');
            modalFooter.className = 'modal-footer';
            modalFooter.appendChild(footerDiv);
            modal.querySelector('.modal-content').appendChild(modalFooter);
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
            // Clean up event listeners to prevent memory leaks
            if (modal._clickOutsideHandler) {
                modal.removeEventListener('click', modal._clickOutsideHandler);
                modal._clickOutsideHandler = null;
            }
            
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

    // Load modal styles from external CSS file
    addModalStyles() {
        // Check if modal styles are already loaded
        const existingLink = document.querySelector('link[href*="modals.css"]');
        if (existingLink) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'src/ui/modals.css';
        link.onload = () => {
            console.log('✅ Modal styles loaded successfully');
        };
        link.onerror = () => {
            console.warn('⚠️ Failed to load modal styles, falling back to basic styles');
            // Fallback: Add minimal inline styles for basic functionality
            this.addFallbackStyles();
        };
        
        document.head.appendChild(link);
    }

    // Fallback styles if CSS file fails to load
    addFallbackStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); display: flex; align-items: center;
                justify-content: center; z-index: 2000; opacity: 0;
                transition: opacity 0.3s ease;
            }
            .game-modal.modal-visible { opacity: 1; }
            .modal-content {
                background: #1a1a3a; border: 2px solid #fff; border-radius: 10px;
                max-width: 90vw; max-height: 90vh; width: 600px; color: #f0f0f0;
                transform: scale(0.9); transition: transform 0.3s ease;
            }
            .game-modal.modal-visible .modal-content { transform: scale(1); }
            .modal-header, .modal-body, .modal-footer { padding: 20px; }
            .modal-close-btn { background: #ff4757; border: none; color: white; 
                padding: 5px 10px; border-radius: 3px; cursor: pointer; }
            

        `;
        document.head.appendChild(style);
    }
}

// Global modal system instance
export const modalSystem = new ModalSystem();

// Note: Initialization handled by main.js

// Expose to global scope for HTML onclick handlers
window.modalSystem = modalSystem; 