import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2, Eye, EyeOff, Play, UserCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInAsGuest, isLoading, error, clearError } = useAuthStore()
  const [showError, setShowError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Get redirect path from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const form = useForm<LoginFormData>({
    // @ts-ignore - zodResolver type instantiation issue with TS 5.x
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError()
      setShowError(false)
      await signIn(data.email, data.password)
      navigate(from, { replace: true })
    } catch {
      setShowError(true)
    }
  }

  const handleDemoLogin = async () => {
    try {
      clearError()
      setShowError(false)
      await signIn('demo@smarttrade.ai', 'demo123')
      navigate(from, { replace: true })
    } catch {
      setShowError(true)
    }
  }

  const handleGuestLogin = () => {
    signInAsGuest()
    navigate('/dashboard', { replace: true })
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ST</span>
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập để truy cập SmartTrade AI
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Social login removed as per request */}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {showError && error && (
              <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
                {error}
              </div>
            )}

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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 rounded border-border bg-surface-2 text-brand focus:ring-brand"
                {...register('rememberMe')}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>

          {/* Demo Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            disabled={isLoading}
            onClick={handleGuestLogin}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Trải nghiệm với tư cách khách
          </Button>

          <div className="text-center text-sm">
            <span className="text-foreground-muted">Chưa có tài khoản? </span>
            <Link to="/register" className="text-brand hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
