import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (classnames utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active', false && 'inactive')).toBe('base active')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'active')).toBe('base active')
  })

  it('should handle empty strings', () => {
    expect(cn('', 'foo', '', 'bar')).toBe('foo bar')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle complex tailwind merging', () => {
    // Later classes should override earlier ones
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-white', 'bg-black')).toBe('bg-black')
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should preserve different utility types', () => {
    expect(cn('p-4 m-2 text-center bg-white', 'text-left')).toBe('p-4 m-2 bg-white text-left')
  })
})

describe('formatCurrency', () => {
  // Test if you have a formatCurrency function in utils
  it.skip('should format VND currency correctly', () => {
    // Add your formatCurrency tests when function exists
  })
})

describe('formatPercent', () => {
  // Test if you have a formatPercent function in utils
  it.skip('should format percentages correctly', () => {
    // Add your formatPercent tests when function exists
  })
})
