/**
 * Login simples sem banco de dados: uma senha em variável de ambiente e um cookie assinado (HMAC-SHA256).
 * Funciona em qualquer runtime (usa Web Crypto), inclusive no proxy do Next.js.
 */

export const SESSION_COOKIE = "nexaleads_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 dias

export interface AuthConfig {
  /** true = é preciso fazer login para usar o app. */
  required: boolean;
  /** Senha configurada (null = não configurada). */
  password: string | null;
  /** Chave usada para assinar o cookie. */
  secret: string | null;
  /** Produção sem senha configurada: o app fica bloqueado até configurar. */
  misconfigured: boolean;
}

export function getAuthConfig(env: Record<string, string | undefined> = process.env): AuthConfig {
  const password = env.NEXALEADS_PASSWORD?.trim() || null;
  const secret = password ? `${env.NEXALEADS_SESSION_SECRET?.trim() || ""}|${password}` : null;
  const production = env.NODE_ENV === "production";
  return {
    required: Boolean(password) || production,
    password,
    secret,
    misconfigured: !password && production,
  };
}

const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Comparação em tempo constante (evita ataques de temporização). */
function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function passwordMatches(input: string, config: AuthConfig): Promise<boolean> {
  if (!config.password || !config.secret) return false;
  const [a, b] = await Promise.all([hmac(config.secret, `pw:${input}`), hmac(config.secret, `pw:${config.password}`)]);
  return safeEqual(a, b);
}

export async function createSessionToken(config: AuthConfig, now = Date.now()): Promise<string> {
  if (!config.secret) throw new Error("Senha não configurada.");
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS;
  return `${expires}.${toBase64Url(await hmac(config.secret, `session:${expires}`))}`;
}

export async function verifySessionToken(token: string | undefined | null, config: AuthConfig, now = Date.now()): Promise<boolean> {
  if (!token || !config.secret) return false;
  const match = /^(\d{1,12})\.([A-Za-z0-9_-]{20,})$/.exec(token);
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires * 1000 <= now) return false;
  const expected = toBase64Url(await hmac(config.secret, `session:${expires}`));
  return safeEqual(encoder.encode(expected), encoder.encode(match[2]));
}

/** Verifica se a requisição pode acessar o app. */
export async function isAuthorized(cookieValue: string | undefined | null, config: AuthConfig = getAuthConfig()): Promise<boolean> {
  if (!config.required) return true;
  if (config.misconfigured) return false;
  return verifySessionToken(cookieValue, config);
}

/** Aceita só caminhos internos ("/..."), evitando redirecionar para outros sites. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.startsWith("/login")) return "/";
  return value;
}
