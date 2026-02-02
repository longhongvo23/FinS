import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Camera, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { userService } from '@/services/user-service'
import { authService } from '@/services/auth-service'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageCropper } from '@/components/ui/image-cropper'
import { useAuthStore } from '@/stores/auth-store'

// List of countries (common ones)
const COUNTRIES = [
  { value: 'VN', label: 'Việt Nam' },
  { value: 'US', label: 'Hoa Kỳ' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'CN', label: 'Trung Quốc' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thái Lan' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'AU', label: 'Úc' },
  { value: 'UK', label: 'Anh' },
  { value: 'DE', label: 'Đức' },
  { value: 'FR', label: 'Pháp' },
  { value: 'OTHER', label: 'Khác' },
]

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, updateLocalUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [cropImage, setCropImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    country: '',
    dateOfBirth: '',
    bio: '',
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    riskTolerance: 'moderate',
    investmentGoal: 'growth',
    experience: 'intermediate',
  })

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const profile = await userService.getMyProfile()
        setFormData({
          fullName: profile.fullName || '',
          email: profile.email || '',
          phone: profile.phoneNumber || '',
          avatarUrl: profile.avatarUrl || '',
          country: profile.country || '',
          dateOfBirth: profile.dateOfBirth || '',
          bio: profile.bio || '',
          profileVisibility: profile.profileVisibility || 'private',
          showEmail: profile.showEmail || false,
          showPhone: profile.showPhone || false,
          riskTolerance: profile.riskTolerance || 'moderate',
          investmentGoal: profile.investmentGoal || 'growth',
          experience: profile.investmentExperience || 'intermediate',
        })
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Không thể tải thông tin hồ sơ')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await userService.updateMyProfile({
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        country: formData.country,
        dateOfBirth: formData.dateOfBirth,
        bio: formData.bio,
        profileVisibility: formData.profileVisibility,
        showEmail: formData.showEmail,
        showPhone: formData.showPhone,
        riskTolerance: formData.riskTolerance,
        investmentGoal: formData.investmentGoal,
        investmentExperience: formData.experience,
      })
      toast.success('Đã lưu thông tin hồ sơ')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Không thể lưu thông tin hồ sơ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Vui lòng nhập mật khẩu để xác nhận')
      return
    }

    setIsDeleting(true)
    try {
      await authService.deleteAccount(deletePassword)
      toast.success('Tài khoản đã được xóa thành công')
      setShowDeleteDialog(false)
      navigate('/auth/login')
    } catch (error: unknown) {
      console.error('Failed to delete account:', error)
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        toast.error(errorMessage || 'Không thể xóa tài khoản')
      } else {
        toast.error('Không thể xóa tài khoản. Vui lòng thử lại sau.')
      }
    } finally {
      setIsDeleting(false)
      setDeletePassword('')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB')
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Chỉ chấp nhận file JPG hoặc PNG')
      return
    }

    // Create preview URL for cropper
    const previewUrl = URL.createObjectURL(file)
    setCropImage(previewUrl)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Show preview immediately with cropped blob
    const previewUrl = URL.createObjectURL(croppedBlob)
    setFormData(prev => ({ ...prev, avatarUrl: previewUrl }))

    // Backend upload
    try {
      toast.loading('Đang tải ảnh lên...', { id: 'avatar-upload' })

      // Convert blob to File object for the service
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })

      const result = await userService.uploadAvatar(file)

      // Update form with actual URL from server
      setFormData(prev => ({ ...prev, avatarUrl: result.avatarUrl }))

      // Update auth store so sidebar and other components get the new avatar
      if (user) {
        updateLocalUser({ avatar_url: result.avatarUrl })
      }

      toast.success('Đã cập nhật ảnh đại diện', { id: 'avatar-upload' })
    } catch (error) {
      // Revert preview on error
      // Ideally trigger a re-fetch of profile here or revert to old URL
      const message = error instanceof Error ? error.message : 'Không thể tải ảnh lên'
      toast.error(message, { id: 'avatar-upload' })
    }

    // Clean up preview URL (the cropped one) - keeping it for now until navigation away or new upload technically
    // URL.revokeObjectURL(previewUrl) 
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
          <CardDescription>Chọn ảnh để hiển thị trên hồ sơ của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatarUrl} />
                <AvatarFallback className="text-2xl bg-brand/20 text-brand">
                  {formData.fullName.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                Tải ảnh lên
              </Button>
              <p className="text-xs text-foreground-muted mt-2">
                JPG, PNG. Tối đa 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropper Modal */}
      {cropImage && (
        <ImageCropper
          image={cropImage}
          open={!!cropImage}
          onOpenChange={(open) => !open && setCropImage(null)}
          onCropComplete={handleCropComplete}
          aspect={1}
        />
      )}

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+84 xxx xxx xxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} disabled />
              <p className="text-xs text-foreground-muted">
                Email không thể thay đổi
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia</Label>
              <Select
                value={formData.country}
                onValueChange={(v) => setFormData({ ...formData, country: v })}
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Chọn quốc gia" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu bản thân</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-foreground-muted text-right">
              {formData.bio.length}/500 ký tự
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt quyền riêng tư</CardTitle>
          <CardDescription>Kiểm soát ai có thể xem thông tin của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chế độ hiển thị hồ sơ</Label>
            <Select
              value={formData.profileVisibility}
              onValueChange={(v) =>
                setFormData({ ...formData, profileVisibility: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Công khai - Mọi người có thể xem</SelectItem>
                <SelectItem value="friends">Bạn bè - Chỉ bạn bè xem được</SelectItem>
                <SelectItem value="private">Riêng tư - Chỉ mình tôi xem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showEmail">Hiển thị email</Label>
              <p className="text-sm text-foreground-muted">
                Cho phép người khác xem địa chỉ email của bạn
              </p>
            </div>
            <Switch
              id="showEmail"
              checked={formData.showEmail}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showEmail: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showPhone">Hiển thị số điện thoại</Label>
              <p className="text-sm text-foreground-muted">
                Cho phép người khác xem số điện thoại của bạn
              </p>
            </div>
            <Switch
              id="showPhone"
              checked={formData.showPhone}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showPhone: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Investment Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ đầu tư</CardTitle>
          <CardDescription>
            Giúp AI đưa ra khuyến nghị phù hợp với bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mức độ chấp nhận rủi ro</Label>
            <Select
              value={formData.riskTolerance}
              onValueChange={(v) =>
                setFormData({ ...formData, riskTolerance: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Thận trọng - Ưu tiên bảo toàn vốn</SelectItem>
                <SelectItem value="moderate">Cân bằng - Chấp nhận rủi ro vừa phải</SelectItem>
                <SelectItem value="aggressive">Mạo hiểm - Sẵn sàng rủi ro cao</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mục tiêu đầu tư</Label>
            <Select
              value={formData.investmentGoal}
              onValueChange={(v) =>
                setFormData({ ...formData, investmentGoal: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Thu nhập - Cổ tức ổn định</SelectItem>
                <SelectItem value="growth">Tăng trưởng - Lợi nhuận dài hạn</SelectItem>
                <SelectItem value="trading">Giao dịch - Lợi nhuận ngắn hạn</SelectItem>
                <SelectItem value="preservation">Bảo toàn - An toàn vốn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kinh nghiệm đầu tư</Label>
            <Select
              value={formData.experience}
              onValueChange={(v) =>
                setFormData({ ...formData, experience: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Mới bắt đầu (0-1 năm)</SelectItem>
                <SelectItem value="intermediate">Trung bình (1-3 năm)</SelectItem>
                <SelectItem value="advanced">Nhiều kinh nghiệm (3-5 năm)</SelectItem>
                <SelectItem value="expert">Chuyên gia (5+ năm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>

      {/* Danger Zone - Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Vùng nguy hiểm
          </CardTitle>
          <CardDescription>
            Các hành động này không thể hoàn tác
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Xóa tài khoản</p>
              <p className="text-sm text-foreground-muted">
                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
              </p>
            </div>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tài khoản
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Xác nhận xóa tài khoản
                  </DialogTitle>
                  <DialogDescription>
                    Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn bao gồm
                    danh mục đầu tư, watchlist, và cài đặt sẽ bị xóa vĩnh viễn.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="delete-password-profile">
                      Nhập mật khẩu để xác nhận
                    </Label>
                    <Input
                      id="delete-password-profile"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      disabled={isDeleting}
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
                    disabled={isDeleting}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || !deletePassword}
                  >
                    {isDeleting ? (
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
        </CardContent>
      </Card>
    </div>
  )
}
