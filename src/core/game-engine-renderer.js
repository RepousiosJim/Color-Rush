// Game Engine Renderer Module
// Handles all rendering, DOM manipulation, and visual effects

import { gameState } from './game-state.js';
import { gemSystem } from './gem-system.js';
import { helpers } from '../utils/helpers.js';

export class GameRenderer {
    constructor() {
        this.gameBoard = null;
        this.animationQueue = [];
    }

    // Initialize renderer
    initialize(gameBoard) {
        this.gameBoard = gameBoard;
        return this.gameBoard !== null;
    }

    // Render the complete game board
    renderBoard(board) {
        if (!this.gameBoard || !board) return false;

        try {
            this.gameBoard.innerHTML = '';
            this.gameBoard.classList.add('game-board-layout');
            
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const gem = board[row][col];
                    if (gem && this.isValidGem(gem)) {
                        const gemElement = this.createGemElement(gem, row, col);
                        this.gameBoard.appendChild(gemElement);
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('Render failed:', error);
            return false;
        }
    }

    // Create individual gem element
    createGemElement(gem, row, col) {
        const element = document.createElement('div');
        element.className = 'gem';
        element.dataset.row = row;
        element.dataset.col = col;
        element.dataset.type = gem.type;
        element.id = gem.id;
        
        this.applyGemStyling(element, gem);
        this.attachGemEvents(element);
        
        return element;
    }

    // Apply visual styling to gem
    applyGemStyling(element, gem) {
        if (gem.colors?.length >= 2) {
            element.style.background = `linear-gradient(135deg, ${gem.colors[0]}, ${gem.colors[1]})`;
        }

        if (gem.isPowerUp) {
            this.applyPowerUpStyling(element, gem);
        } else {
            element.textContent = gem.type;
        }
    }

    // Apply power-up specific styling
    applyPowerUpStyling(element, gem) {
        const powerUpConfigs = {
            [gemSystem.powerUpTypes.LIGHTNING]: { icon: '⚡', color: '#FFD700' },
            [gemSystem.powerUpTypes.BOMB]: { icon: '💥', color: '#FF4500' },
            [gemSystem.powerUpTypes.RAINBOW]: { icon: '🌈', color: '#9400D3' }
        };

        const config = powerUpConfigs[gem.powerUpType];
        if (config) {
            element.innerHTML = `
                <div class="power-up-icon">${config.icon}</div>
                <div class="gem-base">${gem.type}</div>
            `;
            element.style.boxShadow = `0 0 20px ${config.color}99`;
            element.style.border = `2px solid ${config.color}`;
            element.classList.add('power-up', 'power-up-pulse');
        }
    }

    // Attach event listeners to gem
    attachGemEvents(element) {
        element.addEventListener('click', (event) => {
            const customEvent = new CustomEvent('gemClick', {
                detail: {
                    row: parseInt(element.dataset.row),
                    col: parseInt(element.dataset.col),
                    element: element
                }
            });
            document.dispatchEvent(customEvent);
        });
    }

    // Show floating score animation
    showFloatingScore(points, row, col) {
        const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!element) return;
        
        const scoreElement = document.createElement('div');
        scoreElement.textContent = `+${helpers.formatNumber(points)}`;
        scoreElement.className = 'floating-score-element';
        scoreElement.setAttribute('data-temporary', 'true');
        
        const rect = element.getBoundingClientRect();
        Object.assign(scoreElement.style, {
            position: 'absolute',
            left: rect.left + window.scrollX + rect.width / 2 + 'px',
            top: rect.top + window.scrollY + 'px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: '1500',
            animation: 'floatUpScore 1.5s ease-out forwards'
        });
        
        document.body.appendChild(scoreElement);
        
        setTimeout(() => scoreElement.remove(), 1500);
    }

    // Animate gem matches
    animateMatches(matches) {
        matches.forEach(match => {
            match.forEach(({ row, col }) => {
                const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (element) {
                    element.style.animation = 'matchPulse 0.5s ease-in-out';
                    element.style.transform = 'scale(1.2)';
                    element.style.opacity = '0.8';
                }
            });
        });
        
        return helpers.sleep(500);
    }

    // Show hint indicators
    showHint(fromPos, toPos) {
        const fromElement = document.querySelector(`[data-row="${fromPos.row}"][data-col="${fromPos.col}"]`);
        const toElement = document.querySelector(`[data-row="${toPos.row}"][data-col="${toPos.col}"]`);
        
        [fromElement, toElement].forEach(el => {
            if (el) {
                el.classList.add('hint-glow');
                setTimeout(() => el.classList.remove('hint-glow'), 3000);
            }
        });
    }

    // Validate gem object
    isValidGem(gem) {
        return gem && 
               typeof gem === 'object' && 
               gem.type && 
               gem.colors && 
               gem.id;
    }

    // Cleanup renderer
    cleanup() {
        this.animationQueue = [];
        
        if (this.gameBoard) {
            this.gameBoard.innerHTML = '';
            this.gameBoard.style.animation = '';
        }

        // Remove temporary elements
        document.querySelectorAll('[data-temporary="true"]').forEach(el => el.remove());
        
        // Clear visual effects
        document.querySelectorAll('.hint-glow, .power-up-activating, .power-up-pulse').forEach(el => {
            el.classList.remove('hint-glow', 'power-up-activating', 'power-up-pulse');
            el.style.animation = '';
        });
    }
}

export const gameRenderer = new GameRenderer(); 