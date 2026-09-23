import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, getAuthConfig, isAuthorized } from "@/lib/session";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/login", "/api/auth/logout"]);

/** Bloqueia o app e a API para quem não fez login. */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const config = getAuthConfig();
  if (await isAuthorized(request.cookies.get(SESSION_COOKIE)?.value, config)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED", message: "Sessão expirada ou não autenticada. Faça login novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Não intercepta arquivos estáticos (JS, CSS, ícones).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)"],
};
