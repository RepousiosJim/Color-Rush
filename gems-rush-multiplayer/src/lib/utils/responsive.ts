export interface ScreenSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export interface ResponsiveConfig {
  mobileBreakpoint: number
  tabletBreakpoint: number
  desktopBreakpoint: number
}

export const defaultResponsiveConfig: ResponsiveConfig = {
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  desktopBreakpoint: 1280
}

export const getScreenSize = (config = defaultResponsiveConfig): ScreenSize => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      isDesktop: false
    }
  }

  const width = window.innerWidth
  const height = window.innerHeight

  return {
    width,
    height,
    isMobile: width < config.mobileBreakpoint,
    isTablet: width >= config.mobileBreakpoint && width < config.tabletBreakpoint,
    isDesktop: width >= config.tabletBreakpoint
  }
}

export const getResponsiveValue = <T>(
  screenSize: ScreenSize,
  mobile: T,
  tablet: T,
  desktop: T
): T => {
  if (screenSize.isMobile) return mobile
  if (screenSize.isTablet) return tablet
  return desktop
}

export const getOptimalBoardSize = (screenSize: ScreenSize) => {
  return getResponsiveValue(
    screenSize,
    { size: 320, gemSize: 40 },
    { size: 400, gemSize: 50 },
    { size: 480, gemSize: 60 }
  )
}

export const getOptimalGridColumns = (screenSize: ScreenSize) => {
  return getResponsiveValue(
    screenSize,
    'grid-cols-1',
    'md:grid-cols-2 lg:grid-cols-3',
    'lg:grid-cols-4'
  )
}

export const getOptimalSpacing = (screenSize: ScreenSize) => {
  return getResponsiveValue(
    screenSize,
    'gap-2 p-2',
    'gap-4 p-4',
    'gap-6 p-6'
  )
}

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getOptimalTouchTargetSize = (screenSize: ScreenSize) => {
  const baseTouchTarget = isTouchDevice() ? 48 : 40
  return getResponsiveValue(
    screenSize,
    baseTouchTarget,
    baseTouchTarget + 4,
    baseTouchTarget + 8
  )
} 