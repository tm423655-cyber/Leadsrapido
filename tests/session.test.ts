import { describe, expect, it } from "vitest";
import { createSessionToken, getAuthConfig, isAuthorized, passwordMatches, safeNextPath, verifySessionToken } from "@/lib/session";

const config = getAuthConfig({ NEXALEADS_PASSWORD: "minha-senha", NODE_ENV: "production" });

describe("login sem banco de dados", () => {
  it("confere a senha", async () => {
    expect(await passwordMatches("minha-senha", config)).toBe(true);
    expect(await passwordMatches("errada", config)).toBe(false);
    expect(await passwordMatches("", config)).toBe(false);
  });

  it("cria e valida o cookie de sessão", async () => {
    const token = await createSessionToken(config);
    expect(await verifySessionToken(token, config)).toBe(true);
    expect(await isAuthorized(token, config)).toBe(true);
    expect(await isAuthorized(undefined, config)).toBe(false);
  });

  it("rejeita cookie adulterado, expirado ou assinado com outra senha", async () => {
    const token = await createSessionToken(config);
    const [exp, sig] = token.split(".");
    expect(await verifySessionToken(`${Number(exp) + 999999}.${sig}`, config)).toBe(false);
    expect(await verifySessionToken(`${exp}.${sig.slice(0, -2)}xx`, config)).toBe(false);
    expect(await verifySessionToken(token, config, Date.now() + 31 * 24 * 3600 * 1000)).toBe(false);
    const other = getAuthConfig({ NEXALEADS_PASSWORD: "outra-senha", NODE_ENV: "production" });
    expect(await verifySessionToken(token, other)).toBe(false);
  });

  it("bloqueia produção sem senha e libera o desenvolvimento local", async () => {
    const prod = getAuthConfig({ NODE_ENV: "production" });
    expect(prod.misconfigured).toBe(true);
    expect(await isAuthorized("qualquer", prod)).toBe(false);
    const dev = getAuthConfig({ NODE_ENV: "development" });
    expect(dev.required).toBe(false);
    expect(await isAuthorized(undefined, dev)).toBe(true);
  });

  it("só redireciona para caminhos internos", () => {
    expect(safeNextPath("/")).toBe("/");
    expect(safeNextPath("/?x=1")).toBe("/?x=1");
    expect(safeNextPath("https://malicioso.com")).toBe("/");
    expect(safeNextPath("//malicioso.com")).toBe("/");
    expect(safeNextPath("/\\malicioso.com")).toBe("/");
    expect(safeNextPath(null)).toBe("/");
  });
});
