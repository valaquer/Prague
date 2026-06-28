import { test, expect } from "@playwright/test"
import { confirmUser } from "../helpers/supabase-admin"

const TEST_EMAIL = `session-${Date.now()}@prague-test.honeybloom.io`
const TEST_PASSWORD = "SessionTest123!"

test.describe("Session persistence", () => {
  test.beforeAll(async () => {
    // Signup user via direct API call (no browser needed for setup)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    })
    if (!response.ok) throw new Error("Signup failed in setup")
    await confirmUser(TEST_EMAIL)
  })

  test("stays logged in across page reload", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
    await page.reload()
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
