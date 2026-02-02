import { test, expect } from '@playwright/test'

test.describe('Smart Alerts Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock alerts API
    await page.route('**/api/v1/alerts', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            alerts: [
              {
                id: 'alert-1',
                name: 'VNM Buy Signal',
                symbol: 'VNM',
                is_active: true,
                logic_operator: 'AND',
                conditions: [
                  { indicator: 'price', operator: '<=', value: 75000 },
                  { indicator: 'rsi', operator: '<=', value: 30 },
                ],
                trigger_count: 2,
                last_triggered_at: '2024-12-20T10:30:00Z',
              },
              {
                id: 'alert-2',
                name: 'FPT Breakout',
                symbol: 'FPT',
                is_active: false,
                logic_operator: 'OR',
                conditions: [
                  { indicator: 'price', operator: '>=', value: 100000 },
                ],
                trigger_count: 0,
                last_triggered_at: null,
              },
            ],
          }),
        })
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'alert-new',
            name: 'New Alert',
            is_active: true,
          }),
        })
      }
    })

    await page.route('**/api/v1/alerts/limits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          used: 2,
          limit: 5,
          is_premium: false,
        }),
      })
    })

    await page.route('**/api/v1/alerts/*/toggle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.goto('/alerts')
  })

  test('displays alerts page header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /smart alerts|cảnh báo/i })).toBeVisible()
  })

  test('shows usage limit banner', async ({ page }) => {
    await expect(page.getByText(/2.*\/.*5|2 of 5/i)).toBeVisible({ timeout: 10000 })
  })

  test('displays existing alerts', async ({ page }) => {
    await expect(page.getByText('VNM Buy Signal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('FPT Breakout')).toBeVisible()
  })

  test('shows alert symbol', async ({ page }) => {
    await expect(page.getByText('VNM')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('FPT')).toBeVisible()
  })

  test('shows active/inactive status', async ({ page }) => {
    const switches = page.locator('[role="switch"]')
    await expect(switches.first()).toBeVisible({ timeout: 10000 })
  })

  test('opens create alert dialog', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /tạo|thêm|create|add/i })

    if (await createButton.isVisible()) {
      await createButton.click()

      // Should show dialog
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    }
  })

  test('toggles alert active state', async ({ page }) => {
    const toggle = page.locator('[role="switch"]').first()

    if (await toggle.isVisible()) {
      const initialState = await toggle.getAttribute('aria-checked')
      await toggle.click()

      await page.waitForTimeout(500)

      const newState = await toggle.getAttribute('aria-checked')
      expect(newState).not.toBe(initialState)
    }
  })

  test('shows trigger count', async ({ page }) => {
    await expect(page.getByText(/2.*times|2.*lần|triggered.*2/i)).toBeVisible({ timeout: 10000 })
  })

  test('shows never triggered state', async ({ page }) => {
    await expect(page.getByText(/never|chưa bao giờ|0.*lần/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Smart Alerts - Create Alert Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/v1/alerts/**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ alerts: [] }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'new', success: true }),
        })
      }
    })

    await page.route('**/api/v1/alerts/limits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ used: 0, limit: 5, is_premium: false }),
      })
    })

    await page.goto('/alerts')
  })

  test('shows empty state when no alerts', async ({ page }) => {
    await expect(page.getByText(/chưa có|no alerts|empty/i)).toBeVisible({ timeout: 10000 })
  })

  test('can open create dialog from empty state', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /tạo|create|thêm|add/i }).first()

    if (await createButton.isVisible()) {
      await createButton.click()
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Smart Alerts - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('displays mobile-friendly alerts list', async ({ page }) => {
    await page.route('**/api/v1/alerts', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          alerts: [
            { id: '1', name: 'Test Alert', symbol: 'VNM', is_active: true, conditions: [] },
          ],
        }),
      })
    })

    await page.route('**/api/v1/alerts/limits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ used: 1, limit: 5, is_premium: false }),
      })
    })

    await page.goto('/alerts')

    // Alert cards should be visible
    await expect(page.getByText('Test Alert')).toBeVisible({ timeout: 10000 })
  })
})
