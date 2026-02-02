import {
  Gem,
  Rocket,
  Trophy,
  Coins,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Calendar,
  Bot,
  Newspaper,
  Clock,
  type LucideIcon,
} from 'lucide-react'

// Preset screen icon mapping
export const presetIconMap: Record<string, LucideIcon> = {
  value: Gem,
  growth: Rocket,
  bluechip: Trophy,
  dividend: Coins,
  oversold: TrendingDown,
  breakout: TrendingUp,
}

// Event type icon mapping
export const eventTypeIconMap: Record<string, LucideIcon> = {
  earnings: BarChart3,
  economic: TrendingUp,
  dividend: Coins,
  ipo: Rocket,
}

// Alert type icon mapping
export const alertTypeIconMap: Record<string, LucideIcon> = {
  ai_insight: Bot,
  news: Newspaper,
  technical: TrendingUp,
}

// Helper to get icon component
export function getPresetIcon(id: string): LucideIcon {
  return presetIconMap[id] || Gem
}

export function getEventIcon(type: string): LucideIcon {
  return eventTypeIconMap[type] || Calendar
}

export function getAlertIcon(type: string): LucideIcon {
  return alertTypeIconMap[type] || Bot
}

// Export common icons for direct use
export {
  Gem,
  Rocket,
  Trophy,
  Coins,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Bot,
  Newspaper,
  Clock,
}
