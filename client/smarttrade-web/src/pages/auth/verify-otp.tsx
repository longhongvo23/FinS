import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OTPInput } from '@/components/ui/otp-input'
import { Loader2, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds

export function VerifyOTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string })?.email || 'your@email.com'

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify()
    }
  }, [otp])

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 số')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Demo: Accept any OTP for testing
      if (otp === '123456' || true) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 2000)
      } else {
        setError('Mã OTP không đúng. Vui lòng thử lại.')
        setOtp('')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResendCooldown(RESEND_COOLDOWN)
      // Show success message
      setError(null)
    } catch {
      setError('Không thể gửi lại mã. Vui lòng thử lại.')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Xác thực thành công!</h2>
            <p className="text-foreground-muted mb-4">
              Đang chuyển hướng đến Dashboard...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="mx-auto w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-brand" />
          </div>
          <CardTitle className="text-2xl">Xác thực OTP</CardTitle>
          <CardDescription>
            Nhập mã 6 số đã được gửi đến
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm text-center">
              {error}
            </div>
          )}

          <OTPInput
            length={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
            autoFocus
          />

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || otp.length !== OTP_LENGTH}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>

          <div className="text-center">
            <p className="text-sm text-foreground-muted mb-2">
              Không nhận được mã?
            </p>
            <Button
              variant="link"
              disabled={isResending || resendCooldown > 0}
              onClick={handleResendOTP}
              className={cn(
                'text-brand',
                (isResending || resendCooldown > 0) && 'text-foreground-muted'
              )}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : resendCooldown > 0 ? (
                `Gửi lại sau ${resendCooldown}s`
              ) : (
                'Gửi lại mã OTP'
              )}
            </Button>
          </div>

          <p className="text-xs text-foreground-muted text-center">
            Mã OTP có hiệu lực trong 5 phút
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
