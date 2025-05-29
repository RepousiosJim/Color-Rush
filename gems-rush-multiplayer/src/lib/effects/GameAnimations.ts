import { animationQueue, Animation, AnimationConfig, ParallelAnimationGroup } from './AnimationQueue'

export interface GemPosition {
  row: number
  col: number
}

export interface MatchGroup {
  gems: GemPosition[]
  type: string
  score: number
}

export interface CascadeAnimation {
  level: number
  matches: MatchGroup[]
  totalScore: number
}

export interface PowerUpEffect {
  type: 'bomb' | 'lightning' | 'rainbow' | 'clear'
  position: GemPosition
  affectedGems: GemPosition[]
  score: number
}

export class GameAnimations {
  private readonly STAGGER_DELAY = 50
  private readonly MATCH_DURATION = 400
  private readonly FALL_DURATION = 300
  private readonly POWER_UP_DURATION = 600
  
  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    animationQueue.on('animation:completed', this.handleAnimationComplete.bind(this))
    animationQueue.on('queue:error', this.handleAnimationError.bind(this))
  }

  private handleAnimationComplete(data: any): void {
    // Handle completion events for game-specific logic
    if (data.animation.id.startsWith('match_')) {
      this.onMatchAnimationComplete(data)
    } else if (data.animation.id.startsWith('cascade_')) {
      this.onCascadeAnimationComplete(data)
    }
  }

  private handleAnimationError(data: any): void {
    console.error('Game animation error:', data.error)
  }

  private onMatchAnimationComplete(data: any): void {
    // Emit custom events for game logic
    const event = new CustomEvent('gems:match-complete', {
      detail: { animationId: data.animation.id }
    })
    document.dispatchEvent(event)
  }

  private onCascadeAnimationComplete(data: any): void {
    const event = new CustomEvent('gems:cascade-complete', {
      detail: { animationId: data.animation.id }
    })
    document.dispatchEvent(event)
  }

  // Gem Match Animations
  public async animateMatches(matches: MatchGroup[], cascadeLevel: number = 0): Promise<void> {
    const groupId = `match_group_${Date.now()}`
    const animations: Animation[] = []

    matches.forEach((match, matchIndex) => {
      match.gems.forEach((gem, gemIndex) => {
        const element = document.querySelector(`[data-row="${gem.row}"][data-col="${gem.col}"]`)
        if (!element) return

        const animationId = `match_${groupId}_${matchIndex}_${gemIndex}`
        
        // Phase 1: Highlight
        animations.push({
          id: `${animationId}_highlight`,
          element: element as HTMLElement,
          type: 'css',
          config: {
            duration: 200,
            delay: gemIndex * this.STAGGER_DELAY + matchIndex * 100,
            easing: 'ease-out'
          },
          properties: {
            '--highlight-opacity': '1',
            'transform': `scale(${1.1 + cascadeLevel * 0.1})`,
            'filter': `brightness(${1.5 + cascadeLevel * 0.2})`
          }
        })

        // Phase 2: Break
        animations.push({
          id: `${animationId}_break`,
          element: element as HTMLElement,
          type: 'custom',
          config: {
            duration: this.MATCH_DURATION,
            delay: 300 + gemIndex * this.STAGGER_DELAY + matchIndex * 100,
            easing: cascadeLevel > 0 ? 'ease-bounce' : 'ease-out'
          },
          customFunction: (progress, el) => {
            const scale = 1 - progress * 0.8
            const rotation = progress * 180
            const opacity = 1 - progress
            
            el.style.transform = `scale(${scale}) rotate(${rotation}deg)`
            el.style.opacity = opacity.toString()
            
            if (cascadeLevel > 0) {
              el.style.filter = `hue-rotate(${progress * 360}deg) brightness(${1 + progress})`
            }
          },
          cleanup: () => {
            (element as HTMLElement).style.display = 'none'
          }
        })
      })
    })

    // Add floating score animations
    matches.forEach((match, matchIndex) => {
      if (match.gems.length > 0) {
        const firstGem = match.gems[0]
        this.addFloatingScore(
          match.score,
          firstGem,
          cascadeLevel,
          animations,
          matchIndex * 150
        )
      }
    })

    const group: ParallelAnimationGroup = {
      id: groupId,
      animations
    }

    return animationQueue.addParallel(group)
  }

  // Gem Fall Animations
  public async animateGemFalls(fallData: Array<{
    from: GemPosition
    to: GemPosition
    distance: number
  }>): Promise<void> {
    const animations: Animation[] = []
    const groupId = `fall_group_${Date.now()}`

    fallData.forEach((fall, index) => {
      const element = document.querySelector(`[data-row="${fall.from.row}"][data-col="${fall.from.col}"]`)
      if (!element) return

      const fallDistance = fall.distance * 60 // 60px per row
      const fallDuration = this.FALL_DURATION + (fall.distance * 50) // Longer falls take more time

      animations.push({
        id: `fall_${groupId}_${index}`,
        element: element as HTMLElement,
        type: 'transform',
        config: {
          duration: fallDuration,
          delay: index * 20, // Slight stagger
          easing: 'ease-in'
        },
        properties: {
          translateY: `${fallDistance}px`
        }
      })
    })

    const group: ParallelAnimationGroup = {
      id: groupId,
      animations
    }

    return animationQueue.addParallel(group)
  }

  // Power-Up Activation Animations
  public async animatePowerUpActivation(powerUp: PowerUpEffect): Promise<void> {
    const powerUpElement = document.querySelector(
      `[data-row="${powerUp.position.row}"][data-col="${powerUp.position.col}"]`
    )
    
    if (!powerUpElement) return

    const groupId = `powerup_${powerUp.type}_${Date.now()}`
    const animations: Animation[] = []

    // Power-up activation animation
    animations.push({
      id: `${groupId}_activation`,
      element: powerUpElement as HTMLElement,
      type: 'custom',
      config: {
        duration: this.POWER_UP_DURATION,
        easing: 'ease-out'
      },
      customFunction: (progress, el) => {
        const scale = 1 + progress * 0.5
        const rotation = progress * 360
        const brightness = 1 + progress * 2
        
        el.style.transform = `scale(${scale}) rotate(${rotation}deg)`
        el.style.filter = `brightness(${brightness})`
        
        // Type-specific effects
        switch (powerUp.type) {
          case 'bomb':
            el.style.boxShadow = `0 0 ${progress * 50}px rgba(255, 100, 0, ${progress})`
            break
          case 'lightning':
            el.style.boxShadow = `0 0 ${progress * 40}px rgba(255, 215, 0, ${progress})`
            break
          case 'rainbow':
            el.style.filter += ` hue-rotate(${progress * 360}deg)`
            break
        }
      }
    })

    // Affected gems animation
    powerUp.affectedGems.forEach((gem, index) => {
      const element = document.querySelector(`[data-row="${gem.row}"][data-col="${gem.col}"]`)
      if (!element) return

      animations.push({
        id: `${groupId}_affected_${index}`,
        element: element as HTMLElement,
        type: 'custom',
        config: {
          duration: 300,
          delay: 200 + index * 30,
          easing: 'ease-out'
        },
        customFunction: (progress, el) => {
          const scale = 1 - progress
          const opacity = 1 - progress
          
          el.style.transform = `scale(${scale})`
          el.style.opacity = opacity.toString()
          
          // Power-up specific effects
          if (powerUp.type === 'lightning') {
            el.style.filter = `brightness(${1 + progress * 2})`
          }
        },
        cleanup: () => {
          (element as HTMLElement).style.display = 'none'
        }
      })
    })

    // Add score animation
    this.addFloatingScore(
      powerUp.score,
      powerUp.position,
      0,
      animations,
      this.POWER_UP_DURATION / 2
    )

    const group: ParallelAnimationGroup = {
      id: groupId,
      animations
    }

    return animationQueue.addParallel(group)
  }

  // Cascade Effect Animation
  public async animateCascade(cascade: CascadeAnimation): Promise<void> {
    const cascadePromises: Promise<void>[] = []

    // Show cascade level indicator
    this.showCascadeIndicator(cascade.level)

    // Animate matches with cascade multiplier
    cascadePromises.push(this.animateMatches(cascade.matches, cascade.level))

    // Add screen effect for higher cascades
    if (cascade.level > 2) {
      cascadePromises.push(this.addScreenShakeEffect(cascade.level))
    }

    // Show total score with cascade bonus
    setTimeout(() => {
      this.showCascadeScore(cascade.totalScore, cascade.level)
    }, 500)

    return Promise.all(cascadePromises).then(() => {})
  }

  // Special Effects
  private async addScreenShakeEffect(intensity: number): Promise<void> {
    const gameBoard = document.querySelector('.game-board')
    if (!gameBoard) return

    return animationQueue.add({
      id: `screen_shake_${Date.now()}`,
      element: gameBoard as HTMLElement,
      type: 'custom',
      config: {
        duration: 300,
        easing: 'ease-out'
      },
      customFunction: (progress, el) => {
        const shakeIntensity = intensity * 2 * (1 - progress)
        const x = (Math.random() - 0.5) * shakeIntensity
        const y = (Math.random() - 0.5) * shakeIntensity
        
        el.style.transform = `translate(${x}px, ${y}px)`
      },
      cleanup: () => {
        (gameBoard as HTMLElement).style.transform = ''
      }
    })
  }

  private showCascadeIndicator(level: number): void {
    const indicator = document.createElement('div')
    indicator.className = 'cascade-indicator'
    indicator.textContent = `CASCADE x${level}`
    indicator.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 2rem;
      font-weight: bold;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
      pointer-events: none;
      animation: cascadeIndicator 1s ease-out forwards;
    `

    document.body.appendChild(indicator)

    // Add CSS animation keyframes if not exists
    if (!document.getElementById('cascadeIndicatorStyles')) {
      const style = document.createElement('style')
      style.id = 'cascadeIndicatorStyles'
      style.textContent = `
        @keyframes cascadeIndicator {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
          }
          80% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(0.8);
          }
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator)
      }
    }, 1000)
  }

  private showCascadeScore(score: number, level: number): void {
    const scoreElement = document.createElement('div')
    scoreElement.className = 'cascade-score'
    scoreElement.innerHTML = `
      <div class="score-value">+${score.toLocaleString()}</div>
      <div class="cascade-bonus">Cascade Bonus x${level}</div>
    `
    scoreElement.style.cssText = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: #FFD700;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      animation: cascadeScore 2s ease-out forwards;
    `

    document.body.appendChild(scoreElement)

    // Add CSS if not exists
    if (!document.getElementById('cascadeScoreStyles')) {
      const style = document.createElement('style')
      style.id = 'cascadeScoreStyles'
      style.textContent = `
        @keyframes cascadeScore {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1.1);
          }
          80% {
            opacity: 1;
            transform: translateX(-50%) translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px) scale(0.9);
          }
        }
        .cascade-score .score-value {
          font-size: 2.5rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        .cascade-score .cascade-bonus {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 4px;
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      if (scoreElement.parentNode) {
        scoreElement.parentNode.removeChild(scoreElement)
      }
    }, 2000)
  }

  private addFloatingScore(
    score: number,
    position: GemPosition,
    cascadeLevel: number,
    animations: Animation[],
    delay: number
  ): void {
    const element = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`)
    if (!element) return

    const scoreElement = document.createElement('div')
    let scoreText = `+${score.toLocaleString()}`
    if (cascadeLevel > 0) {
      scoreText += ` (x${cascadeLevel + 1})`
    }
    
    scoreElement.textContent = scoreText
    scoreElement.className = 'floating-score'
    scoreElement.style.cssText = `
      position: absolute;
      pointer-events: none;
      font-weight: bold;
      font-size: ${1 + cascadeLevel * 0.2}rem;
      color: ${cascadeLevel > 0 ? '#FFD700' : '#00FF00'};
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
    `

    const rect = element.getBoundingClientRect()
    scoreElement.style.left = rect.left + window.scrollX + rect.width / 2 + 'px'
    scoreElement.style.top = rect.top + window.scrollY + 'px'

    document.body.appendChild(scoreElement)

    animations.push({
      id: `floating_score_${Date.now()}`,
      element: scoreElement,
      type: 'custom',
      config: {
        duration: 1000 + cascadeLevel * 200,
        delay,
        easing: 'ease-out'
      },
      customFunction: (progress, el) => {
        const y = -60 * progress
        const opacity = 1 - progress
        const scale = 1 + progress * 0.2
        
        el.style.transform = `translateY(${y}px) scale(${scale})`
        el.style.opacity = opacity.toString()
      },
      cleanup: () => {
        if (scoreElement.parentNode) {
          scoreElement.parentNode.removeChild(scoreElement)
        }
      }
    })
  }

  // Hint System Animations
  public async showHint(positions: GemPosition[]): Promise<void> {
    const animations: Animation[] = []
    const groupId = `hint_${Date.now()}`

    positions.forEach((position, index) => {
      const element = document.querySelector(`[data-row="${position.row}"][data-col="${position.col}"]`)
      if (!element) return

      animations.push({
        id: `${groupId}_${index}`,
        element: element as HTMLElement,
        type: 'css',
        config: {
          duration: 1000,
          delay: index * 100,
          loop: 3,
          yoyo: true,
          easing: 'ease-in-out'
        },
        properties: {
          'box-shadow': '0 0 20px rgba(255, 255, 255, 0.8)',
          'transform': 'scale(1.05)'
        }
      })
    })

    const group: ParallelAnimationGroup = {
      id: groupId,
      animations
    }

    return animationQueue.addParallel(group)
  }

  // Cleanup and Control
  public pauseAnimations(): void {
    animationQueue.pause()
  }

  public resumeAnimations(): void {
    animationQueue.resume()
  }

  public clearAnimations(): void {
    animationQueue.clear()
    
    // Clean up any remaining DOM elements
    document.querySelectorAll('.floating-score, .cascade-indicator, .cascade-score').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
  }

  public getAnimationStatus() {
    return animationQueue.getQueueStatus()
  }

  public cleanup(): void {
    this.clearAnimations()
    animationQueue.cleanup()
  }
}

// Singleton instance
export const gameAnimations = new GameAnimations() 