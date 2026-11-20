import { defineConfig } from '@playwright/test'

const url = 'http://127.0.0.1:4178'
export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  workers: 2,
  use: {
    baseURL: url,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run dev -- --port 4178 --strictPort',
    url,
    reuseExistingServer: !process.env.CI,
  },
})
