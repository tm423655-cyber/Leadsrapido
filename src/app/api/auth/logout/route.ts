import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { isHttps } from "@/server/auth";
import { isSameOrigin } from "@/server/guards";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false, code: "FORBIDDEN", message: "Origem não permitida." }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: isHttps(request), sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
