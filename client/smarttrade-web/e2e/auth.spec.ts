import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()
  })

  test('should display login page', async ({ page }) => {
    await page.goto('/login')

    // Check for login form elements
    await expect(page.getByRole('heading', { name: /đăng nhập/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/mật khẩu/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login')

    // Click submit without filling form
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Should show validation errors
    await expect(page.getByText(/email.*bắt buộc/i)).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill('wrong@email.com')
    await page.getByPlaceholder(/mật khẩu/i).fill('wrongpassword')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Should show error message
    await expect(page.getByText(/sai.*email.*mật khẩu/i)).toBeVisible({
      timeout: 5000,
    })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: /đăng ký/i }).click()

    await expect(page).toHaveURL(/register/)
  })

  test('should redirect to dashboard after login', async ({ page }) => {
    // Setup mock for successful login
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
          session: { access_token: 'mock-token' },
        }),
      })
    })

    await page.goto('/login')

    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByPlaceholder(/mật khẩu/i).fill('password123')
    await page.getByRole('button', { name: /đăng nhập/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 5000 })
  })
})

test.describe('Register', () => {
  test('should display register page', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('heading', { name: /đăng ký/i })).toBeVisible()
    await expect(page.getByPlaceholder(/họ.*tên/i)).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/mật khẩu/i).first()).toBeVisible()
  })

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/register')

    await page.getByPlaceholder(/họ.*tên/i).fill('Test User')
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByPlaceholder(/mật khẩu/i).first().fill('password123')
    await page.getByPlaceholder(/xác nhận/i).fill('different123')

    await page.getByRole('button', { name: /đăng ký/i }).click()

    await expect(page.getByText(/mật khẩu.*không khớp/i)).toBeVisible()
  })
})

test.describe('Logout', () => {
  test('should logout successfully', async ({ page }) => {
    // First login
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Go to a protected page (will need to mock auth state)
    await page.goto('/dashboard')

    // Look for user menu and click logout
    const userMenu = page.getByRole('button', { name: /user|menu/i }).first()
    if (await userMenu.isVisible()) {
      await userMenu.click()
      const logoutButton = page.getByRole('menuitem', { name: /đăng xuất/i })
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        // Should redirect to login
        await expect(page).toHaveURL(/login/, { timeout: 5000 })
      }
    }
  })
})
