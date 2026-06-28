import { config } from "dotenv"
import { defineConfig } from "@playwright/test"

config({ path: ".env.local" })

export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
