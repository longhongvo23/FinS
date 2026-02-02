import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'

// Mock localStorage before importing stores
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Import stores after mocking
import { useUIStore } from '../../stores/ui-store'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store state
    const { getState } = useUIStore
    act(() => {
      getState().setTheme('system')
      if (getState().sidebarCollapsed) {
        getState().toggleSidebar()
      }
    })
    localStorageMock.clear()
  })

  describe('theme', () => {
    it('should have default theme as system', () => {
      const { theme } = useUIStore.getState()
      expect(theme).toBe('system')
    })

    it('should set theme to dark', () => {
      act(() => {
        useUIStore.getState().setTheme('dark')
      })
      expect(useUIStore.getState().theme).toBe('dark')
    })

    it('should set theme to light', () => {
      act(() => {
        useUIStore.getState().setTheme('light')
      })
      expect(useUIStore.getState().theme).toBe('light')
    })
  })

  describe('sidebar', () => {
    it('should have sidebar expanded by default', () => {
      const { sidebarCollapsed } = useUIStore.getState()
      expect(sidebarCollapsed).toBe(false)
    })

    it('should toggle sidebar collapsed state', () => {
      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)

      act(() => {
        useUIStore.getState().toggleSidebar()
      })
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })
})

// Test auth store if it exists
describe('useAuthStore', () => {
  it.skip('should handle login state', () => {
    // Add auth store tests when available
  })

  it.skip('should handle logout', () => {
    // Add auth store tests when available
  })
})
