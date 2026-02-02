import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers and helpers
export function mockLocalStorage(data: Record<string, string> = {}) {
  const store: Record<string, string> = { ...data }

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(key => delete store[key]) },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  }
}

// Wait for loading states to resolve
export async function waitForLoadingToFinish() {
  const { waitFor, screen } = await import('@testing-library/react')
  await waitFor(() => {
    const loaders = [
      ...screen.queryAllByTestId('loading'),
      ...screen.queryAllByRole('progressbar'),
      ...screen.queryAllByText(/loading/i),
    ]
    loaders.forEach((loader) => {
      expect(loader).not.toBeInTheDocument()
    })
  })
}

// Format currency for assertions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format percentage for assertions
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}
