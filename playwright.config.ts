import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'desenvolvimento', testMatch: 'recovery.spec.ts', use: { baseURL: 'http://127.0.0.1:4201' } },
    { name: 'producao', testMatch: 'production.spec.ts', use: { baseURL: 'http://127.0.0.1:4300' } }
  ],
  webServer: [
    { command: 'npm start -- --host 127.0.0.1 --port 4201', url: 'http://127.0.0.1:4201', reuseExistingServer: false, timeout: 60_000 },
    { command: 'npm run build && node scripts/serve-production.mjs', url: 'http://127.0.0.1:4300', reuseExistingServer: false, timeout: 60_000 }
  ]
});
