// Stage System Module
// Handles stage progression, boss missions, and map-based gameplay

import { gameState } from '../core/game-state.js';
import { storageManager } from '../utils/storage.js';

export class StageSystem {
    constructor() {
        this.currentStage = 1;
        this.maxStagesUnlocked = 1;
        this.stagesCompleted = [];
        this.bossStagesCleared = [];
        this.BOSS_STAGE_INTERVAL = 5; // Boss stage every 5 stages
        this.stageStats = {
            totalStagesCompleted: 0,
            totalBossesDefeated: 0,
            bestStageTime: null,
            perfectStages: 0,
            totalPlayTime: 0
        };
    }

    // Initialize the stage system
    initialize() {
        console.log('🗺️ Initializing Stage System...');
        
        try {
            this.loadStageProgress();
            this.validateStageData();
            console.log('✅ Stage System initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Stage System:', error);
            this.resetStageProgress();
            return false;
        }
    }

    // Check if a stage is a boss stage
    isBossStage(stageNumber) {
        return stageNumber > 0 && stageNumber % this.BOSS_STAGE_INTERVAL === 0;
    }

    // Get stage information
    getStageInfo(stageNumber) {
        const isBoss = this.isBossStage(stageNumber);
        const isUnlocked = stageNumber <= this.maxStagesUnlocked;
        const isCompleted = this.stagesCompleted.includes(stageNumber);
        
        return {
            stageNumber,
            isBoss,
            isUnlocked,
            isCompleted,
            type: isBoss ? 'boss' : 'normal',
            title: isBoss ? `Divine Conquest Boss ${Math.floor(stageNumber / this.BOSS_STAGE_INTERVAL)}` : `Stage ${stageNumber}`,
            description: isBoss ? 
                'A powerful divine entity awaits. Special rewards and challenges!' : 
                `Divine realm challenge - Level ${stageNumber}`,
            targetScore: this.calculateStageTarget(stageNumber),
            specialRewards: isBoss ? this.getBossRewards(stageNumber) : null
        };
    }

    // Calculate target score for a stage
    calculateStageTarget(stageNumber) {
        const baseTarget = 1000;
        const stageMultiplier = stageNumber * 0.2;
        const bossMultiplier = this.isBossStage(stageNumber) ? 2.5 : 1;
        
        return Math.floor(baseTarget * (1 + stageMultiplier) * bossMultiplier);
    }

    // Get boss stage rewards
    getBossRewards(stageNumber) {
        const bossLevel = Math.floor(stageNumber / this.BOSS_STAGE_INTERVAL);
        return {
            divineEssence: bossLevel * 100,
            specialGems: bossLevel * 5,
            title: `Divine Conqueror ${bossLevel}`,
            powerUps: ['rainbow', 'lightning', 'bomb']
        };
    }

    // Start a stage
    async startStage(stageNumber) {
        if (!this.canPlayStage(stageNumber)) {
            console.error(`❌ Cannot start stage ${stageNumber} - not unlocked`);
            return false;
        }

        console.log(`🎮 Starting Stage ${stageNumber}...`);
        
        try {
            const stageInfo = this.getStageInfo(stageNumber);
            this.currentStage = stageNumber;
            
            // Configure game state for this stage
            gameState.reset();
            gameState.setGameMode(stageInfo.isBoss ? 'bossStage' : 'stageMode');
            gameState.targetScore = stageInfo.targetScore;
            gameState.currentStage = stageNumber;
            gameState.stageInfo = stageInfo;
            
            // Save current stage
            this.saveStageProgress();
            
            console.log(`✅ Stage ${stageNumber} started successfully`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to start stage ${stageNumber}:`, error);
            return false;
        }
    }

    // Complete a stage
    completeStage(stageNumber, scoreAchieved, timeElapsed) {
        console.log(`🏆 Stage ${stageNumber} completed! Score: ${scoreAchieved}`);
        
        try {
            const stageInfo = this.getStageInfo(stageNumber);
            const isSuccess = scoreAchieved >= stageInfo.targetScore;
            
            if (isSuccess) {
                // Mark stage as completed
                if (!this.stagesCompleted.includes(stageNumber)) {
                    this.stagesCompleted.push(stageNumber);
                    this.stageStats.totalStagesCompleted++;
                }
                
                // Handle boss stage completion
                if (stageInfo.isBoss && !this.bossStagesCleared.includes(stageNumber)) {
                    this.bossStagesCleared.push(stageNumber);
                    this.stageStats.totalBossesDefeated++;
                    console.log(`👑 Boss Stage ${stageNumber} defeated!`);
                }
                
                // Unlock next stage
                const nextStage = stageNumber + 1;
                if (nextStage > this.maxStagesUnlocked) {
                    this.maxStagesUnlocked = nextStage;
                    console.log(`🔓 Stage ${nextStage} unlocked!`);
                }
                
                // Update stats
                this.updateStageStats(stageNumber, scoreAchieved, timeElapsed);
                
                // Save progress
                this.saveStageProgress();
                
                return {
                    success: true,
                    rewards: stageInfo.isBoss ? stageInfo.specialRewards : this.getStageRewards(stageNumber),
                    nextStageUnlocked: nextStage <= this.maxStagesUnlocked,
                    stageInfo
                };
            } else {
                console.log(`💔 Stage ${stageNumber} failed. Target: ${stageInfo.targetScore}, Achieved: ${scoreAchieved}`);
                return {
                    success: false,
                    targetScore: stageInfo.targetScore,
                    scoreAchieved,
                    stageInfo
                };
            }
            
        } catch (error) {
            console.error(`❌ Failed to complete stage ${stageNumber}:`, error);
            return { success: false, error: error.message };
        }
    }

    // Get regular stage rewards
    getStageRewards(stageNumber) {
        return {
            divineEssence: stageNumber * 10,
            experience: stageNumber * 5,
            gems: Math.floor(stageNumber / 2)
        };
    }

    // Update stage statistics
    updateStageStats(stageNumber, score, timeElapsed) {
        this.stageStats.totalPlayTime += timeElapsed;
        
        if (!this.stageStats.bestStageTime || timeElapsed < this.stageStats.bestStageTime) {
            this.stageStats.bestStageTime = timeElapsed;
        }
        
        // Check for perfect stage (high score achievement)
        const stageInfo = this.getStageInfo(stageNumber);
        if (score >= stageInfo.targetScore * 1.5) {
            this.stageStats.perfectStages++;
        }
    }

    // Check if a stage can be played
    canPlayStage(stageNumber) {
        return stageNumber > 0 && stageNumber <= this.maxStagesUnlocked;
    }

    // Get available stages for display
    getAvailableStages(limit = 10) {
        const stages = [];
        const startStage = Math.max(1, this.currentStage - 2);
        const endStage = Math.min(this.maxStagesUnlocked + 1, startStage + limit);
        
        for (let i = startStage; i <= endStage; i++) {
            stages.push(this.getStageInfo(i));
        }
        
        return stages;
    }

    // Get current stage for map display
    getCurrentStageForMap() {
        return this.getStageInfo(this.currentStage);
    }

    // Get next available stage
    getNextStage() {
        // Find first incomplete stage, or current stage if current is incomplete
        for (let i = 1; i <= this.maxStagesUnlocked; i++) {
            if (!this.stagesCompleted.includes(i)) {
                return this.getStageInfo(i);
            }
        }
        
        // All current stages completed, return next unlocked stage if available
        if (this.maxStagesUnlocked < this.currentStage + 1) {
            return this.getStageInfo(this.maxStagesUnlocked);
        }
        
        return this.getStageInfo(this.currentStage);
    }

    // Validate stage data integrity
    validateStageData() {
        if (this.currentStage < 1) {
            this.currentStage = 1;
        }
        
        if (this.maxStagesUnlocked < 1) {
            this.maxStagesUnlocked = 1;
        }
        
        if (this.currentStage > this.maxStagesUnlocked) {
            this.currentStage = this.maxStagesUnlocked;
        }
        
        // Ensure completed stages are valid
        this.stagesCompleted = this.stagesCompleted.filter(stage => 
            stage > 0 && stage <= this.maxStagesUnlocked
        );
        
        // Ensure boss stages cleared are valid
        this.bossStagesCleared = this.bossStagesCleared.filter(stage => 
            this.isBossStage(stage) && this.stagesCompleted.includes(stage)
        );
    }

    // Reset stage progress
    resetStageProgress() {
        console.log('🔄 Resetting stage progress...');
        this.currentStage = 1;
        this.maxStagesUnlocked = 1;
        this.stagesCompleted = [];
        this.bossStagesCleared = [];
        this.stageStats = {
            totalStagesCompleted: 0,
            totalBossesDefeated: 0,
            bestStageTime: null,
            perfectStages: 0,
            totalPlayTime: 0
        };
        this.saveStageProgress();
    }

    // Save stage progress to storage
    saveStageProgress() {
        try {
            const progressData = {
                currentStage: this.currentStage,
                maxStagesUnlocked: this.maxStagesUnlocked,
                stagesCompleted: this.stagesCompleted,
                bossStagesCleared: this.bossStagesCleared,
                stageStats: this.stageStats,
                lastPlayed: Date.now()
            };
            
            storageManager.save('stageProgress', progressData);
            console.log('💾 Stage progress saved');
            
        } catch (error) {
            console.error('❌ Failed to save stage progress:', error);
        }
    }

    // Load stage progress from storage
    loadStageProgress() {
        try {
            const progressData = storageManager.load('stageProgress');
            
            if (progressData) {
                this.currentStage = progressData.currentStage || 1;
                this.maxStagesUnlocked = progressData.maxStagesUnlocked || 1;
                this.stagesCompleted = progressData.stagesCompleted || [];
                this.bossStagesCleared = progressData.bossStagesCleared || [];
                this.stageStats = {
                    ...this.stageStats,
                    ...progressData.stageStats
                };
                
                console.log('📖 Stage progress loaded:', {
                    currentStage: this.currentStage,
                    maxUnlocked: this.maxStagesUnlocked,
                    completed: this.stagesCompleted.length
                });
            } else {
                console.log('🆕 No stage progress found, starting fresh');
            }
            
        } catch (error) {
            console.error('❌ Failed to load stage progress:', error);
        }
    }

    // Get stage statistics for display
    getStageStatistics() {
        return {
            ...this.stageStats,
            currentStage: this.currentStage,
            maxStagesUnlocked: this.maxStagesUnlocked,
            completionRate: this.stageStats.totalStagesCompleted / this.maxStagesUnlocked,
            bossCompletionRate: this.bossStagesCleared.length / Math.floor(this.maxStagesUnlocked / this.BOSS_STAGE_INTERVAL)
        };
    }

    // Export stage data
    export() {
        return {
            currentStage: this.currentStage,
            maxStagesUnlocked: this.maxStagesUnlocked,
            stagesCompleted: this.stagesCompleted,
            bossStagesCleared: this.bossStagesCleared,
            stageStats: this.stageStats
        };
    }

    // Import stage data
    import(data) {
        if (data && typeof data === 'object') {
            this.currentStage = data.currentStage || 1;
            this.maxStagesUnlocked = data.maxStagesUnlocked || 1;
            this.stagesCompleted = data.stagesCompleted || [];
            this.bossStagesCleared = data.bossStagesCleared || [];
            this.stageStats = { ...this.stageStats, ...(data.stageStats || {}) };
            this.validateStageData();
        }
    }
}

// Global stage system instance
export const stageSystem = new StageSystem(); 