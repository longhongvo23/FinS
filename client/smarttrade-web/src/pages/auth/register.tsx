import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authService } from '@/services/auth-service'
import { Loader2, CheckCircle, Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  login: z.string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(50, 'Username tối đa 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ cái, số và dấu gạch dưới'),
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần đồng ý với điều khoản sử dụng',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormData>({
    // @ts-ignore - zodResolver type instantiation issue with TS 5.x
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  const password = watch('password', '')

  // Password strength indicators
  const passwordChecks = [
    { label: 'Ít nhất 6 ký tự', valid: password.length >= 6 },
    { label: 'Có chữ hoa', valid: /[A-Z]/.test(password) },
    { label: 'Có số', valid: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      await authService.signUpWithDetails({
        login: data.login.toLowerCase(),
        email: data.email.toLowerCase(),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`)
    alert(`Đăng ký bằng ${provider} sẽ được hỗ trợ sớm!`)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Đăng ký thành công!</h2>
            <p className="text-foreground-muted mb-6">
              Vui lòng kiểm tra email để xác thực tài khoản
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Đi đến trang đăng nhập
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
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ST</span>
          </div>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Bắt đầu giao dịch với SmartTrade AI
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">


          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="login">Tên đăng nhập (Username)</Label>
              <Input
                id="login"
                placeholder="username123"
                autoComplete="username"
                {...register('login')}
              />
              {errors.login && (
                <p className="text-xs text-danger">{errors.login.message}</p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ</Label>
                <Input
                  id="lastName"
                  placeholder="Nguyễn"
                  autoComplete="family-name"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-xs text-danger">{errors.lastName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên</Label>
                <Input
                  id="firstName"
                  placeholder="Văn A"
                  autoComplete="given-name"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-xs text-danger">{errors.firstName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-foreground-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-foreground-muted" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}

              {/* Password strength */}
              {password && (
                <div className="space-y-1 mt-2">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {check.valid ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <X className="h-3 w-3 text-foreground-muted" />
                      )}
                      <span className={cn(
                        check.valid ? 'text-success' : 'text-foreground-muted'
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-foreground-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-foreground-muted" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                className="h-4 w-4 mt-0.5 rounded border-border bg-surface-2 text-brand focus:ring-brand"
                {...register('acceptTerms')}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer leading-tight">
                Tôi đồng ý với{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  Chính sách bảo mật
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-danger">{errors.acceptTerms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-foreground-muted">Đã có tài khoản? </span>
            <Link to="/login" className="text-brand hover:underline font-medium">
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
