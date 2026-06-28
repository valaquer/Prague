import { test, expect } from "@playwright/test"
import { confirmUser } from "../helpers/supabase-admin"

const TEST_EMAIL = `test-${Date.now()}@prague-test.honeybloom.io`
const TEST_PASSWORD = "TestPassword123!"

test.describe("Auth flow", () => {
  test("signup shows confirmation message", async ({ page }) => {
    await page.goto("/signup")
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page.locator("text=check your email")).toBeVisible()
  })

  test("login works after email confirmation", async ({ page }) => {
    await confirmUser(TEST_EMAIL)
    await page.goto("/login")
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("logout clears session and redirects to home", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[name="email"]', TEST_EMAIL)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
    await page.click("text=logout")
    await expect(page).toHaveURL("/")
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("invalid credentials are rejected", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[name="email"]', "wrong@example.com")
    await page.fill('input[name="password"]', "WrongPassword!")
    await page.click('button[type="submit"]')
    await expect(page.locator("text=Invalid login")).toBeVisible()
  })
})
