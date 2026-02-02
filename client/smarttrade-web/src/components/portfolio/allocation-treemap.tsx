import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { PortfolioHolding } from '@/stores/portfolio-store'

interface AllocationTreemapProps {
  holdings: PortfolioHolding[]
  onSelectHolding?: (symbol: string) => void
  selectedSymbol?: string | null
}

interface TreemapNode {
  symbol: string
  name: string
  value: number
  percent: number
  change: number
  color: string
}

// Generate color based on P&L percentage
function getNodeColor(change: number): string {
  if (change >= 5) return '#22C55E' // Strong green
  if (change >= 2) return '#4ADE80' // Medium green
  if (change >= 0) return '#86EFAC' // Light green
  if (change >= -2) return '#FCA5A5' // Light red
  if (change >= -5) return '#F87171' // Medium red
  return '#EF4444' // Strong red
}

function getTextColor(bgColor: string): string {
  // Simple contrast check - darker backgrounds get white text
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 150 ? '#000000' : '#FFFFFF'
}

// Squarified treemap algorithm (simplified)
function calculateTreemapLayout(
  nodes: TreemapNode[],
  width: number,
  height: number
): { node: TreemapNode; x: number; y: number; w: number; h: number }[] {
  if (nodes.length === 0) return []

  const totalValue = nodes.reduce((sum, n) => sum + n.value, 0)
  const sortedNodes = [...nodes].sort((a, b) => b.value - a.value)

  const result: { node: TreemapNode; x: number; y: number; w: number; h: number }[] = []
  let currentX = 0
  let currentY = 0
  let remainingWidth = width
  let remainingHeight = height
  let row: TreemapNode[] = []
  let rowValue = 0
  let isHorizontal = remainingWidth >= remainingHeight

  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i]
    row.push(node)
    rowValue += node.value

    // Calculate aspect ratio for current row
    const rowArea = (rowValue / totalValue) * width * height
    const rowLength = isHorizontal ? rowArea / remainingHeight : rowArea / remainingWidth

    // Check if adding next node would make aspect ratios worse
    const shouldFinishRow =
      i === sortedNodes.length - 1 ||
      row.length >= 3 ||
      (i < sortedNodes.length - 1 &&
        sortedNodes[i + 1].value / node.value < 0.3)

    if (shouldFinishRow) {
      // Layout current row
      let offset = 0
      for (const rowNode of row) {
        const nodeRatio = rowNode.value / rowValue
        const nodeLength = nodeRatio * rowLength

        if (isHorizontal) {
          result.push({
            node: rowNode,
            x: currentX,
            y: currentY + offset,
            w: rowLength,
            h: nodeLength,
          })
          offset += nodeLength
        } else {
          result.push({
            node: rowNode,
            x: currentX + offset,
            y: currentY,
            w: nodeLength,
            h: rowLength,
          })
          offset += nodeLength
        }
      }

      // Update remaining area
      if (isHorizontal) {
        currentX += rowLength
        remainingWidth -= rowLength
      } else {
        currentY += rowLength
        remainingHeight -= rowLength
      }

      // Reset row
      row = []
      rowValue = 0
      isHorizontal = remainingWidth >= remainingHeight
    }
  }

  return result
}

export function AllocationTreemap({
  holdings,
  onSelectHolding,
  selectedSymbol,
}: AllocationTreemapProps) {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null)

  const nodes: TreemapNode[] = useMemo(() => {
    return holdings.map((h) => ({
      symbol: h.symbol,
      name: h.name,
      value: h.marketValue,
      percent: h.weight,
      change: h.unrealizedPLPercent,
      color: getNodeColor(h.unrealizedPLPercent),
    }))
  }, [holdings])

  const layout = useMemo(() => {
    return calculateTreemapLayout(nodes, 100, 100)
  }, [nodes])

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Phân bổ danh mục
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            Chưa có dữ liệu danh mục
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Phân bổ danh mục
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9' }}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              {layout.map(({ node, x, y, w, h }) => {
                const isSelected = selectedSymbol === node.symbol
                const isHovered = hoveredSymbol === node.symbol
                const textColor = getTextColor(node.color)

                return (
                  <Tooltip key={node.symbol}>
                    <TooltipTrigger asChild>
                      <g
                        className="cursor-pointer transition-all duration-150"
                        onClick={() => onSelectHolding?.(node.symbol)}
                        onMouseEnter={() => setHoveredSymbol(node.symbol)}
                        onMouseLeave={() => setHoveredSymbol(null)}
                      >
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill={node.color}
                          stroke={isSelected ? '#000' : '#fff'}
                          strokeWidth={isSelected ? 0.5 : 0.2}
                          opacity={isHovered || isSelected ? 1 : 0.9}
                          className="transition-all duration-150"
                        />
                        {/* Only show text if box is large enough */}
                        {w > 8 && h > 8 && (
                          <>
                            <text
                              x={x + w / 2}
                              y={y + h / 2 - (h > 15 ? 2 : 0)}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={textColor}
                              fontSize={Math.min(w / 4, h / 3, 4)}
                              fontWeight="bold"
                              className="pointer-events-none"
                            >
                              {node.symbol}
                            </text>
                            {w > 12 && h > 15 && (
                              <text
                                x={x + w / 2}
                                y={y + h / 2 + 3}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={textColor}
                                fontSize={Math.min(w / 5, h / 4, 2.5)}
                                opacity={0.9}
                                className="pointer-events-none"
                              >
                                {formatPercent(node.percent)}
                              </text>
                            )}
                          </>
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{node.symbol}</p>
                        <p className="text-xs text-muted-foreground">{node.name}</p>
                        <div className="flex justify-between gap-4 text-sm">
                          <span>Giá trị:</span>
                          <span className="font-mono">{formatCurrency(node.value)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                          <span>Tỷ trọng:</span>
                          <span className="font-mono">{formatPercent(node.percent)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                          <span>Lãi/Lỗ:</span>
                          <span
                            className={cn(
                              'font-mono',
                              node.change >= 0 ? 'text-green-500' : 'text-red-500'
                            )}
                          >
                            {node.change >= 0 ? '+' : ''}
                            {formatPercent(node.change)}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </svg>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#22C55E' }} />
            <span className="text-[var(--color-text-muted)]">{'>'}5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#86EFAC' }} />
            <span className="text-[var(--color-text-muted)]">0-5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FCA5A5' }} />
            <span className="text-[var(--color-text-muted)]">0 to -5%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#EF4444' }} />
            <span className="text-[var(--color-text-muted)]">{'<'}-5%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
