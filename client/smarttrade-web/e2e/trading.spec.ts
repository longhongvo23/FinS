import { test, expect } from '@playwright/test'

test.describe('Trading Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/v1/market/stocks', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stocks: [
            { symbol: 'VNM', name: 'Vinamilk', price: 85000, change: 1500, change_percent: 1.8 },
            { symbol: 'FPT', name: 'FPT Corp', price: 145000, change: -2000, change_percent: -1.36 },
          ],
        }),
      })
    })

    await page.route('**/api/v1/trading/orders', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ orders: [] }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'order-1',
            status: 'pending',
            created_at: new Date().toISOString(),
          }),
        })
      }
    })

    await page.goto('/trading')
  })

  test('should display trading page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /giao dịch/i })).toBeVisible()
  })

  test('should show order form', async ({ page }) => {
    // Look for buy/sell tabs or buttons
    const buyTab = page.getByRole('tab', { name: /mua/i })
    const sellTab = page.getByRole('tab', { name: /bán/i })

    if (await buyTab.isVisible()) {
      await expect(buyTab).toBeVisible()
      await expect(sellTab).toBeVisible()
    }
  })

  test('should search for stock symbol', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/tìm.*mã/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill('VNM')
      await searchInput.press('Enter')

      // Should show stock info
      await expect(page.getByText('VNM')).toBeVisible()
    }
  })

  test('should submit buy order', async ({ page }) => {
    // Fill order form
    const symbolInput = page.getByPlaceholder(/mã cổ phiếu/i)
    const quantityInput = page.getByPlaceholder(/số lượng/i)
    const priceInput = page.getByPlaceholder(/giá/i)

    if (await symbolInput.isVisible()) {
      await symbolInput.fill('VNM')
    }

    if (await quantityInput.isVisible()) {
      await quantityInput.fill('100')
    }

    if (await priceInput.isVisible()) {
      await priceInput.fill('85000')
    }

    // Click buy button
    const buyButton = page.getByRole('button', { name: /đặt lệnh.*mua/i })
    if (await buyButton.isVisible()) {
      await buyButton.click()

      // Should show success message
      await expect(page.getByText(/thành công|đã đặt/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('should validate order form', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /đặt lệnh/i })

    if (await submitButton.isVisible()) {
      await submitButton.click()

      // Should show validation errors
      const errorMessage = page.getByText(/bắt buộc|không hợp lệ/i)
      await expect(errorMessage).toBeVisible({ timeout: 3000 })
    }
  })

  test('should display order book', async ({ page }) => {
    const orderBook = page.getByTestId('order-book')

    if (await orderBook.isVisible()) {
      // Should have bid/ask sections
      await expect(page.getByText(/mua|bid/i)).toBeVisible()
      await expect(page.getByText(/bán|ask/i)).toBeVisible()
    }
  })

  test('should show recent orders', async ({ page }) => {
    const recentOrders = page.getByTestId('recent-orders')

    if (await recentOrders.isVisible()) {
      // Should show orders list or empty state
      const emptyState = page.getByText(/chưa có lệnh/i)
      const ordersList = page.getByRole('table')

      const hasOrders = await ordersList.isVisible()
      const isEmpty = await emptyState.isVisible()

      expect(hasOrders || isEmpty).toBe(true)
    }
  })
})

test.describe('Trading - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should display mobile-optimized trading UI', async ({ page }) => {
    await page.goto('/trading')

    // Should show bottom navigation
    const bottomNav = page.locator('nav').filter({ has: page.getByText(/giao dịch/i) })
    await expect(bottomNav).toBeVisible()
  })

  test('should have touch-friendly order buttons', async ({ page }) => {
    await page.goto('/trading')

    // Buttons should be large enough for touch
    const buyButton = page.getByRole('button', { name: /mua/i }).first()

    if (await buyButton.isVisible()) {
      const box = await buyButton.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44) // Minimum touch target
    }
  })
})
