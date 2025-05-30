'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Target, Clock, Calendar, Medal, Star, Gift } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action?: string
  tip?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gems Rush!',
    description: 'Get ready for the ultimate match-3 adventure where you\'ll match divine gems, create powerful combos, and conquer mystical realms!',
    icon: <div className="text-6xl">🎮</div>,
    tip: 'Tap anywhere to continue'
  },
  {
    id: 'gameplay',
    title: 'How to Play',
    description: 'Swap adjacent gems to create matches of 3 or more. The more gems you match, the higher your score!',
    icon: <div className="text-6xl">💎</div>,
    tip: 'Look for special gem combinations'
  },
  {
    id: 'modes',
    title: 'Game Modes',
    description: 'Choose from multiple exciting game modes: Classic for endless fun, Time Rush for fast-paced action, and Daily Quests for special rewards!',
    icon: <Target className="w-16 h-16" />,
    tip: 'Each mode offers unique challenges'
  },
  {
    id: 'combos',
    title: 'Power Combos',
    description: 'Create L-shapes and T-shapes for bomb gems, match 4 in a row for lightning gems, or match 5 for rainbow gems that clear entire colors!',
    icon: <div className="text-6xl">⚡</div>,
    tip: 'Bigger matches = better power-ups'
  },
  {
    id: 'progression',
    title: 'Level Up & Earn Rewards',
    description: 'Gain XP, level up, and unlock new features. Earn coins and gems to customize your experience!',
    icon: <Star className="w-16 h-16" />,
    tip: 'Daily play increases your streak bonus'
  },
  {
    id: 'ready',
    title: 'Ready to Start?',
    description: 'You\'re all set! Start with Classic Mode to get familiar with the gameplay, then explore other modes as you progress.',
    icon: <div className="text-6xl">🚀</div>,
    action: 'Start Playing!'
  }
]

interface UserOnboardingProps {
  isVisible: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function UserOnboarding({ isVisible, onComplete, onSkip }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = () => {
    if (isAnimating) return
    
    if (currentStep === onboardingSteps.length - 1) {
      onComplete()
      return
    }

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, onboardingSteps.length - 1))
      setIsAnimating(false)
    }, 300)
  }

  const handlePrevious = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 0))
      setIsAnimating(false)
    }, 300)
  }

  const handleSkip = () => {
    onSkip()
  }

  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0)
    }
  }, [isVisible])

  const currentStepData = onboardingSteps[currentStep]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-md mx-4 bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white/60 hover:text-white text-sm font-medium transition-colors z-10"
            >
              Skip
            </button>

            {/* Progress indicator */}
            <div className="absolute top-4 left-4 right-16 z-10">
              <div className="flex gap-1">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <div className="text-white/60 text-xs mt-1">
                {currentStep + 1} of {onboardingSteps.length}
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 pb-8 px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  className="text-center"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-6 text-white">
                    {currentStepData.icon}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {currentStepData.title}
                  </h2>

                  {/* Description */}
                  <p className="text-white/80 text-base leading-relaxed mb-6">
                    {currentStepData.description}
                  </p>

                  {/* Tip */}
                  {currentStepData.tip && (
                    <div className="bg-white/10 rounded-xl p-3 mb-6 border border-white/20">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="text-yellow-400">💡</div>
                        <span className="text-white/90 text-sm font-medium">
                          {currentStepData.tip}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Special content for specific steps */}
                  {currentStep === 2 && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <div className="text-white text-xs font-medium">Classic</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <Clock className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                        <div className="text-white text-xs font-medium">Time Rush</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <div className="text-white text-xs font-medium">Daily Quest</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                        <Medal className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                        <div className="text-white text-xs font-medium">Campaign</div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="flex justify-center gap-2 mb-6">
                      <div className="text-2xl">💥</div>
                      <div className="text-2xl">⚡</div>
                      <div className="text-2xl">🌈</div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="flex justify-center gap-4 mb-6">
                      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-white text-sm">Coins</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-purple-400">💎</span>
                        <span className="text-white text-sm">Gems</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
                        <Star className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">XP</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-8 pb-8">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isAnimating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    currentStep === 0 || isAnimating
                      ? 'opacity-50 cursor-not-allowed text-white/40'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={isAnimating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  <span>
                    {currentStepData.action || 'Next'}
                  </span>
                  {!currentStepData.action && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-tr-full"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 