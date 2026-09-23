import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const TEST_PASSWORD = "senha-de-teste-123";

export async function login(page: Page, base: string) {
  await page.goto(base);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Senha").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Encontrar novos leads" })).toBeVisible();
}

export async function loginApi(request: APIRequestContext, base: string) {
  const res = await request.post(`${base}/api/auth/login`, { data: { password: TEST_PASSWORD } });
  expect(res.ok()).toBe(true);
}
