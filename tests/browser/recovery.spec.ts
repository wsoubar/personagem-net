import { test, expect } from '@playwright/test';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

const projectId = 'demo-personagens';
const email = 'recuperacao@example.com';
const password = 'Senha123456';

async function login(page: import('@playwright/test').Page, secret = password) {
  await page.goto('/sign-in');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(secret);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/dashboard$/);
}

test('recupera autenticação e consulta personagens sem acessar serviços reais', async ({ page, request }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:')) { external.push(request.url()); }
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sign-in$/);
  await page.evaluate(() => localStorage.setItem('user', '{"uid":"forjado"}'));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sign-in$/);

  await page.goto('/register-user');
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await expect(page).toHaveURL(/verify-email-address$/);
  await expect(page.getByRole('heading', { name: 'Verificar e-mail' })).toBeVisible();
  await page.getByRole('button', { name: 'Reenviar verificação' }).click();
  await expect(page.getByRole('status')).toContainText('E-mail de verificação enviado');
  const accountResponse = await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key', { data: { email, password, returnSecureToken: true } });
  expect(accountResponse.ok()).toBe(true);
  const owner = await accountResponse.json();
  expect(owner).toBeTruthy();
  const oob = await request.get(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/oobCodes`);
  const verification = (await oob.json()).oobCodes.find((code: { email: string; requestType: string }) => code.email === email && code.requestType === 'VERIFY_EMAIL');
  expect(verification).toBeTruthy();
  await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=demo-api-key', { data: { oobCode: verification.oobCode } });
  await page.getByRole('link', { name: 'Continuar para minha conta' }).click();
  await expect(page.getByText('Você ainda não tem personagens.')).toBeVisible();

  const env = await initializeTestEnvironment({ projectId, firestore: { host: '127.0.0.1', port: 8080 } });
  try {
    await env.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await setDoc(doc(db, 'personagem', 'helena'), { nome: 'Helena', resumo: 'Personagem de teste', userID: owner.localId, dataCriacao: Timestamp.fromDate(new Date('2020-01-01T12:00:00Z')) });
      await setDoc(doc(db, 'personagem', 'sem-data'), { nome: 'Sem data', userID: owner.localId });
      await setDoc(doc(db, 'personagem', 'outro'), { nome: 'Personagem privado de outro usuário', userID: 'outro' });
    });
    await expect(page.getByRole('cell', { name: 'Helena', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Não informada', exact: true })).toBeVisible();
    await expect(page.getByText('Personagem privado de outro usuário')).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('cell', { name: 'Helena', exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Ver personagem Helena' }).click();
    await expect(page.getByText('Personagem de teste', { exact: true })).toBeVisible();
    await page.goto('/edit-personagem/ausente');
    await expect(page.getByText('Personagem não encontrado.')).toBeVisible();
    await page.goto('/edit-personagem/outro');
    await expect(page.getByRole('alert')).toContainText('Não foi possível carregar');
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    await expect(page).toHaveURL(/sign-in$/);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-in$/);
    await page.goto('/forgot-password');
    await page.getByLabel('E-mail', { exact: true }).fill(email);
    await page.getByRole('button', { name: 'Enviar recuperação' }).click();
    await expect(page.getByRole('status')).toContainText('Solicitação recebida');
    const recovery = await request.get(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/oobCodes`);
    const resetCode = (await recovery.json()).oobCodes.find((code: { requestType: string }) => code.requestType === 'PASSWORD_RESET');
    expect(resetCode).toBeTruthy();
    const newPassword = 'NovaSenha123456';
    const resetResponse = await request.post('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=demo-api-key', { data: { oobCode: resetCode.oobCode, newPassword } });
    expect(resetResponse.ok()).toBe(true);
    await login(page, newPassword);
    await expect(page.getByText('E-mail verificado: Sim')).toBeVisible();
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/dashboard$/);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByRole('button', { name: 'Alternar navegação' }).click();
    await expect(page.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
    await page.screenshot({ path: 'test-results/recuperacao-mobile.png', fullPage: true });
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  } finally { await env.cleanup(); }
});

test('entra pela demonstração sem preencher login e mantém a sessão ao recarregar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/sign-in');
  await page.getByRole('button', { name: 'Entrar sem cadastro (demonstração)' }).click();
  await expect(page).toHaveURL(/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Visitante de demonstração' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Explorador (exemplo)', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Cronista (exemplo)', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'Explorador (exemplo)', exact: true })).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(3);
  await page.getByRole('link', { name: 'Ver personagem Explorador (exemplo)' }).click();
  await expect(page.getByText('Personagem fictício para conhecer a listagem e a tela de detalhes.')).toBeVisible();
  await page.goto('/add-personagem');
  await expect(page.getByText('A inclusão de personagens ainda não foi implementada neste protótipo.')).toBeVisible();
  await page.goto('/feed');
  await expect(page.getByText('O feed ainda não foi implementado neste protótipo.')).toBeVisible();
  await page.goto('/dashboard');
  await page.screenshot({ path: 'test-results/demonstracao-local.png', fullPage: true });
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(page).toHaveURL(/sign-in$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/sign-in$/);
  expect(errors).toEqual([]);
});
