// Campaign Module
// Handles Divine Conquest campaign mode with realms, levels, and progression

import { gameState } from '../core/game-state.js';
import { gameEngine } from '../core/game-engine.js';
import { storageManager } from '../utils/storage.js';
import { helpers } from '../utils/helpers.js';

export class CampaignMode {
    constructor() {
        this.isInitialized = false;
        this.currentLevel = null;
        this.levelObjectives = {};
        this.divineRealms = {};
        this.setupRealms();
    }

    // Initialize campaign mode
    initialize() {
        try {
            console.log('🏰 Initializing Campaign Mode...');
            this.loadCampaignProgress();
            this.isInitialized = true;
            console.log('✅ Campaign Mode initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Campaign Mode:', error);
            return false;
        }
    }

    // Setup divine realms configuration
    setupRealms() {
        this.divineRealms = {
            fire: {
                id: 'fire',
                name: 'Flame Sanctuary',
                symbol: '🔥',
                description: 'Where sacred fires burn eternal',
                color: '#FF4500',
                backgroundGradient: 'linear-gradient(135deg, #FF4500, #DC143C, #8B0000)',
                levels: [
                    { id: 1, type: 'score', target: 1500, moves: 25, stars: 0, unlocked: true, completed: false },
                    { id: 2, type: 'clear', target: 30, gemType: '🔥', moves: 20, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'cascade', target: 5, cascades: 5, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'time', target: 2000, timeLimit: 120, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 4000, moves: 35, specialMechanic: 'fireStorm', stars: 0, unlocked: false, completed: false }
                ]
            },
            water: {
                id: 'water',
                name: 'Sacred Springs',
                symbol: '💧',
                description: 'Where divine waters flow with healing power',
                color: '#1E90FF',
                backgroundGradient: 'linear-gradient(135deg, #1E90FF, #4169E1, #0000CD)',
                levels: [
                    { id: 1, type: 'score', target: 2000, moves: 25, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'clear', target: 40, gemType: '💧', moves: 25, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'powerup', target: 8, powerUps: 8, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'time', target: 2500, timeLimit: 100, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 5000, moves: 40, specialMechanic: 'tidalWave', stars: 0, unlocked: false, completed: false }
                ]
            },
            earth: {
                id: 'earth',
                name: 'Ancient Foundations',
                symbol: '🌍',
                description: 'Where eternal strength supports all creation',
                color: '#8B4513',
                backgroundGradient: 'linear-gradient(135deg, #8B4513, #A0522D, #654321)',
                levels: [
                    { id: 1, type: 'score', target: 2500, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'clear', target: 50, gemType: '🌍', moves: 25, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'bigmatch', target: 3, matchSize: 5, moves: 35, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'time', target: 3000, timeLimit: 90, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 6000, moves: 45, specialMechanic: 'earthquake', stars: 0, unlocked: false, completed: false }
                ]
            },
            air: {
                id: 'air',
                name: 'Celestial Winds',
                symbol: '💨',
                description: 'Where divine freedom dances on heavenly breezes',
                color: '#87CEEB',
                backgroundGradient: 'linear-gradient(135deg, #87CEEB, #B0E0E6, #E0F6FF)',
                levels: [
                    { id: 1, type: 'score', target: 3000, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'clear', target: 60, gemType: '💨', moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'chain', target: 10, chains: 10, moves: 25, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'time', target: 3500, timeLimit: 75, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 7000, moves: 40, specialMechanic: 'whirlwind', stars: 0, unlocked: false, completed: false }
                ]
            },
            lightning: {
                id: 'lightning',
                name: 'Thunder Temple',
                symbol: '⚡',
                description: 'Where divine power crackles with pure energy',
                color: '#FFD700',
                backgroundGradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                levels: [
                    { id: 1, type: 'score', target: 3500, moves: 25, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'clear', target: 70, gemType: '⚡', moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'speed', target: 4000, timeLimit: 60, moves: 35, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'multiplier', target: 5, multiplier: 5, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 8000, moves: 35, specialMechanic: 'lightning', stars: 0, unlocked: false, completed: false }
                ]
            },
            nature: {
                id: 'nature',
                name: 'Life Grove',
                symbol: '🌿',
                description: 'Where sacred life force nurtures eternal growth',
                color: '#32CD32',
                backgroundGradient: 'linear-gradient(135deg, #32CD32, #228B22, #006400)',
                levels: [
                    { id: 1, type: 'score', target: 4000, moves: 35, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'clear', target: 80, gemType: '🌿', moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'growth', target: 15, newGems: 15, moves: 40, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'harmony', target: 7, allTypes: 7, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 9000, moves: 50, specialMechanic: 'overgrowth', stars: 0, unlocked: false, completed: false }
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
                    { id: 1, type: 'score', target: 5000, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 2, type: 'mystery', target: 3000, randomObjectives: true, moves: 35, stars: 0, unlocked: false, completed: false },
                    { id: 3, type: 'transformation', target: 3500, gemTransforms: 20, moves: 40, stars: 0, unlocked: false, completed: false },
                    { id: 4, type: 'essence', target: 4000, essenceGems: 10, moves: 30, stars: 0, unlocked: false, completed: false },
                    { id: 5, type: 'boss', target: 10000, moves: 45, specialMechanic: 'realityBend', stars: 0, unlocked: false, completed: false }
                ]
            }
        };
    }

    // Start campaign mode
    startCampaign() {
        console.log('🏰 Starting Divine Conquest Campaign');
        
        // Ensure campaign is initialized
        if (!this.isInitialized) {
            console.log('⚠️ Campaign not initialized, initializing now...');
            this.initialize();
        }
        
        this.showCampaignLevelSelect();
    }

    // Show campaign level selection
    showCampaignLevelSelect() {
        this.hideCampaignLevelSelect(); // Clear existing
        
        const campaignContainer = document.createElement('div');
        campaignContainer.id = 'campaignLevelSelect';
        campaignContainer.className = 'campaign-level-select';
        
        campaignContainer.innerHTML = `
            <div class="campaign-content">
                <div class="campaign-header">
                    <h2>🏰 Divine Conquest</h2>
                    <p>Choose your realm and begin your divine journey</p>
                    <button class="close-btn" onclick="this.closest('#campaignLevelSelect').remove()">✕</button>
                </div>
                <div class="campaign-body">
                    <div class="campaign-progress">
                        <div class="progress-item">
                            <span>Divine Essence:</span>
                            <span id="essenceCount">${gameState.campaignProgress.totalEssence || 0}</span>
                        </div>
                        <div class="progress-item">
                            <span>Realms Unlocked:</span>
                            <span id="realmsCount">${gameState.campaignProgress.unlockedRealms?.length || 1}</span>
                        </div>
                    </div>
                    <div class="realms-grid">
                        ${this.generateRealmsHTML()}
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        campaignContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(campaignContainer);
        
        // Add event delegation for realm clicks
        campaignContainer.addEventListener('click', (event) => {
            const realmCard = event.target.closest('.realm-card[data-clickable="true"]');
            if (realmCard) {
                const realmId = realmCard.dataset.realm;
                this.openRealmLevels(realmId);
            }
        });
        
        // Animate in
        setTimeout(() => {
            campaignContainer.style.opacity = '1';
        }, 50);
    }

    // Generate realms HTML
    generateRealmsHTML() {
        const unlockedRealms = gameState.campaignProgress.unlockedRealms || ['fire'];
        console.log('🏰 Unlocked realms:', unlockedRealms);
        console.log('🏰 Available realms:', Object.keys(this.divineRealms));
        
        return Object.values(this.divineRealms).map(realm => {
            const isUnlocked = unlockedRealms.includes(realm.id);
            const completedLevels = realm.levels.filter(level => level.completed).length;
            const totalLevels = realm.levels.length;
            console.log(`🏰 Realm ${realm.id}: unlocked=${isUnlocked}, ${completedLevels}/${totalLevels} levels`);
            
            return `
                <div class="realm-card ${isUnlocked ? 'unlocked' : 'realm-locked'}" 
                     data-realm="${realm.id}" ${isUnlocked ? 'data-clickable="true"' : ''}>
                    <div class="realm-icon">${realm.symbol}</div>
                    <div class="realm-info">
                        <div class="realm-name">${realm.name}</div>
                        <div class="realm-desc">${realm.description}</div>
                        <div class="realm-progress">
                            ${completedLevels}/${totalLevels} Levels
                        </div>
                    </div>
                    ${!isUnlocked ? '<div class="realm-lock">🔒</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Open realm levels
    openRealmLevels(realmId) {
        const realm = this.divineRealms[realmId];
        if (!realm) return;
        
        const levelSelect = document.createElement('div');
        levelSelect.id = 'levelSelect';
        levelSelect.className = 'level-select';
        
        levelSelect.innerHTML = `
            <div class="level-content">
                <div class="level-header" style="background: ${realm.backgroundGradient}">
                    <h3>${realm.symbol} ${realm.name}</h3>
                    <p>${realm.description}</p>
                    <button class="close-btn" onclick="this.closest('#levelSelect').remove()">✕</button>
                </div>
                <div class="level-body">
                    <div class="levels-grid">
                        ${this.generateLevelsHTML(realm)}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(levelSelect);
        
        // Add event delegation for level clicks
        levelSelect.addEventListener('click', (event) => {
            const levelCard = event.target.closest('.level-card[data-clickable="true"]');
            if (levelCard) {
                const realmId = levelCard.dataset.realm;
                const levelId = parseInt(levelCard.dataset.level);
                this.startCampaignLevel(realmId, levelId);
            }
        });
        
        // Apply realm theme
        this.applyRealmTheme(realm);
    }

    // Generate levels HTML
    generateLevelsHTML(realm) {
        return realm.levels.map(level => {
            const isUnlocked = level.unlocked;
            const stars = level.stars || 0;
            const starsHTML = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
            
            return `
                <div class="level-card ${isUnlocked ? 'unlocked' : 'level-locked'}"
                     data-realm="${realm.id}" data-level="${level.id}" ${isUnlocked ? 'data-clickable="true"' : ''}>
                    <div class="level-number">${level.id}</div>
                    <div class="level-type">${this.getLevelTypeIcon(level.type)}</div>
                    <div class="level-objective">${this.getLevelObjectiveText(level)}</div>
                    <div class="level-stars">${starsHTML}</div>
                    ${!isUnlocked ? '<div class="level-lock">🔒</div>' : ''}
                </div>
            `;
        }).join('');
    }

    // Get level type icon
    getLevelTypeIcon(type) {
        const icons = {
            score: '🎯',
            clear: '💎',
            cascade: '🌊',
            time: '⏰',
            boss: '👑',
            powerup: '⭐',
            bigmatch: '💥',
            chain: '⛓️',
            speed: '⚡',
            multiplier: '🔥',
            growth: '🌱',
            harmony: '🎵',
            mystery: '❓',
            transformation: '🔄',
            essence: '✨'
        };
        return icons[type] || '🎯';
    }

    // Get level objective text
    getLevelObjectiveText(level) {
        switch (level.type) {
            case 'score':
                return `Score ${helpers.formatNumber(level.target)} points`;
            case 'clear':
                return `Clear ${level.target} ${level.gemType} gems`;
            case 'cascade':
                return `Create ${level.target} cascades`;
            case 'time':
                return `Score ${helpers.formatNumber(level.target)} in ${level.timeLimit}s`;
            case 'boss':
                return `Defeat the realm guardian`;
            case 'powerup':
                return `Create ${level.target} power-ups`;
            case 'bigmatch':
                return `Make ${level.target} matches of ${level.matchSize}+ gems`;
            case 'chain':
                return `Create ${level.target} chain reactions`;
            case 'speed':
                return `Score ${helpers.formatNumber(level.target)} quickly`;
            case 'multiplier':
                return `Reach ${level.target}x multiplier`;
            case 'growth':
                return `Generate ${level.target} new gems`;
            case 'harmony':
                return `Match all ${level.target} gem types`;
            case 'mystery':
                return `Complete random objectives`;
            case 'transformation':
                return `Transform ${level.target} gems`;
            case 'essence':
                return `Collect ${level.target} essence gems`;
            default:
                return `Complete the challenge`;
        }
    }

    // Start campaign level
    startCampaignLevel(realmId, levelId) {
        const realm = this.divineRealms[realmId];
        const level = realm?.levels.find(l => l.id === levelId);
        
        if (!realm || !level || !level.unlocked) {
            console.error('Invalid or locked level:', realmId, levelId);
            return;
        }
        
        console.log(`🏰 Starting ${realm.name} Level ${levelId}`);
        
        // Clean up any existing level first
        this.cleanupLevel();
        
        // Set current level
        this.currentLevel = { realm, level };
        
        // Reset level objectives
        this.resetLevelObjectives();
        
        // Apply realm theme
        this.applyRealmTheme(realm);
        
        // Hide level select
        this.hideCampaignLevelSelect();
        
        // Set game mode
        gameState.setGameMode('campaign');
        gameState.setCampaignProgress({
            currentRealm: realmId,
            currentLevel: levelId
        });
        
        // Show level start notification
        this.showLevelStartNotification(realm, level);
        
        // Start game engine with campaign settings
        gameEngine.setGameMode('campaign');
        gameEngine.restart();
        
        // Set level-specific conditions
        if (level.timeLimit) {
            this.startLevelTimer(level.timeLimit);
        }
    }

    // Reset level objectives
    resetLevelObjectives() {
        this.levelObjectives = {
            clearedGems: {},
            cascadeCount: 0,
            comboCount: 0,
            powerUpsCreated: 0,
            chainCount: 0,
            specialCounter: 0
        };
    }

    // Apply realm theme
    applyRealmTheme(realm) {
        document.body.style.setProperty('--realm-color', realm.color);
        document.body.style.setProperty('--realm-gradient', realm.backgroundGradient);
    }

    // Show level start notification
    showLevelStartNotification(realm, level) {
        const notification = document.createElement('div');
        notification.className = 'level-start-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>${realm.symbol} ${realm.name}</h3>
                <h4>Level ${level.id}</h4>
                <p>${this.getLevelObjectiveText(level)}</p>
                <p>Moves: ${level.moves}</p>
                ${level.timeLimit ? `<p>Time: ${level.timeLimit}s</p>` : ''}
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${realm.backgroundGradient};
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 3000;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            animation: levelStartPulse 3s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Start level timer
    startLevelTimer(timeLimit) {
        // Clear existing timer first
        this.cleanupLevel();
        
        gameState.timeRemaining = timeLimit;
        
        const timer = setInterval(() => {
            gameState.timeRemaining--;
            
            if (gameState.timeRemaining <= 0) {
                clearInterval(timer);
                this.checkCampaignLevelCompletion();
            }
        }, 1000);
        
        // Store timer reference
        this.levelTimer = timer;
    }

    // Clean up level resources
    cleanupLevel() {
        if (this.levelTimer) {
            clearInterval(this.levelTimer);
            this.levelTimer = null;
        }
    }

    // Hide campaign level select
    hideCampaignLevelSelect() {
        const existing = document.getElementById('campaignLevelSelect');
        if (existing) {
            existing.remove();
        }
        
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.remove();
        }
    }

    // Check campaign level completion
    checkCampaignLevelCompletion() {
        if (!this.currentLevel) return;
        
        // Clean up timer immediately
        this.cleanupLevel();
        
        const { realm, level } = this.currentLevel;
        const success = this.evaluateLevelObjectives(level);
        
        if (success) {
            const stars = this.calculateLevelStars(level, gameState.score, gameState.moves, gameState.timeRemaining);
            const essenceEarned = stars * 10;
            
            // Update level completion
            level.completed = true;
            level.stars = Math.max(level.stars || 0, stars);
            
            // Award essence
            gameState.campaignProgress.totalEssence += essenceEarned;
            
            // Unlock next level
            this.unlockNextLevel(realm.id, level.id);
            
            // Save progress
            this.saveCampaignProgress();
            
            // Show completion
            this.showCampaignLevelComplete(realm, level, stars, essenceEarned);
        } else {
            this.showCampaignLevelFailed(realm, level);
        }
    }

    // Evaluate level objectives
    evaluateLevelObjectives(level) {
        switch (level.type) {
            case 'score':
                return gameState.score >= level.target;
            case 'clear':
                return (this.levelObjectives.clearedGems[level.gemType] || 0) >= level.target;
            case 'cascade':
                return this.levelObjectives.cascadeCount >= level.target;
            case 'time':
                return gameState.score >= level.target && gameState.timeRemaining > 0;
            case 'boss':
                return gameState.score >= level.target;
            // Add more objective types as needed
            default:
                return gameState.score >= level.target;
        }
    }

    // Calculate level stars
    calculateLevelStars(level, finalScore, movesTaken, timeRemaining) {
        let stars = 1; // Base completion star
        
        // Score bonus star
        const scoreThreshold = level.target * 1.5;
        if (finalScore >= scoreThreshold) {
            stars++;
        }
        
        // Efficiency bonus star
        const movesUsed = movesTaken;
        const movesTarget = level.moves;
        if (movesUsed <= movesTarget * 0.7) {
            stars++;
        }
        
        return Math.min(3, stars);
    }

    // Unlock next level
    unlockNextLevel(realmId, currentLevelId) {
        const realm = this.divineRealms[realmId];
        const nextLevel = realm.levels.find(l => l.id === currentLevelId + 1);
        
        if (nextLevel) {
            nextLevel.unlocked = true;
        }
        
        // Check if realm is completed
        const allCompleted = realm.levels.every(l => l.completed);
        if (allCompleted) {
            this.unlockNextRealm(realmId);
        }
    }

    // Unlock next realm
    unlockNextRealm(currentRealmId) {
        const realmOrder = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic'];
        const currentIndex = realmOrder.indexOf(currentRealmId);
        const nextRealmId = realmOrder[currentIndex + 1];
        
        if (nextRealmId && !gameState.campaignProgress.unlockedRealms.includes(nextRealmId)) {
            gameState.campaignProgress.unlockedRealms.push(nextRealmId);
            this.showRealmUnlockNotification(this.divineRealms[nextRealmId]);
        }
    }

    // Show campaign level complete
    showCampaignLevelComplete(realm, level, stars, essenceEarned) {
        // Implementation for level complete modal
        console.log(`🎉 Level completed! Stars: ${stars}, Essence: ${essenceEarned}`);
    }

    // Show campaign level failed
    showCampaignLevelFailed(realm, level) {
        // Implementation for level failed modal
        console.log('💔 Level failed');
    }

    // Show realm unlock notification
    showRealmUnlockNotification(realm) {
        console.log(`🎉 New realm unlocked: ${realm.name}`);
    }

    // Save campaign progress
    saveCampaignProgress() {
        storageManager.saveCampaignProgress(gameState.campaignProgress);
    }

    // Load campaign progress
    loadCampaignProgress() {
        const saved = storageManager.loadCampaignProgress();
        // Always set campaign progress (saved data or defaults)
        gameState.setCampaignProgress(saved);
        
        // Apply saved progress to realms
        Object.keys(this.divineRealms).forEach(realmId => {
            const realm = this.divineRealms[realmId];
            const savedRealm = saved.completedLevels?.[realmId];
            
            if (savedRealm) {
                realm.levels.forEach(level => {
                    const savedLevel = savedRealm[level.id];
                    if (savedLevel) {
                        level.completed = savedLevel.completed;
                        level.stars = savedLevel.stars;
                        level.unlocked = savedLevel.unlocked;
                    }
                });
            }
        });
        
        console.log('🏰 Campaign progress loaded:', gameState.campaignProgress);
    }
}

// Global campaign mode instance
export const campaignMode = new CampaignMode();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        campaignMode.initialize();
    });
} else {
    campaignMode.initialize();
}

// Export start function for main.js
export const startCampaign = () => campaignMode.startCampaign(); 