import { useState } from 'react'
import { SlidersHorizontal, PanelLeftClose, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import { useScreenerStore } from '@/stores/screener-store'
import {
  ScreenerFilters,
  ScreenerResults,
  PresetScreens,
  DiscoverySection,
} from '@/components/screener'

export function ScreenerPage() {
  const { filtersOpen, toggleFilters, expandedRows, getActiveFilterCount } = useScreenerStore()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeFilters = getActiveFilterCount()

  // Get selected symbol from expanded row (for similar stocks)
  const selectedSymbol = expandedRows.length > 0 ? expandedRows[0] : undefined

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="px-6 py-4">
          <PageHeader
            title="Bộ lọc cổ phiếu"
            description="Tìm kiếm cổ phiếu theo tiêu chí của bạn"
            actions={
              <div className="flex items-center gap-2">
                {/* Desktop: Toggle filters panel */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFilters}
                  className="hidden md:flex h-8 px-3 text-[12px] border-[var(--color-border)]"
                >
                  {filtersOpen ? (
                    <>
                      <PanelLeftClose className="h-4 w-4 mr-1.5" />
                      Ẩn bộ lọc
                    </>
                  ) : (
                    <>
                      <PanelLeft className="h-4 w-4 mr-1.5" />
                      Hiện bộ lọc
                      {activeFilters > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                          {activeFilters}
                        </span>
                      )}
                    </>
                  )}
                </Button>

                {/* Mobile: Filters dialog */}
                <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="md:hidden h-8 px-3 text-[12px] border-[var(--color-border)]"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                      Bộ lọc
                      {activeFilters > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                          {activeFilters}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[350px] max-h-[80vh] overflow-y-auto p-0 bg-[var(--color-surface)] border-[var(--color-border)]">
                    <DialogHeader className="sr-only">
                      <DialogTitle>Bộ lọc</DialogTitle>
                    </DialogHeader>
                    <ScreenerFilters />
                  </DialogContent>
                </Dialog>
              </div>
            }
          />

          {/* Preset Screens */}
          <div className="mt-4">
            <PresetScreens />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar (Desktop) */}
        <div
          className={cn(
            'hidden md:block flex-shrink-0 overflow-hidden transition-all duration-300',
            filtersOpen ? 'w-[280px]' : 'w-0'
          )}
        >
          <div className="h-full w-[280px] overflow-y-auto">
            <ScreenerFilters />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScreenerResults />
          </div>

          {/* Discovery Section */}
          <div className="flex-shrink-0 border-t border-[var(--color-border)] p-4 bg-[var(--color-bg-primary)]">
            <DiscoverySection selectedSymbol={selectedSymbol} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScreenerPage
