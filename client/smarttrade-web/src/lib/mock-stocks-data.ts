import type { ScreenerStock, Exchange, MarketCapCategory } from '@/stores/screener-store'

// Helper to generate sparkline data (30 data points)
function generateSparkline(basePrice: number, volatility: number = 0.02): number[] {
  const data: number[] = []
  let price = basePrice * (0.9 + Math.random() * 0.2) // Start within 10% of base

  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.5) * 2 * volatility * price
    price = Math.max(price * 0.8, Math.min(price * 1.2, price + change))
    data.push(Math.round(price * 100) / 100)
  }

  // Ensure last point is close to current price
  data[29] = basePrice
  return data
}

// Helper to determine market cap category
function getMarketCapCategory(marketCap: number): MarketCapCategory {
  if (marketCap >= 50e12) return 'large' // >= 50T VND
  if (marketCap >= 10e12) return 'mid'   // >= 10T VND
  return 'small'
}

// Raw stock data
interface RawStock {
  symbol: string
  name: string
  exchange: Exchange
  sector: string
  industry: string
  price: number
  change: number
  volume: number
  marketCap: number
  pe: number | null
  pb: number | null
  dividendYield: number
  rsi: number
  aboveMA50: boolean
}

const rawStocks: RawStock[] = [
  // Ngân hàng
  { symbol: 'VCB', name: 'Vietcombank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 89500, change: 2.3, volume: 5200000, marketCap: 420e12, pe: 12.5, pb: 2.8, dividendYield: 1.2, rsi: 58, aboveMA50: true },
  { symbol: 'TCB', name: 'Techcombank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 48200, change: 1.5, volume: 8500000, marketCap: 168e12, pe: 8.2, pb: 1.5, dividendYield: 0, rsi: 52, aboveMA50: true },
  { symbol: 'MBB', name: 'MB Bank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 26800, change: -0.8, volume: 12000000, marketCap: 125e12, pe: 6.8, pb: 1.3, dividendYield: 3.5, rsi: 45, aboveMA50: false },
  { symbol: 'ACB', name: 'ACB', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 25600, change: 0.5, volume: 9800000, marketCap: 98e12, pe: 7.2, pb: 1.6, dividendYield: 2.8, rsi: 48, aboveMA50: true },
  { symbol: 'BID', name: 'BIDV', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 47800, change: -1.2, volume: 4500000, marketCap: 240e12, pe: 11.5, pb: 2.1, dividendYield: 2.0, rsi: 42, aboveMA50: false },
  { symbol: 'CTG', name: 'VietinBank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 35200, change: 0.8, volume: 6200000, marketCap: 165e12, pe: 9.8, pb: 1.8, dividendYield: 1.5, rsi: 55, aboveMA50: true },
  { symbol: 'VPB', name: 'VPBank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 21500, change: 2.1, volume: 15000000, marketCap: 95e12, pe: 5.5, pb: 1.1, dividendYield: 0, rsi: 62, aboveMA50: true },
  { symbol: 'TPB', name: 'TPBank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 18900, change: -0.5, volume: 7800000, marketCap: 42e12, pe: 6.2, pb: 1.2, dividendYield: 2.5, rsi: 38, aboveMA50: false },
  { symbol: 'HDB', name: 'HDBank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 24300, change: 1.8, volume: 5600000, marketCap: 58e12, pe: 7.5, pb: 1.4, dividendYield: 3.0, rsi: 56, aboveMA50: true },
  { symbol: 'STB', name: 'Sacombank', exchange: 'HOSE', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 32100, change: -2.1, volume: 8200000, marketCap: 62e12, pe: 8.8, pb: 1.5, dividendYield: 0, rsi: 28, aboveMA50: false },

  // Bất động sản
  { symbol: 'VIC', name: 'Vingroup', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 42500, change: -1.5, volume: 3200000, marketCap: 145e12, pe: 45.2, pb: 2.5, dividendYield: 0, rsi: 35, aboveMA50: false },
  { symbol: 'VHM', name: 'Vinhomes', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 38900, change: 0.8, volume: 4500000, marketCap: 170e12, pe: 8.5, pb: 1.8, dividendYield: 4.5, rsi: 52, aboveMA50: true },
  { symbol: 'NVL', name: 'Novaland', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 12800, change: 5.2, volume: 18000000, marketCap: 25e12, pe: null, pb: 0.8, dividendYield: 0, rsi: 72, aboveMA50: true },
  { symbol: 'KDH', name: 'Khang Điền', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 28500, change: 1.2, volume: 2800000, marketCap: 22e12, pe: 12.5, pb: 1.6, dividendYield: 2.0, rsi: 58, aboveMA50: true },
  { symbol: 'DXG', name: 'Đất Xanh', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Môi giới BĐS', price: 15200, change: -3.5, volume: 12000000, marketCap: 8.5e12, pe: null, pb: 0.9, dividendYield: 0, rsi: 25, aboveMA50: false },
  { symbol: 'PDR', name: 'Phát Đạt', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 21800, change: 2.8, volume: 6500000, marketCap: 12e12, pe: 15.2, pb: 1.2, dividendYield: 0, rsi: 65, aboveMA50: true },
  { symbol: 'NLG', name: 'Nam Long', exchange: 'HOSE', sector: 'Bất động sản', industry: 'Phát triển BĐS', price: 32500, change: -0.5, volume: 1800000, marketCap: 9.8e12, pe: 9.5, pb: 1.1, dividendYield: 3.2, rsi: 48, aboveMA50: false },

  // Công nghệ
  { symbol: 'FPT', name: 'FPT Corporation', exchange: 'HOSE', sector: 'Công nghệ', industry: 'Phần mềm & Dịch vụ IT', price: 125800, change: 1.8, volume: 3500000, marketCap: 165e12, pe: 18.2, pb: 4.5, dividendYield: 2.5, rsi: 68, aboveMA50: true },
  { symbol: 'CMG', name: 'CMC Corporation', exchange: 'HOSE', sector: 'Công nghệ', industry: 'Phần mềm & Dịch vụ IT', price: 52300, change: 2.5, volume: 850000, marketCap: 8.2e12, pe: 14.5, pb: 2.8, dividendYield: 1.8, rsi: 62, aboveMA50: true },
  { symbol: 'FOX', name: 'FPT Telecom', exchange: 'HOSE', sector: 'Công nghệ', industry: 'Viễn thông', price: 78500, change: 0.5, volume: 420000, marketCap: 12e12, pe: 12.8, pb: 3.2, dividendYield: 4.0, rsi: 55, aboveMA50: true },

  // Tiêu dùng
  { symbol: 'VNM', name: 'Vinamilk', exchange: 'HOSE', sector: 'Tiêu dùng', industry: 'Thực phẩm & Đồ uống', price: 72500, change: -0.8, volume: 2800000, marketCap: 152e12, pe: 16.5, pb: 4.2, dividendYield: 5.5, rsi: 42, aboveMA50: false },
  { symbol: 'MSN', name: 'Masan Group', exchange: 'HOSE', sector: 'Tiêu dùng', industry: 'Thực phẩm & Đồ uống', price: 68200, change: 1.2, volume: 3200000, marketCap: 82e12, pe: 28.5, pb: 3.5, dividendYield: 0, rsi: 55, aboveMA50: true },
  { symbol: 'SAB', name: 'Sabeco', exchange: 'HOSE', sector: 'Tiêu dùng', industry: 'Thực phẩm & Đồ uống', price: 58900, change: -0.2, volume: 450000, marketCap: 85e12, pe: 22.5, pb: 5.8, dividendYield: 3.8, rsi: 48, aboveMA50: false },
  { symbol: 'PNJ', name: 'PNJ', exchange: 'HOSE', sector: 'Tiêu dùng', industry: 'Bán lẻ', price: 98500, change: 2.8, volume: 1200000, marketCap: 32e12, pe: 15.8, pb: 4.2, dividendYield: 2.2, rsi: 72, aboveMA50: true },
  { symbol: 'MWG', name: 'Mobile World', exchange: 'HOSE', sector: 'Tiêu dùng', industry: 'Bán lẻ', price: 52800, change: -1.5, volume: 5500000, marketCap: 78e12, pe: 12.2, pb: 2.8, dividendYield: 1.5, rsi: 38, aboveMA50: false },

  // Thép & Vật liệu
  { symbol: 'HPG', name: 'Hòa Phát', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Thép', price: 25200, change: 3.5, volume: 25000000, marketCap: 115e12, pe: 8.5, pb: 1.2, dividendYield: 2.0, rsi: 68, aboveMA50: true },
  { symbol: 'HSG', name: 'Hoa Sen', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Thép', price: 18500, change: 4.2, volume: 8500000, marketCap: 12e12, pe: 6.5, pb: 0.9, dividendYield: 0, rsi: 75, aboveMA50: true },
  { symbol: 'NKG', name: 'Nam Kim', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Thép', price: 12800, change: 2.8, volume: 6200000, marketCap: 5.8e12, pe: 5.2, pb: 0.8, dividendYield: 0, rsi: 62, aboveMA50: true },
  { symbol: 'HT1', name: 'Hà Tiên 1', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Xi măng', price: 16200, change: -0.8, volume: 1200000, marketCap: 6.5e12, pe: 9.8, pb: 1.1, dividendYield: 6.5, rsi: 45, aboveMA50: false },

  // Dầu khí
  { symbol: 'GAS', name: 'PV Gas', exchange: 'HOSE', sector: 'Dầu khí', industry: 'Khí đốt', price: 82500, change: 0.5, volume: 2800000, marketCap: 158e12, pe: 14.2, pb: 3.2, dividendYield: 4.8, rsi: 52, aboveMA50: true },
  { symbol: 'PVD', name: 'PV Drilling', exchange: 'HOSE', sector: 'Dầu khí', industry: 'Dịch vụ dầu khí', price: 28500, change: 2.2, volume: 3500000, marketCap: 12e12, pe: 18.5, pb: 1.5, dividendYield: 0, rsi: 58, aboveMA50: true },
  { symbol: 'PVS', name: 'PV Tech Services', exchange: 'HNX', sector: 'Dầu khí', industry: 'Dịch vụ dầu khí', price: 32800, change: 1.8, volume: 4200000, marketCap: 15e12, pe: 12.5, pb: 1.8, dividendYield: 3.2, rsi: 55, aboveMA50: true },
  { symbol: 'PLX', name: 'Petrolimex', exchange: 'HOSE', sector: 'Dầu khí', industry: 'Phân phối xăng dầu', price: 38200, change: -0.5, volume: 1800000, marketCap: 52e12, pe: 15.8, pb: 2.2, dividendYield: 5.5, rsi: 48, aboveMA50: false },

  // Điện & Năng lượng
  { symbol: 'POW', name: 'PV Power', exchange: 'HOSE', sector: 'Điện & Năng lượng', industry: 'Sản xuất điện', price: 12500, change: 1.2, volume: 8500000, marketCap: 28e12, pe: 9.5, pb: 1.1, dividendYield: 4.0, rsi: 55, aboveMA50: true },
  { symbol: 'REE', name: 'REE Corporation', exchange: 'HOSE', sector: 'Điện & Năng lượng', industry: 'Đa ngành', price: 58200, change: 0.8, volume: 1500000, marketCap: 18e12, pe: 8.2, pb: 1.5, dividendYield: 6.0, rsi: 52, aboveMA50: true },
  { symbol: 'PC1', name: 'Power Construction 1', exchange: 'HOSE', sector: 'Điện & Năng lượng', industry: 'Xây dựng điện', price: 22800, change: -1.5, volume: 2200000, marketCap: 5.5e12, pe: 7.8, pb: 1.2, dividendYield: 3.5, rsi: 42, aboveMA50: false },
  { symbol: 'NT2', name: 'Nhơn Trạch 2', exchange: 'HOSE', sector: 'Điện & Năng lượng', industry: 'Sản xuất điện', price: 28500, change: 0.5, volume: 850000, marketCap: 8.2e12, pe: 6.5, pb: 1.0, dividendYield: 8.5, rsi: 58, aboveMA50: true },

  // Y tế & Dược phẩm
  { symbol: 'DHG', name: 'Dược Hậu Giang', exchange: 'HOSE', sector: 'Y tế & Dược phẩm', industry: 'Dược phẩm', price: 98500, change: 0.2, volume: 280000, marketCap: 12.8e12, pe: 14.5, pb: 3.5, dividendYield: 5.0, rsi: 50, aboveMA50: true },
  { symbol: 'IMP', name: 'Imexpharm', exchange: 'HOSE', sector: 'Y tế & Dược phẩm', industry: 'Dược phẩm', price: 62500, change: 1.5, volume: 180000, marketCap: 4.8e12, pe: 12.8, pb: 2.2, dividendYield: 3.0, rsi: 55, aboveMA50: true },
  { symbol: 'DBD', name: 'Dược Bình Định', exchange: 'HOSE', sector: 'Y tế & Dược phẩm', industry: 'Dược phẩm', price: 42800, change: -0.5, volume: 120000, marketCap: 1.5e12, pe: 10.5, pb: 1.8, dividendYield: 6.5, rsi: 48, aboveMA50: false },

  // Hàng không
  { symbol: 'VJC', name: 'Vietjet Air', exchange: 'HOSE', sector: 'Hàng không', industry: 'Hàng không', price: 98200, change: 2.5, volume: 1800000, marketCap: 52e12, pe: 25.5, pb: 4.8, dividendYield: 0, rsi: 65, aboveMA50: true },
  { symbol: 'HVN', name: 'Vietnam Airlines', exchange: 'HOSE', sector: 'Hàng không', industry: 'Hàng không', price: 18500, change: -2.8, volume: 8500000, marketCap: 38e12, pe: null, pb: 2.5, dividendYield: 0, rsi: 28, aboveMA50: false },

  // Chứng khoán
  { symbol: 'SSI', name: 'SSI Securities', exchange: 'HOSE', sector: 'Chứng khoán', industry: 'Chứng khoán', price: 32500, change: 1.8, volume: 12000000, marketCap: 25e12, pe: 10.5, pb: 1.5, dividendYield: 2.0, rsi: 58, aboveMA50: true },
  { symbol: 'VND', name: 'VNDirect', exchange: 'HOSE', sector: 'Chứng khoán', industry: 'Chứng khoán', price: 18200, change: 3.2, volume: 18000000, marketCap: 18e12, pe: 8.5, pb: 1.2, dividendYield: 0, rsi: 68, aboveMA50: true },
  { symbol: 'HCM', name: 'HCMC Securities', exchange: 'HOSE', sector: 'Chứng khoán', industry: 'Chứng khoán', price: 25800, change: 2.5, volume: 8500000, marketCap: 12e12, pe: 9.2, pb: 1.4, dividendYield: 2.5, rsi: 62, aboveMA50: true },
  { symbol: 'VCI', name: 'Vietcap', exchange: 'HOSE', sector: 'Chứng khoán', industry: 'Chứng khoán', price: 42500, change: 0.8, volume: 2500000, marketCap: 8.5e12, pe: 12.5, pb: 1.8, dividendYield: 3.0, rsi: 52, aboveMA50: true },

  // Bảo hiểm
  { symbol: 'BVH', name: 'Bảo Việt Holdings', exchange: 'HOSE', sector: 'Bảo hiểm', industry: 'Bảo hiểm', price: 52500, change: -0.5, volume: 850000, marketCap: 38e12, pe: 18.5, pb: 1.5, dividendYield: 2.5, rsi: 45, aboveMA50: false },
  { symbol: 'BMI', name: 'Bảo Minh', exchange: 'HOSE', sector: 'Bảo hiểm', industry: 'Bảo hiểm', price: 32800, change: 0.8, volume: 280000, marketCap: 3.2e12, pe: 12.5, pb: 1.2, dividendYield: 4.0, rsi: 55, aboveMA50: true },

  // Xây dựng
  { symbol: 'CTD', name: 'Coteccons', exchange: 'HOSE', sector: 'Xây dựng', industry: 'Xây dựng dân dụng', price: 68500, change: -1.2, volume: 580000, marketCap: 5.2e12, pe: 15.5, pb: 1.8, dividendYield: 2.0, rsi: 42, aboveMA50: false },
  { symbol: 'HBC', name: 'Hòa Bình Corp', exchange: 'HOSE', sector: 'Xây dựng', industry: 'Xây dựng dân dụng', price: 8500, change: 4.5, volume: 12000000, marketCap: 2.8e12, pe: null, pb: 0.5, dividendYield: 0, rsi: 75, aboveMA50: true },

  // Vận tải & Logistics
  { symbol: 'GMD', name: 'Gemadept', exchange: 'HOSE', sector: 'Vận tải & Logistics', industry: 'Cảng biển', price: 52800, change: 1.5, volume: 1200000, marketCap: 15e12, pe: 12.5, pb: 2.0, dividendYield: 3.5, rsi: 58, aboveMA50: true },
  { symbol: 'HAH', name: 'Hải An Transport', exchange: 'HOSE', sector: 'Vận tải & Logistics', industry: 'Vận tải biển', price: 38500, change: 2.8, volume: 850000, marketCap: 4.2e12, pe: 8.5, pb: 1.5, dividendYield: 5.0, rsi: 65, aboveMA50: true },

  // HNX stocks
  { symbol: 'SHS', name: 'Saigon Hanoi Securities', exchange: 'HNX', sector: 'Chứng khoán', industry: 'Chứng khoán', price: 12500, change: 2.5, volume: 15000000, marketCap: 8.5e12, pe: 7.5, pb: 1.0, dividendYield: 0, rsi: 68, aboveMA50: true },
  { symbol: 'PVB', name: 'PV Coating', exchange: 'HNX', sector: 'Dầu khí', industry: 'Dịch vụ dầu khí', price: 18200, change: 1.2, volume: 2800000, marketCap: 1.8e12, pe: 8.5, pb: 1.2, dividendYield: 4.5, rsi: 55, aboveMA50: true },
  { symbol: 'IDC', name: 'IDICO', exchange: 'HNX', sector: 'Xây dựng', industry: 'Xây dựng hạ tầng', price: 42500, change: 0.5, volume: 580000, marketCap: 12e12, pe: 10.5, pb: 1.5, dividendYield: 5.5, rsi: 52, aboveMA50: true },
  { symbol: 'TNG', name: 'TNG Investment', exchange: 'HNX', sector: 'Tiêu dùng', industry: 'Dệt may', price: 22800, change: -0.8, volume: 1500000, marketCap: 2.5e12, pe: 6.5, pb: 1.0, dividendYield: 3.0, rsi: 45, aboveMA50: false },

  // UPCOM stocks
  { symbol: 'ACV', name: 'Airports Corporation', exchange: 'UPCOM', sector: 'Vận tải & Logistics', industry: 'Hàng không', price: 82500, change: 0.2, volume: 350000, marketCap: 180e12, pe: 35.5, pb: 4.5, dividendYield: 1.0, rsi: 48, aboveMA50: false },
  { symbol: 'MCH', name: 'Masan Consumer', exchange: 'UPCOM', sector: 'Tiêu dùng', industry: 'Thực phẩm & Đồ uống', price: 125000, change: 1.5, volume: 180000, marketCap: 85e12, pe: 22.5, pb: 6.5, dividendYield: 2.5, rsi: 55, aboveMA50: true },
  { symbol: 'VGI', name: 'Viettel Global', exchange: 'UPCOM', sector: 'Công nghệ', industry: 'Viễn thông', price: 68500, change: 2.2, volume: 420000, marketCap: 45e12, pe: 15.5, pb: 2.8, dividendYield: 0, rsi: 62, aboveMA50: true },
  { symbol: 'BSR', name: 'Bình Sơn Refining', exchange: 'UPCOM', sector: 'Dầu khí', industry: 'Lọc dầu', price: 18500, change: -1.5, volume: 5500000, marketCap: 55e12, pe: 5.5, pb: 1.0, dividendYield: 8.0, rsi: 38, aboveMA50: false },
  { symbol: 'LPB', name: 'LienViet Post Bank', exchange: 'UPCOM', sector: 'Ngân hàng', industry: 'Ngân hàng thương mại', price: 15200, change: 1.8, volume: 3200000, marketCap: 22e12, pe: 6.8, pb: 0.9, dividendYield: 0, rsi: 58, aboveMA50: true },

  // More diverse stocks
  { symbol: 'DPM', name: 'Đạm Phú Mỹ', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Hóa chất', price: 32500, change: 0.8, volume: 2500000, marketCap: 12.8e12, pe: 7.5, pb: 1.2, dividendYield: 7.5, rsi: 55, aboveMA50: true },
  { symbol: 'DCM', name: 'Đạm Cà Mau', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Hóa chất', price: 28500, change: 1.2, volume: 3800000, marketCap: 15e12, pe: 6.2, pb: 1.0, dividendYield: 9.0, rsi: 58, aboveMA50: true },
  { symbol: 'GVR', name: 'Cao su Việt Nam', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Cao su', price: 18200, change: -0.5, volume: 4500000, marketCap: 72e12, pe: 12.5, pb: 1.5, dividendYield: 3.5, rsi: 48, aboveMA50: false },
  { symbol: 'VRE', name: 'Vincom Retail', exchange: 'HOSE', sector: 'Bất động sản', industry: 'BĐS thương mại', price: 25800, change: 0.5, volume: 2800000, marketCap: 58e12, pe: 28.5, pb: 2.2, dividendYield: 1.5, rsi: 52, aboveMA50: true },
  { symbol: 'BCM', name: 'Becamex IDC', exchange: 'HOSE', sector: 'Bất động sản', industry: 'KCN', price: 52500, change: -1.8, volume: 850000, marketCap: 32e12, pe: 15.5, pb: 1.8, dividendYield: 2.5, rsi: 42, aboveMA50: false },
  { symbol: 'KBC', name: 'Kinh Bắc', exchange: 'HOSE', sector: 'Bất động sản', industry: 'KCN', price: 28500, change: 2.5, volume: 5500000, marketCap: 18e12, pe: 8.5, pb: 1.2, dividendYield: 0, rsi: 65, aboveMA50: true },
  { symbol: 'VGC', name: 'Viglacera', exchange: 'HOSE', sector: 'Thép & Vật liệu', industry: 'Vật liệu xây dựng', price: 42500, change: 0.2, volume: 1200000, marketCap: 18e12, pe: 11.5, pb: 1.5, dividendYield: 4.0, rsi: 50, aboveMA50: true },
]

// Generate full ScreenerStock data
export const mockScreenerStocks: ScreenerStock[] = rawStocks.map((stock) => {
  const high52W = stock.price * (1.1 + Math.random() * 0.3) // 10-40% above current
  const low52W = stock.price * (0.6 + Math.random() * 0.25) // 15-40% below current
  const avgVolume20D = stock.volume * (0.7 + Math.random() * 0.6)

  return {
    ...stock,
    changePercent: stock.change,
    avgVolume20D: Math.round(avgVolume20D),
    marketCapCategory: getMarketCapCategory(stock.marketCap),
    high52W: Math.round(high52W),
    low52W: Math.round(low52W),
    sparklineData: generateSparkline(stock.price),
  }
})

// Trending stocks (volume spike)
export const trendingStocks = mockScreenerStocks
  .filter((s) => s.volume > s.avgVolume20D * 1.5)
  .sort((a, b) => b.volume / b.avgVolume20D - a.volume / a.avgVolume20D)
  .slice(0, 6)

// Popular stocks (most added to watchlist - mocked)
export const popularStocks = ['VCB', 'FPT', 'HPG', 'VNM', 'MWG', 'VHM']
  .map((symbol) => mockScreenerStocks.find((s) => s.symbol === symbol)!)
  .filter(Boolean)

// Get similar stocks based on sector
export function getSimilarStocks(symbol: string, limit = 5): ScreenerStock[] {
  const stock = mockScreenerStocks.find((s) => s.symbol === symbol)
  if (!stock) return []

  return mockScreenerStocks
    .filter((s) => s.sector === stock.sector && s.symbol !== symbol)
    .slice(0, limit)
}
