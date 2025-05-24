// Modern 2025 Gaming Features Module
// Color Rush: Cascade Challenge - Advanced Features

import { gameState } from './gameState.js';

// AI-Powered Hint System (2025 feature)
export class AIHintSystem {
  static analyzeBoard() {
    const board = gameState.board;
    const hints = [];
    
    // AI analyzes potential moves and scores them
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const adjacent = [
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 }
        ];
        
        for (const adj of adjacent) {
          if (this.isValidPosition(adj.row, adj.col)) {
            const moveScore = this.calculateMoveValue(row, col, adj.row, adj.col);
            if (moveScore > 0) {
              hints.push({
                from: { row, col },
                to: { row: adj.row, col: adj.col },
                score: moveScore,
                type: this.getMoveType(moveScore)
              });
            }
          }
        }
      }
    }
    
    return hints.sort((a, b) => b.score - a.score).slice(0, 3);
  }
  
  static calculateMoveValue(row1, col1, row2, col2) {
    // Simulate the move and calculate potential score
    const tempBoard = JSON.parse(JSON.stringify(gameState.board));
    [tempBoard[row1][col1], tempBoard[row2][col2]] = 
    [tempBoard[row2][col2], tempBoard[row1][col1]];
    
    const matches = this.findMatchesInBoard(tempBoard);
    let totalScore = 0;
    
    for (const match of matches) {
      totalScore += match.length * 50; // Base scoring
      if (match.length >= 4) totalScore += 200; // Bonus for larger matches
      if (match.length >= 5) totalScore += 500; // Super bonus
    }
    
    return totalScore;
  }
  
  static findMatchesInBoard(board) {
    // Simplified match detection for AI analysis
    const matches = [];
    
    // Check horizontal matches
    for (let row = 0; row < 8; row++) {
      let currentMatch = [];
      let currentType = null;
      
      for (let col = 0; col < 8; col++) {
        const cell = board[row][col];
        const cellType = cell ? cell.type : null;
        
        if (cellType && cellType === currentType) {
          currentMatch.push({ row, col });
        } else {
          if (currentMatch.length >= 3) {
            matches.push([...currentMatch]);
          }
          currentMatch = cellType ? [{ row, col }] : [];
          currentType = cellType;
        }
      }
      
      if (currentMatch.length >= 3) {
        matches.push([...currentMatch]);
      }
    }
    
    // Check vertical matches
    for (let col = 0; col < 8; col++) {
      let currentMatch = [];
      let currentType = null;
      
      for (let row = 0; row < 8; row++) {
        const cell = board[row][col];
        const cellType = cell ? cell.type : null;
        
        if (cellType && cellType === currentType) {
          currentMatch.push({ row, col });
        } else {
          if (currentMatch.length >= 3) {
            matches.push([...currentMatch]);
          }
          currentMatch = cellType ? [{ row, col }] : [];
          currentType = cellType;
        }
      }
      
      if (currentMatch.length >= 3) {
        matches.push([...currentMatch]);
      }
    }
    
    return matches;
  }
  
  static getMoveType(score) {
    if (score >= 1000) return 'EXCELLENT';
    if (score >= 500) return 'GREAT';
    if (score >= 200) return 'GOOD';
    return 'OKAY';
  }
  
  static isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }
  
  static showHint() {
    const hints = this.analyzeBoard();
    if (hints.length === 0) {
      // Show message if no hints available
      this.showNoHintsMessage();
      return;
    }
    
    const bestHint = hints[0];
    this.highlightHintMove(bestHint);
    
    // Modern UI feedback
    this.showHintTooltip(bestHint);
  }
  
  static showNoHintsMessage() {
    const tooltip = document.createElement('div');
    tooltip.className = 'ai-hint-tooltip';
    tooltip.innerHTML = `
      <div class="hint-header">🤖 AI Analysis</div>
      <div class="hint-quality okay">No beneficial moves found</div>
      <div class="hint-score">Try shuffling the board</div>
    `;
    
    tooltip.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 2000;
      animation: hintAppear 0.3s ease-out;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 3000);
  }
  
  static highlightHintMove(hint) {
    // Clear previous hints
    document.querySelectorAll('.hint-glow').forEach(el => {
      el.classList.remove('hint-glow');
    });
    
    // Highlight suggested move
    const fromElement = document.querySelector(`[data-row="${hint.from.row}"][data-col="${hint.from.col}"]`);
    const toElement = document.querySelector(`[data-row="${hint.to.row}"][data-col="${hint.to.col}"]`);
    
    if (fromElement && toElement) {
      fromElement.classList.add('hint-glow');
      toElement.classList.add('hint-glow');
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        fromElement.classList.remove('hint-glow');
        toElement.classList.remove('hint-glow');
      }, 5000);
    }
  }
  
  static showHintTooltip(hint) {
    const tooltip = document.createElement('div');
    tooltip.className = 'ai-hint-tooltip';
    tooltip.innerHTML = `
      <div class="hint-header">🤖 AI Suggestion</div>
      <div class="hint-quality ${hint.type.toLowerCase()}">${hint.type} Move</div>
      <div class="hint-score">Potential: ${hint.score} points</div>
    `;
    
    tooltip.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 2000;
      animation: hintAppear 0.3s ease-out;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 3000);
  }
}

// Social Features (2025 standard)
export class SocialSystem {
  static async shareScore(score, level) {
    const shareData = {
      title: 'Color Rush: Cascade Challenge',
      text: `I just scored ${score.toLocaleString()} points on level ${level}! 🎮⭐`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.trackShare('native');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      this.fallbackShare(shareData);
    }
  }
  
  static fallbackShare(data) {
    const shareText = `${data.text}\n${data.url}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        this.showShareConfirmation('Link copied to clipboard!');
      });
    } else {
      // Create temporary textarea for copying
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      // Modified to indicate fallback usage
      this.showShareConfirmation('Link copied using fallback method - please paste manually if needed!');
    }
  }
  
  static showShareConfirmation(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 3000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
  
  static trackShare(method) {
    // Analytics tracking for social sharing
    console.log(`Score shared via: ${method}`);
  }
}

// Advanced Progression System
export class ModernProgression {
  static calculatePlayerLevel() {
    const totalScore = gameState.score;
    const gamesPlayed = gameState.gamesPlayed || 1;
    const avgScore = totalScore / gamesPlayed;
    
    // Modern skill-based leveling
    let playerLevel = 1;
    let requiredExp = 1000;
    let currentExp = totalScore;
    let safetyCounter = 0;
    const maxIterations = 1000;
    
    while (currentExp >= requiredExp && safetyCounter < maxIterations) {
      currentExp -= requiredExp;
      playerLevel++;
      requiredExp = Math.floor(requiredExp * 1.2); // Exponential scaling
      safetyCounter++;
    }
    
    // Log warning if safety limit reached
    if (safetyCounter >= maxIterations) {
      console.warn('Player level calculation reached maximum iterations limit');
    }
    
    return {
      level: playerLevel,
      currentExp,
      requiredExp,
      progress: (currentExp / requiredExp) * 100
    };
  }
  
  static unlockFeatures() {
    const playerLevel = this.calculatePlayerLevel().level;
    const unlockedFeatures = [];
    
    // Feature gates based on progression
    if (playerLevel >= 3) unlockedFeatures.push('speed_mode');
    if (playerLevel >= 5) unlockedFeatures.push('daily_challenges');
    if (playerLevel >= 8) unlockedFeatures.push('tournament_mode');
    if (playerLevel >= 10) unlockedFeatures.push('custom_themes');
    if (playerLevel >= 15) unlockedFeatures.push('ai_hints');
    
    return unlockedFeatures;
  }
  
  static showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="levelup-content">
        <div class="levelup-title">🎉 LEVEL UP! 🎉</div>
        <div class="levelup-level">Level ${newLevel}</div>
        <div class="levelup-features">New features unlocked!</div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      font-weight: bold;
      z-index: 3000;
      animation: levelUpBounce 1s ease-out;
      box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 4000);
  }
}

// Performance Analytics (2025 standard)
export class PerformanceTracker {
  static trackGameMetrics() {
    const metrics = {
      avgSessionTime: this.calculateAvgSessionTime(),
      completionRate: this.calculateCompletionRate(),
      preferredMode: this.getMostPlayedMode(),
      skillProgression: this.calculateSkillProgression(),
      timestamp: Date.now()
    };
    
    // Store locally (could be sent to analytics service)
    localStorage.setItem('gameMetrics', JSON.stringify(metrics));
    return metrics;
  }
  
  static calculateAvgSessionTime() {
    const totalTime = gameState.totalPlayTime || 0;
    const sessions = gameState.gamesPlayed || 1;
    return Math.floor(totalTime / sessions / 1000); // seconds
  }
  
  static calculateCompletionRate() {
    const levelsCompleted = gameState.adventureLevel - 1;
    const totalAttempts = gameState.gamesPlayed || 1;
    return (levelsCompleted / totalAttempts) * 100;
  }
  
  static getMostPlayedMode() {
    // This would track which game mode is played most
    return gameState.gameMode || 'adventure';
  }
  
  static calculateSkillProgression() {
    const recentScores = this.getRecentScores();
    if (recentScores.length < 2) return 0;
    
    const oldAvg = recentScores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const newAvg = recentScores.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    // Check for division by zero
    if (oldAvg === 0) {
      return newAvg > 0 ? 100 : 0; // Return 100% improvement if starting from 0 and now have scores
    }
    
    return ((newAvg - oldAvg) / oldAvg) * 100; // percentage improvement
  }
  
  static getRecentScores() {
    const scores = JSON.parse(localStorage.getItem('recentScores') || '[]');
    return scores.slice(-20); // Last 20 games
  }
  
  static addScore(score) {
    const scores = this.getRecentScores();
    scores.push(score);
    localStorage.setItem('recentScores', JSON.stringify(scores.slice(-20)));
  }
}

// Accessibility Features (2025 requirement)
export class AccessibilityFeatures {
  static enableReducedMotion() {
    document.body.classList.add('reduced-motion');
    localStorage.setItem('reducedMotion', 'true');
  }
  
  static enableHighContrast() {
    document.body.classList.add('high-contrast');
    localStorage.setItem('highContrast', 'true');
  }
  
  static enableLargeText() {
    document.body.classList.add('large-text');
    localStorage.setItem('largeText', 'true');
  }
  
  static addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const selected = document.querySelector('.keyboard-selected');
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.moveKeyboardSelection('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.moveKeyboardSelection('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.moveKeyboardSelection('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.moveKeyboardSelection('right');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.activateKeyboardSelection();
          break;
        case 'h':
          e.preventDefault();
          if (ModernProgression.unlockFeatures().includes('ai_hints')) {
            AIHintSystem.showHint();
          }
          break;
      }
    });
  }
  
  static moveKeyboardSelection(direction) {
    // Implementation for keyboard navigation between game pieces
    console.log(`Moving selection: ${direction}`);
  }
  
  static activateKeyboardSelection() {
    // Implementation for selecting/swapping pieces with keyboard
    console.log('Activating keyboard selection');
  }
  
  static loadAccessibilitySettings() {
    if (localStorage.getItem('reducedMotion') === 'true') {
      this.enableReducedMotion();
    }
    if (localStorage.getItem('highContrast') === 'true') {
      this.enableHighContrast();
    }
    if (localStorage.getItem('largeText') === 'true') {
      this.enableLargeText();
    }
  }
} 