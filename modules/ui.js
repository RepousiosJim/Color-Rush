// UI Management Module
// Color Rush: Cascade Challenge - Modern 2025 Edition

import { gameState } from './gameState.js';
import { SHAPES, LEVEL_OBJECTIVES } from './constants.js';

export const updateAllUI = () => {
  updateScoreDisplay();
  updateLivesDisplay();
  updateCurrencyDisplay();
  updateBoosterDisplay();
  updateObjectiveDisplay();
  updateTimeDisplay();
  updateMovesDisplay();
  updateStarProgress();
};

export const updateScoreDisplay = () => {
  const scoreElement = document.querySelector('.score');
  if (scoreElement) {
    scoreElement.textContent = `Score: ${gameState.score.toLocaleString()}`;
  }
  
  const comboElement = document.querySelector('.combo');
  if (comboElement) {
    comboElement.textContent = gameState.combo > 1 ? `${gameState.combo}x Combo!` : '';
    comboElement.style.display = gameState.combo > 1 ? 'block' : 'none';
  }
};

export const updateLivesDisplay = () => {
  const livesElement = document.querySelector('.lives-count');
  if (livesElement) {
    livesElement.textContent = `❤️ ${gameState.lives}/${gameState.maxLives}`;
  }
};

export const updateCurrencyDisplay = () => {
  const coinsElement = document.querySelector('.coins-count');
  if (coinsElement) {
    coinsElement.textContent = `🪙 ${gameState.coins}`;
  }
  
  const gemsElement = document.querySelector('.gems-count');
  if (gemsElement) {
    gemsElement.textContent = `💎 ${gameState.gems}`;
  }
};

export const updateBoosterDisplay = () => {
  Object.entries(gameState.boosters).forEach(([booster, count]) => {
    const element = document.querySelector(`.booster-${booster}`);
    if (element) {
      element.textContent = `${getBoosterIcon(booster)} ${count}`;
    }
  });
};

export const updateObjectiveDisplay = () => {
  const objectiveElement = document.querySelector('.objective-text');
  if (objectiveElement && gameState.currentObjective) {
    const obj = gameState.currentObjective;
    const objType = LEVEL_OBJECTIVES[obj.type];
    
    // Add difficulty level indicator
    const level = gameState.adventureLevel || 1;
    const difficultyLevel = Math.floor((level - 1) / 10) + 1;
    const difficultyStars = '⭐'.repeat(Math.min(difficultyLevel, 5));
    
    objectiveElement.textContent = `${objType.icon} ${objType.description} ${difficultyStars}`;
  }
};

export const updateTimeDisplay = () => {
  const timeElement = document.querySelector('.timer');
  if (timeElement) {
    if (gameState.currentObjective?.type === 'time_limit') {
      timeElement.textContent = `⏰ ${gameState.timeLeft}s`;
      timeElement.style.display = 'block';
    } else {
      timeElement.style.display = 'none';
    }
  }
};

export const updateMovesDisplay = () => {
  const movesElement = document.querySelector('.moves');
  if (movesElement) {
    if (gameState.currentObjective?.type === 'moves_limit') {
      movesElement.textContent = `👆 ${gameState.movesLeft} moves`;
      movesElement.style.display = 'block';
    } else {
      movesElement.style.display = 'none';
    }
  }
};

export const updateStarProgress = () => {
  const currentScore = gameState.score;
  const thresholds = gameState.starThresholds;
  
  // Calculate current stars earned
  let starsEarned = 0;
  if (currentScore >= thresholds[2]) starsEarned = 3;
  else if (currentScore >= thresholds[1]) starsEarned = 2;
  else if (currentScore >= thresholds[0]) starsEarned = 1;
  
  // Update stars earned display
  const starsEarnedElement = document.querySelector('.stars-earned');
  if (starsEarnedElement) {
    starsEarnedElement.textContent = `${starsEarned}/3`;
  }
  
  // Calculate progress percentage for the progress bar
  let progressPercentage = 0;
  let nextThreshold = thresholds[0];
  
  if (currentScore >= thresholds[2]) {
    progressPercentage = 100;
  } else if (currentScore >= thresholds[1]) {
    // Between star 2 and star 3
    const progressBetweenStars = (currentScore - thresholds[1]) / (thresholds[2] - thresholds[1]);
    progressPercentage = 66.6 + (progressBetweenStars * 33.4);
    nextThreshold = thresholds[2];
  } else if (currentScore >= thresholds[0]) {
    // Between star 1 and star 2
    const progressBetweenStars = (currentScore - thresholds[0]) / (thresholds[1] - thresholds[0]);
    progressPercentage = 33.3 + (progressBetweenStars * 33.3);
    nextThreshold = thresholds[1];
  } else {
    // Before first star
    progressPercentage = (currentScore / thresholds[0]) * 33.3;
    nextThreshold = thresholds[0];
  }
  
  // Update progress bar
  const progressFill = document.querySelector('.star-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    
    // Add smooth animation
    progressFill.style.transition = 'width 0.5s ease-out';
  }
  
  // Update individual star indicators
  const starIcons = document.querySelectorAll('.star-icon');
  starIcons.forEach((starIcon, index) => {
    const starNumber = index + 1;
    if (starNumber <= starsEarned) {
      starIcon.classList.remove('inactive');
      starIcon.classList.add('active');
      // Add sparkle animation for newly earned stars
      if (starNumber === starsEarned && !starIcon.dataset.animated) {
        starIcon.style.animation = 'starEarned 0.8s ease-out';
        starIcon.dataset.animated = 'true';
        setTimeout(() => {
          starIcon.style.animation = '';
        }, 800);
      }
    } else {
      starIcon.classList.add('inactive');
      starIcon.classList.remove('active');
    }
  });
  
  // Update gameState
  gameState.starsEarned = starsEarned;
  
  // Show progress tooltip on hover
  updateProgressTooltip(currentScore, nextThreshold, starsEarned);
};

const updateProgressTooltip = (currentScore, nextThreshold, starsEarned) => {
  const starProgress = document.querySelector('.star-progress');
  if (!starProgress) return;
  
  // Remove existing tooltip
  const existingTooltip = starProgress.querySelector('.progress-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create new tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'progress-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 1000;
  `;
  
  if (starsEarned === 3) {
    tooltip.textContent = `Perfect! All stars earned! 🌟`;
  } else {
    const pointsNeeded = nextThreshold - currentScore;
    tooltip.textContent = `${pointsNeeded.toLocaleString()} more points for next star`;
  }
  
  starProgress.appendChild(tooltip);
  
  // Show tooltip on hover
  starProgress.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
  });
  
  starProgress.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });
};

export const animateScoreGain = (scoreGained, position) => {
  // This function can be called when score is gained to show visual feedback
  // It can trigger the star progress update with animation
  updateStarProgress();
  
  // Check if a new star was just earned
  const previousStars = gameState.starsEarned || 0;
  const currentStars = calculateCurrentStars();
  
  if (currentStars > previousStars) {
    showStarEarnedAnimation(currentStars);
  }
};

const calculateCurrentStars = () => {
  const currentScore = gameState.score;
  const thresholds = gameState.starThresholds;
  
  if (currentScore >= thresholds[2]) return 3;
  if (currentScore >= thresholds[1]) return 2;
  if (currentScore >= thresholds[0]) return 1;
  return 0;
};

const showStarEarnedAnimation = (starNumber) => {
  // Create a celebration popup for earning a new star
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 2000;
    animation: starCelebration 2s ease-out forwards;
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
  `;
  
  popup.innerHTML = `
    <div>⭐ STAR EARNED! ⭐</div>
    <div style="font-size: 16px; margin-top: 10px;">${'★'.repeat(starNumber)} ${starNumber}/3 Stars</div>
  `;
  
  document.body.appendChild(popup);
  
  // Remove popup after animation
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 2000);
};

const getBoosterIcon = (type) => {
  const icons = {
    hammer: '🔨',
    colorBomb: '💣',
    striped: '⚡',
    wrapped: '💫',
    shuffle: '🔀',
    extraMoves: '➕',
    extraTime: '⏰'
  };
  return icons[type] || '🎁';
}; 