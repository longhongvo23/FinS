import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Bookmark, ExternalLink, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useNewsStore,
  getCompanyInfo,
  type NewsArticle,
} from '@/stores/news-store'

interface NewsCardProps {
  article: NewsArticle
  compact?: boolean
  featured?: boolean
}

// Get the first related symbol's company info
function getRelatedCompanyInfo(symbols: string[]): { logo: string; color: string; name: string } | undefined {
  for (const symbol of symbols) {
    const info = getCompanyInfo(symbol)
    if (info) return info
  }
  return undefined
}

export function NewsCard({ article, compact = false, featured = false }: NewsCardProps) {
  const { toggleSaveArticle, isArticleSaved } = useNewsStore()
  const isSaved = isArticleSaved(article.id)
  const [logoError, setLogoError] = useState(false)

  // Get company info for display
  const companyInfo = getRelatedCompanyInfo(article.relatedSymbols)
  const primarySymbol = article.relatedSymbols[0] || ''
  const brandColor = companyInfo?.color || '#6366f1'

  // Generate initials from symbol (fallback if logo fails)
  const getInitials = (symbol: string) => symbol.slice(0, 2).toUpperCase()

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: vi,
  })

  const handleOpenSource = () => {
    window.open(article.sourceUrl, '_blank', 'noopener,noreferrer')
  }

  // Logo component with white background and brand color border
  const LogoBadge = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-14 h-14',
      lg: 'w-16 h-16',
    }
    const logoSizes = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-10 h-10',
    }
    const textSizes = {
      sm: 'text-xs',
      md: 'text-lg',
      lg: 'text-xl',
    }

    return (
      <div
        className={cn(
          sizeClasses[size],
          "rounded-xl flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-50"
        )}
        style={{
          boxShadow: `0 0 0 2px ${brandColor}`,
        }}
      >
        {companyInfo && !logoError ? (
          <img
            src={companyInfo.logo}
            alt={companyInfo.name}
            className={cn(logoSizes[size], "object-contain")}
            onError={() => setLogoError(true)}
          />
        ) : (
          <span
            className={cn(textSizes[size], "font-bold")}
            style={{ color: brandColor }}
          >
            {getInitials(primarySymbol)}
          </span>
        )}
      </div>
    )
  }

  // Compact variant for sidebar/small lists
  if (compact) {
    return (
      <div
        onClick={handleOpenSource}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
      >
        <LogoBadge size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-foreground-muted">
              {article.source}
            </span>
            <span className="text-xs text-foreground-muted">•</span>
            <span className="text-xs text-foreground-muted">{timeAgo}</span>
          </div>
          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">
            {article.title}
          </p>
        </div>
        <ExternalLink className="h-4 w-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    )
  }

  // Featured variant for trending section
  if (featured) {
    return (
      <div
        onClick={handleOpenSource}
        className="group cursor-pointer rounded-xl overflow-hidden bg-card border hover:border-primary/50 transition-all h-full flex flex-col"
      >
        {/* Header with Logo */}
        <div className="h-28 flex items-center justify-center bg-gradient-to-br from-secondary to-background">
          <LogoBadge size="lg" />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.source}
            </Badge>
            <span className="text-xs text-foreground-muted">{timeAgo}</span>
          </div>
          <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-foreground-muted line-clamp-2 flex-1">
            {article.summary}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {article.relatedSymbols.slice(0, 3).map((symbol) => (
              <Link
                key={symbol}
                to={`/stock/${symbol}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 rounded bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {symbol}
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default card variant
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card border hover:border-primary/30 transition-colors group">
      {/* Logo Badge */}
      <LogoBadge size="lg" />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="secondary" className="text-xs">
            {article.source}
          </Badge>
          <span className="text-xs text-foreground-muted">•</span>
          <span className="text-xs text-foreground-muted">{timeAgo}</span>
          {article.language === 'vi' && (
            <>
              <span className="text-xs text-foreground-muted">•</span>
              <span className="text-xs text-foreground-muted flex items-center gap-1">
                <Globe className="h-3 w-3" />
                VN
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={handleOpenSource}
          className="text-sm font-semibold line-clamp-2 cursor-pointer hover:text-primary transition-colors mb-1"
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-foreground-muted line-clamp-2 mb-2">
          {article.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          {/* Related Symbols */}
          <div className="flex items-center gap-1.5">
            {article.relatedSymbols.slice(0, 3).map((symbol) => (
              <Link
                key={symbol}
                to={`/stock/${symbol}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 rounded bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                {symbol}
              </Link>
            ))}
            {article.relatedSymbols.length > 3 && (
              <span className="text-xs text-foreground-muted">
                +{article.relatedSymbols.length - 3}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                toggleSaveArticle(article.id)
              }}
              className={cn(
                'h-8 w-8',
                isSaved
                  ? 'text-primary'
                  : 'text-foreground-muted opacity-0 group-hover:opacity-100'
              )}
            >
              <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenSource}
              className="h-8 w-8 text-foreground-muted opacity-0 group-hover:opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
