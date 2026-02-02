import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, Bell, Shield, CreditCard, Moon, Languages } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cài đặt</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Hồ sơ cá nhân</CardTitle>
          </div>
          <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-bold text-xl">U</span>
            </div>
            <div>
              <p className="font-medium">Demo User</p>
              <p className="text-sm text-foreground-muted">demo@smarttrade.ai</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Họ và tên</Label>
              <Input defaultValue="Demo User" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue="demo@smarttrade.ai" disabled />
            </div>
            <div className="grid gap-2">
              <Label>Số điện thoại</Label>
              <Input placeholder="0912345678" />
            </div>
          </div>

          <Button>Lưu thay đổi</Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Thông tin hệ thống</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-surface-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">FinS - Đồ án tốt nghiệp</p>
                <Badge variant="secondary">v1.0</Badge>
              </div>
              <p className="text-sm text-foreground-muted">Nền tảng đầu tư thông minh với AI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Thông báo</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Cảnh báo giá', description: 'Thông báo khi giá chạm mục tiêu' },
            { label: 'Cập nhật lệnh', description: 'Thông báo khi lệnh được khớp' },
            { label: 'AI Insights', description: 'Thông báo phân tích từ AI' },
            { label: 'Tin tức', description: 'Tin tức thị trường quan trọng' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-foreground-muted">{item.description}</p>
              </div>
              <Button variant="outline" size="sm">
                Bật
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            <CardTitle>Giao diện</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Chế độ tối</p>
              <p className="text-sm text-foreground-muted">Đang bật</p>
            </div>
            <Badge>Mặc định</Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <div>
                <p className="font-medium">Ngôn ngữ</p>
                <p className="text-sm text-foreground-muted">Tiếng Việt</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Bảo mật</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Đổi mật khẩu</Button>
          <Button variant="outline">Xác thực 2 bước</Button>
        </CardContent>
      </Card>
    </div>
  )
}
