export interface AnimationConfig {
  duration: number
  delay?: number
  easing?: string
  loop?: boolean | number
  yoyo?: boolean
  onStart?: () => void
  onComplete?: () => void
  onUpdate?: (progress: number) => void
}

export interface ParallelAnimationGroup {
  id: string
  animations: Animation[]
  config?: Partial<AnimationConfig>
}

export interface Animation {
  id: string
  element: HTMLElement | string
  type: 'css' | 'transform' | 'custom' | 'sequence'
  config: AnimationConfig
  properties?: Record<string, any>
  keyframes?: Keyframe[]
  customFunction?: (progress: number, element: HTMLElement) => void
  cleanup?: () => void
}

export interface AnimationTimeline {
  id: string
  animations: Animation[]
  duration: number
  startTime?: number
  progress: number
  isComplete: boolean
}

export class AnimationQueue {
  private queue: Animation[] = []
  private parallelGroups: ParallelAnimationGroup[] = []
  private timelines: Map<string, AnimationTimeline> = new Map()
  private activeAnimations: Map<string, any> = new Map()
  private isProcessing: boolean = false
  private frameId: number | null = null
  private eventListeners: Map<string, Function[]> = new Map()
  private defaultConfig: AnimationConfig = {
    duration: 300,
    delay: 0,
    easing: 'ease-out'
  }

  constructor() {
    this.bindMethods()
  }

  private bindMethods(): void {
    this.processTimelines = this.processTimelines.bind(this)
    this.cleanup = this.cleanup.bind(this)
  }

  // Queue Management
  public add(animation: Animation): Promise<void> {
    const animationWithDefaults = {
      ...animation,
      config: { ...this.defaultConfig, ...animation.config }
    }
    
    this.queue.push(animationWithDefaults)
    this.emit('animation:queued', { animation: animationWithDefaults })
    
    if (!this.isProcessing) {
      this.startProcessing()
    }
    
    return this.createAnimationPromise(animationWithDefaults.id)
  }

  public addSequence(animations: Animation[], groupId?: string): Promise<void> {
    const sequenceId = groupId || `sequence_${Date.now()}`
    const sequencePromises: Promise<void>[] = []
    
    animations.forEach((animation, index) => {
      const animationWithDelay = {
        ...animation,
        config: {
          ...this.defaultConfig,
          ...animation.config,
          delay: (animation.config.delay || 0) + (index * 50) // Stagger by 50ms
        }
      }
      sequencePromises.push(this.add(animationWithDelay))
    })
    
    return Promise.all(sequencePromises).then(() => {})
  }

  public addParallel(group: ParallelAnimationGroup): Promise<void> {
    this.parallelGroups.push(group)
    this.emit('parallel:queued', { group })
    
    if (!this.isProcessing) {
      this.startProcessing()
    }
    
    return this.createParallelPromise(group.id)
  }

  // Timeline Management
  public createTimeline(id: string, animations: Animation[]): AnimationTimeline {
    const maxDuration = Math.max(...animations.map(a => a.config.duration + (a.config.delay || 0)))
    
    const timeline: AnimationTimeline = {
      id,
      animations,
      duration: maxDuration,
      progress: 0,
      isComplete: false
    }
    
    this.timelines.set(id, timeline)
    this.emit('timeline:created', { timeline })
    
    return timeline
  }

  public playTimeline(id: string): Promise<void> {
    const timeline = this.timelines.get(id)
    if (!timeline) {
      return Promise.reject(new Error(`Timeline ${id} not found`))
    }
    
    timeline.startTime = performance.now()
    timeline.progress = 0
    timeline.isComplete = false
    
    this.startTimelineProcessing()
    
    return this.createTimelinePromise(id)
  }

  // Animation Processing
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true
    this.emit('queue:started')
    
    try {
      while (this.queue.length > 0 || this.parallelGroups.length > 0) {
        // Process parallel groups first
        if (this.parallelGroups.length > 0) {
          await this.processParallelGroup(this.parallelGroups.shift()!)
        }
        
        // Process sequential animations
        if (this.queue.length > 0) {
          await this.processAnimation(this.queue.shift()!)
        }
      }
    } catch (error) {
      this.emit('queue:error', { error })
    } finally {
      this.isProcessing = false
      this.emit('queue:completed')
    }
  }

  private async processAnimation(animation: Animation): Promise<void> {
    const element = this.getElement(animation.element)
    if (!element) {
      this.emit('animation:error', { 
        animation, 
        error: new Error('Element not found') 
      })
      return
    }
    
    // Apply delay
    if (animation.config.delay && animation.config.delay > 0) {
      await this.sleep(animation.config.delay)
    }
    
    this.emit('animation:started', { animation, element })
    animation.config.onStart?.()
    
    try {
      switch (animation.type) {
        case 'css':
          await this.processCSSAnimation(animation, element)
          break
        case 'transform':
          await this.processTransformAnimation(animation, element)
          break
        case 'custom':
          await this.processCustomAnimation(animation, element)
          break
        default:
          throw new Error(`Unknown animation type: ${animation.type}`)
      }
      
      this.emit('animation:completed', { animation, element })
      animation.config.onComplete?.()
    } catch (error) {
      this.emit('animation:error', { animation, element, error })
    } finally {
      this.activeAnimations.delete(animation.id)
      animation.cleanup?.()
    }
  }

  private async processParallelGroup(group: ParallelAnimationGroup): Promise<void> {
    this.emit('parallel:started', { group })
    
    const promises = group.animations.map(animation => 
      this.processAnimation(animation)
    )
    
    try {
      await Promise.all(promises)
      this.emit('parallel:completed', { group })
    } catch (error) {
      this.emit('parallel:error', { group, error })
    }
  }

  // Animation Types Implementation
  private async processCSSAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const { duration, easing } = animation.config
      
      // Apply CSS properties
      if (animation.properties) {
        Object.entries(animation.properties).forEach(([prop, value]) => {
          element.style.setProperty(prop, value)
        })
      }
      
      // Apply transition
      element.style.transition = `all ${duration}ms ${easing}`
      
      const cleanup = () => {
        element.removeEventListener('transitionend', onComplete)
        element.removeEventListener('transitioncancel', onError)
      }
      
      const onComplete = () => {
        cleanup()
        resolve()
      }
      
      const onError = () => {
        cleanup()
        reject(new Error('CSS transition cancelled'))
      }
      
      element.addEventListener('transitionend', onComplete, { once: true })
      element.addEventListener('transitioncancel', onError, { once: true })
      
      // Fallback timeout
      setTimeout(() => {
        cleanup()
        resolve()
      }, duration + 100)
    })
  }

  private async processTransformAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const { duration, easing } = animation.config
      const startTime = performance.now()
      let animationId: number
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = this.applyEasing(progress, easing || 'ease-out')
        
        // Apply transform properties
        if (animation.properties) {
          const transforms: string[] = []
          Object.entries(animation.properties).forEach(([prop, value]) => {
            if (typeof value === 'number') {
              const currentValue = value * easedProgress
              transforms.push(`${prop}(${currentValue})`)
            } else if (typeof value === 'string') {
              transforms.push(`${prop}(${value})`)
            }
          })
          element.style.transform = transforms.join(' ')
        }
        
        animation.config.onUpdate?.(easedProgress)
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animationId = requestAnimationFrame(animate)
      this.activeAnimations.set(animation.id, () => cancelAnimationFrame(animationId))
    })
  }

  private async processCustomAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const { duration, easing } = animation.config
      const startTime = performance.now()
      let animationId: number
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = this.applyEasing(progress, easing || 'ease-out')
        
        animation.customFunction?.(easedProgress, element)
        animation.config.onUpdate?.(easedProgress)
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animationId = requestAnimationFrame(animate)
      this.activeAnimations.set(animation.id, () => cancelAnimationFrame(animationId))
    })
  }

  // Timeline Processing
  private startTimelineProcessing(): void {
    if (this.frameId) return
    
    this.frameId = requestAnimationFrame(this.processTimelines)
  }

  private processTimelines(): void {
    const currentTime = performance.now()
    let hasActiveTimelines = false
    
    this.timelines.forEach((timeline) => {
      if (timeline.isComplete || !timeline.startTime) return
      
      hasActiveTimelines = true
      const elapsed = currentTime - timeline.startTime
      timeline.progress = Math.min(elapsed / timeline.duration, 1)
      
      // Process timeline animations
      timeline.animations.forEach((animation) => {
        const animationStart = animation.config.delay || 0
        const animationEnd = animationStart + animation.config.duration
        
        if (elapsed >= animationStart && elapsed <= animationEnd) {
          const animationProgress = (elapsed - animationStart) / animation.config.duration
          const easedProgress = this.applyEasing(animationProgress, animation.config.easing || 'ease-out')
          
          animation.config.onUpdate?.(easedProgress)
          
          if (animation.customFunction) {
            const element = this.getElement(animation.element)
            if (element) {
              animation.customFunction(easedProgress, element)
            }
          }
        }
      })
      
      if (timeline.progress >= 1) {
        timeline.isComplete = true
        this.emit('timeline:completed', { timeline })
      }
    })
    
    if (hasActiveTimelines) {
      this.frameId = requestAnimationFrame(this.processTimelines)
    } else {
      this.frameId = null
    }
  }

  // Utility Methods
  private getElement(elementOrSelector: HTMLElement | string): HTMLElement | null {
    if (typeof elementOrSelector === 'string') {
      return document.querySelector(elementOrSelector)
    }
    return elementOrSelector
  }

  private applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case 'ease-in':
        return progress * progress
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2)
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
      case 'ease-back':
        return 2.7 * progress * progress * progress - 1.7 * progress * progress
      case 'ease-bounce':
        if (progress < 1 / 2.75) {
          return 7.5625 * progress * progress
        } else if (progress < 2 / 2.75) {
          return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75
        } else if (progress < 2.5 / 2.75) {
          return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375
        } else {
          return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375
        }
      default:
        return progress
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private createAnimationPromise(animationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const onComplete = (data: any) => {
        if (data.animation.id === animationId) {
          this.off('animation:completed', onComplete)
          this.off('animation:error', onError)
          resolve()
        }
      }
      
      const onError = (data: any) => {
        if (data.animation.id === animationId) {
          this.off('animation:completed', onComplete)
          this.off('animation:error', onError)
          reject(data.error)
        }
      }
      
      this.on('animation:completed', onComplete)
      this.on('animation:error', onError)
    })
  }

  private createParallelPromise(groupId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const onComplete = (data: any) => {
        if (data.group.id === groupId) {
          this.off('parallel:completed', onComplete)
          this.off('parallel:error', onError)
          resolve()
        }
      }
      
      const onError = (data: any) => {
        if (data.group.id === groupId) {
          this.off('parallel:completed', onComplete)
          this.off('parallel:error', onError)
          reject(data.error)
        }
      }
      
      this.on('parallel:completed', onComplete)
      this.on('parallel:error', onError)
    })
  }

  private createTimelinePromise(timelineId: string): Promise<void> {
    return new Promise((resolve) => {
      const onComplete = (data: any) => {
        if (data.timeline.id === timelineId) {
          this.off('timeline:completed', onComplete)
          resolve()
        }
      }
      
      this.on('timeline:completed', onComplete)
    })
  }

  // Event System
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in animation queue event listener for ${event}:`, error)
        }
      })
    }
  }

  // Queue Control
  public pause(): void {
    this.activeAnimations.forEach(cancelFn => cancelFn())
    if (this.frameId) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
    this.emit('queue:paused')
  }

  public resume(): void {
    if (!this.isProcessing && (this.queue.length > 0 || this.parallelGroups.length > 0)) {
      this.startProcessing()
    }
    if (this.timelines.size > 0) {
      this.startTimelineProcessing()
    }
    this.emit('queue:resumed')
  }

  public clear(): void {
    this.pause()
    this.queue = []
    this.parallelGroups = []
    this.timelines.clear()
    this.activeAnimations.clear()
    this.isProcessing = false
    this.emit('queue:cleared')
  }

  public getQueueStatus() {
    return {
      queueLength: this.queue.length,
      parallelGroups: this.parallelGroups.length,
      activeAnimations: this.activeAnimations.size,
      timelines: this.timelines.size,
      isProcessing: this.isProcessing
    }
  }

  // Cleanup
  public cleanup(): void {
    this.clear()
    this.eventListeners.clear()
    this.emit('queue:destroyed')
  }
}

// Singleton instance
export const animationQueue = new AnimationQueue() 