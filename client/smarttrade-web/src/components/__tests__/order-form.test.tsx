import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import * as React from 'react'

interface OrderFormProps {
  symbol: string
  currentPrice: number
  ceiling: number
  floor: number
  availableQuantity?: number
  onSubmit: (order: {
    side: 'buy' | 'sell'
    type: string
    price: number
    quantity: number
  }) => Promise<void>
}

function OrderForm({
  symbol,
  currentPrice,
  ceiling,
  floor,
  availableQuantity = 0,
  onSubmit,
}: OrderFormProps) {
  const [side, setSide] = React.useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = React.useState('LO')
  const [price, setPrice] = React.useState(currentPrice.toString())
  const [quantity, setQuantity] = React.useState('100')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const priceNum = parseInt(price)
    const qtyNum = parseInt(quantity)

    // Validation
    if (priceNum < floor || priceNum > ceiling) {
      setError('Giá phải nằm trong khoảng sàn - trần')
      return
    }
    if (qtyNum < 100 || qtyNum % 100 !== 0) {
      setError('Khối lượng phải là bội số của 100')
      return
    }
    if (side === 'sell' && qtyNum > availableQuantity) {
      setError('Vượt quá số lượng khả dụng')
      return
    }

    setLoading(true)
    try {
      await onSubmit({ side, type: orderType, price: priceNum, quantity: qtyNum })
    } catch {
      setError('Đặt lệnh thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="order-form">
      <div className="mb-4" data-testid="symbol-display">{symbol}</div>

      {/* Side tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={side === 'buy' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}
          aria-pressed={side === 'buy'}
        >
          Mua
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={side === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-100'}
          aria-pressed={side === 'sell'}
        >
          Bán
        </button>
      </div>

      {/* Order type */}
      <div className="mb-4">
        <label className="text-sm">Loại lệnh</label>
        <div className="flex gap-2">
          {['LO', 'MP', 'ATO'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={orderType === type ? 'bg-orange-500 text-white' : 'bg-gray-100'}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Price input */}
      <div className="mb-4">
        <label htmlFor="price" className="text-sm">Giá</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={orderType === 'MP'}
          className="w-full border p-2 rounded"
        />
        <div className="text-xs text-gray-500">
          Sàn: {floor.toLocaleString()} | Trần: {ceiling.toLocaleString()}
        </div>
      </div>

      {/* Quantity input */}
      <div className="mb-4">
        <label htmlFor="quantity" className="text-sm">Khối lượng</label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border p-2 rounded"
        />
        {side === 'sell' && (
          <div className="text-xs text-gray-500" data-testid="available-qty">
            Khả dụng: {availableQuantity.toLocaleString()}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-sm mb-4" role="alert">{error}</div>}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded font-semibold ${
          side === 'buy' ? 'bg-emerald-500' : 'bg-red-500'
        } text-white`}
      >
        {loading ? 'Đang xử lý...' : `Đặt lệnh ${side === 'buy' ? 'MUA' : 'BÁN'}`}
      </button>
    </form>
  )
}

describe('OrderForm', () => {
  const defaultProps: OrderFormProps = {
    symbol: 'VNM',
    currentPrice: 76500,
    ceiling: 82000,
    floor: 71000,
    availableQuantity: 1000,
    onSubmit: vi.fn(),
  }

  it('renders form with default values', () => {
    render(<OrderForm {...defaultProps} />)

    // Use getAllByRole for multiple buttons with similar names
    const muaButtons = screen.getAllByRole('button', { name: /mua/i })
    const banButtons = screen.getAllByRole('button', { name: /bán/i })
    expect(muaButtons.length).toBeGreaterThan(0)
    expect(banButtons.length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/giá/i)).toHaveValue(76500)
    expect(screen.getByLabelText(/khối lượng/i)).toHaveValue(100)
  })

  it('displays symbol', () => {
    render(<OrderForm {...defaultProps} />)

    expect(screen.getByTestId('symbol-display')).toHaveTextContent('VNM')
  })

  it('switches between buy and sell', async () => {
    const user = userEvent.setup()
    render(<OrderForm {...defaultProps} />)

    const sellButton = screen.getByRole('button', { name: /bán/i })
    await user.click(sellButton)

    expect(sellButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('available-qty')).toBeInTheDocument()
  })

  it('switches order types', async () => {
    const user = userEvent.setup()
    render(<OrderForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'MP' }))

    expect(screen.getByLabelText(/giá/i)).toBeDisabled()
  })

  it('validates price within bounds', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    const priceInput = screen.getByLabelText(/giá/i)
    await user.clear(priceInput)
    await user.type(priceInput, '50000') // Below floor

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/sàn - trần/i)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('validates price above ceiling', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    const priceInput = screen.getByLabelText(/giá/i)
    await user.clear(priceInput)
    await user.type(priceInput, '90000') // Above ceiling

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/sàn - trần/i)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('validates quantity is lot size', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    const qtyInput = screen.getByLabelText(/khối lượng/i)
    await user.clear(qtyInput)
    await user.type(qtyInput, '150') // Not multiple of 100

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/bội số của 100/i)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('validates sell quantity against available', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    render(<OrderForm {...defaultProps} availableQuantity={500} onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: /bán/i }))

    const qtyInput = screen.getByLabelText(/khối lượng/i)
    await user.clear(qtyInput)
    await user.type(qtyInput, '1000') // More than available

    await user.click(screen.getByRole('button', { name: /đặt lệnh bán/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/khả dụng/i)
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('submits valid order', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        side: 'buy',
        type: 'LO',
        price: 76500,
        quantity: 100,
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    )
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    expect(screen.getByText(/đang xử lý/i)).toBeInTheDocument()
  })

  it('shows error on submission failure', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockRejectedValue(new Error('API Error'))
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/thất bại/i)
    })
  })

  it('displays floor and ceiling prices', () => {
    render(<OrderForm {...defaultProps} />)

    expect(screen.getByText(/sàn.*71/i)).toBeInTheDocument()
    expect(screen.getByText(/trần.*82/i)).toBeInTheDocument()
  })

  it('allows ATO order type', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<OrderForm {...defaultProps} onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: 'ATO' }))
    await user.click(screen.getByRole('button', { name: /đặt lệnh mua/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ATO' })
      )
    })
  })
})
