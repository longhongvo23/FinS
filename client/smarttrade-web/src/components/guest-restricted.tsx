import { Link } from 'react-router-dom'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GuestRestrictedProps {
    featureName?: string
}

export function GuestRestricted({ featureName = 'AI Tools' }: GuestRestrictedProps) {
    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md text-center">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-orange-500" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-foreground mb-3">
                    Tính năng dành cho thành viên
                </h2>

                {/* Description */}
                <p className="text-foreground-muted mb-6 leading-relaxed">
                    <span className="font-semibold text-orange-500">{featureName}</span> là tính năng cao cấp
                    chỉ dành cho thành viên đã đăng ký. Đăng ký ngay để trải nghiệm đầy đủ sức mạnh của AI
                    trong phân tích và dự đoán thị trường.
                </p>

                {/* Features List */}
                <div className="bg-surface-2 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        Khi đăng ký, bạn sẽ có quyền truy cập:
                    </p>
                    <ul className="space-y-2 text-sm text-foreground-muted">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            AI Chat - Trò chuyện với AI về thị trường
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            AI Insights - Phân tích chuyên sâu bằng AI
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            AI Research - Nghiên cứu thị trường tự động
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Smart Alerts - Cảnh báo thông minh theo thời gian thực
                        </li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="gap-2">
                        <Link to="/register">
                            Đăng ký miễn phí
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/login">
                            Đã có tài khoản? Đăng nhập
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
