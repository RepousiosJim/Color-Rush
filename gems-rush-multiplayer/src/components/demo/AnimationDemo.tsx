'use client'

import React, { useRef, useState } from 'react'
import { useAnimations } from '@/lib/effects/useAnimations'
import { animationQueue } from '@/lib/effects/AnimationQueue'
import { gameAnimations, MatchGroup, PowerUpEffect } from '@/lib/effects/GameAnimations'

const AnimationDemo: React.FC = () => {
  const demoRef = useRef<HTMLDivElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { getAnimationStatus, pauseAnimations, resumeAnimations, clearAnimations } = useAnimations()

  // Demo gem grid data
  const demoGems = [
    ['🔥', '💧', '🌍', '💨'],
    ['⚡', '🌿', '🔮', '🔥'],
    ['💧', '🌍', '💨', '⚡'],
    ['🌿', '🔮', '🔥', '💧']
  ]

  const handleBasicAnimation = async () => {
    if (isRunning) return
    setIsRunning(true)

    try {
      const gems = demoRef.current?.querySelectorAll('.demo-gem')
      if (!gems) return

      // Animate first row with stagger
      const animations = Array.from(gems).slice(0, 4).map((gem, index) => ({
        id: `basic_demo_${index}`,
        element: gem as HTMLElement,
        type: 'css' as const,
        config: {
          duration: 500,
          delay: index * 100,
          easing: 'ease-bounce'
        },
        properties: {
          'transform': 'scale(1.3) rotate(180deg)',
          'filter': 'brightness(1.5) hue-rotate(90deg)'
        }
      }))

      // Add them sequentially
      for (const animation of animations) {
        await animationQueue.add(animation)
      }

      // Reset after a delay
      setTimeout(async () => {
        const resetAnimations = Array.from(gems).slice(0, 4).map((gem, index) => ({
          id: `reset_demo_${index}`,
          element: gem as HTMLElement,
          type: 'css' as const,
          config: {
            duration: 300,
            delay: index * 50,
            easing: 'ease-out'
          },
          properties: {
            'transform': 'scale(1) rotate(0deg)',
            'filter': 'brightness(1) hue-rotate(0deg)'
          }
        }))

        for (const animation of resetAnimations) {
          await animationQueue.add(animation)
        }
      }, 1000)

    } catch (error) {
      console.error('Animation demo error:', error)
    } finally {
      setTimeout(() => setIsRunning(false), 2000)
    }
  }

  const handleMatchAnimation = async () => {
    if (isRunning) return
    setIsRunning(true)

    try {
      // Simulate a match in the second row
      const matches: MatchGroup[] = [
        {
          gems: [
            { row: 1, col: 0 },
            { row: 1, col: 1 },
            { row: 1, col: 2 }
          ],
          type: 'lightning',
          score: 150
        }
      ]

      await gameAnimations.animateMatches(matches, 0)

      // Reset gems after animation
      setTimeout(() => {
        const gems = demoRef.current?.querySelectorAll('[data-row="1"]')
        gems?.forEach(gem => {
          const el = gem as HTMLElement
          el.style.display = 'flex'
          el.style.transform = 'scale(1)'
          el.style.opacity = '1'
        })
      }, 1500)

    } catch (error) {
      console.error('Match animation error:', error)
    } finally {
      setTimeout(() => setIsRunning(false), 2000)
    }
  }

  const handlePowerUpAnimation = async () => {
    if (isRunning) return
    setIsRunning(true)

    try {
      const powerUp: PowerUpEffect = {
        type: 'bomb',
        position: { row: 2, col: 2 },
        affectedGems: [
          { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
          { row: 2, col: 1 }, { row: 2, col: 3 },
          { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }
        ],
        score: 800
      }

      await gameAnimations.animatePowerUpActivation(powerUp)

      // Reset gems after animation
      setTimeout(() => {
        const allGems = demoRef.current?.querySelectorAll('.demo-gem')
        allGems?.forEach(gem => {
          const el = gem as HTMLElement
          el.style.display = 'flex'
          el.style.transform = 'scale(1)'
          el.style.opacity = '1'
          el.style.filter = 'brightness(1)'
          el.style.boxShadow = 'none'
        })
      }, 2000)

    } catch (error) {
      console.error('Power-up animation error:', error)
    } finally {
      setTimeout(() => setIsRunning(false), 3000)
    }
  }

  const handleParallelAnimation = async () => {
    if (isRunning) return
    setIsRunning(true)

    try {
      const gems = demoRef.current?.querySelectorAll('.demo-gem')
      if (!gems) return

      // Create parallel group for all gems
      const animations = Array.from(gems).map((gem, index) => ({
        id: `parallel_demo_${index}`,
        element: gem as HTMLElement,
        type: 'custom' as const,
        config: {
          duration: 1000,
          delay: Math.random() * 200,
          easing: 'ease-out'
        },
        customFunction: (progress: number, el: HTMLElement) => {
          const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.2
          const rotation = progress * 360
          const hue = progress * 360
          
          el.style.transform = `scale(${scale}) rotate(${rotation}deg)`
          el.style.filter = `hue-rotate(${hue}deg) brightness(${1 + progress * 0.5})`
        },
        cleanup: () => {
          (gem as HTMLElement).style.transform = 'scale(1) rotate(0deg)'
          ;(gem as HTMLElement).style.filter = 'hue-rotate(0deg) brightness(1)'
        }
      }))

      await animationQueue.addParallel({
        id: 'parallel_demo_group',
        animations
      })

    } catch (error) {
      console.error('Parallel animation error:', error)
    } finally {
      setTimeout(() => setIsRunning(false), 1200)
    }
  }

  const status = getAnimationStatus()

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🎪 Animation Queue System Demo
      </h2>

      {/* Demo Grid */}
      <div 
        ref={demoRef}
        className="grid grid-cols-4 gap-2 mb-6 max-w-xs mx-auto"
      >
        {demoGems.map((row, rowIndex) =>
          row.map((gem, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="demo-gem w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-lg border border-white/30 flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform"
              data-row={rowIndex}
              data-col={colIndex}
              style={{
                transition: 'transform 0.2s ease-out'
              }}
            >
              {gem}
            </div>
          ))
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <button
          onClick={handleBasicAnimation}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Basic Animation
        </button>
        <button
          onClick={handleMatchAnimation}
          disabled={isRunning}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Match Animation
        </button>
        <button
          onClick={handlePowerUpAnimation}
          disabled={isRunning}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Power-Up Effect
        </button>
        <button
          onClick={handleParallelAnimation}
          disabled={isRunning}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Parallel Animation
        </button>
      </div>

      {/* Queue Controls */}
      <div className="flex gap-3 justify-center mb-6">
        <button
          onClick={pauseAnimations}
          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
        >
          Pause
        </button>
        <button
          onClick={resumeAnimations}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
        >
          Resume
        </button>
        <button
          onClick={clearAnimations}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          Clear Queue
        </button>
      </div>

      {/* Status Display */}
      <div className="bg-black/20 rounded-lg p-4 text-center">
        <h3 className="text-white font-semibold mb-2">Animation Queue Status</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-300">
            Queue: <span className="text-white font-mono">{status.queueLength}</span>
          </div>
          <div className="text-gray-300">
            Groups: <span className="text-white font-mono">{status.parallelGroups}</span>
          </div>
          <div className="text-gray-300">
            Active: <span className="text-white font-mono">{status.activeAnimations}</span>
          </div>
          <div className="text-gray-300">
            Processing: <span className={`font-mono ${status.isProcessing ? 'text-green-400' : 'text-red-400'}`}>
              {status.isProcessing ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-300">
        <p>Click the buttons above to see different animation types in action!</p>
        <p className="mt-1 text-xs">
          • Basic: Sequential animations with stagger<br />
          • Match: Game-style gem matching effect<br />
          • Power-Up: Explosion effect with score popup<br />
          • Parallel: All gems animate simultaneously
        </p>
      </div>
    </div>
  )
}

export default AnimationDemo 