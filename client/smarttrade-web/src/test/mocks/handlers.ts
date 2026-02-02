import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:8000/api/v1'

// Mock data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockStocks = [
  {
    symbol: 'VNM',
    name: 'Công ty CP Sữa Việt Nam',
    price: 85000,
    change: 1500,
    change_percent: 1.8,
    volume: 2500000,
    market_cap: 180000000000000,
  },
  {
    symbol: 'FPT',
    name: 'Công ty CP FPT',
    price: 145000,
    change: -2000,
    change_percent: -1.36,
    volume: 1800000,
    market_cap: 160000000000000,
  },
  {
    symbol: 'VIC',
    name: 'Tập đoàn Vingroup',
    price: 42000,
    change: 500,
    change_percent: 1.2,
    volume: 3200000,
    market_cap: 145000000000000,
  },
]

export const mockPortfolio = {
  total_value: 125000000,
  cash_balance: 25000000,
  total_profit: 15000000,
  profit_percent: 13.6,
  positions: [
    {
      symbol: 'VNM',
      quantity: 500,
      avg_price: 80000,
      current_price: 85000,
      market_value: 42500000,
      profit: 2500000,
      profit_percent: 6.25,
    },
    {
      symbol: 'FPT',
      quantity: 300,
      avg_price: 140000,
      current_price: 145000,
      market_value: 43500000,
      profit: 1500000,
      profit_percent: 3.57,
    },
  ],
}

export const mockAlerts = [
  {
    id: 'alert-1',
    name: 'VNM Buy Signal',
    symbol: 'VNM',
    is_active: true,
    logic_operator: 'AND',
    conditions: [
      { indicator: 'price', operator: '<=', value: 82000 },
      { indicator: 'rsi', operator: '<=', value: 30 },
    ],
    trigger_count: 2,
    last_triggered_at: '2024-12-20T10:30:00Z',
  },
  {
    id: 'alert-2',
    name: 'FPT Breakout',
    symbol: 'FPT',
    is_active: false,
    logic_operator: 'OR',
    conditions: [
      { indicator: 'price', operator: '>=', value: 150000 },
      { indicator: 'volume', operator: '>=', value: 3000000 },
    ],
    trigger_count: 0,
    last_triggered_at: null,
  },
]

export const mockChatMessages = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: 'Xin chào! Tôi là AI Assistant của SmartTrade. Tôi có thể giúp bạn phân tích thị trường, tìm kiếm cổ phiếu, và đưa ra các đề xuất đầu tư.',
    timestamp: '2024-12-25T08:00:00Z',
  },
]

// API Handlers
export const handlers = [
  // Auth
  http.post(`${API_BASE}/auth/login`, async () => {
    return HttpResponse.json({
      user: mockUser,
      session: { access_token: 'mock-token' },
    })
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    return HttpResponse.json({ success: true })
  }),

  http.get(`${API_BASE}/auth/me`, async () => {
    return HttpResponse.json(mockUser)
  }),

  // Market
  http.get(`${API_BASE}/market/stocks`, async () => {
    return HttpResponse.json({ stocks: mockStocks })
  }),

  http.get(`${API_BASE}/market/stocks/:symbol`, async ({ params }) => {
    const stock = mockStocks.find(s => s.symbol === params.symbol)
    if (!stock) {
      return HttpResponse.json({ error: 'Stock not found' }, { status: 404 })
    }
    return HttpResponse.json(stock)
  }),

  http.get(`${API_BASE}/market/indices`, async () => {
    return HttpResponse.json({
      indices: [
        { symbol: 'VNINDEX', value: 1250.5, change: 12.3, change_percent: 0.99 },
        { symbol: 'VN30', value: 1285.2, change: 8.7, change_percent: 0.68 },
        { symbol: 'HNX', value: 235.8, change: -1.2, change_percent: -0.51 },
      ],
    })
  }),

  // Portfolio
  http.get(`${API_BASE}/portfolio`, async () => {
    return HttpResponse.json(mockPortfolio)
  }),

  http.get(`${API_BASE}/portfolio/positions`, async () => {
    return HttpResponse.json({ positions: mockPortfolio.positions })
  }),

  // Trading
  http.post(`${API_BASE}/trading/orders`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'order-' + Date.now(),
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
  }),

  http.get(`${API_BASE}/trading/orders`, async () => {
    return HttpResponse.json({
      orders: [
        {
          id: 'order-1',
          symbol: 'VNM',
          side: 'buy',
          quantity: 100,
          price: 85000,
          status: 'filled',
          created_at: '2024-12-25T09:30:00Z',
        },
      ],
    })
  }),

  // Alerts
  http.get(`${API_BASE}/alerts`, async () => {
    return HttpResponse.json({ alerts: mockAlerts })
  }),

  http.post(`${API_BASE}/alerts`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: 'alert-' + Date.now(),
      ...body,
      is_active: true,
      trigger_count: 0,
      created_at: new Date().toISOString(),
    })
  }),

  http.post(`${API_BASE}/alerts/:id/toggle`, async ({ params }) => {
    const alert = mockAlerts.find(a => a.id === params.id)
    if (alert) {
      alert.is_active = !alert.is_active
    }
    return HttpResponse.json({ success: true })
  }),

  http.get(`${API_BASE}/alerts/limits`, async () => {
    return HttpResponse.json({
      used: 2,
      limit: 5,
      is_premium: false,
    })
  }),

  // AI Chat
  http.post(`${API_BASE}/ai/chat`, async ({ request }) => {
    const body = await request.json() as { message?: string }
    return HttpResponse.json({
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: `Bạn đã hỏi: "${body.message}". Đây là phản hồi từ AI Assistant.`,
      timestamp: new Date().toISOString(),
    })
  }),

  http.get(`${API_BASE}/ai/chat/history`, async () => {
    return HttpResponse.json({ messages: mockChatMessages })
  }),

  // Research
  http.get(`${API_BASE}/research/report/:symbol`, async ({ params }) => {
    return HttpResponse.json({
      symbol: params.symbol,
      recommendation: 'BUY',
      target_price: 95000,
      current_price: 85000,
      upside: 11.76,
      analysis: 'Phân tích chi tiết về cổ phiếu...',
      scores: {
        technical: 75,
        fundamental: 82,
        sentiment: 68,
      },
    })
  }),

  // Watchlist
  http.get(`${API_BASE}/watchlist`, async () => {
    return HttpResponse.json({
      items: mockStocks.slice(0, 2).map(s => ({
        symbol: s.symbol,
        added_at: '2024-12-01T00:00:00Z',
      })),
    })
  }),

  http.post(`${API_BASE}/watchlist/:symbol`, async ({ params }) => {
    return HttpResponse.json({ symbol: params.symbol, added: true })
  }),

  http.delete(`${API_BASE}/watchlist/:symbol`, async ({ params }) => {
    return HttpResponse.json({ symbol: params.symbol, removed: true })
  }),
]
