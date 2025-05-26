// Storage Utility Module
// Handles localStorage operations and data persistence

export class StorageManager {
    constructor() {
        this.storageKeys = {
            GAME_STATE: 'gemsRush_gameState',
            SETTINGS: 'gemsRush_settings',
            ACHIEVEMENTS: 'gemsRush_achievements',
            STATISTICS: 'gemsRush_statistics',
            CAMPAIGN_PROGRESS: 'gemsRush_campaignProgress',
            DAILY_CHALLENGE: 'gemsRush_dailyChallenge'
        };
        this.isStorageAvailable = this.checkStorageAvailability();
    }

    // Check if localStorage is available
    checkStorageAvailability() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    // Save data to localStorage
    save(key, data) {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, cannot save:', key);
            return false;
        }

        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error('Failed to save to storage:', key, error);
            return false;
        }
    }

    // Load data from localStorage
    load(key, defaultValue = null) {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, returning default value for:', key);
            return defaultValue;
        }

        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error('Failed to load from storage:', key, error);
            return defaultValue;
        }
    }

    // Remove data from localStorage
    remove(key) {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, cannot remove:', key);
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from storage:', key, error);
            return false;
        }
    }

    // Clear all game data
    clearAll() {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, cannot clear data');
            return false;
        }

        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }

    // Game state persistence
    saveGameState(gameState) {
        return this.save(this.storageKeys.GAME_STATE, gameState.export());
    }

    loadGameState() {
        return this.load(this.storageKeys.GAME_STATE);
    }

    // Settings persistence
    saveSettings(settings) {
        return this.save(this.storageKeys.SETTINGS, settings);
    }

    loadSettings() {
        const defaultSettings = {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7,
            hintsEnabled: true,
            animationsEnabled: true,
            theme: 'default',
            difficulty: 'normal',
            autoSave: true,
            notifications: true
        };
        
        return this.load(this.storageKeys.SETTINGS, defaultSettings);
    }

    // Achievements persistence
    saveAchievements(achievements) {
        return this.save(this.storageKeys.ACHIEVEMENTS, achievements);
    }

    loadAchievements() {
        const defaultAchievements = {
            firstMatch: { unlocked: false, date: null },
            bigMatch: { unlocked: false, date: null },
            perfectGame: { unlocked: false, date: null },
            speedDemon: { unlocked: false, date: null },
            cascadeMaster: { unlocked: false, date: null },
            gemCollector: { unlocked: false, date: null },
            streakKing: { unlocked: false, date: null },
            scoremaster: { unlocked: false, date: null }
        };
        
        return this.load(this.storageKeys.ACHIEVEMENTS, defaultAchievements);
    }

    // Statistics persistence
    saveStatistics(stats) {
        return this.save(this.storageKeys.STATISTICS, stats);
    }

    loadStatistics() {
        const defaultStats = {
            totalScore: 0,
            totalMoves: 0,
            totalGamesPlayed: 0,
            totalMatches: 0,
            bestScore: 0,
            averageScore: 0,
            perfectMatches: 0,
            bigMatches: 0,
            totalPlayTime: 0,
            highestLevel: 1,
            longestStreak: 0,
            totalCascades: 0,
            powerUpsUsed: 0
        };
        
        return this.load(this.storageKeys.STATISTICS, defaultStats);
    }

    // Campaign progress persistence
    saveCampaignProgress(progress) {
        return this.save(this.storageKeys.CAMPAIGN_PROGRESS, progress);
    }

    loadCampaignProgress() {
        const defaultProgress = {
            currentRealm: 1,
            currentLevel: 1,
            unlockedRealms: [1],
            completedLevels: {},
            totalEssence: 0,
            realmProgress: {
                1: { unlocked: true, completed: false, stars: 0 }
            }
        };
        
        return this.load(this.storageKeys.CAMPAIGN_PROGRESS, defaultProgress);
    }

    // Daily challenge persistence
    saveDailyChallenge(challengeData) {
        return this.save(this.storageKeys.DAILY_CHALLENGE, challengeData);
    }

    loadDailyChallenge() {
        return this.load(this.storageKeys.DAILY_CHALLENGE);
    }

    // Get storage usage information
    getStorageInfo() {
        if (!this.isStorageAvailable) {
            return { available: false, used: 0, total: 0 };
        }

        try {
            let used = 0;
            Object.values(this.storageKeys).forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    used += data.length;
                }
            });

            // Estimate total localStorage capacity (usually ~5-10MB)
            const total = 5 * 1024 * 1024; // 5MB estimation
            
            return {
                available: true,
                used: used,
                total: total,
                usedPercent: Math.round((used / total) * 100),
                keys: Object.keys(this.storageKeys).length
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { available: false, used: 0, total: 0 };
        }
    }

    // Export all data for backup
    exportAllData() {
        if (!this.isStorageAvailable) {
            return null;
        }

        const allData = {};
        Object.entries(this.storageKeys).forEach(([name, key]) => {
            const data = this.load(key);
            if (data !== null) {
                allData[name] = data;
            }
        });

        return {
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: allData
        };
    }

    // Import data from backup
    importAllData(backupData) {
        if (!this.isStorageAvailable || !backupData?.data) {
            return false;
        }

        try {
            Object.entries(backupData.data).forEach(([name, data]) => {
                const key = this.storageKeys[name];
                if (key) {
                    this.save(key, data);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    // Migrate data from old version (if needed)
    migrateData(fromVersion, toVersion) {
        console.log(`Migrating data from version ${fromVersion} to ${toVersion}`);
        
        // Add migration logic here when needed
        // For now, just ensure all keys exist with defaults
        const settings = this.loadSettings();
        const achievements = this.loadAchievements();
        const statistics = this.loadStatistics();
        const campaignProgress = this.loadCampaignProgress();
        
        // Save migrated data
        this.saveSettings(settings);
        this.saveAchievements(achievements);
        this.saveStatistics(statistics);
        this.saveCampaignProgress(campaignProgress);
        
        return true;
    }

    // Check if data exists
    exists(key) {
        if (!this.isStorageAvailable) {
            return false;
        }
        return localStorage.getItem(key) !== null;
    }

    // Get all storage keys used by the game
    getAllKeys() {
        return Object.values(this.storageKeys);
    }

    // Cleanup old or corrupted data
    cleanup() {
        if (!this.isStorageAvailable) {
            return false;
        }

        try {
            // Remove any corrupted data
            Object.values(this.storageKeys).forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        JSON.parse(data); // Test if it's valid JSON
                    }
                } catch (error) {
                    console.warn('Removing corrupted data for key:', key);
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Failed to cleanup storage:', error);
            return false;
        }
    }
}

// Global storage manager instance
export const storageManager = new StorageManager(); 