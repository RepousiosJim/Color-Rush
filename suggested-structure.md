# Recommended Module Structure for Gems Rush: Divine Teams

## **Core Architecture (10 modules)**

```
src/
├── core/
│   ├── game-engine.js      # Game initialization, board creation, main game loop
│   ├── game-state.js       # Score, level, moves, state management
│   └── gem-system.js       # Gem creation, matching logic, power-ups
├── ui/
│   ├── menu-system.js      # Main menu, navigation, mode selection
│   ├── interface.js        # UI updates, displays, notifications
│   └── modals.js          # Settings, credits, game info modals
├── modes/
│   ├── game-modes.js       # Normal, time attack, daily challenge modes
│   └── campaign.js         # Divine conquest campaign system
├── features/
│   ├── audio-system.js     # Web Audio API, sound management
│   ├── input-handler.js    # Touch/swipe, keyboard, mouse events
│   ├── achievements.js     # Achievement system, unlocks
│   └── settings.js         # Settings persistence, configuration
└── utils/
    ├── storage.js          # localStorage, save/load functions
    └── helpers.js          # Utility functions, polyfills
```

## **Module Dependencies (Import/Export Strategy)**

### **Core Modules**
```javascript
// game-engine.js - Main entry point
import { GameState } from './game-state.js';
import { GemSystem } from './gem-system.js';
import { UIInterface } from '../ui/interface.js';
import { AudioSystem } from '../features/audio-system.js';

export class GameEngine {
    // Core game functionality
}
```

### **Lazy-Loaded Modules**
```javascript
// Dynamic imports for non-essential features
const loadCampaign = () => import('./modes/campaign.js');
const loadAchievements = () => import('./features/achievements.js');
const loadSettings = () => import('./features/settings.js');
```

## **Loading Strategy**

### **Critical Path (Load First)**
1. `game-engine.js`
2. `game-state.js` 
3. `gem-system.js`
4. `menu-system.js`
5. `interface.js`

### **Lazy Load (On Demand)**
1. `campaign.js` - When entering campaign mode
2. `achievements.js` - When needed
3. `settings.js` - When settings opened
4. `audio-system.js` - After user interaction

### **Preload (Background)**
1. `input-handler.js` - After game loads
2. `modals.js` - After menu shows

## **Performance Targets**

- **Initial Bundle**: ~50-80KB (critical path only)
- **Total Application**: ~150-200KB (all modules)
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <2.5s 