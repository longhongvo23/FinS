import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  Check,
  Zap,
  MessageSquare,
  Target,
  Shield,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumUpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: 'limit_reached' | 'feature_locked' | 'manual'
}

const features = [
  {
    icon: MessageSquare,
    title: 'Chat AI không giới hạn',
    description: 'Hỏi AI bất cứ lúc nào, không lo hết lượt',
    free: '10 lượt/ngày',
    premium: 'Không giới hạn',
  },
  {
    icon: Target,
    title: 'Phân tích chuyên sâu',
    description: 'Nhận phân tích kỹ thuật & cơ bản chi tiết',
    free: 'Cơ bản',
    premium: 'Nâng cao',
  },
  {
    icon: Zap,
    title: 'Cảnh báo real-time',
    description: 'Nhận thông báo khi có tín hiệu giao dịch',
    free: false,
    premium: true,
  },
  {
    icon: Shield,
    title: 'Portfolio Health AI',
    description: 'Phân tích sức khỏe danh mục đầu tư',
    free: 'Hàng tuần',
    premium: 'Real-time',
  },
]

const plans = [
  {
    name: 'Tháng',
    price: 199000,
    period: '/tháng',
    popular: false,
  },
  {
    name: 'Năm',
    price: 1499000,
    period: '/năm',
    savings: 'Tiết kiệm 40%',
    popular: true,
  },
]

export function PremiumUpgradeModal({
  open,
  onOpenChange,
  trigger = 'manual',
}: PremiumUpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'Tháng' | 'Năm'>('Năm')

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'limit_reached':
        return 'Bạn đã hết lượt hỏi AI hôm nay!'
      case 'feature_locked':
        return 'Tính năng này chỉ dành cho Premium'
      default:
        return 'Nâng cấp để trải nghiệm tốt hơn'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-brand via-brand/90 to-brand/80 p-6 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-white/20">
                <Crown className="h-5 w-5" />
              </div>
              <Badge className="bg-white/20 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              SmartTrade Premium
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {getTriggerMessage()}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Features comparison */}
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-2"
              >
                <div className="p-2 rounded-lg bg-brand/10 shrink-0">
                  <feature.icon className="h-4 w-4 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-foreground-muted">
                    {feature.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-foreground-muted line-through">
                    {typeof feature.free === 'boolean'
                      ? feature.free
                        ? 'Có'
                        : 'Không'
                      : feature.free}
                  </p>
                  <p className="text-xs font-medium text-success">
                    {typeof feature.premium === 'boolean'
                      ? feature.premium
                        ? 'Có'
                        : 'Không'
                      : feature.premium}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Plan selection */}
          <div className="grid grid-cols-2 gap-3">
            {plans.map((plan) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name as 'Tháng' | 'Năm')}
                className={cn(
                  'relative p-4 rounded-xl border-2 text-left transition-all',
                  selectedPlan === plan.name
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand/50'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand text-xs">
                    Phổ biến
                  </Badge>
                )}
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="text-2xl font-bold font-mono">
                  {plan.price.toLocaleString()}đ
                </p>
                <p className="text-xs text-foreground-muted">{plan.period}</p>
                {plan.savings && (
                  <p className="text-xs text-success mt-1">{plan.savings}</p>
                )}
                {selectedPlan === plan.name && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-4 w-4 text-brand" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          <Button className="w-full bg-brand hover:bg-brand/90" size="lg">
            <Crown className="h-4 w-4 mr-2" />
            Nâng cấp Premium
          </Button>

          <p className="text-[10px] text-foreground-muted text-center">
            Hủy bất cứ lúc nào. Hoàn tiền trong 7 ngày nếu không hài lòng.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
