import { test, expect } from "@playwright/test"

test.describe("PWA manifest", () => {
  test("manifest.json is accessible with correct fields", async ({ page }) => {
    const response = await page.goto("/manifest.json")
    expect(response?.ok()).toBeTruthy()
    const manifest = await response?.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.display).toBe("standalone")
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThan(0)
    manifest.icons.forEach((icon: { sizes: string }) => {
      expect(icon.sizes).toBeTruthy()
    })
  })

  test("service worker is registered", async ({ page }) => {
    await page.goto("/")
    const registrations = await page.evaluate(() =>
      navigator.serviceWorker.getRegistrations().then((regs) =>
        regs.map((r) => ({
          scope: r.scope,
          active: !!r.active,
        }))
      )
    )
    expect(registrations.length).toBeGreaterThan(0)
    expect(registrations[0].active).toBe(true)
  })
})
