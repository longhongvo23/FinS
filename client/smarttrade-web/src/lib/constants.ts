// App constants
export const APP_NAME = 'SmartTrade AI'
export const APP_DESCRIPTION = 'Nền tảng giao dịch chứng khoán thông minh với AI'

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Trading constants
export const ORDER_TYPES = {
  LO: 'Lệnh giới hạn',
  MP: 'Lệnh thị trường',
  ATO: 'Lệnh ATO',
  ATC: 'Lệnh ATC',
  stop: 'Lệnh dừng',
  stop_limit: 'Lệnh dừng giới hạn',
} as const

export const ORDER_SIDES = {
  buy: 'Mua',
  sell: 'Bán',
} as const

export const ORDER_STATUSES = {
  pending: 'Chờ xử lý',
  open: 'Đang mở',
  partial: 'Khớp một phần',
  filled: 'Đã khớp',
  cancelled: 'Đã hủy',
  rejected: 'Bị từ chối',
} as const

// Exchanges
export const EXCHANGES = {
  HOSE: 'HOSE',
  HNX: 'HNX',
  UPCOM: 'UPCOM',
} as const

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  free: 'Miễn phí',
  premium: 'Premium',
  vip: 'VIP',
} as const

// AI limits
export const FREE_DAILY_AI_LIMIT = 3

// Chart colors
export const CHART_COLORS = {
  up: '#10B981',
  down: '#EF4444',
  neutral: '#F59E0B',
  volume: '#6366F1',
  grid: '#27272A',
}

// Navigation items
export const NAV_ITEMS = [
  { icon: 'Home', label: 'Trang chủ', href: '/dashboard' },
  { icon: 'BarChart3', label: 'Thị trường', href: '/market' },
  { icon: 'Wallet', label: 'Giao dịch', href: '/trading' },
  { icon: 'PieChart', label: 'Danh mục', href: '/portfolio' },
  { icon: 'MessageSquare', label: 'AI Chat', href: '/ai-chat', premium: true },
  { icon: 'Star', label: 'Watchlist', href: '/watchlist' },
  { icon: 'TrendingUp', label: 'Phái sinh', href: '/derivatives' },
  { icon: 'Settings', label: 'Cài đặt', href: '/settings' },
] as const
