// Progressive Tutorial System
// Guides players through game features with contextual tips and achievements

export interface TutorialStep {
  id: string
  title: string
  description: string
  trigger: 'manual' | 'auto' | 'achievement' | 'game_event'
  requirements?: {
    completedSteps?: string[]
    gameMode?: string
    minLevel?: number
    hasPlayed?: number // minimum games played
  }
  action: {
    type: 'highlight' | 'modal' | 'tooltip' | 'overlay' | 'guided_action'
    target?: string // CSS selector or component name
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    allowSkip?: boolean
  }
  reward?: {
    coins?: number
    gems?: number
    xp?: number
    energy?: number
  }
  category: 'basics' | 'advanced' | 'mastery' | 'social' | 'monetization'
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // Basics
  {
    id: 'welcome',
    title: 'Welcome to Gems Rush!',
    description: 'Let\'s learn the basics of matching gems to create amazing combos!',
    trigger: 'manual',
    action: { type: 'modal', allowSkip: true },
    reward: { coins: 50, energy: 10 },
    category: 'basics'
  },
  {
    id: 'first_match',
    title: 'Make Your First Match',
    description: 'Tap and drag to swap gems. Match 3 or more of the same color!',
    trigger: 'auto',
    action: { type: 'highlight', target: '.game-board', position: 'center' },
    reward: { coins: 25, xp: 50 },
    category: 'basics'
  },
  {
    id: 'combo_tutorial',
    title: 'Create a Combo',
    description: 'When gems fall and create new matches automatically, that\'s a combo!',
    trigger: 'game_event',
    requirements: { completedSteps: ['first_match'] },
    action: { type: 'tooltip', position: 'top' },
    reward: { coins: 50, xp: 100 },
    category: 'basics'
  },
  {
    id: 'power_up_intro',
    title: 'Discover Power-Ups',
    description: 'Special gem combinations create powerful effects! Try matching 4 or 5 gems.',
    trigger: 'auto',
    requirements: { completedSteps: ['combo_tutorial'], hasPlayed: 3 },
    action: { type: 'modal' },
    reward: { gems: 10, xp: 150 },
    category: 'basics'
  },
  
  // Advanced
  {
    id: 'time_attack_intro',
    title: 'Ready for Speed?',
    description: 'Time Attack mode tests your speed! Can you beat the clock?',
    trigger: 'manual',
    requirements: { minLevel: 3, completedSteps: ['power_up_intro'] },
    action: { type: 'highlight', target: '.time-attack-button' },
    reward: { coins: 100, energy: 20 },
    category: 'advanced'
  },
  {
    id: 'daily_challenge',
    title: 'Daily Challenges',
    description: 'Complete daily challenges for special rewards and streak bonuses!',
    trigger: 'auto',
    requirements: { minLevel: 5, hasPlayed: 10 },
    action: { type: 'highlight', target: '.daily-challenge-button' },
    reward: { gems: 25, xp: 200 },
    category: 'advanced'
  },
  {
    id: 'energy_system',
    title: 'Energy System',
    description: 'Each game costs energy. Energy regenerates over time, or you can refill it with gems!',
    trigger: 'auto',
    requirements: { hasPlayed: 5 },
    action: { type: 'highlight', target: '.energy-display' },
    reward: { energy: 50 },
    category: 'advanced'
  },
  
  // Mastery
  {
    id: 'cascade_master',
    title: 'Cascade Master',
    description: 'Plan your moves to create massive cascade effects for huge scores!',
    trigger: 'achievement',
    requirements: { minLevel: 10, completedSteps: ['daily_challenge'] },
    action: { type: 'modal' },
    reward: { coins: 500, gems: 50, xp: 500 },
    category: 'mastery'
  },
  {
    id: 'strategy_tips',
    title: 'Pro Strategy Tips',
    description: 'Look for corner matches and T-shaped combinations for maximum cascade potential!',
    trigger: 'manual',
    requirements: { minLevel: 15, hasPlayed: 50 },
    action: { type: 'modal', allowSkip: false },
    reward: { gems: 100, xp: 1000 },
    category: 'mastery'
  },
  
  // Social
  {
    id: 'leaderboards',
    title: 'Compete with Others',
    description: 'Check the leaderboards to see how you rank against other players!',
    trigger: 'manual',
    requirements: { minLevel: 8, hasPlayed: 20 },
    action: { type: 'highlight', target: '.leaderboard-button' },
    reward: { coins: 200, xp: 300 },
    category: 'social'
  },
  
  // Monetization (gentle introduction)
  {
    id: 'gem_benefits',
    title: 'Gems Unlock Potential',
    description: 'Gems help you continue games, buy power-ups, and customize your experience!',
    trigger: 'manual',
    requirements: { minLevel: 12, hasPlayed: 30 },
    action: { type: 'modal', allowSkip: true },
    category: 'monetization'
  }
]

export interface TutorialProgress {
  currentStep: number
  completedSteps: string[]
  isActive: boolean
  skipped: boolean
  lastStepTime: number
}

export class ProgressiveTutorialManager {
  private steps: TutorialStep[]

  constructor(steps: TutorialStep[] = TUTORIAL_STEPS) {
    this.steps = steps
  }

  // Get next available tutorial step
  getNextStep(
    progress: TutorialProgress | undefined,
    playerStats: {
      level: number
      gamesPlayed: number
      achievements: any[]
    }
  ): TutorialStep | null {
    // Handle undefined or incomplete progress data
    if (!progress || !progress.isActive || progress.skipped) return null

    // Find the next uncompleted step that meets requirements
    for (const step of this.steps) {
      if (progress.completedSteps?.includes(step.id)) continue

      if (this.meetsRequirements(step, progress, playerStats)) {
        return step
      }
    }

    return null
  }

  // Check if step requirements are met
  private meetsRequirements(
    step: TutorialStep,
    progress: TutorialProgress | undefined,
    playerStats: { level: number; gamesPlayed: number; achievements: any[] }
  ): boolean {
    const req = step.requirements

    if (!req) return true

    // Check completed steps requirement
    if (req.completedSteps && progress?.completedSteps) {
      for (const requiredStep of req.completedSteps) {
        if (!progress.completedSteps.includes(requiredStep)) {
          return false
        }
      }
    }

    // Check level requirement
    if (req.minLevel && playerStats.level < req.minLevel) {
      return false
    }

    // Check games played requirement
    if (req.hasPlayed && playerStats.gamesPlayed < req.hasPlayed) {
      return false
    }

    return true
  }

  // Complete a tutorial step
  completeStep(stepId: string, progress: TutorialProgress | undefined): TutorialProgress {
    // Create default progress if undefined
    const currentProgress: TutorialProgress = progress || {
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      skipped: false,
      lastStepTime: Date.now()
    }

    const step = this.steps.find(s => s.id === stepId)
    if (!step || currentProgress.completedSteps.includes(stepId)) {
      return currentProgress
    }

    return {
      ...currentProgress,
      completedSteps: [...currentProgress.completedSteps, stepId],
      currentStep: currentProgress.currentStep + 1,
      lastStepTime: Date.now()
    }
  }

  // Skip tutorial entirely
  skipTutorial(progress: TutorialProgress | undefined): TutorialProgress {
    const currentProgress: TutorialProgress = progress || {
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      skipped: false,
      lastStepTime: Date.now()
    }

    return {
      ...currentProgress,
      isActive: false,
      skipped: true
    }
  }

  // Get tutorial steps by category
  getStepsByCategory(category: TutorialStep['category']): TutorialStep[] {
    return this.steps.filter(step => step.category === category)
  }

  // Get contextual tips based on current game state
  getContextualTip(gameContext: {
    currentMode: string
    recentActions: string[]
    performance: 'good' | 'average' | 'poor'
  }): { tip: string; category: string } | null {
    const { currentMode, recentActions, performance } = gameContext

    // Performance-based tips
    if (performance === 'poor') {
      return {
        tip: 'Try to look for matches at the bottom of the board first - they create more cascades!',
        category: 'strategy'
      }
    }

    // Mode-specific tips
    if (currentMode === 'timeAttack' && recentActions.includes('slow_moves')) {
      return {
        tip: 'In Time Attack, quick pattern recognition is key. Look for obvious matches first!',
        category: 'time_attack'
      }
    }

    // General encouragement
    if (performance === 'good') {
      return {
        tip: 'Great job! Try creating L or T shaped matches for special gems!',
        category: 'encouragement'
      }
    }

    return null
  }

  // Calculate tutorial completion percentage
  getTutorialProgress(progress: TutorialProgress | undefined): {
    completionPercentage: number
    stepsCompleted: number
    totalSteps: number
    category: string
  } {
    const currentProgress: TutorialProgress = progress || {
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      skipped: false,
      lastStepTime: Date.now()
    }

    const basicSteps = this.getStepsByCategory('basics')
    const completedBasicSteps = basicSteps.filter(step => 
      currentProgress.completedSteps.includes(step.id)
    ).length

    return {
      completionPercentage: (currentProgress.completedSteps.length / this.steps.length) * 100,
      stepsCompleted: currentProgress.completedSteps.length,
      totalSteps: this.steps.length,
      category: completedBasicSteps === basicSteps.length ? 'advanced' : 'basics'
    }
  }

  // Get rewards for completing tutorial milestones
  getMilestoneRewards(progress: TutorialProgress | undefined): {
    coins: number
    gems: number
    xp: number
    energy: number
  } {
    const currentProgress: TutorialProgress = progress || {
      currentStep: 1,
      completedSteps: [],
      isActive: true,
      skipped: false,
      lastStepTime: Date.now()
    }

    let totalRewards = { coins: 0, gems: 0, xp: 0, energy: 0 }

    for (const stepId of currentProgress.completedSteps) {
      const step = this.steps.find(s => s.id === stepId)
      if (step?.reward) {
        totalRewards.coins += step.reward.coins || 0
        totalRewards.gems += step.reward.gems || 0
        totalRewards.xp += step.reward.xp || 0
        totalRewards.energy += step.reward.energy || 0
      }
    }

    return totalRewards
  }
}

// Singleton instance
export const tutorialManager = new ProgressiveTutorialManager() 