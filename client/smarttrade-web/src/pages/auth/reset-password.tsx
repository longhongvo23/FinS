import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth-service'
import { Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, KeyRound } from 'lucide-react'

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
        .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
        .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

type PageStatus = 'form' | 'loading' | 'success' | 'error' | 'invalid-token'

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<PageStatus>('form')
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setStatus('invalid-token')
        }
    }, [token])

    const form = useForm<ResetPasswordFormData>({
        // @ts-ignore - zodResolver type instantiation issue with TS 5.x
        resolver: zodResolver(resetPasswordSchema),
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return

        try {
            setStatus('loading')
            setError(null)
            await authService.resetPasswordWithToken(token, data.password)
            setStatus('success')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đặt lại mật khẩu thất bại')
            setStatus('error')
        }
    }

    // Invalid token
    if (status === 'invalid-token') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-destructive flex items-center justify-center mb-4">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Link không hợp lệ</CardTitle>
                        <CardDescription>
                            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild className="w-full">
                            <Link to="/forgot-password">Yêu cầu link mới</Link>
                        </Button>
                        <div className="text-center">
                            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                                <ArrowLeft className="w-3 h-3 inline mr-1" />
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Success
    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl">Đặt lại mật khẩu thành công!</CardTitle>
                        <CardDescription>
                            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            onClick={() => navigate('/login')}
                        >
                            Đăng nhập ngay
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Form
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-brand flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
                    <CardDescription>
                        Nhập mật khẩu mới cho tài khoản của bạn
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Error message */}
                        {error && status === 'error' && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('password')}
                                    disabled={status === 'loading'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    disabled={status === 'loading'}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Password requirements */}
                        <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
                            <p>Mật khẩu phải có:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Ít nhất 8 ký tự</li>
                                <li>Ít nhất 1 chữ hoa (A-Z)</li>
                                <li>Ít nhất 1 chữ thường (a-z)</li>
                                <li>Ít nhất 1 số (0-9)</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={status === 'loading'}>
                            {status === 'loading' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đặt lại mật khẩu'
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
