import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import userEvent from '@testing-library/user-event'

// Mock StockCard component for testing
interface StockCardProps {
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
  changePercent: number
  volume: number
  onClick?: () => void
  onAddToWatchlist?: () => void
  isInWatchlist?: boolean
}

function StockCard({
  symbol,
  name,
  exchange,
  price,
  change,
  changePercent,
  volume,
  onClick,
  onAddToWatchlist,
  isInWatchlist = false,
}: StockCardProps) {
  const isPositive = changePercent >= 0

  return (
    <div
      className="p-4 rounded-xl border cursor-pointer hover:shadow-md"
      onClick={onClick}
      data-testid="stock-card"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-semibold text-lg">{symbol}</span>
          <span className="ml-2 text-xs text-gray-500">{exchange}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToWatchlist?.()
          }}
          aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          className="p-1"
        >
          {isInWatchlist ? '★' : '☆'}
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-2">{name}</div>

      <div className="flex justify-between items-end">
        <div>
          <div className="text-xl font-bold font-mono">
            ₫{price.toLocaleString()}
          </div>
          <div className={`text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change.toLocaleString()} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Vol</div>
          <div className="font-mono">{(volume / 1000000).toFixed(1)}M</div>
        </div>
      </div>
    </div>
  )
}

describe('StockCard', () => {
  const defaultProps: StockCardProps = {
    symbol: 'VNM',
    name: 'Vinamilk',
    exchange: 'HOSE',
    price: 76500,
    change: 1750,
    changePercent: 2.34,
    volume: 2300000,
  }

  it('renders stock information correctly', () => {
    render(<StockCard {...defaultProps} />)

    expect(screen.getByText('VNM')).toBeInTheDocument()
    expect(screen.getByText('Vinamilk')).toBeInTheDocument()
    expect(screen.getByText('HOSE')).toBeInTheDocument()
    expect(screen.getByText('₫76,500')).toBeInTheDocument()
  })

  it('shows positive change in green', () => {
    render(<StockCard {...defaultProps} />)

    const changeElement = screen.getByText(/\+2\.34%/)
    expect(changeElement).toHaveClass('text-emerald-500')
  })

  it('shows negative change in red', () => {
    render(<StockCard {...defaultProps} change={-1500} changePercent={-1.92} />)

    const changeElement = screen.getByText(/-1\.92%/)
    expect(changeElement).toHaveClass('text-red-500')
  })

  it('formats volume correctly', () => {
    render(<StockCard {...defaultProps} />)

    expect(screen.getByText('2.3M')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<StockCard {...defaultProps} onClick={handleClick} />)
    await user.click(screen.getByTestId('stock-card'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('calls onAddToWatchlist when star is clicked', async () => {
    const user = userEvent.setup()
    const handleWatchlist = vi.fn()
    const handleClick = vi.fn()

    render(
      <StockCard
        {...defaultProps}
        onClick={handleClick}
        onAddToWatchlist={handleWatchlist}
      />
    )

    await user.click(screen.getByRole('button', { name: /watchlist/i }))

    expect(handleWatchlist).toHaveBeenCalledTimes(1)
    expect(handleClick).not.toHaveBeenCalled() // Click should not propagate
  })

  it('shows filled star when in watchlist', () => {
    render(<StockCard {...defaultProps} isInWatchlist={true} />)

    expect(screen.getByText('★')).toBeInTheDocument()
  })

  it('shows empty star when not in watchlist', () => {
    render(<StockCard {...defaultProps} isInWatchlist={false} />)

    expect(screen.getByText('☆')).toBeInTheDocument()
  })

  it('displays exchange badge', () => {
    render(<StockCard {...defaultProps} exchange="HNX" />)

    expect(screen.getByText('HNX')).toBeInTheDocument()
  })

  it('formats large volumes correctly', () => {
    render(<StockCard {...defaultProps} volume={15000000} />)

    expect(screen.getByText('15.0M')).toBeInTheDocument()
  })

  it('handles zero change', () => {
    render(<StockCard {...defaultProps} change={0} changePercent={0} />)

    expect(screen.getByText(/0.*0\.00%/)).toBeInTheDocument()
  })
})
