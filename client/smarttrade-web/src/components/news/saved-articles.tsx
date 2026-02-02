import { Bookmark } from 'lucide-react'
import { useNewsStore } from '@/stores/news-store'
import { NewsCard } from './news-card'

export function SavedArticles() {
  const { getSavedArticles } = useNewsStore()
  const savedArticles = getSavedArticles()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          {savedArticles.length} bài viết đã lưu
        </p>
      </div>

      {/* Saved Articles List */}
      {savedArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <Bookmark className="h-12 w-12 text-foreground-muted mb-4" />
          <h3 className="text-base font-medium mb-2">
            Chưa có bài viết nào được lưu
          </h3>
          <p className="text-sm text-foreground-muted text-center max-w-sm">
            Nhấn vào biểu tượng bookmark trên các bài viết để lưu lại và đọc sau
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
