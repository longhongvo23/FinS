import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Date Utils', () => {
  // ============================================
  // Trading Hours Check
  // ============================================

  describe('isMarketOpen', () => {
    const isMarketOpen = (date: Date) => {
      const day = date.getDay()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const time = hours * 60 + minutes

      // Weekend
      if (day === 0 || day === 6) return false

      // Morning session: 9:00 - 11:30
      // Afternoon session: 13:00 - 14:45
      const morningStart = 9 * 60
      const morningEnd = 11 * 60 + 30
      const afternoonStart = 13 * 60
      const afternoonEnd = 14 * 60 + 45

      return (time >= morningStart && time <= morningEnd) ||
             (time >= afternoonStart && time <= afternoonEnd)
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true during morning session', () => {
      vi.setSystemTime(new Date('2024-12-23T09:30:00')) // Monday
      expect(isMarketOpen(new Date())).toBe(true)
    })

    it('returns true during afternoon session', () => {
      vi.setSystemTime(new Date('2024-12-23T14:00:00'))
      expect(isMarketOpen(new Date())).toBe(true)
    })

    it('returns false during lunch break', () => {
      vi.setSystemTime(new Date('2024-12-23T12:00:00'))
      expect(isMarketOpen(new Date())).toBe(false)
    })

    it('returns false on Saturday', () => {
      vi.setSystemTime(new Date('2024-12-21T10:00:00'))
      expect(isMarketOpen(new Date())).toBe(false)
    })

    it('returns false on Sunday', () => {
      vi.setSystemTime(new Date('2024-12-22T10:00:00'))
      expect(isMarketOpen(new Date())).toBe(false)
    })

    it('returns false before market opens', () => {
      vi.setSystemTime(new Date('2024-12-23T08:00:00'))
      expect(isMarketOpen(new Date())).toBe(false)
    })

    it('returns false after market closes', () => {
      vi.setSystemTime(new Date('2024-12-23T15:00:00'))
      expect(isMarketOpen(new Date())).toBe(false)
    })

    it('returns true at market open time', () => {
      vi.setSystemTime(new Date('2024-12-23T09:00:00'))
      expect(isMarketOpen(new Date())).toBe(true)
    })

    it('returns true at morning close time', () => {
      vi.setSystemTime(new Date('2024-12-23T11:30:00'))
      expect(isMarketOpen(new Date())).toBe(true)
    })

    it('returns true at afternoon open time', () => {
      vi.setSystemTime(new Date('2024-12-23T13:00:00'))
      expect(isMarketOpen(new Date())).toBe(true)
    })
  })

  // ============================================
  // Relative Time Formatting
  // ============================================

  describe('formatRelativeTime', () => {
    const formatRelativeTime = (date: Date) => {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSecs < 60) return 'Vừa xong'
      if (diffMins < 60) return `${diffMins} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`
      return date.toLocaleDateString('vi-VN')
    }

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-12-25T10:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "Vừa xong" for recent times', () => {
      const date = new Date('2024-12-25T09:59:30')
      expect(formatRelativeTime(date)).toBe('Vừa xong')
    })

    it('returns minutes ago', () => {
      const date = new Date('2024-12-25T09:45:00')
      expect(formatRelativeTime(date)).toBe('15 phút trước')
    })

    it('returns hours ago', () => {
      const date = new Date('2024-12-25T07:00:00')
      expect(formatRelativeTime(date)).toBe('3 giờ trước')
    })

    it('returns days ago', () => {
      const date = new Date('2024-12-23T10:00:00')
      expect(formatRelativeTime(date)).toBe('2 ngày trước')
    })

    it('returns formatted date for older than a week', () => {
      const date = new Date('2024-12-10T10:00:00')
      const result = formatRelativeTime(date)
      expect(result).toContain('12')
    })

    it('returns 1 minute ago correctly', () => {
      const date = new Date('2024-12-25T09:59:00')
      expect(formatRelativeTime(date)).toBe('1 phút trước')
    })

    it('returns 1 hour ago correctly', () => {
      const date = new Date('2024-12-25T09:00:00')
      expect(formatRelativeTime(date)).toBe('1 giờ trước')
    })

    it('returns 1 day ago correctly', () => {
      const date = new Date('2024-12-24T10:00:00')
      expect(formatRelativeTime(date)).toBe('1 ngày trước')
    })
  })

  // ============================================
  // Trading Day Utils
  // ============================================

  describe('getTradingDays', () => {
    const isTradingDay = (date: Date) => {
      const day = date.getDay()
      return day !== 0 && day !== 6 // Not weekend
    }

    const getNextTradingDay = (date: Date) => {
      const next = new Date(date)
      next.setDate(next.getDate() + 1)
      while (!isTradingDay(next)) {
        next.setDate(next.getDate() + 1)
      }
      return next
    }

    const getPreviousTradingDay = (date: Date) => {
      const prev = new Date(date)
      prev.setDate(prev.getDate() - 1)
      while (!isTradingDay(prev)) {
        prev.setDate(prev.getDate() - 1)
      }
      return prev
    }

    it('identifies weekday as trading day', () => {
      expect(isTradingDay(new Date('2024-12-23'))).toBe(true) // Monday
      expect(isTradingDay(new Date('2024-12-24'))).toBe(true) // Tuesday
      expect(isTradingDay(new Date('2024-12-25'))).toBe(true) // Wednesday
      expect(isTradingDay(new Date('2024-12-26'))).toBe(true) // Thursday
      expect(isTradingDay(new Date('2024-12-27'))).toBe(true) // Friday
    })

    it('identifies weekend as non-trading day', () => {
      expect(isTradingDay(new Date('2024-12-21'))).toBe(false) // Saturday
      expect(isTradingDay(new Date('2024-12-22'))).toBe(false) // Sunday
    })

    it('gets next trading day from Friday', () => {
      const friday = new Date('2024-12-27')
      const next = getNextTradingDay(friday)
      expect(next.getDay()).toBe(1) // Monday
    })

    it('gets next trading day from Saturday', () => {
      const saturday = new Date('2024-12-28')
      const next = getNextTradingDay(saturday)
      expect(next.getDay()).toBe(1) // Monday
    })

    it('gets next trading day from Sunday', () => {
      const sunday = new Date('2024-12-29')
      const next = getNextTradingDay(sunday)
      expect(next.getDay()).toBe(1) // Monday
    })

    it('gets previous trading day from Monday', () => {
      const monday = new Date('2024-12-23')
      const prev = getPreviousTradingDay(monday)
      expect(prev.getDay()).toBe(5) // Friday
    })

    it('gets previous trading day from Sunday', () => {
      const sunday = new Date('2024-12-22')
      const prev = getPreviousTradingDay(sunday)
      expect(prev.getDay()).toBe(5) // Friday
    })
  })

  // ============================================
  // Session Time Utils
  // ============================================

  describe('getSessionInfo', () => {
    const getSessionInfo = (date: Date) => {
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const time = hours * 60 + minutes

      if (time < 9 * 60) return { session: 'pre-market', label: 'Trước giờ mở cửa' }
      if (time <= 11 * 60 + 30) return { session: 'morning', label: 'Phiên sáng' }
      if (time < 13 * 60) return { session: 'lunch', label: 'Nghỉ trưa' }
      if (time <= 14 * 60 + 45) return { session: 'afternoon', label: 'Phiên chiều' }
      return { session: 'after-hours', label: 'Sau giờ đóng cửa' }
    }

    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('identifies pre-market session', () => {
      vi.setSystemTime(new Date('2024-12-23T08:00:00'))
      expect(getSessionInfo(new Date()).session).toBe('pre-market')
    })

    it('identifies morning session', () => {
      vi.setSystemTime(new Date('2024-12-23T10:00:00'))
      expect(getSessionInfo(new Date()).session).toBe('morning')
    })

    it('identifies lunch break', () => {
      vi.setSystemTime(new Date('2024-12-23T12:00:00'))
      expect(getSessionInfo(new Date()).session).toBe('lunch')
    })

    it('identifies afternoon session', () => {
      vi.setSystemTime(new Date('2024-12-23T14:00:00'))
      expect(getSessionInfo(new Date()).session).toBe('afternoon')
    })

    it('identifies after-hours', () => {
      vi.setSystemTime(new Date('2024-12-23T16:00:00'))
      expect(getSessionInfo(new Date()).session).toBe('after-hours')
    })
  })
})
