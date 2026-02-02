import { useState } from 'react'
import { Save, Trash2, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useScreenerStore,
  presetScreens,
  type PresetScreen,
} from '@/stores/screener-store'
import { getPresetIcon } from '@/lib/icons'

export function PresetScreens() {
  const { applyPreset, savedScreens, saveScreen, loadScreen, deleteScreen, getActiveFilterCount } =
    useScreenerStore()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [screenName, setScreenName] = useState('')

  const handleSave = () => {
    if (screenName.trim()) {
      saveScreen(screenName.trim())
      setScreenName('')
      setSaveDialogOpen(false)
    }
  }

  const handlePresetClick = (preset: PresetScreen) => {
    applyPreset(preset)
  }

  const activeFilters = getActiveFilterCount()

  return (
    <div className="space-y-3">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presetScreens.map((preset) => {
          const Icon = getPresetIcon(preset.id)
          return (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset)}
              className="h-8 px-3 text-[11px] border-[var(--color-border)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5"
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {preset.name}
            </Button>
          )
        })}
      </div>

      {/* Save & Load Actions */}
      <div className="flex items-center gap-2">
        {/* Save Screen Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={activeFilters === 0}
              className="h-8 px-3 text-[11px] border-[var(--color-border)]"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Lưu bộ lọc
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-[var(--color-surface)] border-[var(--color-border)]">
            <DialogHeader>
              <DialogTitle className="text-[15px]">Lưu bộ lọc tùy chỉnh</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                  Tên bộ lọc
                </label>
                <Input
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="VD: Cổ phiếu tiềm năng Q1"
                  className="h-9 text-[13px] bg-[var(--color-bg-secondary)] border-[var(--color-border)]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveDialogOpen(false)}
                  className="h-8 text-[12px]"
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!screenName.trim()}
                  className="h-8 text-[12px] bg-[var(--color-brand)] hover:bg-[var(--color-brand)]/90"
                >
                  Lưu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Load Saved Screens */}
        {savedScreens.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[11px] border-[var(--color-border)]"
              >
                <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                Đã lưu ({savedScreens.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 bg-[var(--color-surface)] border-[var(--color-border)]"
            >
              {savedScreens.map((screen) => (
                <DropdownMenuItem
                  key={screen.id}
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => loadScreen(screen.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {screen.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {new Date(screen.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteScreen(screen.id)
                    }}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-[var(--color-negative)] hover:text-[var(--color-negative)] hover:bg-[var(--color-negative)]/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
