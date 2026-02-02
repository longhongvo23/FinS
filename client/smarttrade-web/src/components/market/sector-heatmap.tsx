import { cn } from '@/lib/utils'

interface Sector {
  name: string
  code: string
  change: number
  marketCap: number
}

interface SectorHeatmapProps {
  sectors: Sector[]
  className?: string
}

export function SectorHeatmap({ sectors, className }: SectorHeatmapProps) {
  // Sort by market cap for larger boxes
  const sortedSectors = [...sectors].sort((a, b) => b.marketCap - a.marketCap)

  const getBackgroundColor = (change: number) => {
    if (change >= 3) return 'bg-success'
    if (change >= 1.5) return 'bg-success/80'
    if (change >= 0.5) return 'bg-success/60'
    if (change > 0) return 'bg-success/40'
    if (change === 0) return 'bg-warning/40'
    if (change > -0.5) return 'bg-danger/40'
    if (change > -1.5) return 'bg-danger/60'
    if (change > -3) return 'bg-danger/80'
    return 'bg-danger'
  }

  const getTextColor = (change: number) => {
    if (Math.abs(change) >= 1) return 'text-white'
    return 'text-foreground'
  }

  // Calculate relative sizes based on market cap
  const maxMarketCap = Math.max(...sectors.map((s) => s.marketCap))
  const getSize = (marketCap: number) => {
    const ratio = marketCap / maxMarketCap
    if (ratio > 0.7) return 'col-span-2 row-span-2'
    if (ratio > 0.4) return 'col-span-2'
    return ''
  }

  return (
    <div
      className={cn(
        'grid grid-cols-4 md:grid-cols-6 gap-1.5',
        className
      )}
    >
      {sortedSectors.map((sector) => (
        <div
          key={sector.code}
          className={cn(
            'p-2 rounded-md cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md',
            getBackgroundColor(sector.change),
            getTextColor(sector.change),
            getSize(sector.marketCap)
          )}
        >
          <p className="text-xs font-medium truncate">{sector.code}</p>
          <p className="text-sm font-bold">
            {sector.change >= 0 ? '+' : ''}
            {sector.change.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  )
}
