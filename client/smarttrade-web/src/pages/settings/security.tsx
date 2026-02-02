import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Key,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  LogOut,
  Loader2,
  Check,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth-service'
import { sessionService, type SessionInfo } from '@/services/session-service'
import { useAuthStore } from '@/stores/auth-store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function SecuritySettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Session management state
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isRevokingSession, setIsRevokingSession] = useState<string | null>(null)
  const [isRevokingAll, setIsRevokingAll] = useState(false)

  // Fetch sessions on component mount
  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const data = await sessionService.getSessions()
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast.error('Không thể tải danh sách phiên đăng nhập')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Vui lòng nhập mật khẩu')
      return
    }

    setIsDeletingAccount(true)
    try {
      await authService.deleteAccount(deletePassword)
      toast.success('Tài khoản đã được xóa thành công')
      setShowDeleteDialog(false)
      signOut()
      navigate('/auth/login')
    } catch (error: unknown) {
      console.error('Failed to delete account:', error)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        toast.error(errorMessage || 'Không thể xóa tài khoản')
      } else {
        toast.error('Không thể xóa tài khoản. Vui lòng thử lại.')
      }
    } finally {
      setIsDeletingAccount(false)
      setDeletePassword('')
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Mật khẩu mới không khớp')
      return
    }
    if (passwordData.new.length < 4) {
      toast.error('Mật khẩu mới phải có ít nhất 4 ký tự')
      return
    }
    if (passwordData.current.length < 4) {
      toast.error('Vui lòng nhập mật khẩu hiện tại')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword(passwordData.current, passwordData.new)
      setPasswordData({ current: '', new: '', confirm: '' })
      toast.success('Đã đổi mật khẩu thành công')
    } catch (error: unknown) {
      console.error('Failed to change password:', error)
      // Check for specific error messages from backend
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        if (errorMessage.includes('incorrect') || errorMessage.includes('Current password')) {
          toast.error('Mật khẩu hiện tại không đúng')
        } else {
          toast.error(errorMessage || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.')
        }
      } else {
        toast.error('Không thể đổi mật khẩu. Vui lòng thử lại sau.')
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    toast.success(
      twoFactorEnabled
        ? 'Đã tắt xác thực 2 lớp'
        : 'Đã bật xác thực 2 lớp'
    )
  }

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevokingSession(sessionId)
    try {
      await sessionService.revokeSession(sessionId)
      toast.success('Đã đăng xuất thiết bị thành công')
      // Remove the session from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error('Failed to revoke session:', error)
      toast.error('Không thể đăng xuất thiết bị. Vui lòng thử lại.')
    } finally {
      setIsRevokingSession(null)
    }
  }

  const handleLogoutAll = async () => {
    setIsRevokingAll(true)
    try {
      const response = await sessionService.logoutAllOtherDevices()
      toast.success(response.message || 'Đã đăng xuất tất cả thiết bị khác')
      // Refresh sessions to show only current session
      await fetchSessions()
    } catch (error) {
      console.error('Failed to logout all devices:', error)
      toast.error('Không thể đăng xuất tất cả thiết bị. Vui lòng thử lại.')
    } finally {
      setIsRevokingAll(false)
    }
  }

  // Get the appropriate icon for device type
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'MOBILE_IOS':
      case 'MOBILE_ANDROID':
        return <Smartphone className="h-5 w-5 text-foreground-muted" />
      case 'TABLET':
        return <Tablet className="h-5 w-5 text-foreground-muted" />
      case 'DESKTOP_APP':
        return <Laptop className="h-5 w-5 text-foreground-muted" />
      case 'WEB':
      default:
        return <Monitor className="h-5 w-5 text-foreground-muted" />
    }
  }

  // Format device name for display
  const formatDeviceName = (session: SessionInfo): string => {
    if (session.deviceName) {
      return session.deviceName
    }
    const browser = session.browserName || 'Browser'
    const os = session.osName || 'Unknown'
    return `${browser} on ${os}`
  }

  // Check if there are other sessions to logout
  const hasOtherSessions = sessions.filter(s => !s.current).length > 0

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-foreground-muted" />
            <div>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Mật khẩu hiện tại</Label>
            <Input
              id="current"
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new">Mật khẩu mới</Label>
              <Input
                id="new"
                type="password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm"
                type="password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwordData.current || !passwordData.new}
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Đổi mật khẩu'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Auth */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-foreground-muted" />
            <div>
              <CardTitle>Xác thực 2 lớp (2FA)</CardTitle>
              <CardDescription>
                Bảo vệ tài khoản với lớp bảo mật bổ sung
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${twoFactorEnabled ? 'bg-success/10' : 'bg-warning/10'
                  }`}
              >
                {twoFactorEnabled ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {twoFactorEnabled ? 'Đã bật' : 'Chưa bật'}
                </p>
                <p className="text-sm text-foreground-muted">
                  {twoFactorEnabled
                    ? 'Tài khoản của bạn được bảo vệ 2 lớp'
                    : 'Bật để tăng cường bảo mật'}
                </p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-foreground-muted" />
              <div>
                <CardTitle>Phiên đăng nhập</CardTitle>
                <CardDescription>
                  Quản lý các thiết bị đang đăng nhập
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSessions}
                disabled={isLoadingSessions}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasOtherSessions || isRevokingAll}
                  >
                    {isRevokingAll ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    Đăng xuất tất cả
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Đăng xuất tất cả thiết bị?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn sẽ được đăng xuất khỏi tất cả các thiết bị khác.
                      Phiên đăng nhập hiện tại của bạn sẽ được giữ nguyên.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogoutAll}>
                      Đăng xuất tất cả
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingSessions ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                <Monitor className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Không có phiên đăng nhập nào</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-surface-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.deviceType)}
                    <div>
                      <p className="font-medium text-sm">{formatDeviceName(session)}</p>
                      <p className="text-xs text-foreground-muted">
                        {session.location || session.ipAddress || 'Không xác định vị trí'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.current ? (
                      <Badge className="bg-success">Thiết bị này</Badge>
                    ) : (
                      <>
                        <span className="text-xs text-foreground-muted">
                          {session.lastActive}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isRevokingSession === session.id}
                            >
                              {isRevokingSession === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Đăng xuất thiết bị này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Thiết bị "{formatDeviceName(session)}" sẽ được đăng xuất và cần đăng nhập lại để tiếp tục sử dụng.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                                Đăng xuất
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/50">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle className="text-red-500">Vùng nguy hiểm</CardTitle>
          </div>
          <CardDescription>
            Các hành động này không thể hoàn tác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/30 bg-red-500/5">
            <div>
              <p className="font-medium">Xóa tài khoản</p>
              <p className="text-sm text-foreground-muted">
                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Xóa tài khoản vĩnh viễn
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn bao gồm:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Thông tin hồ sơ cá nhân</li>
                <li>Danh sách cổ phiếu theo dõi</li>
                <li>Lịch sử giao dịch</li>
                <li>Cài đặt thông báo</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">
                Nhập mật khẩu để xác nhận
              </Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                disabled={isDeletingAccount}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeletePassword('')
              }}
              disabled={isDeletingAccount}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tài khoản
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
