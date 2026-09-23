import "server-only";

/** Bloqueia chamadas vindas de outros sites (evita que terceiros disparem buscas e gerem custos). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // chamadas do mesmo site via fetch GET/POST podem omitir Origin em alguns navegadores
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

const hits = new Map<string, number[]>();

/** Limite simples em memória por IP (por instância). */
export function rateLimit(request: Request, max: number, windowMs: number): boolean {
  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) hits.clear();
  return true;
}

interface CachedRun {
  runId: string;
  at: number;
}

const recentRuns = new Map<string, CachedRun>();
const RUN_CACHE_MS = 10 * 60 * 1000;

/** Evita disparar duas execuções idênticas do Actor em sequência (duplo clique, recarregar etc.). */
export function getRecentRun(key: string): string | null {
  const cached = recentRuns.get(key);
  if (!cached) return null;
  if (Date.now() - cached.at > RUN_CACHE_MS) {
    recentRuns.delete(key);
    return null;
  }
  return cached.runId;
}

export function rememberRun(key: string, runId: string): void {
  recentRuns.set(key, { runId, at: Date.now() });
  if (recentRuns.size > 200) {
    const oldest = recentRuns.keys().next().value;
    if (oldest) recentRuns.delete(oldest);
  }
}

export function forgetRun(key: string): void {
  recentRuns.delete(key);
}

export function forgetRunId(runId: string): void {
  for (const [key, cached] of recentRuns) {
    if (cached.runId === runId) recentRuns.delete(key);
  }
}

const loginFailures = new Map<string, number[]>();
const LOGIN_WINDOW_MS = 60_000;
const MAX_LOGIN_FAILURES = 5;

function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
}

/** true se o IP errou a senha muitas vezes no último minuto. */
export function loginBlocked(request: Request): boolean {
  const now = Date.now();
  const recent = (loginFailures.get(clientIp(request)) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS);
  loginFailures.set(clientIp(request), recent);
  return recent.length >= MAX_LOGIN_FAILURES;
}

export function recordLoginFailure(request: Request): void {
  const ip = clientIp(request);
  loginFailures.set(ip, [...(loginFailures.get(ip) ?? []), Date.now()]);
  if (loginFailures.size > 1000) loginFailures.clear();
}
