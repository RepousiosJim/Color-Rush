# 💎 Gems Rush: Divine Teams

A high-performance match-3 puzzle game built with vanilla JavaScript, optimized for both human players and AI assistant development workflow.

## 🚀 Quick Start for AI Assistants

```javascript
// Import everything you need
import { QuickAccess, healthCheck, DevUtils } from './src/index.js';

// Initialize the game
QuickAccess.initialize();

// Debug the current board state
QuickAccess.debugBoard();

// Check module health
healthCheck();
```

## 📁 Project Structure

```
src/
├── core/                   # Core game logic
│   ├── game-engine.js     # Main game controller
│   ├── game-state.js      # State management
│   ├── gem-system.js      # Gem logic & physics
│   └── constants.js       # Game configuration
├── ui/                    # User interface
│   ├── interface.js       # UI controller
│   ├── modals.js         # Dialog systems
│   ├── menu-system.js    # Navigation
│   └── game-mode-selector.js
├── utils/                 # Utilities & helpers
│   ├── helpers.js        # General utilities
│   ├── storage.js        # Local storage
│   ├── validators.js     # Input validation
│   ├── event-manager.js  # Event handling
│   ├── performance-*.js  # Performance tools
│   └── ai-friendly-docs.js # Documentation
├── modes/                 # Game modes
│   ├── game-modes.js     # Mode configuration
│   ├── campaign.js       # Campaign system
│   └── stage-system.js   # Stage progression
├── features/             # Game features
│   ├── audio-system.js   # Sound & music
│   └── input-handler.js  # Input processing
└── index.js              # Central exports
```

## 🎮 Game Architecture

### Core Components

1. **GameEngine** (`src/core/game-engine.js`)
   - Main game initialization and lifecycle
   - Board rendering and user interaction
   - Animation and cascade processing

2. **GemSystem** (`src/core/gem-system.js`)
   - Gem creation and validation
   - Match detection algorithms
   - Physics simulation (gravity, cascades)

3. **GameState** (`src/core/game-state.js`)
   - State management and persistence
   - Score tracking and statistics
   - Save/load functionality

### Performance Features

- **Hardware-accelerated CSS animations** with `transform3d` and `will-change`
- **RequestAnimationFrame** batching for smooth 60fps gameplay
- **Object pooling** for frequently created objects
- **DOM operation batching** to minimize reflows
- **Event delegation** and passive listeners
- **Memory management** with automatic cleanup

## 🔧 AI Assistant Development Guide

### Quick Debugging Commands

```javascript
// Check game health
import { healthCheck, QuickAccess, DevUtils } from './src/index.js';
healthCheck();

// Inspect game state
QuickAccess.debugState();

// View board as table
QuickAccess.debugBoard();

// Monitor performance
DevUtils.trackMemory();
DevUtils.measurePerformance(() => QuickAccess.restart(), 'Game Restart');

// Fix common issues
QuickAccess.fixBoardSync();
QuickAccess.validateBoard();
```

### Common Troubleshooting

| Issue | Solution | File Location |
|-------|----------|---------------|
| Auto-breaking gems | `createFallbackBoard()` | `src/core/gem-system.js:882` |
| Multiple gem selection | `handleRegularGemClick()` | `src/core/game-engine.js:1080` |
| Board synchronization | `fixBoardSynchronization()` | `src/core/game-engine.js:1403` |
| Performance issues | `performanceUtils.enableHardwareAcceleration()` | `src/utils/performance-utils.js` |
| Memory leaks | `cleanup()` methods | All major classes |

### Code Patterns

#### Error Handling
```javascript
// ✅ Good pattern used throughout
try {
    if (!this.validateInput(input)) {
        console.warn('⚠️ Invalid input provided');
        return false;
    }
    
    const result = this.performOperation(input);
    console.log('✅ Operation successful');
    return result;
    
} catch (error) {
    console.error('❌ Operation failed:', error);
    return this.handleFailure(error);
}
```

#### Performance Optimization
```javascript
// ✅ Hardware acceleration
element.style.transform = 'translateZ(0)';
element.style.willChange = 'transform';

// ✅ Batched DOM operations
requestAnimationFrame(() => {
    elements.forEach(el => this.updateElement(el));
});

// ✅ Event cleanup
cleanup() {
    this.eventListeners.forEach(cleanup => cleanup());
    this.intervals.forEach(id => clearInterval(id));
}
```

### Key Methods for AI Understanding

#### GameEngine
- `initialize()` - Set up complete game environment
- `restart()` - Reset to initial state
- `processMatchesWithCascade()` - Handle match processing
- `handleGemClickSafely()` - Process user interactions
- `fixBoardSynchronization()` - Repair board state issues

#### GemSystem
- `createInitialBoard()` - Generate valid starting board
- `findMatches()` - Identify matching gem groups
- `processCascade()` - Handle automatic match processing
- `validateBoard()` - Check board state integrity

#### GameState
- `reset()` - Initialize default state
- `addScore()` - Update player score
- `getGem(row, col)` - Retrieve gem at position
- `setBoard()` - Update board state

## 🎯 Game Rules

- **Board Size**: 9×9 grid
- **Match Requirements**: 3+ identical gems horizontally or vertically
- **Scoring**: Base points × match size × cascade multiplier
- **Power-ups**: Created from 4+ gem matches
- **Objective**: Reach target score to advance levels

## 🔍 Performance Monitoring

```javascript
// Enable performance tracking
import { performanceUtils } from './src/utils/performance-utils.js';

// Monitor frame time
console.log('Frame time:', performanceUtils.getMetrics().frameTime);

// Track memory usage
if (performance.memory) {
    const memory = performance.memory;
    console.log(`Memory: ${memory.usedJSHeapSize / 1024 / 1024}MB`);
}

// Monitor DOM operations
performanceUtils.batchDOMOperation(() => {
    // Your DOM updates here
});
```

## 🚨 Common Issues & Fixes

### 1. Auto-breaking Gems on Start
**Cause**: Fallback board creation generates immediate matches  
**Fix**: Enhanced `createFallbackBoard()` with match prevention  
**Location**: `src/core/gem-system.js:882`

### 2. Multiple Gem Selection
**Cause**: Inadequate selection state management  
**Fix**: Improved `handleRegularGemClick()` logic  
**Location**: `src/core/game-engine.js:1080`

### 3. Board Synchronization Errors
**Cause**: DOM and game state mismatch  
**Fix**: `fixBoardSynchronization()` with validation  
**Location**: `src/core/game-engine.js:1403`

### 4. Performance Issues
**Cause**: Inefficient animations or DOM operations  
**Fix**: Hardware acceleration and batching  
**Location**: `src/utils/performance-utils.js`

## 🔧 Development Commands

```bash
# Start development server
python -m http.server 8000

# Open in browser
open http://localhost:8000

# Run health check
# Open browser console and run: healthCheck()
```

## 📊 Code Quality Metrics

- **Modular Architecture**: 20+ focused modules
- **Error Handling**: Comprehensive try-catch with fallbacks
- **Performance**: 60fps target with hardware acceleration
- **Accessibility**: ARIA labels, keyboard navigation
- **Documentation**: JSDoc throughout, AI-friendly patterns
- **Testing**: Built-in validation and health checks

## 🤖 AI Assistant Tips

1. **Use the index file** (`src/index.js`) for centralized imports
2. **Check module health** with `healthCheck()` before debugging
3. **Use QuickAccess** for common operations and debugging
4. **Follow logging conventions** (✅❌⚠️🔍) for consistent output
5. **Leverage DevUtils** for performance measurement and inspection
6. **Refer to ai-friendly-docs.js** for patterns and conventions

## 🏆 Performance Optimizations Applied

### CSS Optimizations
- ✅ Hardware acceleration with `transform3d`
- ✅ `will-change` properties for animated elements
- ✅ Efficient selectors and minimal reflows
- ✅ GPU-optimized animations

### JavaScript Optimizations
- ✅ RequestAnimationFrame for all animations
- ✅ DOM operation batching
- ✅ Object pooling for frequent allocations
- ✅ Passive event listeners for touch events
- ✅ Debounced/throttled function calls

### Memory Management
- ✅ Automatic event listener cleanup
- ✅ WeakMap for automatic garbage collection
- ✅ Interval and timeout cleanup
- ✅ Performance monitoring and metrics

---

**For AI Assistants**: This project is optimized for analysis and development. Use the centralized documentation, QuickAccess utilities, and health checking functions to efficiently understand and modify the codebase.

# ⚡ Gems Rush: Divine Teams ⚡
### Epic Match-3 Adventure with Divine Powers

[![Live Demo](https://img.shields.io/badge/🎮_Play_Now-Live_Demo-brightgreen?style=for-the-badge)](https://repousiosjim.github.io/Gems-Rush/)
[![ES6 Modules](https://img.shields.io/badge/ES6-Modules-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

*Master the ancient art of divine gem matching! Unite elemental powers, create epic cascades, and build legendary teams to conquer mystical realms.*

[🎮 **Play Now**](https://repousiosjim.github.io/Gems-Rush/) • [📖 **Game Guide**](#-how-to-play) • [🛠️ **Technical Docs**](#-technical-details) • [🤝 **Contributing**](#-contributing)

## 📸 Game Preview

<!-- Add screenshots here when you have them -->
```
🎯 Normal Mode    ⏱️ Time Attack    📅 Daily Quest    ⚔️ Divine Conquest
     ┌─────┐         ┌─────┐          ┌─────┐           ┌─────┐
     │ 🔥💧 │         │ ⚡🌿 │          │ 🌍🔮 │           │ 🏰👑 │
     │ 🌍⚡ │         │ 🔥💧 │          │ ⚡🌿 │           │ ⭐🗡️ │
     │ 🔮🌿 │         │ 🌍🔮 │          │ 🔥💧 │           │ 🛡️💎 │
     └─────┘         └─────┘          └─────┘           └─────┘
```

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🎮 **Game Modes**
- 🎯 **Normal Mode** - Classic strategic gameplay
- ⏱️ **Time Attack** - Fast-paced 60-second battles  
- 📅 **Daily Quest** - Special themed challenges
- ⚔️ **Divine Conquest** - Epic campaign with 7 realms

### 💎 **Divine Gem System**
- 🔥 **Fire** - Sacred flames of purification
- 💧 **Water** - Healing waters of life
- 🌍 **Earth** - Eternal foundation stone
- 💨 **Air** - Celestial winds of freedom

</td>
<td width="50%">

### 🌟 **Advanced Features**
- ⚡ **Rush System** - Cascade multipliers
- 🏆 **Achievement System** - Unlock rewards
- 📊 **Statistics Tracking** - Monitor progress
- ⚙️ **Customizable Settings** - Tailor your experience

### 🔮 **More Divine Powers**
- ⚡ **Lightning** - Pure divine energy
- 🌿 **Nature** - Life force of creation  
- 🔮 **Magic** - Infinite mystical potential

</td>
</tr>
</table>

## 🎯 How to Play

### Basic Rules
1. **🔄 Swap Adjacent Gems** - Create matches of 3+ identical divine powers
2. **🎯 Reach Target Scores** - Advance through divine realms
3. **💎 Create Bigger Matches** - Earn higher scores and divine multipliers
4. **⚡ Chain Reactions** - Watch cascades create more celestial matches

### Controls
- 🖱️ **Click to Select** - Choose your divine gem
- 🔄 **Click to Swap** - Unite adjacent divine powers
- 📱 **Swipe Gestures** - Touch-friendly controls
- ⌨️ **Keyboard Shortcuts** - `R` to restart, `H` for hints


### Technology Stack
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)  
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Web APIs](https://img.shields.io/badge/Web_APIs-FF6B35?style=flat-square)

## 🚀 Quick Start

### Option 1: Play Online (Recommended)
Just click the **[🎮 Play Now](https://repousiosjim.github.io/Gems-Rush/)** button above!

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/repousiosjim/Gems-Rush.git
cd Gems-Rush

# Serve with any HTTP server (required for ES6 modules)
python -m http.server 8000
# OR
npx http-server
# OR use VS Code Live Server extension

# Open http://localhost:8000
```

> ⚠️ **Important**: Must be served via HTTP server due to ES6 module CORS requirements

## 📱 Device Support

| Device Type | Screen Size | Status |
|-------------|-------------|--------|
| 🖥️ **Desktop** | 1200px+ | ✅ Optimized |
| 💻 **Laptop** | 768px+ | ✅ Fully Supported |
| 📱 **Mobile** | 320px+ | ✅ Touch Controls |
| 📟 **Tablet** | 768px+ | ✅ Perfect Fit |

## 🎨 Customization

### Settings Available
- 🔊 **Audio Controls** - Master volume, sound effects, background music
- 👁️ **Visual Options** - Animations, particle effects, themes, high contrast
- 🎮 **Gameplay** - Difficulty levels, hints, auto-save
- 📱 **Display** - Board size, fullscreen, statistics panel

### Themes
- 🌌 **Space** (Default) - Cosmic divine atmosphere
- 🌲 **Forest** - Natural woodland setting  
- 🌊 **Ocean** - Underwater mystical realm
- 🔥 **Fire** - Volcanic divine temple

## 🏆 Achievements System

Track your divine mastery with comprehensive achievements:

- 🔥 **First Divine Match** - Begin your journey
- 💫 **Divine Mastery** - Create 5+ gem matches
- ✨ **Perfect Harmony** - Complete level without mistakes
- ⚡ **Lightning Speed** - Finish in under 30 seconds
- 🌊 **Cascade Master** - Achieve 5x multiplier
- 💎 **Divine Collector** - Match every gem type
- 🔥 **Streak Champion** - 10-move winning streak
- 🏆 **Score Master** - Reach 100,000 points

## 🤝 Contributing

We welcome contributions to make Gems Rush even more divine! 

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Test your changes thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🎮 **Game Design**: Inspired by classic Match-3 mechanics with divine twist
- 🎨 **Visual Design**: Modern glassmorphism with divine aesthetics  
- 🔧 **Architecture**: Built with modern ES6 modules for performance
- ♿ **Accessibility**: Inclusive design for all players
- 🌟 **Community**: Thanks to all testers and contributors!

<div align="center">

### ⚡ Ready to Master Divine Powers? ⚡

[![Play Now](https://img.shields.io/badge/🎮_PLAY_NOW-brightgreen?style=for-the-badge&labelColor=darkgreen)](https://repousiosjim.github.io/Gems-Rush/)

**Made with 💎 for divine gaming experiences**

[⬆️ Back to Top](#-gems-rush-divine-teams-)

</div> 