import type { SentimentType, StockRating, MarketSummary, StockAnalysis, SectorInsight } from '@/stores/ai-store'

// ============================================
// MOCK MARKET SUMMARIES
// ============================================

const marketSummaryTemplates: Omit<MarketSummary, 'lastUpdated'>[] = [
  {
    sentiment: 'bullish',
    title: 'Thị trường US Tech tăng mạnh',
    summary: 'NASDAQ tăng 1.5% với NVDA và AAPL dẫn dắt. Dòng tiền đổ mạnh vào nhóm AI stocks khi nhu cầu chip tiếp tục vượt kỳ vọng.',
    highlights: [
      'NASDAQ vượt mốc 20,000 điểm',
      'NVDA tăng 3.8% sau tin doanh thu datacenter kỷ lục',
      'AAPL vượt $3 trillion market cap',
      'Volume giao dịch tăng 40% so với trung bình',
      'Tất cả 7 mega tech stocks đều tăng điểm',
    ],
  },
  {
    sentiment: 'bearish',
    title: 'Thị trường điều chỉnh giảm',
    summary: 'NASDAQ giảm 1.2% do áp lực chốt lời và lo ngại Fed giữ lãi suất cao. Big tech stocks bị bán mạnh.',
    highlights: [
      'NASDAQ mất mốc hỗ trợ 19,500 điểm',
      'TSLA giảm 4% sau báo cáo giao xe thấp kỳ vọng',
      'GOOGL, META giảm do lo ngại antitrust',
      'VIX tăng lên 22, tâm lý thận trọng',
      '10-year Treasury yield vượt 4.5%',
    ],
  },
  {
    sentiment: 'neutral',
    title: 'Thị trường đi ngang chờ Fed',
    summary: 'US tech stocks biến động hẹp trước cuộc họp FOMC. Nhà đầu tư chờ đợi tín hiệu về lộ trình cắt giảm lãi suất.',
    highlights: [
      'NASDAQ dao động quanh mốc 19,800 điểm',
      'AAPL, MSFT giao dịch cân bằng',
      'Phân hóa giữa AI stocks và rest of tech',
      'Chờ báo cáo earnings Q4 từ big tech',
      'CPI và Non-Farm Payrolls sẽ quyết định xu hướng',
    ],
  },
]

// ============================================
// STOCK DATA & ANALYSIS TEMPLATES
// ============================================

interface StockInfo {
  symbol: string
  name: string
  sector: string
  description: string
}

const stockDatabase: Record<string, StockInfo> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc',
    sector: 'Consumer Electronics',
    description: 'công ty công nghệ lớn nhất thế giới với iPhone, Mac, và hệ sinh thái Apple',
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    description: 'công ty chip AI hàng đầu thế giới với GPU H100/H200 thống trị datacenter',
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Software & Cloud',
    description: 'gã khổng lồ software với Azure cloud, Office 365 và Copilot AI',
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc',
    sector: 'E-commerce & Cloud',
    description: 'công ty e-commerce lớn nhất với AWS là nền tảng cloud hàng đầu',
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc',
    sector: 'Electric Vehicles',
    description: 'nhà sản xuất xe điện hàng đầu với công nghệ FSD và năng lượng sạch',
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms Inc',
    sector: 'Social Media & AI',
    description: 'công ty mạng xã hội với Facebook, Instagram, WhatsApp và đầu tư metaverse',
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    sector: 'Search & Advertising',
    description: 'công ty mẹ của Google với Search, YouTube, Cloud và Waymo',
  },
}

const prosTemplates = [
  'Vị thế dẫn đầu thị trường với thị phần lớn',
  'Tài chính lành mạnh, dòng tiền ổn định',
  'Ban lãnh đạo có kinh nghiệm và tầm nhìn',
  'Cổ tức đều đặn, hấp dẫn nhà đầu tư dài hạn',
  'Chiến lược mở rộng rõ ràng và khả thi',
  'Công nghệ và đổi mới sáng tạo liên tục',
  'Thương hiệu mạnh được người tiêu dùng tin tưởng',
  'Lợi thế cạnh tranh bền vững trong ngành',
]

const consTemplates = [
  'Định giá cao so với trung bình ngành',
  'Phụ thuộc nhiều vào thị trường nội địa',
  'Chi phí nguyên vật liệu biến động',
  'Cạnh tranh ngày càng gay gắt',
  'Rủi ro từ chính sách và quy định mới',
  'Tốc độ tăng trưởng có dấu hiệu chậm lại',
  'Nợ vay ở mức cao cần theo dõi',
  'Biên lợi nhuận có xu hướng thu hẹp',
]

const ratingDescriptions: Record<StockRating, string> = {
  strong_buy: 'Khuyến nghị MUA MẠNH',
  buy: 'Khuyến nghị MUA',
  hold: 'Khuyến nghị NẮM GIỮ',
  sell: 'Khuyến nghị BÁN',
  strong_sell: 'Khuyến nghị BÁN MẠNH',
}

// ============================================
// SECTOR INSIGHTS TEMPLATES
// ============================================

const sectorInsightsTemplates: Omit<SectorInsight, 'topStocks'>[] = [
  {
    sector: 'AI & Semiconductors',
    sentiment: 'bullish',
    summary: 'Nhóm chip AI đang bùng nổ với nhu cầu GPU vượt xa nguồn cung. NVDA thống trị thị trường datacenter, biên lợi nhuận cao kỷ lục.',
  },
  {
    sector: 'Cloud & Software',
    sentiment: 'bullish',
    summary: 'Cloud computing tiếp tục tăng trưởng mạnh. MSFT Azure và AMZN AWS dẫn đầu, AI integration tạo thêm động lực revenue.',
  },
  {
    sector: 'Consumer Tech',
    sentiment: 'neutral',
    summary: 'Smartphone và PC đang ổn định. AAPL duy trì premium segment, chờ đợi AI features mới thúc đẩy upgrade cycle.',
  },
  {
    sector: 'Electric Vehicles',
    sentiment: 'bullish',
    summary: 'Xe điện tiếp tục tăng thị phần toàn cầu. TSLA dẫn đầu với FSD technology và mở rộng Gigafactory.',
  },
  {
    sector: 'Digital Advertising',
    sentiment: 'neutral',
    summary: 'Quảng cáo số phục hồi sau giai đoạn khó khăn. META và GOOGL hưởng lợi từ AI targeting, nhưng antitrust là rủi ro.',
  },
]

// ============================================
// CHAT RESPONSE TEMPLATES
// ============================================

const chatResponses: Record<string, string[]> = {
  market: [
    'Thị trường US tech hôm nay giao dịch tích cực với NASDAQ tăng 0.8%. NVDA dẫn dắt với +2.5% nhờ tin tức về chip AI mới. Volume cao hơn 20% so với trung bình.',
    'Nhìn chung thị trường đang trong xu hướng tích lũy. NASDAQ dao động quanh vùng 19,500-20,000 điểm. Chờ đợi Fed meeting và earnings reports từ big tech.',
  ],
  portfolio: [
    'Dựa trên danh mục của bạn, tôi thấy bạn đang có tỷ trọng cao ở nhóm AI/Semiconductors với NVDA - đây là ngành có triển vọng tích cực. Tuy nhiên, có thể diversify thêm vào AAPL, MSFT để cân bằng.',
    'Danh mục của bạn có hiệu suất tốt so với S&P 500 trong tháng qua. NVDA và TSLA đang là 2 mã đóng góp nhiều nhất. Bạn nên cân nhắc chốt lời một phần nếu các mã đã tăng trên 30%.',
  ],
  compare: [
    'So sánh hai mã này, tôi thấy mỗi mã có ưu điểm riêng. Về định giá, Forward P/E của mã đầu thấp hơn nhưng revenue growth lại kém hơn. Bạn nên xem xét mục tiêu đầu tư và risk tolerance.',
  ],
  recommend: [
    'Dựa trên phân tích kỹ thuật và cơ bản, một số mã đáng chú ý tuần này: NVDA (AI demand mạnh), AAPL (Apple Intelligence), TSLA (FSD progress). Tuy nhiên, bạn nên tự nghiên cứu kỹ trước khi quyết định.',
    'Tuần này tôi khuyến nghị quan tâm nhóm AI stocks như NVDA, MSFT do nhu cầu chip và cloud AI tiếp tục tăng. META cũng hấp dẫn sau khi quảng cáo phục hồi mạnh.',
  ],
  default: [
    'Tôi có thể giúp bạn phân tích 7 mã US tech stocks: AAPL, NVDA, MSFT, AMZN, TSLA, META, GOOGL. Bạn có thể hỏi tôi về:\n• Tổng quan thị trường US tech\n• Phân tích một mã cụ thể\n• So sánh các cổ phiếu\n• Khuyến nghị đầu tư',
    'Xin chào! Tôi là trợ lý AI của SmartTrade. Tôi có thể giúp bạn phân tích 7 big tech stocks:\n• AAPL, NVDA, MSFT, AMZN\n• TSLA, META, GOOGL\n\nBạn muốn tìm hiểu về mã nào?',
  ],
}

// ============================================
// GENERATOR FUNCTIONS
// ============================================

export function generateMarketSummary(): MarketSummary {
  const template = marketSummaryTemplates[Math.floor(Math.random() * marketSummaryTemplates.length)]
  return {
    ...template,
    lastUpdated: new Date().toISOString(),
  }
}

export function generateStockAnalysis(symbol: string): StockAnalysis {
  const stock = stockDatabase[symbol] || {
    symbol,
    name: `Công ty ${symbol}`,
    sector: 'Khác',
    description: 'một công ty niêm yết trên sàn HOSE',
  }

  const shuffledPros = [...prosTemplates].sort(() => Math.random() - 0.5)
  const shuffledCons = [...consTemplates].sort(() => Math.random() - 0.5)

  const ratings: StockRating[] = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']
  const rating = ratings[Math.floor(Math.random() * 3)] // Favor positive ratings

  const similarSymbols = Object.keys(stockDatabase)
    .filter((s) => s !== symbol)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  return {
    symbol,
    overview: `${stock.symbol} (${stock.name}) là ${stock.description}. Công ty hoạt động trong lĩnh vực ${stock.sector} với vị thế cạnh tranh mạnh trên thị trường.`,
    performance: `Trong 3 tháng gần đây, ${stock.symbol} đã ${Math.random() > 0.5 ? 'tăng' : 'giảm'} ${(Math.random() * 15 + 5).toFixed(1)}% so với đầu kỳ. ${Math.random() > 0.5 ? 'Thanh khoản cải thiện đáng kể' : 'Khối lượng giao dịch ổn định'} với trung bình ${(Math.random() * 2 + 0.5).toFixed(1)} triệu cổ phiếu/phiên.`,
    pros: shuffledPros.slice(0, 3),
    cons: shuffledCons.slice(0, 3),
    rating,
    similarStocks: similarSymbols.map((s) => ({
      symbol: s,
      name: stockDatabase[s]?.name || s,
      reason: `Cùng ngành ${stockDatabase[s]?.sector || 'Khác'}`,
    })),
    lastUpdated: new Date().toISOString(),
  }
}

export function generateSectorInsights(): SectorInsight[] {
  const sectorStocks: Record<string, string[]> = {
    'AI & Semiconductors': ['NVDA'],
    'Cloud & Software': ['MSFT', 'AMZN', 'GOOGL'],
    'Consumer Tech': ['AAPL'],
    'Electric Vehicles': ['TSLA'],
    'Digital Advertising': ['META', 'GOOGL'],
  }

  return sectorInsightsTemplates.map((template) => ({
    ...template,
    topStocks: sectorStocks[template.sector] || [],
  }))
}

export function generateChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('thị trường') || lowerMessage.includes('market') || lowerMessage.includes('hôm nay')) {
    return chatResponses.market[Math.floor(Math.random() * chatResponses.market.length)]
  }

  if (lowerMessage.includes('portfolio') || lowerMessage.includes('danh mục')) {
    return chatResponses.portfolio[Math.floor(Math.random() * chatResponses.portfolio.length)]
  }

  if (lowerMessage.includes('so sánh') || lowerMessage.includes('compare')) {
    return chatResponses.compare[Math.floor(Math.random() * chatResponses.compare.length)]
  }

  if (lowerMessage.includes('mua') || lowerMessage.includes('khuyến nghị') || lowerMessage.includes('recommend') || lowerMessage.includes('tuần này')) {
    return chatResponses.recommend[Math.floor(Math.random() * chatResponses.recommend.length)]
  }

  // Check for specific stock symbol
  const stockSymbols = Object.keys(stockDatabase)
  const mentionedStock = stockSymbols.find((s) => lowerMessage.includes(s.toLowerCase()))
  if (mentionedStock) {
    const stock = stockDatabase[mentionedStock]
    return `${stock.symbol} (${stock.name}) là ${stock.description}.\n\nĐây là mã thuộc nhóm ${stock.sector}. Để có phân tích chi tiết hơn, bạn có thể truy cập trang chi tiết cổ phiếu và xem tab "AI Analysis".`
  }

  return chatResponses.default[Math.floor(Math.random() * chatResponses.default.length)]
}

export function getRatingColor(rating: StockRating): string {
  switch (rating) {
    case 'strong_buy':
      return 'text-[var(--color-positive)]'
    case 'buy':
      return 'text-[var(--color-positive)]'
    case 'hold':
      return 'text-[var(--color-warning)]'
    case 'sell':
      return 'text-[var(--color-negative)]'
    case 'strong_sell':
      return 'text-[var(--color-negative)]'
  }
}

export function getRatingBgColor(rating: StockRating): string {
  switch (rating) {
    case 'strong_buy':
      return 'bg-[var(--color-positive)]/10'
    case 'buy':
      return 'bg-[var(--color-positive)]/10'
    case 'hold':
      return 'bg-[var(--color-warning)]/10'
    case 'sell':
      return 'bg-[var(--color-negative)]/10'
    case 'strong_sell':
      return 'bg-[var(--color-negative)]/10'
  }
}

export function getRatingLabel(rating: StockRating): string {
  return ratingDescriptions[rating]
}

export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'bullish':
      return 'text-[var(--color-positive)]'
    case 'bearish':
      return 'text-[var(--color-negative)]'
    case 'neutral':
      return 'text-[var(--color-warning)]'
  }
}

export function getSentimentBgColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'bullish':
      return 'bg-[var(--color-positive)]/10'
    case 'bearish':
      return 'bg-[var(--color-negative)]/10'
    case 'neutral':
      return 'bg-[var(--color-warning)]/10'
  }
}

export function getSentimentLabel(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'bullish':
      return 'Tích cực'
    case 'bearish':
      return 'Tiêu cực'
    case 'neutral':
      return 'Trung lập'
  }
}

export function getSentimentEmoji(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'bullish':
      return '🟢'
    case 'bearish':
      return '🔴'
    case 'neutral':
      return '🟡'
  }
}
