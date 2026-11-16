import { test, expect } from '@playwright/test';

test('produção sem configuração bloqueia Firebase sem acessar serviços remotos', async ({ page }) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:4300/')) { external.push(request.url()); }
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sign-in$/);
  await expect(page.getByRole('button', { name: 'Entrar sem cadastro (demonstração)' })).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Firebase não configurado');
  await page.getByLabel('E-mail', { exact: true }).fill('teste@example.com');
  await page.getByLabel('Senha', { exact: true }).fill('Senha123456');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Firebase não configurado');
  await expect(page).toHaveURL(/sign-in$/);
  await page.screenshot({ path: 'test-results/producao-sem-configuracao.png', fullPage: true });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
