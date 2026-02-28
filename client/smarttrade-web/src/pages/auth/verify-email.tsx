import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth-service'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Logo } from '@/components/logo'

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-key'

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<VerificationStatus>('loading')
    const [message, setMessage] = useState('')
    const [isResending, setIsResending] = useState(false)
    const activationCalled = useRef(false) // Prevent double call in React StrictMode

    const key = searchParams.get('key')

    useEffect(() => {
        if (!key) {
            setStatus('no-key')
            setMessage('Không tìm thấy mã kích hoạt trong đường link.')
            return
        }

        // Prevent double call in React StrictMode
        if (activationCalled.current) {
            return
        }
        activationCalled.current = true

        const activateAccount = async () => {
            try {
                const response = await authService.activateAccount(key)
                setStatus('success')
                setMessage(response.message || 'Tài khoản đã được kích hoạt thành công!')
            } catch (error) {
                // Check if the error indicates the account is already activated
                const errorMessage = error instanceof Error ? error.message : 'Kích hoạt thất bại'
                console.error('Activation error:', errorMessage)

                // Only treat "already activated" as success
                if (errorMessage.toLowerCase().includes('already activated') ||
                    errorMessage.toLowerCase().includes('đã kích hoạt')) {
                    setStatus('success')
                    setMessage('Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay!')
                } else {
                    setStatus('error')
                    setMessage(errorMessage)
                }
            }
        }

        activateAccount()
    }, [key])

    const handleResendActivation = async () => {
        // User cần nhập email để resend
        const email = prompt('Nhập email của bạn để gửi lại link kích hoạt:')
        if (!email) return

        setIsResending(true)
        try {
            await authService.resendActivation(email)
            alert('Đã gửi email kích hoạt mới. Vui lòng kiểm tra hộp thư!')
        } catch (error) {
            alert('Không thể gửi email. Vui lòng thử lại sau.')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo size="lg" hideIcon />
                    </div>
                    <CardTitle className="text-2xl">Xác thực tài khoản</CardTitle>
                    <CardDescription>
                        SmartTrade AI
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-brand mb-4" />
                            <p className="text-foreground-muted">Đang xác thực tài khoản...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-success" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-success">Kích hoạt thành công!</h3>
                            <p className="text-foreground-muted mb-6">{message}</p>
                            <Button onClick={() => navigate('/login')} className="w-full">
                                Đăng nhập ngay
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                                <XCircle className="h-8 w-8 text-danger" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-danger">Kích hoạt thất bại</h3>
                            <p className="text-foreground-muted mb-6">{message}</p>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    onClick={handleResendActivation}
                                    disabled={isResending}
                                    className="w-full"
                                >
                                    {isResending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 h-4 w-4" />
                                    )}
                                    Gửi lại email kích hoạt
                                </Button>
                                <Button variant="ghost" onClick={() => navigate('/login')} className="w-full">
                                    Về trang đăng nhập
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'no-key' && (
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                                <XCircle className="h-8 w-8 text-warning" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Link không hợp lệ</h3>
                            <p className="text-foreground-muted mb-6">{message}</p>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    onClick={handleResendActivation}
                                    disabled={isResending}
                                    className="w-full"
                                >
                                    {isResending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 h-4 w-4" />
                                    )}
                                    Yêu cầu link mới
                                </Button>
                                <Link to="/login">
                                    <Button variant="ghost" className="w-full">
                                        Về trang đăng nhập
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
