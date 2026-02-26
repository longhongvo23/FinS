import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle2, AlertTriangle, Scale, Zap, Info } from 'lucide-react'

export function TermsPage() {
    const lastUpdated = "26 tháng 02, 2026"

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-brand/10 rounded-2xl mb-2">
                        <FileText className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Điều khoản Sử dụng</h1>
                    <p className="text-foreground-muted">
                        Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ. Cập nhật: {lastUpdated}
                    </p>
                </div>

                <Card className="border-none shadow-sm bg-surface-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Scale className="h-5 w-5 text-brand" />
                            Thỏa thuận Người dùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none text-foreground-muted leading-relaxed space-y-6">

                        <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 flex gap-3 text-sm italic">
                            <Info className="h-5 w-5 text-brand shrink-0" />
                            Bằng cách truy cập hoặc sử dụng SmartTrade AI, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây.
                        </div>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Zap className="h-5 w-5 text-brand" />
                                1. Dịch vụ cung cấp
                            </h3>
                            <p>
                                SmartTrade AI cung cấp các công cụ phân tích dữ liệu chứng khoán, dự báo xu hướng dựa trên trí tuệ nhân tạo và hệ thống theo dõi thị trường thời gian thực.
                                Chúng tôi không phải là một sàn giao dịch chứng khoán hoặc tổ chức tư vấn đầu tư tài chính chính thức.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-brand" />
                                2. Miễn trừ trách nhiệm về Tài chính
                            </h3>
                            <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 text-danger font-medium">
                                <p className="font-bold underline mb-2">CẢNH BÁO RỦI RO:</p>
                                Mọi dữ liệu, phân tích và dự báo từ AI chỉ mang tính chất tham khảo. Đầu tư chứng khoán luôn tiềm ẩn rủi ro mất mát vốn.
                                SmartTrade AI <strong>không chịu trách nhiệm</strong> cho bất kỳ khoản thua lỗ tài chính nào phát sinh từ việc sử dụng thông tin của chúng tôi để ra quyết định đầu tư.
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-brand" />
                                3. Trách nhiệm người dùng
                            </h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Bạn phải đủ 18 tuổi để đăng ký tài khoản.</li>
                                <li>Không sử dụng bất kỳ công cụ tự động (crawl/robot) nào để trích xuất dữ liệu từ hệ thống khi chưa có sự cho phép.</li>
                                <li>Bảo mật thông tin đăng nhập cá nhân.</li>
                                <li>Không thực hiện các hành vi tấn công mạng hoặc gây quá tải hệ thống.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Scale className="h-5 w-5 text-brand" />
                                4. Thay đổi điều khoản
                            </h3>
                            <p>
                                Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
                                Việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-border mt-8">
                            <p className="text-sm text-center">
                                © 2026 SmartTrade AI Team. Bảo lưu mọi quyền.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Link to="/login" className="text-brand hover:underline text-sm font-medium">
                        Quay lại trang Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    )
}
