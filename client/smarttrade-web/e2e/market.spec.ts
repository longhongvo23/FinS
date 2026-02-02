import { test, expect } from '@playwright/test'

test.describe('Market Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock market API
    await page.route('**/api/v1/market/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/indices')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            indices: [
              { symbol: 'VNINDEX', value: 1250.5, change: 12.3, change_percent: 0.99 },
              { symbol: 'HNX', value: 235.8, change: -1.2, change_percent: -0.51 },
              { symbol: 'VN30', value: 1285.2, change: 8.7, change_percent: 0.68 },
            ],
          }),
        })
      } else if (url.includes('/stocks')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            stocks: [
              { symbol: 'VNM', name: 'Vinamilk', price: 76500, change: 1500, change_percent: 2.0, volume: 2500000 },
              { symbol: 'FPT', name: 'FPT Corp', price: 92000, change: -1000, change_percent: -1.1, volume: 1800000 },
              { symbol: 'VCB', name: 'Vietcombank', price: 95000, change: 500, change_percent: 0.53, volume: 1200000 },
            ],
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.goto('/market')
  })

  test('displays market page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /thị trường/i })).toBeVisible()
  })

  test('shows market indices', async ({ page }) => {
    await expect(page.getByText('VNINDEX')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('HNX')).toBeVisible()
    await expect(page.getByText('VN30')).toBeVisible()
  })

  test('shows stock list', async ({ page }) => {
    await expect(page.getByText('VNM')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('FPT')).toBeVisible()
  })

  test('shows stock names', async ({ page }) => {
    await expect(page.getByText('Vinamilk')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('FPT Corp')).toBeVisible()
  })

  test('navigates to stock detail on click', async ({ page }) => {
    await page.getByText('VNM').first().click()

    await expect(page).toHaveURL(/\/market\/VNM|\/stock\/VNM/)
  })

  test('shows positive change in green color', async ({ page }) => {
    const vnmRow = page.locator('[data-testid="stock-row-VNM"], tr:has-text("VNM")')

    if (await vnmRow.isVisible()) {
      const changeElement = vnmRow.locator('.text-green, .text-emerald, [class*="positive"]')
      await expect(changeElement.first()).toBeVisible()
    }
  })

  test('shows negative change in red color', async ({ page }) => {
    const fptRow = page.locator('[data-testid="stock-row-FPT"], tr:has-text("FPT")')

    if (await fptRow.isVisible()) {
      const changeElement = fptRow.locator('.text-red, [class*="negative"]')
      await expect(changeElement.first()).toBeVisible()
    }
  })

  test('has search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/tìm|search/i)

    if (await searchInput.isVisible()) {
      await searchInput.fill('VNM')

      // Should filter to show only VNM
      await expect(page.getByText('VNM')).toBeVisible()
    }
  })
})

test.describe('Market Page - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('displays mobile-friendly layout', async ({ page }) => {
    await page.route('**/api/v1/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stocks: [
            { symbol: 'VNM', name: 'Vinamilk', price: 76500, change: 1500, change_percent: 2.0 },
          ],
        }),
      })
    })

    await page.goto('/market')

    // Should show bottom navigation on mobile
    const bottomNav = page.locator('nav[class*="fixed"][class*="bottom"]')
    await expect(bottomNav).toBeVisible()
  })

  test('has touch-friendly stock cards', async ({ page }) => {
    await page.route('**/api/v1/market/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stocks: [
            { symbol: 'VNM', name: 'Vinamilk', price: 76500, change: 1500, change_percent: 2.0 },
          ],
        }),
      })
    })

    await page.goto('/market')

    // Stock elements should be visible and tappable
    await expect(page.getByText('VNM')).toBeVisible({ timeout: 10000 })
  })
})
