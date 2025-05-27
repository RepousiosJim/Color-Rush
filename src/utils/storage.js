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
        this.maxRetries = 3;
        this.compressionThreshold = 1024; // Compress data larger than 1KB
    }

    // Check if localStorage is available with comprehensive testing
    checkStorageAvailability() {
        try {
            const testKey = '__localStorage_test__';
            const testData = { test: 'value', timestamp: Date.now() };
            
            // Test write
            localStorage.setItem(testKey, JSON.stringify(testData));
            
            // Test read
            const retrieved = localStorage.getItem(testKey);
            const parsed = JSON.parse(retrieved);
            
            // Validate retrieved data
            if (parsed.test !== testData.test) {
                throw new Error('Data integrity check failed');
            }
            
            // Test delete
            localStorage.removeItem(testKey);
            
            // Verify deletion
            if (localStorage.getItem(testKey) !== null) {
                throw new Error('Delete operation failed');
            }
            
            return true;
        } catch (e) {
            console.warn('localStorage not available or not functioning properly:', e);
            return false;
        }
    }

    // Validate data before serialization
    validateData(data, expectedSchema = null) {
        if (data === null || data === undefined) {
            return { isValid: false, error: 'Data is null or undefined' };
        }
        
        // Check for circular references
        try {
            JSON.stringify(data);
        } catch (error) {
            return { isValid: false, error: 'Data contains circular references or is not serializable' };
        }
        
        // Schema validation if provided
        if (expectedSchema) {
            const validation = this.validateSchema(data, expectedSchema);
            if (!validation.isValid) {
                return validation;
            }
        }
        
        return { isValid: true };
    }

    // Schema validation helper
    validateSchema(data, schema) {
        try {
            if (typeof data !== 'object' || data === null) {
                return { isValid: false, error: 'Data must be an object' };
            }
            
            for (const [key, expectedType] of Object.entries(schema)) {
                if (!(key in data)) {
                    return { isValid: false, error: `Missing required property: ${key}` };
                }
                
                const actualType = typeof data[key];
                if (actualType !== expectedType && expectedType !== 'any') {
                    return { isValid: false, error: `Property ${key} should be ${expectedType}, got ${actualType}` };
                }
            }
            
            return { isValid: true };
        } catch (error) {
            return { isValid: false, error: `Schema validation error: ${error.message}` };
        }
    }

    // Save data to localStorage with validation and retry logic
    save(key, data, schema = null) {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, cannot save:', key);
            return false;
        }

        // Validate input parameters
        if (typeof key !== 'string' || key.trim() === '') {
            console.error('Invalid storage key provided');
            return false;
        }

        // Validate data
        const validation = this.validateData(data, schema);
        if (!validation.isValid) {
            console.error(`Data validation failed for ${key}:`, validation.error);
            return false;
        }

        let retryCount = 0;
        
        while (retryCount < this.maxRetries) {
            try {
                const serializedData = JSON.stringify(data);
                
                // Check data size and warn if large
                const dataSize = new Blob([serializedData]).size;
                if (dataSize > 5 * 1024 * 1024) { // 5MB
                    console.warn(`Large data being saved (${dataSize} bytes) for key: ${key}`);
                }
                
                // Check storage quota before saving
                if (!this.checkStorageQuota(dataSize)) {
                    console.error('Storage quota exceeded');
                    this.handleStorageQuotaExceeded();
                    return false;
                }
                
                // Add metadata
                const dataWithMetadata = {
                    data: data,
                    metadata: {
                        version: '1.0',
                        timestamp: Date.now(),
                        checksum: this.calculateChecksum(serializedData)
                    }
                };
                
                localStorage.setItem(key, JSON.stringify(dataWithMetadata));
                
                // Verify save was successful
                const verification = this.verifySave(key, dataWithMetadata);
                if (!verification.success) {
                    throw new Error(verification.error);
                }
                
                return true;
                
            } catch (error) {
                retryCount++;
                console.error(`Save attempt ${retryCount} failed for ${key}:`, error);
                
                if (error.name === 'QuotaExceededError') {
                    this.handleStorageQuotaExceeded();
                    return false;
                }
                
                if (retryCount < this.maxRetries) {
                    console.log(`Retrying save for ${key} (attempt ${retryCount + 1}/${this.maxRetries})`);
                    // Small delay before retry
                    setTimeout(() => {}, 100);
                } else {
                    console.error(`All save attempts failed for ${key}`);
                    return false;
                }
            }
        }
        
        return false;
    }

    // Verify that save operation was successful
    verifySave(key, originalData) {
        try {
            const savedData = localStorage.getItem(key);
            if (!savedData) {
                return { success: false, error: 'No data found after save' };
            }
            
            const parsed = JSON.parse(savedData);
            
            // Verify checksum
            const originalChecksum = originalData.metadata.checksum;
            const savedChecksum = parsed.metadata?.checksum;
            
            if (originalChecksum !== savedChecksum) {
                return { success: false, error: 'Checksum mismatch - data corrupted' };
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: `Verification failed: ${error.message}` };
        }
    }

    // Calculate simple checksum for data integrity
    calculateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    // Check available storage quota
    checkStorageQuota(additionalSize = 0) {
        try {
            // Estimate current usage
            let currentUsage = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                currentUsage += key.length + value.length;
            }
            
            // Rough quota estimate (varies by browser)
            const estimatedQuota = 5 * 1024 * 1024; // 5MB
            const availableSpace = estimatedQuota - currentUsage;
            
            return availableSpace > additionalSize;
        } catch (error) {
            console.warn('Could not check storage quota:', error);
            return true; // Assume available if check fails
        }
    }

    // Handle storage quota exceeded
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, attempting cleanup...');
        
        try {
            // Remove old temporary data first
            this.cleanupOldData();
            
            // If still not enough space, remove oldest data
            if (!this.checkStorageQuota(1024)) {
                this.removeOldestData();
            }
        } catch (error) {
            console.error('Failed to cleanup storage:', error);
        }
    }

    // Load data from localStorage with validation and corruption detection
    load(key, defaultValue = null, schema = null) {
        if (!this.isStorageAvailable) {
            console.warn('Storage not available, returning default value for:', key);
            return defaultValue;
        }

        // Validate input parameters
        if (typeof key !== 'string' || key.trim() === '') {
            console.error('Invalid storage key provided');
            return defaultValue;
        }

        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            
            const dataWithMetadata = JSON.parse(serializedData);
            
            // Handle legacy data without metadata
            if (!dataWithMetadata.metadata) {
                console.warn(`Loading legacy data for ${key}, consider updating`);
                
                // Validate legacy data if schema provided
                if (schema) {
                    const validation = this.validateData(dataWithMetadata, schema);
                    if (!validation.isValid) {
                        console.error(`Legacy data validation failed for ${key}:`, validation.error);
                        return defaultValue;
                    }
                }
                
                return dataWithMetadata;
            }
            
            // Verify data integrity
            const integrityCheck = this.verifyDataIntegrity(serializedData, dataWithMetadata);
            if (!integrityCheck.success) {
                console.error(`Data integrity check failed for ${key}:`, integrityCheck.error);
                
                // Attempt recovery
                const recoveredData = this.attemptDataRecovery(key);
                return recoveredData || defaultValue;
            }
            
            // Validate data schema if provided
            if (schema) {
                const validation = this.validateData(dataWithMetadata.data, schema);
                if (!validation.isValid) {
                    console.error(`Data validation failed for ${key}:`, validation.error);
                    return defaultValue;
                }
            }
            
            return dataWithMetadata.data;
            
        } catch (error) {
            console.error('Failed to load from storage:', key, error);
            
            // Attempt recovery
            const recoveredData = this.attemptDataRecovery(key);
            return recoveredData || defaultValue;
        }
    }

    // Verify data integrity using checksum
    verifyDataIntegrity(serializedData, dataWithMetadata) {
        try {
            if (!dataWithMetadata.metadata || !dataWithMetadata.metadata.checksum) {
                return { success: false, error: 'No checksum available' };
            }
            
            // Recalculate checksum
            const dataOnly = JSON.stringify(dataWithMetadata.data);
            const calculatedChecksum = this.calculateChecksum(dataOnly);
            const storedChecksum = dataWithMetadata.metadata.checksum;
            
            if (calculatedChecksum !== storedChecksum) {
                return { success: false, error: 'Checksum mismatch - data may be corrupted' };
            }
            
            return { success: true };
        } catch (error) {
            return { success: false, error: `Integrity check failed: ${error.message}` };
        }
    }

    // Attempt to recover corrupted data
    attemptDataRecovery(key) {
        console.log(`Attempting data recovery for ${key}...`);
        
        try {
            // Try to get backup data if available
            const backupKey = `${key}_backup`;
            const backupData = localStorage.getItem(backupKey);
            
            if (backupData) {
                console.log(`Found backup data for ${key}`);
                const parsed = JSON.parse(backupData);
                
                // Validate backup data
                if (parsed.data) {
                    return parsed.data;
                }
            }
            
            // If no backup, try to repair the data
            const corruptedData = localStorage.getItem(key);
            if (corruptedData) {
                const repaired = this.repairCorruptedData(corruptedData);
                if (repaired) {
                    console.log(`Successfully repaired data for ${key}`);
                    return repaired;
                }
            }
            
        } catch (error) {
            console.error(`Data recovery failed for ${key}:`, error);
        }
        
        return null;
    }

    // Attempt to repair corrupted JSON data
    repairCorruptedData(corruptedData) {
        try {
            // Try common repair strategies
            
            // Remove potential trailing garbage
            let cleaned = corruptedData.trim();
            
            // Try to find the last valid JSON structure
            let lastValidEnd = -1;
            for (let i = cleaned.length - 1; i >= 0; i--) {
                if (cleaned[i] === '}' || cleaned[i] === ']') {
                    try {
                        const candidate = cleaned.substring(0, i + 1);
                        const parsed = JSON.parse(candidate);
                        return parsed.data || parsed; // Return data if wrapped
                    } catch (e) {
                        // Continue searching
                    }
                }
            }
            
        } catch (error) {
            console.error('Data repair failed:', error);
        }
        
        return null;
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
            currentRealm: 'fire',
            currentLevel: 1,
            unlockedRealms: ['fire'],
            completedLevels: {},
            totalEssence: 0,
            realmProgress: {
                fire: { unlocked: true, completed: false, stars: 0 }
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