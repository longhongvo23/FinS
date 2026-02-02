import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Bell,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Newspaper,
  Mail,
  Smartphone,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSetting {
  id: string
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
}

export function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'price_alerts',
      icon: TrendingUp,
      title: 'Cảnh báo giá',
      description: 'Thông báo khi giá cổ phiếu đạt ngưỡng đã đặt',
      enabled: true,
    },
    {
      id: 'order_updates',
      icon: ShoppingCart,
      title: 'Cập nhật lệnh',
      description: 'Thông báo khi lệnh được khớp hoặc bị từ chối',
      enabled: true,
    },
    {
      id: 'ai_insights',
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Nhận phân tích AI mới cho watchlist của bạn',
      enabled: true,
    },
    {
      id: 'market_news',
      icon: Newspaper,
      title: 'Tin tức thị trường',
      description: 'Tin tức quan trọng ảnh hưởng đến thị trường',
      enabled: false,
    },
  ])

  const [channels, setChannels] = useState({
    email: true,
    push: false,
  })

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    toast.success('Đã lưu cài đặt thông báo')
  }

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-foreground-muted" />
            <div>
              <CardTitle>Loại thông báo</CardTitle>
              <CardDescription>
                Chọn loại thông báo bạn muốn nhận
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4 bg-surface-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand/10">
                  <setting.icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <Label htmlFor={setting.id} className="font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-foreground-muted">
                    {setting.description}
                  </p>
                </div>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                onCheckedChange={() => toggleSetting(setting.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Kênh thông báo</CardTitle>
          <CardDescription>
            Chọn cách bạn muốn nhận thông báo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Mail className="h-5 w-5 text-brand" />
              </div>
              <div>
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <p className="text-sm text-foreground-muted">
                  Nhận thông báo qua email
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={channels.email}
              onCheckedChange={(v: boolean) => setChannels({ ...channels, email: v })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Smartphone className="h-5 w-5 text-brand" />
              </div>
              <div>
                <Label htmlFor="push" className="font-medium">
                  Push Notification
                </Label>
                <p className="text-sm text-foreground-muted">
                  Thông báo đẩy trên trình duyệt
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={channels.push}
              onCheckedChange={(v: boolean) => setChannels({ ...channels, push: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
