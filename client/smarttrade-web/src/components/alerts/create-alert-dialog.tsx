import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Bell, TrendingUp, TrendingDown, ArrowLeftRight, Percent } from 'lucide-react'
import { toast } from 'sonner'
import { useAlertsStore, type AlertCondition } from '@/stores/alerts-store'
import { cn } from '@/lib/utils'

interface CreateAlertDialogProps {
  symbol: string
  stockName: string
  currentPrice: number
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const CONDITIONS: { value: AlertCondition; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'above',
    label: 'Giá vượt',
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Khi giá >= mức đặt',
  },
  {
    value: 'below',
    label: 'Giá dưới',
    icon: <TrendingDown className="h-4 w-4" />,
    description: 'Khi giá <= mức đặt',
  },
  {
    value: 'crosses',
    label: 'Chạm mốc',
    icon: <ArrowLeftRight className="h-4 w-4" />,
    description: 'Khi giá chạm đúng mốc',
  },
  {
    value: 'change_above',
    label: 'Tăng %',
    icon: <Percent className="h-4 w-4 text-[var(--color-positive)]" />,
    description: 'Khi tăng >= % so với hiện tại',
  },
  {
    value: 'change_below',
    label: 'Giảm %',
    icon: <Percent className="h-4 w-4 text-[var(--color-negative)]" />,
    description: 'Khi giảm >= % so với hiện tại',
  },
]

export function CreateAlertDialog({
  symbol,
  stockName,
  currentPrice,
  trigger,
  onSuccess,
}: CreateAlertDialogProps) {
  const [open, setOpen] = useState(false)
  const [condition, setCondition] = useState<AlertCondition>('above')
  const [targetValue, setTargetValue] = useState('')
  const [note, setNote] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  const { createAlert } = useAlertsStore()

  const isPercentCondition = condition === 'change_above' || condition === 'change_below'

  const handleSubmit = () => {
    const value = parseFloat(targetValue)
    if (isNaN(value) || value <= 0) {
      toast.error('Vui lòng nhập giá trị hợp lệ')
      return
    }

    createAlert({
      symbol,
      stockName,
      condition,
      targetPrice: value,
      basePrice: currentPrice,
      currentPrice,
      note: note.trim() || undefined,
      isRecurring,
    })

    toast.success('Tạo alert thành công!', {
      description: `${symbol} - ${CONDITIONS.find((c) => c.value === condition)?.label} ${isPercentCondition ? value + '%' : value.toLocaleString() + 'đ'}`,
    })

    // Reset form
    setCondition('above')
    setTargetValue('')
    setNote('')
    setIsRecurring(false)
    setOpen(false)

    onSuccess?.()
  }

  const getDefaultTarget = () => {
    if (isPercentCondition) {
      return '5' // Default 5%
    }
    // For price conditions, suggest 5% above/below current price
    if (condition === 'above') {
      return Math.round(currentPrice * 1.05).toString()
    }
    if (condition === 'below') {
      return Math.round(currentPrice * 0.95).toString()
    }
    return currentPrice.toString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[13px] border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]"
          >
            <Bell className="h-3.5 w-3.5 mr-2" />
            Tạo Alert
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[var(--color-surface)] border-[var(--color-border)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
            <Bell className="h-5 w-5 text-[var(--color-brand)]" />
            Tạo Alert cho {symbol}
          </DialogTitle>
          <DialogDescription className="text-[var(--color-text-muted)]">
            {stockName} • Giá hiện tại: {currentPrice.toLocaleString()}đ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Condition Selection */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Điều kiện
            </Label>
            <div className="grid grid-cols-5 gap-1.5">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => {
                    setCondition(c.value)
                    setTargetValue(
                      c.value === 'change_above' || c.value === 'change_below'
                        ? '5'
                        : c.value === 'above'
                          ? Math.round(currentPrice * 1.05).toString()
                          : c.value === 'below'
                            ? Math.round(currentPrice * 0.95).toString()
                            : currentPrice.toString()
                    )
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                    condition === c.value
                      ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {c.icon}
                  <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {CONDITIONS.find((c) => c.value === condition)?.description}
            </p>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              {isPercentCondition ? 'Phần trăm thay đổi' : 'Giá mục tiêu'}
            </Label>
            <div className="relative">
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={getDefaultTarget()}
                className="pr-12 h-10 text-[14px] bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-muted)]">
                {isPercentCondition ? '%' : 'đ'}
              </span>
            </div>
            {!isPercentCondition && targetValue && (
              <p className="text-[11px] text-[var(--color-text-muted)]">
                {condition === 'above' ? '↑' : condition === 'below' ? '↓' : '↔'}{' '}
                {(
                  ((parseFloat(targetValue) - currentPrice) / currentPrice) *
                  100
                ).toFixed(2)}
                % so với giá hiện tại
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              Ghi chú (tùy chọn)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Mua khi về vùng hỗ trợ..."
              className="min-h-[60px] text-[13px] bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
            <div>
              <p className="text-[13px] font-medium text-[var(--color-text-primary)]">
                Lặp lại sau khi trigger
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Alert sẽ tự động bật lại sau khi kích hoạt
              </p>
            </div>
            <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-[var(--color-border)] text-[var(--color-text-secondary)]"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
          >
            <Bell className="h-4 w-4 mr-2" />
            Tạo Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
