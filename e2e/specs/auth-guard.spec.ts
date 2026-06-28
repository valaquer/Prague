import { test, expect } from "@playwright/test"
import { confirmUser } from "../helpers/supabase-admin"

test.describe("Auth guard", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("authenticated user can access dashboard", async ({ page }) => {
    const email = `guard-${Date.now()}@prague-test.honeybloom.io`
    const password = "GuardTest123!"

    // Signup and confirm via admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({ email, password }),
    })

    await confirmUser(email)

    await page.goto("/login")
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
