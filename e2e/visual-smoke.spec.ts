import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

mkdirSync('artifacts', { recursive: true });

test('M00/M17 navigation and guarded integration actions', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Seu comércio,/ })).toBeVisible();
  await expect(page.getByText('MODO DEMO')).toBeVisible();
  await expect(page.getByText('Vendas no período')).toBeVisible();
  await page.screenshot({ path: 'artifacts/dashboard-' + testInfo.project.name + '.png', fullPage: true });
  await page.getByRole('link', { name: /Preparar integração/ }).click();
  await expect(page.getByRole('heading', { name: /Conecte tudo/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Conectar Bling/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Configurar fornecedor/ })).toBeDisabled();
  await page.screenshot({ path: 'artifacts/integrations-' + testInfo.project.name + '.png', fullPage: true });
});

test('layout has no horizontal page overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});
