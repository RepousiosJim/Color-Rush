// Game Constants and Configuration
// Color Rush: Cascade Challenge - Modern 2025 Edition

// Enhanced shape system
export const SHAPES = {
  circle: { 
    symbol: '●', 
    class: 'circle', 
    points: 100, 
    color: '#FF6B6B',
    name: 'Cherry'
  },
  square: { 
    symbol: '■', 
    class: 'square', 
    points: 150, 
    color: '#4ECDC4',
    name: 'Mint'
  },
  triangle: { 
    symbol: '▲', 
    class: 'triangle', 
    points: 200, 
    color: '#45B7D1',
    name: 'Sapphire'
  },
  diamond: { 
    symbol: '◆', 
    class: 'diamond', 
    points: 250, 
    color: '#96CEB4',
    name: 'Emerald'
  },
  star: { 
    symbol: '★', 
    class: 'star', 
    points: 300, 
    color: '#FFEEAD',
    name: 'Gold'
  },
  heart: {
    symbol: '♥',
    class: 'heart',
    points: 400,
    color: '#FF69B4',
    name: 'Ruby'
  }
};

// Special pieces (like Candy Crush specials)
export const SPECIAL_TYPES = {
  striped_horizontal: {
    name: 'Striped (Horizontal)',
    effect: 'clearRow',
    icon: '━',
    points: 1000
  },
  striped_vertical: {
    name: 'Striped (Vertical)', 
    effect: 'clearColumn',
    icon: '┃',
    points: 1000
  },
  wrapped: {
    name: 'Wrapped',
    effect: 'clear3x3',
    icon: '⊞',
    points: 1500
  },
  color_bomb: {
    name: 'Color Bomb',
    effect: 'clearColor',
    icon: '◉',
    points: 2000
  }
};

// Level objectives
export const LEVEL_OBJECTIVES = {
  score: { description: 'Reach target score', icon: '🎯' },
  moves_limit: { description: 'Limited moves', icon: '👆' },
  time_limit: { description: 'Beat the clock', icon: '⏰' }
};

// Daily rewards
export const DAILY_REWARDS = [
  { coins: 100, gems: 0, boosters: {} },
  { coins: 150, gems: 0, boosters: { hammer: 1 } },
  { coins: 200, gems: 1, boosters: {} },
  { coins: 250, gems: 0, boosters: { colorBomb: 1 } },
  { coins: 300, gems: 2, boosters: { striped: 1 } },
  { coins: 400, gems: 0, boosters: { shuffle: 1 } },
  { coins: 500, gems: 5, boosters: { hammer: 2, colorBomb: 1, striped: 1 } }
];

// Booster icons
export const BOOSTER_ICONS = {
  hammer: '🔨',
  colorBomb: '💣',
  striped: '⚡',
  wrapped: '💫',
  shuffle: '🔀',
  extraMoves: '➕',
  extraTime: '⏰'
};

// Game board configuration
export const BOARD_CONFIG = {
  rows: 8,
  cols: 8,
  minMatch: 3
};

// Scoring configuration
export const SCORING = {
  match3: 100,
  match4: 400,
  match5: 1000,
  match6: 2000,
  cascadeBonus: 50,
  comboMaxMultiplier: 10
}; 