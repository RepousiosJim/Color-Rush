// Game State Management Module
// Handles score, level, moves, and all game state variables

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array(8).fill().map(() => Array(8));
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
            bigMatches: 0
        };
        this.currentLevelObjectives = null;
        this.campaignProgress = {
            currentRealm: 1,
            currentLevel: 1,
            unlockedRealms: [1],
            completedLevels: {},
            totalEssence: 0
        };
    }

    // Score management
    updateScore(points) {
        this.score += points;
        this.gameStats.totalScore += points;
        if (this.score > this.gameStats.bestScore) {
            this.gameStats.bestScore = this.score;
        }
    }

    // Level management
    updateLevel() {
        if (this.score >= this.targetScore) {
            this.level++;
            this.targetScore = this.level * 1000 + (this.level - 1) * 500;
            return true;
        }
        return false;
    }

    // Move management
    incrementMoves() {
        this.moves++;
        this.gameStats.totalMoves++;
    }

    // Streak management
    updateStreak(hasMatches) {
        if (hasMatches) {
            this.streak++;
        } else {
            this.streak = 0;
        }
    }

    // Cascade management
    incrementCascade() {
        this.cascadeLevel++;
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

    // Board management
    setBoard(board) {
        this.board = board;
    }

    getGem(row, col) {
        return this.board[row] && this.board[row][col];
    }

    setGem(row, col, gem) {
        if (this.board[row]) {
            this.board[row][col] = gem;
        }
    }

    // Selection management
    selectGem(row, col, element) {
        this.selectedGem = { row, col, element };
    }

    clearSelection() {
        this.selectedGem = null;
    }

    // Save state for undo functionality
    saveState() {
        this.lastMoveState = {
            board: this.board.map(row => row.slice()),
            score: this.score,
            moves: this.moves,
            streak: this.streak
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
            this.canUndo = false;
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

    // Statistics
    recordMatch(matchSize) {
        this.gameStats.totalMatches++;
        if (matchSize >= 5) {
            this.gameStats.bigMatches++;
        }
        if (this.cascadeLevel === 0) {
            this.gameStats.perfectMatches++;
        }
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