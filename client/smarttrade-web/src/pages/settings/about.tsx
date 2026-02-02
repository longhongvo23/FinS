import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Github,
  Mail,
  Globe,
  Heart,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export function AboutSettingsPage() {
  return (
    <div className="space-y-6">
      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-2xl">ST</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">SmartTrade AI</h2>
              <p className="text-foreground-muted">
                Nền tảng đầu tư thông minh
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">v1.0.0</Badge>
                <Badge className="bg-success">Stable</Badge>
              </div>
            </div>
          </div>

          <p className="text-sm text-foreground-muted leading-relaxed">
            SmartTrade AI là nền tảng giao dịch chứng khoán tích hợp trí tuệ nhân tạo,
            giúp nhà đầu tư Việt Nam đưa ra quyết định thông minh hơn với phân tích
            AI real-time, insights thị trường và quản lý danh mục đầu tư.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            Tính năng chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              'AI Chat thông minh',
              'Phân tích kỹ thuật tự động',
              'Portfolio Health Score',
              'Cảnh báo giá real-time',
              'Stock Screener',
              'Giao dịch Futures & CW',
              'Daily AI Briefing',
              'Quản lý Watchlist',
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm p-2 bg-surface-2 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-brand" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Công nghệ sử dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'React',
              'TypeScript',
              'Vite',
              'Tailwind CSS',
              'Supabase',
              'FastAPI',
              'OpenAI GPT-4',
              'TradingView',
            ].map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liên kết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://smarttrade.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-surface-2 rounded-lg hover:bg-surface-2/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-foreground-muted" />
              <span>Website chính thức</span>
            </div>
            <ExternalLink className="h-4 w-4 text-foreground-muted" />
          </a>

          <a
            href="https://github.com/smarttrade-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-surface-2 rounded-lg hover:bg-surface-2/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-foreground-muted" />
              <span>GitHub</span>
            </div>
            <ExternalLink className="h-4 w-4 text-foreground-muted" />
          </a>

          <a
            href="mailto:support@smarttrade.vn"
            className="flex items-center justify-between p-3 bg-surface-2 rounded-lg hover:bg-surface-2/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-foreground-muted" />
              <span>support@smarttrade.vn</span>
            </div>
            <ExternalLink className="h-4 w-4 text-foreground-muted" />
          </a>
        </CardContent>
      </Card>

      {/* Credits */}
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-foreground-muted">
            Made with <Heart className="h-4 w-4 inline text-danger" /> in Vietnam
          </p>
          <p className="text-xs text-foreground-muted mt-2">
            © 2024 SmartTrade AI. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
