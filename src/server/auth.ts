import "server-only";
import { SESSION_COOKIE, isAuthorized } from "@/lib/session";

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** Segunda verificação dentro das rotas de API (além do proxy). */
export function requestIsAuthorized(request: Request): Promise<boolean> {
  return isAuthorized(readCookie(request, SESSION_COOKIE));
}

export function isHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}
