# 🎪 Animation Queue System

A comprehensive animation system for the Gems Rush match-3 game, providing smooth, sequential effect processing with React integration.

## Features

✨ **Sequential & Parallel Processing** - Handle both sequential and simultaneous animations  
🎯 **Promise-based API** - Clean async/await syntax with proper error handling  
⚡ **Performance Optimized** - RequestAnimationFrame-based with efficient processing  
🎨 **Multiple Animation Types** - CSS transitions, transforms, and custom animations  
📱 **React Integration** - Custom hooks with proper cleanup  
🎬 **Timeline Support** - Complex animation sequences with precise timing  
🎮 **Game-specific Helpers** - Pre-built animations for match-3 mechanics  

## Architecture

```
AnimationQueue (Core)
├── Animation Processing Engine
├── Event System
├── Timeline Management
└── Queue Control

GameAnimations (Game-specific)
├── Match Animations
├── Cascade Effects
├── Power-up Activations
└── Hint System

React Hooks (Integration)
├── useAnimations
├── useAnimationEvents
└── useAnimationQueue
```

## Usage Examples

### Basic Animation

```typescript
import { animationQueue } from '@/lib/effects/AnimationQueue'

// Simple CSS animation
await animationQueue.add({
  id: 'gem_highlight',
  element: document.querySelector('.gem'),
  type: 'css',
  config: {
    duration: 300,
    easing: 'ease-out'
  },
  properties: {
    'transform': 'scale(1.1)',
    'box-shadow': '0 0 20px rgba(255, 255, 255, 0.8)'
  }
})
```

### Transform Animation

```typescript
// Transform-based animation with custom function
await animationQueue.add({
  id: 'gem_rotate',
  element: gemElement,
  type: 'transform',
  config: {
    duration: 500,
    easing: 'ease-back'
  },
  properties: {
    rotate: 360,      // degrees
    scale: 1.2,       // scale factor
    translateY: -50   // pixels
  }
})
```

### Custom Animation

```typescript
// Custom animation with full control
await animationQueue.add({
  id: 'custom_effect',
  element: gemElement,
  type: 'custom',
  config: {
    duration: 800,
    easing: 'ease-bounce',
    onStart: () => console.log('Animation started'),
    onUpdate: (progress) => console.log(`Progress: ${progress}`),
    onComplete: () => console.log('Animation completed')
  },
  customFunction: (progress, element) => {
    const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.1
    const rotation = progress * 720
    const opacity = 1 - progress * 0.5
    
    element.style.transform = `scale(${scale}) rotate(${rotation}deg)`
    element.style.opacity = opacity.toString()
  }
})
```

### Parallel Animations

```typescript
import { ParallelAnimationGroup } from '@/lib/effects/AnimationQueue'

const group: ParallelAnimationGroup = {
  id: 'multi_gem_effect',
  animations: [
    {
      id: 'gem1_anim',
      element: gem1Element,
      type: 'css',
      config: { duration: 400 },
      properties: { 'transform': 'scale(0)' }
    },
    {
      id: 'gem2_anim', 
      element: gem2Element,
      type: 'css',
      config: { duration: 400, delay: 100 },
      properties: { 'transform': 'scale(0)' }
    }
  ]
}

await animationQueue.addParallel(group)
```

### Sequential Animations

```typescript
const animations = [
  {
    id: 'phase1',
    element: gemElement,
    type: 'css',
    config: { duration: 200 },
    properties: { 'transform': 'scale(1.2)' }
  },
  {
    id: 'phase2', 
    element: gemElement,
    type: 'css',
    config: { duration: 300 },
    properties: { 'transform': 'scale(0)', 'opacity': '0' }
  }
]

await animationQueue.addSequence(animations, 'gem_disappear')
```

## React Integration

### Using the Animations Hook

```typescript
import { useAnimations } from '@/lib/effects/useAnimations'

const GameBoard = () => {
  const {
    animateMatches,
    animateCascade,
    pauseAnimations,
    resumeAnimations,
    onAnimationComplete
  } = useAnimations()

  // Handle match animation
  const handleMatches = async (matches) => {
    try {
      await animateMatches(matches, 0) // 0 = no cascade
      // Matches animation completed
      processNextStep()
    } catch (error) {
      console.error('Animation failed:', error)
    }
  }

  // Listen for animation events
  useEffect(() => {
    const cleanup = onAnimationComplete((data) => {
      console.log('Animation completed:', data.animation.id)
    })
    
    return cleanup // Automatic cleanup
  }, [onAnimationComplete])

  return (
    <div className="game-board">
      <button onClick={() => pauseAnimations()}>Pause</button>
      <button onClick={() => resumeAnimations()}>Resume</button>
      {/* Game content */}
    </div>
  )
}
```

### Game-Specific Animations

```typescript
import { gameAnimations, MatchGroup, CascadeAnimation } from '@/lib/effects/GameAnimations'

// Animate gem matches
const matches: MatchGroup[] = [
  {
    gems: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    type: 'fire',
    score: 150
  }
]

await gameAnimations.animateMatches(matches, 1) // Cascade level 1

// Animate cascade effect
const cascade: CascadeAnimation = {
  level: 2,
  matches: matches,
  totalScore: 500
}

await gameAnimations.animateCascade(cascade)

// Power-up activation
const powerUp: PowerUpEffect = {
  type: 'bomb',
  position: { row: 3, col: 3 },
  affectedGems: [
    { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 },
    { row: 3, col: 2 }, { row: 3, col: 4 },
    { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }
  ],
  score: 800
}

await gameAnimations.animatePowerUpActivation(powerUp)

// Show hint
await gameAnimations.showHint([
  { row: 1, col: 1 },
  { row: 1, col: 2 }
])
```

### Animation Queue Monitoring

```typescript
import { useAnimationQueue } from '@/lib/effects/useAnimations'

const DebugPanel = () => {
  const status = useAnimationQueue()

  return (
    <div className="debug-panel">
      <h3>Animation Queue Status</h3>
      <div>Queue Length: {status.queueLength}</div>
      <div>Parallel Groups: {status.parallelGroups}</div>
      <div>Active Animations: {status.activeAnimations}</div>
      <div>Timelines: {status.timelines}</div>
      <div>Processing: {status.isProcessing ? 'Yes' : 'No'}</div>
    </div>
  )
}
```

## Timeline System

```typescript
import { animationQueue } from '@/lib/effects/AnimationQueue'

// Create complex timeline
const timeline = animationQueue.createTimeline('match_sequence', [
  {
    id: 'highlight',
    element: gem1,
    type: 'css',
    config: { duration: 200, delay: 0 },
    properties: { 'filter': 'brightness(1.5)' }
  },
  {
    id: 'disappear',
    element: gem1,
    type: 'css', 
    config: { duration: 400, delay: 200 },
    properties: { 'transform': 'scale(0)', 'opacity': '0' }
  },
  {
    id: 'score_popup',
    element: scoreElement,
    type: 'custom',
    config: { duration: 600, delay: 300 },
    customFunction: (progress, el) => {
      el.style.transform = `translateY(${-progress * 50}px)`
      el.style.opacity = (1 - progress).toString()
    }
  }
])

// Play timeline
await animationQueue.playTimeline('match_sequence')
```

## Event System

```typescript
import { useAnimationEvents } from '@/lib/effects/useAnimations'

const GameComponent = () => {
  const { addEventListener } = useAnimationEvents()

  useEffect(() => {
    // Listen for specific events
    const cleanup1 = addEventListener('animation:completed', (data) => {
      if (data.animation.id.startsWith('match_')) {
        handleMatchComplete(data)
      }
    })

    const cleanup2 = addEventListener('queue:completed', () => {
      console.log('All animations finished')
      enableUserInput()
    })

    const cleanup3 = addEventListener('animation:error', (data) => {
      console.error('Animation error:', data.error)
    })

    // Custom game events
    const gameEventCleanup = (event) => {
      console.log('Match animation complete:', event.detail)
    }
    
    document.addEventListener('gems:match-complete', gameEventCleanup)

    return () => {
      cleanup1()
      cleanup2() 
      cleanup3()
      document.removeEventListener('gems:match-complete', gameEventCleanup)
    }
  }, [addEventListener])
}
```

## Performance Optimization

### Easing Functions

```typescript
// Available easing options
const easingTypes = [
  'ease-in',        // Quadratic ease in
  'ease-out',       // Quadratic ease out  
  'ease-in-out',    // Quadratic ease in-out
  'ease-back',      // Back ease with overshoot
  'ease-bounce'     // Bounce effect
]

// Custom easing can be added by extending the applyEasing method
```

### Performance Tips

1. **Batch Operations**: Use parallel groups for simultaneous animations
2. **Cleanup**: Always provide cleanup functions for DOM modifications
3. **RAF Optimization**: The system uses requestAnimationFrame for smooth 60fps
4. **Memory Management**: Automatic cleanup prevents memory leaks
5. **Error Handling**: Graceful degradation when animations fail

## CSS Integration

The system works with CSS classes and properties:

```css
/* Game-specific animation classes */
.gem {
  transition-property: transform, opacity, filter;
  transition-timing-function: ease-out;
}

.gem.matched {
  animation: gemMatch 0.4s ease-out forwards;
}

.floating-score {
  position: absolute;
  pointer-events: none;
  font-weight: bold;
  color: #00FF00;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}

.cascade-indicator {
  position: fixed;
  font-size: 2rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  z-index: 1000;
}

/* Keyframe animations */
@keyframes gemMatch {
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.2); filter: brightness(1.5); }
  100% { transform: scale(0); filter: brightness(2); opacity: 0; }
}

@keyframes cascadeIndicator {
  0% { opacity: 0; transform: scale(0.5); }
  20% { opacity: 1; transform: scale(1.2); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.8); }
}
```

## Best Practices

### 1. Animation Naming
```typescript
// Use descriptive, hierarchical IDs
const animationId = `match_${matchType}_${gemIndex}_${timestamp}`
const groupId = `cascade_level_${level}_${timestamp}`
```

### 2. Error Handling
```typescript
try {
  await animationQueue.add(animation)
  // Handle success
} catch (error) {
  console.error('Animation failed:', error)
  // Provide fallback or retry logic
}
```

### 3. Cleanup
```typescript
// Always provide cleanup for DOM modifications
{
  id: 'temp_effect',
  element: element,
  type: 'custom',
  config: { duration: 500 },
  customFunction: (progress, el) => {
    // Animation logic
  },
  cleanup: () => {
    // Reset element state
    element.style.transform = ''
    element.style.opacity = ''
  }
}
```

### 4. Performance
```typescript
// Prefer parallel animations for simultaneous effects
const simultaneousEffects = {
  id: 'explosion_group',
  animations: explosionAnimations
}

await animationQueue.addParallel(simultaneousEffects)

// Use sequences for dependent animations
await animationQueue.addSequence([highlight, disappear, cleanup])
```

## Integration with Game Engine

```typescript
// In your game engine or component
import { gameAnimations } from '@/lib/effects/GameAnimations'
import { useAnimations } from '@/lib/effects/useAnimations'

class GameEngine {
  private animations = gameAnimations

  async processMatches(matches) {
    // Disable user input
    this.setUserInputEnabled(false)
    
    try {
      // Animate matches
      await this.animations.animateMatches(matches)
      
      // Remove matched gems from board
      this.removeGemsFromBoard(matches)
      
      // Animate falling gems
      const fallData = this.calculateFalls()
      await this.animations.animateGemFalls(fallData)
      
      // Fill empty spaces
      this.fillBoard()
      
      // Check for cascades
      const newMatches = this.findMatches()
      if (newMatches.length > 0) {
        await this.processMatches(newMatches) // Recursive cascade
      }
    } finally {
      // Re-enable user input
      this.setUserInputEnabled(true)
    }
  }
}
```

This animation system provides a powerful, flexible foundation for creating smooth, professional-quality animations in your match-3 game while maintaining clean code organization and React best practices. 