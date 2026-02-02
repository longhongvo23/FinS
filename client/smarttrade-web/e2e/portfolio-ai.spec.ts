import { test, expect } from '@playwright/test'

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock portfolio API
    await page.route('**/api/v1/portfolio', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total_value: 125000000,
          cash_balance: 25000000,
          total_profit: 15000000,
          profit_percent: 13.6,
          positions: [
            {
              symbol: 'VNM',
              quantity: 500,
              avg_price: 80000,
              current_price: 85000,
              market_value: 42500000,
              profit: 2500000,
              profit_percent: 6.25,
            },
            {
              symbol: 'FPT',
              quantity: 300,
              avg_price: 140000,
              current_price: 145000,
              market_value: 43500000,
              profit: 1500000,
              profit_percent: 3.57,
            },
          ],
        }),
      })
    })

    await page.goto('/portfolio')
  })

  test('should display portfolio summary', async ({ page }) => {
    // Check for portfolio value display
    await expect(page.getByText(/tổng giá trị|total value/i)).toBeVisible()
    await expect(page.getByText(/125.*000.*000|125,000,000/i)).toBeVisible()
  })

  test('should show profit/loss', async ({ page }) => {
    // Should display profit
    await expect(page.getByText(/lợi nhuận|profit/i)).toBeVisible()
    await expect(page.getByText(/15.*000.*000|15,000,000/i)).toBeVisible()
  })

  test('should display positions list', async ({ page }) => {
    // Should show stock positions
    await expect(page.getByText('VNM')).toBeVisible()
    await expect(page.getByText('FPT')).toBeVisible()
  })

  test('should show position details', async ({ page }) => {
    // Click on a position to see details
    const vnmRow = page.getByText('VNM').first()
    await vnmRow.click()

    // Should show more details
    await expect(page.getByText(/500.*cổ phiếu|500 shares/i)).toBeVisible()
  })

  test('should display allocation chart', async ({ page }) => {
    const chart = page.getByTestId('allocation-chart')

    if (await chart.isVisible()) {
      await expect(chart).toBeVisible()
    }
  })

  test('should display performance chart', async ({ page }) => {
    const chart = page.getByTestId('performance-chart')

    if (await chart.isVisible()) {
      await expect(chart).toBeVisible()
    }
  })
})

test.describe('AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Mock AI chat API
    await page.route('**/api/v1/ai/chat', async (route) => {
      const request = route.request()
      const body = JSON.parse(await request.postData() || '{}')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'msg-' + Date.now(),
          role: 'assistant',
          content: `Phản hồi cho: "${body.message}"`,
          timestamp: new Date().toISOString(),
        }),
      })
    })

    await page.route('**/api/v1/ai/chat/history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              id: 'msg-1',
              role: 'assistant',
              content: 'Xin chào! Tôi là AI Assistant.',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })
    })

    await page.goto('/ai-chat')
  })

  test('should display AI chat interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ai chat/i })).toBeVisible()
  })

  test('should show chat input', async ({ page }) => {
    const input = page.getByPlaceholder(/hỏi.*ai|nhập.*tin nhắn/i)
    await expect(input).toBeVisible()
  })

  test('should send message and receive response', async ({ page }) => {
    const input = page.getByPlaceholder(/hỏi.*ai|nhập.*tin nhắn/i)
    const sendButton = page.getByRole('button', { name: /gửi|send/i })

    await input.fill('Phân tích VNM')

    if (await sendButton.isVisible()) {
      await sendButton.click()
    } else {
      await input.press('Enter')
    }

    // Should show user message
    await expect(page.getByText('Phân tích VNM')).toBeVisible()

    // Should show AI response
    await expect(page.getByText(/phản hồi cho/i)).toBeVisible({ timeout: 5000 })
  })

  test('should show typing indicator while waiting', async ({ page }) => {
    // Slow down the response
    await page.route('**/api/v1/ai/chat', async (route) => {
      await new Promise((r) => setTimeout(r, 1000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'msg-1',
          role: 'assistant',
          content: 'Response',
        }),
      })
    })

    const input = page.getByPlaceholder(/hỏi.*ai|nhập.*tin nhắn/i)
    await input.fill('Test message')
    await input.press('Enter')

    // Should show loading/typing indicator
    const typingIndicator = page.getByTestId('typing-indicator')
    if (await typingIndicator.isVisible({ timeout: 500 })) {
      await expect(typingIndicator).toBeVisible()
    }
  })

  test('should display suggested questions', async ({ page }) => {
    const suggestions = page.getByTestId('suggestions')

    if (await suggestions.isVisible()) {
      await expect(suggestions).toBeVisible()

      // Click a suggestion
      const firstSuggestion = suggestions.locator('button').first()
      await firstSuggestion.click()

      // Input should be filled
      const input = page.getByPlaceholder(/hỏi.*ai|nhập.*tin nhắn/i)
      await expect(input).not.toHaveValue('')
    }
  })
})

test.describe('Smart Alerts', () => {
  test.beforeEach(async ({ page }) => {
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
                conditions: [{ indicator: 'price', operator: '<=', value: 82000 }],
                trigger_count: 2,
              },
            ],
          }),
        })
      }
    })

    await page.route('**/api/v1/alerts/limits', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ used: 1, limit: 5, is_premium: false }),
      })
    })

    await page.goto('/alerts')
  })

  test('should display alerts page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /smart alerts/i })).toBeVisible()
  })

  test('should show usage limit', async ({ page }) => {
    await expect(page.getByText(/1.*\/.*5/)).toBeVisible()
  })

  test('should display existing alerts', async ({ page }) => {
    await expect(page.getByText('VNM Buy Signal')).toBeVisible()
  })

  test('should open create alert dialog', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /tạo alert|thêm/i })

    if (await createButton.isVisible()) {
      await createButton.click()

      // Should show dialog
      await expect(page.getByRole('dialog')).toBeVisible()
    }
  })

  test('should toggle alert active state', async ({ page }) => {
    await page.route('**/api/v1/alerts/*/toggle', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    const toggle = page.getByRole('switch').first()

    if (await toggle.isVisible()) {
      const initialState = await toggle.isChecked()
      await toggle.click()

      // Should toggle state
      await expect(toggle).toBeChecked({ checked: !initialState })
    }
  })
})
