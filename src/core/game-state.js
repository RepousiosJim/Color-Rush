// Game State Management Module
// Handles score, level, moves, and all game state variables

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array(9).fill().map(() => Array(9).fill(null)); // Updated to 9x9
        this.score = 0;
        this.level = 1;
        this.targetScore = 1000;
        this.moves = 0;
        this.selectedGem = null;
        this.isAnimating = false;
        this.rushMultiplier = 1;
        this.cascadeLevel = 0;
        this.streak = 0;
        this.timeRemaining = 0;
        this.gameMode = 'normal';
        this.isGameOver = false;
        this.canUndo = false;
        this.lastMoveState = null;
        this.gameStats = {
            totalScore: 0,
            totalMoves: 0,
            totalGamesPlayed: 0,
            totalMatches: 0,
            bestScore: 0,
            averageScore: 0,
            perfectMatches: 0,
            bigMatches: 0,
            cascadesTriggered: 0,
            powerUpsUsed: 0,
            boardShuffles: 0
        };
        this.currentLevelObjectives = null;
        this.campaignProgress = {
            currentRealm: 'fire',
            currentLevel: 1,
            unlockedRealms: ['fire'],
            completedLevels: {},
            totalEssence: 0
        };
    }

    // Enhanced score management
    addScore(points) {
        if (points > 0) {
            this.score += points;
            this.gameStats.totalScore += points;
            if (this.score > this.gameStats.bestScore) {
                this.gameStats.bestScore = this.score;
            }
            console.log(`📈 Score added: ${points}, Total: ${this.score}`);
        }
    }

    updateScore(points) {
        this.addScore(points);
    }

    // Level management
    updateLevel() {
        if (this.score >= this.targetScore) {
            this.level++;
            this.targetScore = this.level * 1000 + (this.level - 1) * 500;
            console.log(`🏆 Level up! Now level ${this.level}, target: ${this.targetScore}`);
            return true;
        }
        return false;
    }

    // Enhanced move management
    incrementMoves() {
        this.moves++;
        this.gameStats.totalMoves++;
        console.log(`🎯 Move ${this.moves} completed`);
    }

    // Streak management
    updateStreak(hasMatches) {
        if (hasMatches) {
            this.streak++;
        } else {
            this.streak = 0;
        }
    }

    // Enhanced cascade management
    incrementCascade() {
        this.cascadeLevel++;
        this.gameStats.cascadesTriggered++;
        this.rushMultiplier = Math.min(5, 1 + (this.cascadeLevel * 0.5));
    }

    resetCascade() {
        this.cascadeLevel = 0;
        this.rushMultiplier = 1;
    }

    // Game mode management
    setGameMode(mode) {
        this.gameMode = mode;
        switch (mode) {
            case 'timeAttack':
                this.timeRemaining = 60; // 60 seconds
                break;
            case 'dailyChallenge':
                this.timeRemaining = 120; // 2 minutes
                break;
            default:
                this.timeRemaining = 0;
        }
    }

    // Board management for 9x9
    setBoard(board) {
        if (Array.isArray(board) && board.length === 9 && 
            board.every(row => Array.isArray(row) && row.length === 9)) {
            this.board = board;
            console.log('✅ 9x9 board set successfully');
        } else {
            console.error('Invalid board provided - must be 9x9 array');
        }
    }

    getGem(row, col) {
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            return this.board[row] && this.board[row][col];
        }
        return null;
    }

    setGem(row, col, gem) {
        if (row >= 0 && row < 9 && col >= 0 && col < 9 && this.board[row]) {
            this.board[row][col] = gem;
        }
    }

    // Enhanced selection management
    selectGem(row, col, element) {
        this.selectedGem = { row, col, element };
        console.log(`💎 Gem selected at (${row}, ${col})`);
    }

    clearSelection() {
        if (this.selectedGem) {
            console.log('🔄 Gem selection cleared');
        }
        this.selectedGem = null;
    }

    // Enhanced save state for undo functionality
    saveState() {
        this.lastMoveState = {
            board: this.board.map(row => row.slice()),
            score: this.score,
            moves: this.moves,
            streak: this.streak,
            cascadeLevel: this.cascadeLevel
        };
        this.canUndo = true;
    }

    // Restore state for undo
    restoreState() {
        if (this.lastMoveState && this.canUndo) {
            this.board = this.lastMoveState.board;
            this.score = this.lastMoveState.score;
            this.moves = this.lastMoveState.moves;
            this.streak = this.lastMoveState.streak;
            this.cascadeLevel = this.lastMoveState.cascadeLevel;
            this.canUndo = false;
            console.log('↩️ Game state restored');
            return true;
        }
        return false;
    }

    // Animation state
    setAnimating(isAnimating) {
        this.isAnimating = isAnimating;
    }

    // Campaign progress
    setCampaignProgress(progress) {
        this.campaignProgress = { ...this.campaignProgress, ...progress };
    }

    // Level objectives
    setLevelObjectives(objectives) {
        this.currentLevelObjectives = objectives;
    }

    // Time management
    decrementTime() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            return this.timeRemaining > 0;
        }
        return false;
    }

    // Game completion checks
    isLevelComplete() {
        return this.score >= this.targetScore;
    }

    isTimeUp() {
        return this.timeRemaining <= 0 && (this.gameMode === 'timeAttack' || this.gameMode === 'dailyChallenge');
    }

    // Enhanced statistics tracking
    recordMatch(matchSize) {
        this.gameStats.totalMatches++;
        if (matchSize >= 5) {
            this.gameStats.bigMatches++;
        }
        if (this.cascadeLevel === 0) {
            this.gameStats.perfectMatches++;
        }
    }

    recordPowerUpUsage() {
        this.gameStats.powerUpsUsed++;
    }

    recordBoardShuffle() {
        this.gameStats.boardShuffles++;
    }

    updateAverageScore() {
        if (this.gameStats.totalGamesPlayed > 0) {
            this.gameStats.averageScore = Math.round(this.gameStats.totalScore / this.gameStats.totalGamesPlayed);
        }
    }

    gameComplete() {
        this.gameStats.totalGamesPlayed++;
        this.updateAverageScore();
        this.isGameOver = true;
    }

    // Data export/import for persistence
    export() {
        return {
            board: this.board,
            score: this.score,
            level: this.level,
            targetScore: this.targetScore,
            moves: this.moves,
            streak: this.streak,
            timeRemaining: this.timeRemaining,
            gameMode: this.gameMode,
            gameStats: this.gameStats,
            campaignProgress: this.campaignProgress,
            currentLevelObjectives: this.currentLevelObjectives
        };
    }

    import(data) {
        Object.keys(data).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        });
    }
}

// Global game state instance
export const gameState = new GameState(); 