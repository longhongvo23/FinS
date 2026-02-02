import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Layout - loaded immediately
import { AppLayout } from '@/components/layout/app-layout'
import { ProtectedRoute } from '@/components/common/protected-route'
import { ErrorBoundary } from '@/components/common/error-boundary'

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-foreground-muted text-sm">Đang tải...</p>
    </div>
  </div>
)

// Auth Pages - lazy loaded
const LoginPage = lazy(() => import('@/pages/auth/login').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/register').then(m => ({ default: m.RegisterPage })))
const VerifyOTPPage = lazy(() => import('@/pages/auth/verify-otp').then(m => ({ default: m.VerifyOTPPage })))
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email').then(m => ({ default: m.VerifyEmailPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password').then(m => ({ default: m.ResetPasswordPage })))

// Main Pages - lazy loaded
const DashboardPage = lazy(() => import('@/pages/dashboard').then(m => ({ default: m.DashboardPage })))
const MarketPage = lazy(() => import('@/pages/market').then(m => ({ default: m.MarketPage })))
const StockScreenerPage = lazy(() => import('@/pages/screener'))
const StockDetailPage = lazy(() => import('@/pages/stock/[symbol]').then(m => ({ default: m.StockDetailPage })))
const PortfolioPage = lazy(() => import('@/pages/portfolio').then(m => ({ default: m.PortfolioPage })))
// Trading pages removed - not in project scope
const AIChatPage = lazy(() => import('@/pages/ai-chat').then(m => ({ default: m.AIChatPage })))
const WatchlistPage = lazy(() => import('@/pages/watchlist').then(m => ({ default: m.WatchlistPage })))

// Derivatives Pages removed - not in project scope

// Notifications - lazy loaded
const NotificationsPage = lazy(() => import('@/pages/notifications').then(m => ({ default: m.NotificationsPage })))

// Settings Pages - lazy loaded
const SettingsLayout = lazy(() => import('@/pages/settings/layout').then(m => ({ default: m.SettingsLayout })))
const ProfileSettingsPage = lazy(() => import('@/pages/settings/profile').then(m => ({ default: m.ProfileSettingsPage })))
const SecuritySettingsPage = lazy(() => import('@/pages/settings/security').then(m => ({ default: m.SecuritySettingsPage })))
const NotificationsSettingsPage = lazy(() => import('@/pages/settings/notifications-settings').then(m => ({ default: m.NotificationsSettingsPage })))
const DisplaySettingsPage = lazy(() => import('@/pages/settings/display').then(m => ({ default: m.DisplaySettingsPage })))
const AboutSettingsPage = lazy(() => import('@/pages/settings/about').then(m => ({ default: m.AboutSettingsPage })))

// Admin Pages - lazy loaded
const AnalyticsDashboard = lazy(() => import('@/pages/admin/analytics'))

// Research Pages - lazy loaded
const ResearchDashboard = lazy(() => import('@/pages/research'))

// Smart Alerts - REMOVED (consolidated into Notifications)
// AlertsPage now redirects to /notifications

// AI Insights - lazy loaded
const InsightsPage = lazy(() => import('@/pages/insights'))

// News - lazy loaded
const NewsPage = lazy(() => import('@/pages/news'))

// Landing Page - lazy loaded
const LandingPage = lazy(() => import('@/pages/landing'))

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/screener" element={<StockScreenerPage />} />
                <Route path="/stock/:symbol" element={<StockDetailPage />} />
                {/* Trading routes removed - not in project scope */}
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/ai-chat" element={<AIChatPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/research" element={<ResearchDashboard />} />
                <Route path="/alerts" element={<Navigate to="/notifications" replace />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* Derivatives routes removed - not in project scope */}

                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />}>
                  <Route index element={<ProfileSettingsPage />} />
                  <Route path="profile" element={<ProfileSettingsPage />} />
                  <Route path="security" element={<SecuritySettingsPage />} />
                  <Route path="notifications" element={<NotificationsSettingsPage />} />
                  <Route path="display" element={<DisplaySettingsPage />} />
                  <Route path="about" element={<AboutSettingsPage />} />
                </Route>

                {/* Admin */}
                <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
              </Route>

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--surface-2))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
