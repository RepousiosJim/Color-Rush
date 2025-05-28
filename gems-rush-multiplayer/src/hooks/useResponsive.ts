'use client'

import { useState, useEffect, useCallback } from 'react'
import { getScreenSize, getResponsiveValue, getOptimalBoardSize, getOptimalGridColumns, getOptimalSpacing, getOptimalTouchTargetSize, isTouchDevice, type ScreenSize, type ResponsiveConfig, defaultResponsiveConfig } from '@/lib/utils/responsive'
import { debounce } from './usePerformanceOptimization'

export const useResponsive = (config: ResponsiveConfig = defaultResponsiveConfig) => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize(config))

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize(getScreenSize(config))
    }

    updateScreenSize()
    
    const debouncedUpdate = debounce(updateScreenSize, 150)
    window.addEventListener('resize', debouncedUpdate)

    return () => {
      window.removeEventListener('resize', debouncedUpdate)
    }
  }, [config])

  const getResponsiveValueHelper = useCallback(<T>(mobile: T, tablet: T, desktop: T): T => {
    return getResponsiveValue(screenSize, mobile, tablet, desktop)
  }, [screenSize])

  const boardSize = getOptimalBoardSize(screenSize)
  const gridColumns = getOptimalGridColumns(screenSize)
  const spacing = getOptimalSpacing(screenSize)
  const touchTargetSize = getOptimalTouchTargetSize(screenSize)

  return {
    screenSize,
    getResponsiveValue: getResponsiveValueHelper,
    boardSize,
    gridColumns,
    spacing,
    touchTargetSize,
    isSmallScreen: screenSize.width < 640,
    isTouchDevice: isTouchDevice(),
    
    // Common responsive utilities
    showSidebar: screenSize.isDesktop,
    useStackedLayout: screenSize.isMobile,
    showCompactUI: screenSize.isMobile,
    
    // Animation preferences based on screen size
    reduceAnimations: screenSize.isMobile || isTouchDevice(),
    
    // Layout helpers
    getContainerPadding: () => getResponsiveValueHelper('p-2', 'p-4', 'p-6'),
    getButtonSize: () => getResponsiveValueHelper('sm', 'md', 'lg'),
    getFontSize: () => getResponsiveValueHelper('text-sm', 'text-base', 'text-lg'),
    getModalWidth: () => getResponsiveValueHelper('w-full', 'w-96', 'w-auto'),
    
    // Game-specific helpers
    getGemSize: () => boardSize.gemSize,
    getBoardContainerSize: () => boardSize.size,
    getGameLayoutColumns: () => getResponsiveValueHelper(1, 2, 3),
    
    // Touch-specific optimizations
    getMinTouchTarget: () => touchTargetSize,
    shouldUseLargerButtons: () => isTouchDevice() && screenSize.isMobile
  }
}

export default useResponsive 