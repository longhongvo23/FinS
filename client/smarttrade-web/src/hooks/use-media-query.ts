import { useState, useEffect } from 'react'

/**
 * Hook to detect if a media query matches
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      // Legacy browsers
      mediaQuery.addListener(handler)
      return () => mediaQuery.removeListener(handler)
    }
  }, [query])

  return matches
}

// Tailwind breakpoint values
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

/**
 * Hook to detect if viewport is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(`(min-width: ${breakpoints.md})`)
}

/**
 * Hook to detect if viewport is tablet (768px - 1023px)
 */
export function useIsTablet(): boolean {
  const isAboveMobile = useMediaQuery(`(min-width: ${breakpoints.md})`)
  const isBelowDesktop = !useMediaQuery(`(min-width: ${breakpoints.lg})`)
  return isAboveMobile && isBelowDesktop
}

/**
 * Hook to detect if viewport is desktop (>= 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`)
}

/**
 * Hook that returns current breakpoint name
 */
export function useBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm})`)
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md})`)
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`)
  const isXl = useMediaQuery(`(min-width: ${breakpoints.xl})`)
  const is2Xl = useMediaQuery(`(min-width: ${breakpoints['2xl']})`)

  if (is2Xl) return '2xl'
  if (isXl) return 'xl'
  if (isLg) return 'lg'
  if (isMd) return 'md'
  if (isSm) return 'sm'
  return 'xs'
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - msMaxTouchPoints is IE specific
      navigator.msMaxTouchPoints > 0
    )
  }, [])

  return isTouch
}

/**
 * Hook to detect reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * Hook to detect dark mode preference (system level)
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

/**
 * Hook to detect landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}

/**
 * Hook to detect portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}

/**
 * Combined hook that returns multiple device info at once
 * Useful to avoid multiple re-renders
 */
export function useDeviceInfo() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isTouch = useIsTouchDevice()
  const breakpoint = useBreakpoint()
  const prefersReducedMotion = usePrefersReducedMotion()

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    breakpoint,
    prefersReducedMotion,
  }
}
