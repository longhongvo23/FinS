import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth-service'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/logo'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<ForgotPasswordFormData>({
        // @ts-ignore - zodResolver type instantiation issue with TS 5.x
        resolver: zodResolver(forgotPasswordSchema),
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = form

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            setIsLoading(true)
            setError(null)
            console.log('Calling forgot password API with email:', data.email)
            await authService.resetPassword(data.email)
            console.log('Forgot password API call success')
            setIsSuccess(true)
        } catch (err) {
            console.error('Forgot password API call failed:', err)
            // Always show success to prevent email enumeration
            setIsSuccess(true)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Email đã được gửi</CardTitle>
                        <CardDescription>
                            Nếu email <strong>{getValues('email')}</strong> tồn tại trong hệ thống,
                            bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                            <p className="flex items-center gap-2 mb-2">
                                <Mail className="w-4 h-4" />
                                Kiểm tra hộp thư đến và thư rác
                            </p>
                            <p>Link sẽ hết hạn sau 1 giờ</p>
                        </div>

                        <Button asChild className="w-full">
                            <Link to="/login">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại đăng nhập
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo size="lg" hideIcon />
                    </div>
                    <CardTitle className="text-2xl">Quên mật khẩu?</CardTitle>
                    <CardDescription>
                        Nhập email đăng ký để nhận link đặt lại mật khẩu
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Error message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Gửi link đặt lại mật khẩu
                                </>
                            )}
                        </Button>

                        {/* Back to login */}
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                                <ArrowLeft className="w-3 h-3 inline mr-1" />
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
