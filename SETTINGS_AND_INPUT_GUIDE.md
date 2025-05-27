# Settings & Advanced Input Systems - Development Guide

## 🏗️ **System Architecture**

### **Core Components**
```
src/
├── features/
│   ├── settings-system.js      # Core settings management
│   └── advanced-input-system.js # Advanced input handling
├── ui/
│   ├── settings-ui.js          # Settings interface
│   └── settings.css            # Settings styling
└── index.js                    # Module exports
```

### **Key Features Implemented**
- ⚙️ **Comprehensive Settings System** with persistent storage
- 🔊 **Audio Settings** - Master volume, sound effects, background music
- 👁️ **Visual Settings** - Animations, particle effects, quality modes
- 🎮 **Gameplay Settings** - Difficulty levels, hints, auto-save
- 🎨 **Theme System** - Multiple board themes with lazy loading
- ♿ **Accessibility Features** - Reduced motion, high contrast, keyboard support
- 📱 **Advanced Input System** - Touch gestures, keyboard shortcuts, mouse enhancement
- 🌐 **Mobile Optimization** - Touch-friendly interface and responsive design

---

## 🚀 **Quick Start Implementation**

### **1. Initialize Systems**
```javascript
// In your main game initialization
import { 
    settingsSystem, 
    advancedInputSystem, 
    settingsUI 
} from './src/index.js';

// Systems auto-initialize, but you can check status
console.log('Settings ready:', settingsSystem.isInitialized);
console.log('Input ready:', advancedInputSystem.isInitialized);
```

### **2. Open Settings UI**
```javascript
// Open settings modal
settingsUI.openSettings();

// Open specific tab
settingsUI.openSettings('visual');

// Or emit event
eventManager.emit('ui:open-settings');
```

### **3. Access Settings**
```javascript
import { getSetting, setSetting } from './src/index.js';

// Get settings
const masterVolume = getSetting('audio.masterVolume');
const isHighContrast = getSetting('visual.highContrast');

// Set settings
await setSetting('audio.masterVolume', 0.8);
await setSetting('theme.current', 'forest');
```

---

## ⚙️ **Settings System Usage**

### **Available Settings Categories**

#### **🔊 Audio Settings**
```javascript
// Volume controls (0-1)
getSetting('audio.masterVolume')
getSetting('audio.sfxVolume')
getSetting('audio.musicVolume')

// Toggle controls
getSetting('audio.muted')
getSetting('audio.sfxEnabled')
getSetting('audio.musicEnabled')
```

#### **👁️ Visual Settings**
```javascript
// Quality and performance
getSetting('visual.quality')          // 'low'|'medium'|'high'
getSetting('visual.targetFPS')        // 30|60
getSetting('visual.hardwareAcceleration')

// Visual effects
getSetting('visual.animationsEnabled')
getSetting('visual.particleEffects')
getSetting('visual.highContrast')
getSetting('visual.reducedMotion')
```

#### **🎮 Gameplay Settings**
```javascript
// Game mechanics
getSetting('gameplay.difficulty')     // 'easy'|'normal'|'hard'
getSetting('gameplay.hintsEnabled')
getSetting('gameplay.autoSave')
getSetting('gameplay.swapSpeed')      // 0.5-2.0
```

#### **🎨 Theme Settings**
```javascript
// Theme selection
getSetting('theme.current')          // 'space'|'forest'|'ocean'|'fire'|'celestial'
getSetting('theme.darkMode')
```

#### **♿ Accessibility Settings**
```javascript
// Accessibility features
getSetting('accessibility.reducedMotion')
getSetting('accessibility.highContrast')
getSetting('accessibility.largeText')
getSetting('accessibility.colorBlindFriendly')
getSetting('accessibility.focusIndicators')
```

### **Batch Updates**
```javascript
import { updateSettings } from './src/index.js';

// Update multiple settings at once
await updateSettings({
    'audio.masterVolume': 0.7,
    'visual.quality': 'medium',
    'accessibility.reducedMotion': true
});
```

### **Listen for Settings Changes**
```javascript
import { eventManager } from './src/utils/event-manager.js';

// Listen for specific setting changes
settingsSystem.onSettingChange('audio.masterVolume', (newValue, oldValue) => {
    console.log(`Volume changed from ${oldValue} to ${newValue}`);
});

// Listen for all setting changes
eventManager.on('settings:changed', ({ path, newValue, oldValue }) => {
    console.log(`Setting ${path} changed from ${oldValue} to ${newValue}`);
});
```

---

## 📱 **Advanced Input System Usage**

### **Device Detection**
```javascript
import { isTouch, isMobile, getInputState } from './src/index.js';

// Quick checks
if (isTouch()) {
    console.log('Touch device detected');
}

if (isMobile()) {
    console.log('Mobile device detected');
}

// Detailed device info
const inputState = getInputState();
console.log('Device capabilities:', inputState);
```

### **Touch Gesture Handling**
```javascript
import { eventManager } from './src/utils/event-manager.js';

// Listen for gestures
eventManager.on('input:gesture:tap', (gesture) => {
    console.log('Tap detected at:', gesture.data.startX, gesture.data.startY);
});

eventManager.on('input:gesture:swipe', (gesture) => {
    console.log('Swipe direction:', gesture.data.direction);
    console.log('Swipe distance:', gesture.data.distance);
});

eventManager.on('input:gesture:long-press', (gesture) => {
    console.log('Long press detected');
});

eventManager.on('input:gesture:pinch', (gesture) => {
    console.log('Pinch scale:', gesture.data.scale);
    console.log('Pinch direction:', gesture.data.direction); // 'in' or 'out'
});
```

### **Keyboard Shortcuts**
```javascript
// Built-in keyboard shortcuts are automatically handled:
// - Arrow keys / WASD: Movement
// - Enter: Confirm
// - Escape: Cancel
// - R: Restart
// - H: Hint
// - P: Pause
// - M: Mute
// - Alt+H: High contrast
// - Alt+R: Reduced motion

// Listen for key actions
eventManager.on('input:key-action', ({ action, key }) => {
    switch (action) {
        case 'restart':
            restartGame();
            break;
        case 'hint':
            showHint();
            break;
        case 'pause':
            togglePause();
            break;
    }
});
```

### **Mouse Enhancement**
```javascript
// Enhanced mouse events with trails and acceleration
eventManager.on('input:mouse-down', ({ x, y, button }) => {
    console.log(`Mouse down at ${x}, ${y} with button ${button}`);
});

eventManager.on('input:mouse-wheel', ({ direction, intensity }) => {
    if (direction === 'up') {
        zoomIn(intensity);
    } else {
        zoomOut(intensity);
    }
});
```

---

## 🎨 **Theme System Implementation**

### **Adding New Themes**
```javascript
// 1. Add theme to available list in settings-system.js
theme: {
    current: 'space',
    available: ['space', 'forest', 'ocean', 'fire', 'celestial', 'your-theme'],
    // ...
}

// 2. Add CSS classes in your stylesheet
.theme-your-theme {
    /* Theme-specific styles */
}

.theme-preview-your-theme {
    background: linear-gradient(135deg, #color1, #color2, #color3);
}

// 3. Add theme name mapping in settings-ui.js
getThemeName(themeId) {
    const names = {
        // ...existing themes
        'your-theme': '🌟 Your Theme'
    };
    return names[themeId] || themeId;
}
```

### **Theme Change Events**
```javascript
eventManager.on('theme:changed', (themeName) => {
    console.log(`Theme changed to: ${themeName}`);
    // Apply theme-specific logic
    updateBoardColors(themeName);
    updateParticleEffects(themeName);
});
```

---

## ♿ **Accessibility Implementation**

### **Automatic System Preferences**
The system automatically detects and respects:
- `prefers-reduced-motion: reduce`
- `prefers-color-scheme: dark`

### **Accessibility CSS Classes**
```css
/* Applied automatically based on settings */
.reduced-motion * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
}

.high-contrast {
    filter: contrast(150%);
}

.large-text {
    font-size: 120%;
}

.colorblind-friendly {
    /* Colorblind-friendly color adjustments */
}

.focus-indicators :focus {
    outline: 3px solid #ffff00 !important;
}
```

### **Screen Reader Support**
```html
<!-- Automatic ARIA attributes -->
<div role="tablist" aria-label="Settings Categories">
    <button role="tab" aria-selected="true" aria-controls="panel-audio">
        Audio Settings
    </button>
</div>

<div role="tabpanel" id="panel-audio" aria-labelledby="tab-audio">
    <!-- Settings content -->
</div>
```

---

## 🚀 **Performance Optimizations**

### **Hardware Acceleration**
```javascript
// Automatically applied when enabled
if (getSetting('visual.hardwareAcceleration')) {
    // GPU acceleration applied to:
    // - Game board
    // - Animations
    // - Particle effects
}
```

### **Event Throttling**
```javascript
// Mouse move events are throttled using requestAnimationFrame
// Touch events use performance.mark() for profiling
// Settings saves are debounced (500ms)
```

### **Memory Management**
```javascript
// Automatic cleanup on modal close
// Event listener removal
// Cache clearing
// Gesture data cleanup
```

---

## 📱 **Mobile Optimization**

### **Automatic Mobile Detection**
```javascript
// Automatically applies mobile-specific settings:
// - Reduced particle effects
// - Medium quality graphics
// - Touch gesture enablement
// - Haptic feedback activation

eventManager.on('device:mobile-detected', () => {
    console.log('Mobile optimizations applied');
});
```

### **Touch-Friendly Interface**
- Larger touch targets (min 44px)
- Proper touch feedback
- Swipe gesture support
- Haptic feedback (if available)
- Responsive breakpoints

### **Performance Mode**
```javascript
// Enable high-performance mode for better frame rates
eventManager.on('game:performance-warning', () => {
    // Automatically suggests:
    // - Lower quality settings
    // - Disabled particle effects
    // - 30fps target
});
```

---

## 🔧 **Integration Examples**

### **Game Engine Integration**
```javascript
// In your game initialization
import { settingsSystem, eventManager } from './src/index.js';

class GameEngine {
    async initialize() {
        // Wait for settings to load
        await settingsSystem.initialize();
        
        // Apply initial settings
        this.applyVisualSettings();
        this.applyAudioSettings();
        
        // Listen for setting changes
        eventManager.on('settings:changed', (change) => {
            this.handleSettingChange(change);
        });
    }
    
    handleSettingChange({ path, newValue }) {
        if (path.startsWith('visual.')) {
            this.applyVisualSettings();
        } else if (path.startsWith('audio.')) {
            this.applyAudioSettings();
        }
    }
    
    applyVisualSettings() {
        const quality = getSetting('visual.quality');
        const animations = getSetting('visual.animationsEnabled');
        
        this.renderer.setQuality(quality);
        this.renderer.setAnimations(animations);
    }
}
```

### **Audio System Integration**
```javascript
// In your audio system
import { eventManager, getSetting } from './src/index.js';

class AudioSystem {
    initialize() {
        eventManager.on('audio:volume-change', ({ master, sfx, music }) => {
            if (master !== undefined) this.setMasterVolume(master);
            if (sfx !== undefined) this.setSfxVolume(sfx);
            if (music !== undefined) this.setMusicVolume(music);
        });
        
        eventManager.on('audio:mute', (muted) => {
            this.setMuted(muted);
        });
    }
    
    playSound(soundId) {
        if (!getSetting('audio.sfxEnabled')) return;
        
        const volume = getSetting('audio.sfxVolume') * getSetting('audio.masterVolume');
        this.playSoundWithVolume(soundId, volume);
    }
}
```

---

## 🐛 **Debugging & Development**

### **Settings Summary**
```javascript
// Get current settings summary
console.log(settingsSystem.getSettingsSummary());
// Output:
// {
//   audio: "Master: 80%, Muted: false",
//   visual: "Quality: high, Animations: true",
//   theme: "space",
//   accessibility: "Reduced Motion: false",
//   performance: "FPS Target: 60, Hardware Accel: true"
// }
```

### **Input State Debugging**
```javascript
// Get input system summary
console.log(advancedInputSystem.getInputSummary());
// Output:
// {
//   device: "Desktop",
//   capabilities: "Touch: false, Hover: true",
//   activeInputs: "Keys: 0, Touches: 0",
//   settings: "Gestures: true, Shortcuts: true"
// }
```

### **Performance Monitoring**
```javascript
// Monitor setting application performance
performance.mark('settings-start');
await settingsSystem.applyAllSettings();
performance.mark('settings-end');
performance.measure('settings-duration', 'settings-start', 'settings-end');
```

---

## 📝 **Best Practices**

### **Settings Management**
1. **Always use async/await** when setting values
2. **Batch updates** when changing multiple settings
3. **Listen for changes** instead of polling
4. **Validate inputs** before applying
5. **Provide fallbacks** for failed operations

### **Input Handling**
1. **Use passive listeners** where possible
2. **Throttle high-frequency events** (mouse move, touch move)
3. **Clean up event listeners** when not needed
4. **Test on multiple devices** and input methods
5. **Respect user preferences** (reduced motion, etc.)

### **Accessibility**
1. **Test with keyboard only** navigation
2. **Use screen readers** for testing
3. **Provide adequate focus indicators**
4. **Ensure sufficient color contrast**
5. **Support system preferences**

### **Performance**
1. **Enable hardware acceleration** when appropriate
2. **Monitor frame rates** and adjust accordingly
3. **Use CSS transforms** instead of position changes
4. **Debounce expensive operations**
5. **Clean up resources** when done

---

## 🔄 **Migration & Updates**

### **Updating from Previous Versions**
```javascript
// Settings are automatically merged with defaults
// New settings will be added with default values
// Existing settings are preserved

// Manual migration if needed
if (settingsVersion < 2.0) {
    await settingsSystem.set('newSetting', defaultValue);
}
```

### **Adding New Settings**
1. Add to `getDefaultSettings()` in settings-system.js
2. Add UI controls in settings-ui.js
3. Add validation in `validateSetting()`
4. Add application logic in `applySetting()`
5. Update CSS if needed

---

This comprehensive settings and input system provides a solid foundation for creating accessible, performant, and user-friendly game interfaces. The modular design allows for easy extension and customization while maintaining consistency and best practices. 