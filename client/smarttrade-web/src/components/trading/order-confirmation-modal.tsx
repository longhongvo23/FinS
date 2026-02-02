import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OTPInput } from '@/components/ui/otp-input'
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrderData, OrderType } from './order-form'

interface OrderConfirmationModalProps {
  order: OrderData | null
  onConfirm: () => void
  onCancel: () => void
  isOpen: boolean
}

type ConfirmationStep = 'review' | 'otp' | 'processing' | 'success' | 'error'

const orderTypeLabels: Record<OrderType, string> = {
  LO: 'Lệnh giới hạn (LO)',
  MP: 'Lệnh thị trường (MP)',
  ATO: 'Lệnh mở cửa (ATO)',
  ATC: 'Lệnh đóng cửa (ATC)',
  STOP: 'Lệnh dừng (Stop)',
  STOP_LIMIT: 'Lệnh dừng giới hạn',
}

export function OrderConfirmationModal({
  order,
  onConfirm,
  onCancel,
  isOpen,
}: OrderConfirmationModalProps) {
  const [step, setStep] = useState<ConfirmationStep>('review')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !order) return null

  const orderValue = order.quantity * order.price
  const fee = Math.round(orderValue * 0.0015)
  const total = order.side === 'buy' ? orderValue + fee : orderValue - fee

  const handleOTPSubmit = async () => {
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số')
      return
    }

    setStep('processing')
    setError(null)

    // Simulate order processing
    await new Promise((r) => setTimeout(r, 2000))

    // Demo: Accept any OTP
    if (otp === '123456' || true) {
      setStep('success')
      setTimeout(() => {
        onConfirm()
        // Reset modal state
        setStep('review')
        setOtp('')
      }, 2500)
    } else {
      setStep('otp')
      setError('Mã OTP không đúng')
      setOtp('')
    }
  }

  const handleCancel = () => {
    setStep('review')
    setOtp('')
    setError(null)
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {step === 'success' ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : step === 'error' ? (
                <XCircle className="h-5 w-5 text-danger" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-brand" />
              )}
              {step === 'success'
                ? 'Đặt lệnh thành công'
                : step === 'error'
                  ? 'Đặt lệnh thất bại'
                  : 'Xác nhận lệnh'}
            </CardTitle>
            {step !== 'processing' && step !== 'success' && (
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Review Step */}
          {step === 'review' && (
            <>
              {/* Order Type Badge */}
              <div className="flex items-center justify-center">
                <Badge
                  className={cn(
                    'text-lg px-4 py-2 font-bold',
                    order.side === 'buy' ? 'bg-success' : 'bg-danger'
                  )}
                >
                  {order.side === 'buy' ? (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-2" />
                  )}
                  {order.side === 'buy' ? 'MUA' : 'BÁN'} {order.symbol}
                </Badge>
              </div>

              {/* Order Details */}
              <div className="space-y-3 p-4 bg-surface-2 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Loại lệnh</span>
                  <span className="font-medium">{orderTypeLabels[order.type]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Khối lượng</span>
                  <span className="font-mono font-medium">{order.quantity.toLocaleString()} CP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Giá đặt</span>
                  <span className="font-mono font-medium">{order.price.toLocaleString()} đ</span>
                </div>
                {order.stopPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Giá kích hoạt</span>
                    <span className="font-mono font-medium">{order.stopPrice.toLocaleString()} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-foreground-muted">Giá trị lệnh</span>
                  <span className="font-mono font-medium">{orderValue.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-muted">Phí GD (ước tính)</span>
                  <span className="font-mono">{fee.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-2 border-t border-border">
                  <span>{order.side === 'buy' ? 'Tổng tiền mua' : 'Tiền nhận về'}</span>
                  <span className={cn(
                    'font-mono text-lg',
                    order.side === 'buy' ? 'text-danger' : 'text-success'
                  )}>
                    {total.toLocaleString()} đ
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-warning">
                  Lệnh sẽ được gửi ngay sau khi xác nhận. Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Hủy bỏ
                </Button>
                <Button
                  className={cn(
                    order.side === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'
                  )}
                  onClick={() => setStep('otp')}
                >
                  Tiếp tục
                </Button>
              </div>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-foreground-muted">
                  Nhập mã OTP đã được gửi đến số điện thoại của bạn
                </p>
                <p className="text-xs text-foreground-muted">
                  (Demo: Nhập bất kỳ 6 số)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm text-center">
                  {error}
                </div>
              )}

              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setStep('review')}>
                  Quay lại
                </Button>
                <Button
                  onClick={handleOTPSubmit}
                  disabled={otp.length !== 6}
                  className={cn(
                    order.side === 'buy' ? 'bg-success hover:bg-success/90' : 'bg-danger hover:bg-danger/90'
                  )}
                >
                  Xác nhận
                </Button>
              </div>
            </>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-brand" />
              <p className="text-foreground-muted">Đang xử lý lệnh...</p>
              <p className="text-xs text-foreground-muted">Vui lòng không tắt ứng dụng</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Lệnh đã được đặt!</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  {order.side === 'buy' ? 'Mua' : 'Bán'} {order.quantity.toLocaleString()} {order.symbol} @ {order.price.toLocaleString()}đ
                </p>
              </div>
              <Badge variant="outline" className="text-success border-success">
                Đang chờ khớp
              </Badge>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
                <XCircle className="h-10 w-10 text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Đặt lệnh thất bại</h3>
                <p className="text-sm text-foreground-muted mt-1">
                  Có lỗi xảy ra. Vui lòng thử lại sau.
                </p>
              </div>
              <Button onClick={handleCancel} className="mt-4">
                Đóng
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
