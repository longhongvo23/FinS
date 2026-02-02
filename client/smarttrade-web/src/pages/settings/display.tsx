import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Palette, Globe, Hash, Save, Loader2, Moon, Sun, Monitor, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUIStore, Theme } from '@/stores/ui-store'

export function DisplaySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { theme, setTheme } = useUIStore()
  const [settings, setSettings] = useState({
    language: 'vi',
    numberFormat: 'vn',
    dateFormat: 'dd/mm/yyyy',
  })

  const handleSave = async (): Promise<void> => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setIsLoading(false)
    toast.success('Đã lưu cài đặt giao diện')
  }

  const themeOptions: { value: Theme; label: string; icon: typeof Sun; preview: string }[] = [
    {
      value: 'light',
      label: 'Sáng',
      icon: Sun,
      preview: 'bg-white border-gray-200',
    },
    {
      value: 'dark',
      label: 'Tối',
      icon: Moon,
      preview: 'bg-[#131722] border-[#2A2E39]',
    },
    {
      value: 'system',
      label: 'Hệ thống',
      icon: Monitor,
      preview: 'bg-gradient-to-br from-white to-[#131722]',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand" />
            <div>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>Chọn chế độ hiển thị ứng dụng</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-soft-md'
                      : 'border-border hover:border-brand/50 hover:bg-surface-2'
                  )}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-brand rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  {/* Theme preview */}
                  <div
                    className={cn(
                      'w-full aspect-[4/3] rounded-lg border overflow-hidden',
                      option.preview
                    )}
                  >
                    {/* Mini mockup */}
                    <div className="h-full p-2">
                      <div
                        className={cn(
                          'h-2 w-8 rounded mb-1',
                          option.value === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                        )}
                      />
                      <div
                        className={cn(
                          'h-1.5 w-12 rounded mb-2',
                          option.value === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                        )}
                      />
                      <div className="flex gap-1">
                        <div
                          className={cn(
                            'h-6 flex-1 rounded',
                            option.value === 'light' ? 'bg-gray-100' : 'bg-[#1E222D]'
                          )}
                        />
                        <div
                          className={cn(
                            'h-6 flex-1 rounded',
                            option.value === 'light' ? 'bg-gray-100' : 'bg-[#1E222D]'
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', isSelected ? 'text-brand' : 'text-foreground-muted')} />
                    <span className={cn('font-medium', isSelected ? 'text-brand' : 'text-foreground')}>
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-sm text-foreground-muted mt-4">
            {theme === 'system'
              ? 'Giao diện sẽ tự động thay đổi theo cài đặt hệ thống của bạn'
              : theme === 'light'
              ? 'Giao diện sáng phù hợp cho môi trường có nhiều ánh sáng'
              : 'Giao diện tối giúp giảm mỏi mắt khi sử dụng ban đêm'}
          </p>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-brand" />
            <div>
              <CardTitle>Ngôn ngữ</CardTitle>
              <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.language}
            onValueChange={(v) => setSettings({ ...settings, language: v })}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vi">Tiếng Việt</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Number & Date Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-brand" />
            <div>
              <CardTitle>Định dạng số & ngày</CardTitle>
              <CardDescription>Tùy chỉnh cách hiển thị số và ngày tháng</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Định dạng số</Label>
            <Select
              value={settings.numberFormat}
              onValueChange={(v) => setSettings({ ...settings, numberFormat: v })}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vn">1.234.567,89 (Việt Nam)</SelectItem>
                <SelectItem value="us">1,234,567.89 (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Định dạng ngày</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(v) => setSettings({ ...settings, dateFormat: v })}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (25/12/2024)</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (12/25/2024)</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2024-12-25)</SelectItem>
              </SelectContent>
            </Select>
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
