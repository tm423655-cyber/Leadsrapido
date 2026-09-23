import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, getAuthConfig, passwordMatches } from "@/lib/session";
import { isHttps } from "@/server/auth";
import { isSameOrigin, loginBlocked, recordLoginFailure } from "@/server/guards";

export const dynamic = "force-dynamic";

function fail(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false, code, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("FORBIDDEN", "Origem não permitida.", 403);
  const config = getAuthConfig();
  if (config.misconfigured) {
    return fail("AUTH_NOT_CONFIGURED", "A senha de acesso ainda não foi configurada. Defina NEXALEADS_PASSWORD nas variáveis de ambiente.", 503);
  }
  if (!config.required) return NextResponse.json({ ok: true });

  // Limita tentativas para impedir que alguém fique chutando senhas.
  if (loginBlocked(request)) {
    return fail("RATE_LIMIT", "Muitas tentativas com senha errada. Aguarde 1 minuto e tente novamente.", 429);
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  } catch {
    return fail("INVALID_JSON", "Requisição inválida.", 400);
  }

  if (!(await passwordMatches(password, config))) {
    recordLoginFailure(request);
    await new Promise((r) => setTimeout(r, 600));
    return fail("INVALID_PASSWORD", "Senha incorreta.", 401);
  }

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(config), {
    httpOnly: true,
    secure: isHttps(request),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
