import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, Bell, Database, Globe } from 'lucide-react'

export function PrivacyPage() {
    const lastUpdated = "26 tháng 02, 2026"

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-brand/10 rounded-2xl mb-2">
                        <Shield className="h-8 w-8 text-brand" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Chính sách Bảo mật</h1>
                    <p className="text-foreground-muted">
                        Cập nhật lần cuối: {lastUpdated}
                    </p>
                </div>

                <Card className="border-none shadow-sm bg-surface-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Lock className="h-5 w-5 text-brand" />
                            Cam kết của SmartTrade AI
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none text-foreground-muted leading-relaxed space-y-6">
                        <p>
                            Tại <strong>SmartTrade AI</strong>, chúng tôi coi trọng sự riêng tư của bạn hơn bất cứ điều gì.
                            Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi bạn sử dụng nền tảng phân tích chứng khoán của chúng tôi.
                        </p>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Database className="h-5 w-5 text-brand" />
                                1. Thông tin chúng tôi thu thập
                            </h3>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Thông tin tài khoản:</strong> Email, tên đăng nhập và mật khẩu (được mã hóa) khi bạn đăng ký.</li>
                                <li><strong>Dữ liệu hoạt động:</strong> Danh sách theo dõi (Watchlist), lịch sử tìm kiếm mã chứng khoán và các tương tác với AI Chatbot.</li>
                                <li><strong>Dữ liệu thiết bị:</strong> Địa chỉ IP, loại trình duyệt và hệ điều hành để tối ưu hóa trải nghiệm người dùng.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Eye className="h-5 w-5 text-brand" />
                                2. Cách chúng tôi sử dụng thông tin
                            </h3>
                            <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Cung cấp và duy trì các dịch vụ phân tích thị trường.</li>
                                <li>Cá nhân hóa nội dung AI Insights dựa trên danh mục bạn quan tâm.</li>
                                <li>Gửi thông báo về biến động thị trường quan trọng (nếu bạn cho phép).</li>
                                <li>Nâng cao độ chính xác của các mô hình dự báo AI thông qua hành vi ẩn danh.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Bell className="h-5 w-5 text-brand" />
                                3. Lưu trữ và Bảo mật dữ liệu
                            </h3>
                            <p>
                                Mọi dữ liệu nhạy cảm đều được lưu trữ trên hệ thống cơ sở dữ liệu MongoDB với <strong>4 tầng bảo mật</strong> bao gồm mã hóa TLS/SSL, tường lửa và mã hóa dữ liệu tĩnh (Encryption at Rest).
                                Mật khẩu của bạn được băm bằng thuật toán Argon2/BCrypt trước khi lưu trữ.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-foreground font-bold flex items-center gap-2">
                                <Globe className="h-5 w-5 text-brand" />
                                4. Chia sẻ thông tin
                            </h3>
                            <p>
                                SmartTrade AI <strong>không bao giờ</strong> bán thông tin cá nhân của bạn cho bên thứ ba.
                                Chúng tôi chỉ chia sẻ dữ liệu khi có yêu cầu pháp lý hoặc để bảo vệ quyền lợi hợp pháp của người dùng trong các trường hợp khẩn cấp.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-border">
                            <p className="text-sm italic">
                                Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật, vui lòng liên hệ với đội ngũ hỗ trợ qua email:
                                <a href="mailto:support@smarttrade.ai" className="text-brand ml-1 hover:underline">support@smarttrade.ai</a>
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
