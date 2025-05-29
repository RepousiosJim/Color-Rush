import { Gem, GemType, GameState } from '@/types/game'
import { MoveAnalysis, intelligentBoardAnalysis } from './IntelligentBoardAnalysis'
import { gameAnimations } from '@/lib/effects/GameAnimations'
import { animationQueue } from '@/lib/effects/AnimationQueue'

export interface HintLevel {
  level: number
  name: string
  description: string
  showBestMove: boolean
  showMultipleOptions: boolean
  showScorePreview: boolean
  showCascadePreview: boolean
  animationDuration: number
  maxHints: number
}

export interface HintConfig {
  progressiveHints: boolean
  autoHintDelay: number // milliseconds before auto-hint
  maxHintsPerLevel: number
  hintCooldown: number // milliseconds between hints
  visualStyle: 'subtle' | 'normal' | 'prominent'
  includeScoring: boolean
}

export interface HintSession {
  currentLevel: number
  hintsUsed: number
  totalHints: number
  lastHintTime: number
  playerStuckTime: number
  autoHintEnabled: boolean
  sessionStartTime: number
}

export interface HintResult {
  success: boolean
  hintLevel: HintLevel
  moves: MoveAnalysis[]
  message: string
  nextLevelUnlocked: boolean
  remainingHints: number
}

export class AdvancedHintSystem {
  private hintLevels: HintLevel[] = [
    {
      level: 1,
      name: 'Gentle Nudge',
      description: 'Highlights possible gem types',
      showBestMove: false,
      showMultipleOptions: false,
      showScorePreview: false,
      showCascadePreview: false,
      animationDuration: 2000,
      maxHints: 10
    },
    {
      level: 2,
      name: 'Direction Guide',
      description: 'Shows general areas where moves are possible',
      showBestMove: false,
      showMultipleOptions: true,
      showScorePreview: false,
      showCascadePreview: false,
      animationDuration: 3000,
      maxHints: 8
    },
    {
      level: 3,
      name: 'Smart Suggestion',
      description: 'Highlights specific gems to move',
      showBestMove: true,
      showMultipleOptions: false,
      showScorePreview: false,
      showCascadePreview: false,
      animationDuration: 3500,
      maxHints: 6
    },
    {
      level: 4,
      name: 'Strategic Preview',
      description: 'Shows move with expected score',
      showBestMove: true,
      showMultipleOptions: false,
      showScorePreview: true,
      showCascadePreview: false,
      animationDuration: 4000,
      maxHints: 4
    },
    {
      level: 5,
      name: 'Master Analysis',
      description: 'Full analysis with cascade prediction',
      showBestMove: true,
      showMultipleOptions: true,
      showScorePreview: true,
      showCascadePreview: true,
      animationDuration: 5000,
      maxHints: 2
    }
  ]

  private config: HintConfig = {
    progressiveHints: true,
    autoHintDelay: 30000, // 30 seconds
    maxHintsPerLevel: 3,
    hintCooldown: 5000, // 5 seconds
    visualStyle: 'normal',
    includeScoring: true
  }

  private session: HintSession = {
    currentLevel: 1,
    hintsUsed: 0,
    totalHints: 0,
    lastHintTime: 0,
    playerStuckTime: 0,
    autoHintEnabled: true,
    sessionStartTime: Date.now()
  }

  private autoHintTimer: NodeJS.Timeout | null = null
  private lastPlayerAction = Date.now()

  constructor(initialConfig?: Partial<HintConfig>) {
    if (initialConfig) {
      this.config = { ...this.config, ...initialConfig }
    }
    this.startAutoHintTimer()
  }

  // Main Hint Methods
  public async requestHint(board: (Gem | null)[][], gameState: GameState): Promise<HintResult> {
    const now = Date.now()
    
    // Check cooldown
    if (now - this.session.lastHintTime < this.config.hintCooldown) {
      return {
        success: false,
        hintLevel: this.getCurrentHintLevel(),
        moves: [],
        message: `Please wait ${Math.ceil((this.config.hintCooldown - (now - this.session.lastHintTime)) / 1000)} seconds`,
        nextLevelUnlocked: false,
        remainingHints: this.getRemainingHints()
      }
    }

    // Check hint availability
    const currentLevel = this.getCurrentHintLevel()
    const remainingHints = this.getRemainingHints()
    
    if (remainingHints <= 0) {
      return this.handleNoHintsLeft(currentLevel)
    }

    // Analyze board state
    const analysis = intelligentBoardAnalysis.analyzeGameState(board)
    
    if (analysis.isDeadlock) {
      return this.handleDeadlockHint()
    }

    // Generate hint based on current level
    const hintResult = await this.generateHint(board, analysis, currentLevel)
    
    // Update session
    this.session.hintsUsed++
    this.session.totalHints++
    this.session.lastHintTime = now
    this.session.playerStuckTime = 0
    
    // Check if level should progress
    if (this.config.progressiveHints && this.shouldProgressLevel()) {
      hintResult.nextLevelUnlocked = this.progressToNextLevel()
    }

    return hintResult
  }

  private async generateHint(
    board: (Gem | null)[][],
    analysis: any,
    hintLevel: HintLevel
  ): Promise<HintResult> {
    const moves = analysis.possibleMoves.slice(0, hintLevel.showMultipleOptions ? 3 : 1)
    
    if (moves.length === 0) {
      return this.handleNoMovesHint()
    }

    // Create hint animation based on level
    await this.createHintAnimation(moves, hintLevel)
    
    // Generate hint message
    const message = this.generateHintMessage(moves, hintLevel)
    
    return {
      success: true,
      hintLevel,
      moves,
      message,
      nextLevelUnlocked: false,
      remainingHints: this.getRemainingHints() - 1
    }
  }

  private async createHintAnimation(moves: MoveAnalysis[], hintLevel: HintLevel): Promise<void> {
    const animationPromises: Promise<void>[] = []

    moves.forEach((move, index) => {
      // Animate source gem
      animationPromises.push(this.animateHintGem(
        move.from.row,
        move.from.col,
        'source',
        hintLevel,
        index * 200
      ))

      // Animate target gem if showing best move
      if (hintLevel.showBestMove) {
        animationPromises.push(this.animateHintGem(
          move.to.row,
          move.to.col,
          'target',
          hintLevel,
          index * 200 + 100
        ))
      }

      // Show score preview if enabled
      if (hintLevel.showScorePreview) {
        animationPromises.push(this.showScorePreview(move, index * 400))
      }

      // Show cascade preview if enabled
      if (hintLevel.showCascadePreview && move.cascadePotential > 0) {
        animationPromises.push(this.showCascadePreview(move, index * 600))
      }
    })

    // Show directional arrow for level 2+
    if (hintLevel.level >= 2 && hintLevel.showBestMove) {
      animationPromises.push(this.showDirectionalArrow(moves[0]))
    }

    await Promise.all(animationPromises)
  }

  private async animateHintGem(
    row: number,
    col: number,
    type: 'source' | 'target',
    hintLevel: HintLevel,
    delay: number
  ): Promise<void> {
    const element = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (!element) return

    const intensity = this.getAnimationIntensity(hintLevel.level)
    const duration = hintLevel.animationDuration / 2

    return animationQueue.add({
      id: `hint_${type}_${row}_${col}_${Date.now()}`,
      element: element as HTMLElement,
      type: 'css',
      config: {
        duration,
        delay,
        loop: 2,
        yoyo: true,
        easing: 'ease-in-out'
      },
      properties: {
        'box-shadow': this.getHintBoxShadow(type, intensity),
        'transform': `scale(${1 + intensity * 0.1})`,
        'filter': `brightness(${1 + intensity * 0.3})`
      }
    })
  }

  private async showScorePreview(move: MoveAnalysis, delay: number): Promise<void> {
    const fromElement = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`)
    if (!fromElement) return

    const scoreElement = document.createElement('div')
    scoreElement.className = 'hint-score-preview'
    scoreElement.textContent = `+${move.expectedScore}`
    scoreElement.style.cssText = `
      position: absolute;
      pointer-events: none;
      font-weight: bold;
      font-size: 1.2rem;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
      transform: translateY(-10px);
    `

    const rect = fromElement.getBoundingClientRect()
    scoreElement.style.left = rect.left + window.scrollX + rect.width / 2 + 'px'
    scoreElement.style.top = rect.top + window.scrollY - 10 + 'px'

    document.body.appendChild(scoreElement)

    return animationQueue.add({
      id: `hint_score_${Date.now()}`,
      element: scoreElement,
      type: 'custom',
      config: {
        duration: 2000,
        delay,
        easing: 'ease-out'
      },
      customFunction: (progress, el) => {
        const opacity = Math.sin(progress * Math.PI) // Fade in and out
        const y = -10 - progress * 20
        
        el.style.transform = `translateY(${y}px)`
        el.style.opacity = opacity.toString()
      },
      cleanup: () => {
        if (scoreElement.parentNode) {
          scoreElement.parentNode.removeChild(scoreElement)
        }
      }
    })
  }

  private async showCascadePreview(move: MoveAnalysis, delay: number): Promise<void> {
    const cascadeElement = document.createElement('div')
    cascadeElement.className = 'hint-cascade-preview'
    cascadeElement.innerHTML = `
      <div class="cascade-icon">⚡</div>
      <div class="cascade-text">Cascade: +${Math.round(move.cascadePotential)}</div>
    `
    cascadeElement.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: #FFD700;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
    `

    document.body.appendChild(cascadeElement)

    return animationQueue.add({
      id: `hint_cascade_${Date.now()}`,
      element: cascadeElement,
      type: 'custom',
      config: {
        duration: 1500,
        delay,
        easing: 'ease-out'
      },
      customFunction: (progress, el) => {
        const scale = 0.8 + progress * 0.4
        const opacity = Math.sin(progress * Math.PI)
        
        el.style.transform = `translateX(-50%) scale(${scale})`
        el.style.opacity = opacity.toString()
      },
      cleanup: () => {
        if (cascadeElement.parentNode) {
          cascadeElement.parentNode.removeChild(cascadeElement)
        }
      }
    })
  }

  private async showDirectionalArrow(move: MoveAnalysis): Promise<void> {
    const fromElement = document.querySelector(`[data-row="${move.from.row}"][data-col="${move.from.col}"]`)
    const toElement = document.querySelector(`[data-row="${move.to.row}"][data-col="${move.to.col}"]`)
    
    if (!fromElement || !toElement) return

    const arrow = document.createElement('div')
    arrow.className = 'hint-arrow'
    arrow.innerHTML = '→'
    
    const fromRect = fromElement.getBoundingClientRect()
    const toRect = toElement.getBoundingClientRect()
    
    const deltaX = toRect.left - fromRect.left
    const deltaY = toRect.top - fromRect.top
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
    
    arrow.style.cssText = `
      position: absolute;
      font-size: 2rem;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
      pointer-events: none;
      transform: rotate(${angle}deg);
    `
    
    arrow.style.left = fromRect.left + window.scrollX + fromRect.width / 2 + 'px'
    arrow.style.top = fromRect.top + window.scrollY + fromRect.height / 2 + 'px'

    document.body.appendChild(arrow)

    return animationQueue.add({
      id: `hint_arrow_${Date.now()}`,
      element: arrow,
      type: 'css',
      config: {
        duration: 1000,
        loop: 3,
        yoyo: true,
        easing: 'ease-in-out'
      },
      properties: {
        'opacity': '0.8',
        'transform': `rotate(${angle}deg) scale(1.2)`
      },
      cleanup: () => {
        if (arrow.parentNode) {
          arrow.parentNode.removeChild(arrow)
        }
      }
    })
  }

  // Auto-Hint System
  private startAutoHintTimer(): void {
    if (this.autoHintTimer) {
      clearTimeout(this.autoHintTimer)
    }

    this.autoHintTimer = setTimeout(() => {
      if (this.session.autoHintEnabled) {
        this.triggerAutoHint()
      }
    }, this.config.autoHintDelay)
  }

  private triggerAutoHint(): void {
    // Emit custom event for auto-hint
    const event = new CustomEvent('game:auto-hint-ready', {
      detail: { 
        playerStuckTime: Date.now() - this.lastPlayerAction,
        currentLevel: this.session.currentLevel
      }
    })
    document.dispatchEvent(event)
  }

  public onPlayerAction(): void {
    this.lastPlayerAction = Date.now()
    this.session.playerStuckTime = 0
    this.startAutoHintTimer()
  }

  // Hint Level Management
  private getCurrentHintLevel(): HintLevel {
    return this.hintLevels[this.session.currentLevel - 1] || this.hintLevels[0]
  }

  private getRemainingHints(): number {
    const currentLevel = this.getCurrentHintLevel()
    return Math.max(0, currentLevel.maxHints - this.session.hintsUsed)
  }

  private shouldProgressLevel(): boolean {
    const currentLevel = this.getCurrentHintLevel()
    return this.session.hintsUsed >= currentLevel.maxHints && this.session.currentLevel < this.hintLevels.length
  }

  private progressToNextLevel(): boolean {
    if (this.session.currentLevel < this.hintLevels.length) {
      this.session.currentLevel++
      this.session.hintsUsed = 0
      return true
    }
    return false
  }

  // Helper Methods
  private getAnimationIntensity(level: number): number {
    switch (this.config.visualStyle) {
      case 'subtle': return 0.3 + (level - 1) * 0.1
      case 'prominent': return 0.7 + (level - 1) * 0.1
      default: return 0.5 + (level - 1) * 0.1
    }
  }

  private getHintBoxShadow(type: 'source' | 'target', intensity: number): string {
    const color = type === 'source' ? '0, 255, 0' : '255, 215, 0'
    const size = 20 * intensity
    return `0 0 ${size}px rgba(${color}, ${intensity})`
  }

  private generateHintMessage(moves: MoveAnalysis[], hintLevel: HintLevel): string {
    if (moves.length === 0) return 'No moves available'
    
    const bestMove = moves[0]
    let message = `${hintLevel.name}: `
    
    switch (hintLevel.level) {
      case 1:
        message += `Look for ${bestMove.from.row < 4 ? 'upper' : 'lower'} area matches`
        break
      case 2:
        message += `Try moving gems in row ${bestMove.from.row + 1} or column ${bestMove.from.col + 1}`
        break
      case 3:
        message += `Move the gem at (${bestMove.from.row + 1}, ${bestMove.from.col + 1})`
        break
      case 4:
        message += `Move will score ${bestMove.expectedScore} points`
        break
      case 5:
        message += `Best move: ${bestMove.difficulty} difficulty, ${Math.round(bestMove.cascadePotential)} cascade potential`
        break
      default:
        message += 'Move available'
    }
    
    return message
  }

  private handleNoHintsLeft(currentLevel: HintLevel): HintResult {
    return {
      success: false,
      hintLevel: currentLevel,
      moves: [],
      message: `No more ${currentLevel.name} hints available`,
      nextLevelUnlocked: false,
      remainingHints: 0
    }
  }

  private handleDeadlockHint(): HintResult {
    return {
      success: true,
      hintLevel: this.getCurrentHintLevel(),
      moves: [],
      message: 'Board is in deadlock - shuffle recommended',
      nextLevelUnlocked: false,
      remainingHints: this.getRemainingHints()
    }
  }

  private handleNoMovesHint(): HintResult {
    return {
      success: false,
      hintLevel: this.getCurrentHintLevel(),
      moves: [],
      message: 'No valid moves found',
      nextLevelUnlocked: false,
      remainingHints: this.getRemainingHints()
    }
  }

  // Public API
  public updateConfig(newConfig: Partial<HintConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public resetSession(): void {
    this.session = {
      currentLevel: 1,
      hintsUsed: 0,
      totalHints: 0,
      lastHintTime: 0,
      playerStuckTime: 0,
      autoHintEnabled: true,
      sessionStartTime: Date.now()
    }
  }

  public getSessionStats() {
    return {
      ...this.session,
      currentLevelName: this.getCurrentHintLevel().name,
      remainingHints: this.getRemainingHints(),
      totalSessionTime: Date.now() - this.session.sessionStartTime
    }
  }

  public enableAutoHint(enabled: boolean): void {
    this.session.autoHintEnabled = enabled
    if (enabled) {
      this.startAutoHintTimer()
    } else if (this.autoHintTimer) {
      clearTimeout(this.autoHintTimer)
      this.autoHintTimer = null
    }
  }

  public cleanup(): void {
    if (this.autoHintTimer) {
      clearTimeout(this.autoHintTimer)
      this.autoHintTimer = null
    }
    
    // Clean up any remaining hint elements
    document.querySelectorAll('.hint-score-preview, .hint-cascade-preview, .hint-arrow').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el)
      }
    })
  }
}

// Singleton instance
export const advancedHintSystem = new AdvancedHintSystem() 