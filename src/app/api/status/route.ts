import { NextResponse } from "next/server";
import { getApifyConfig } from "@/server/config";
import { requestIsAuthorized } from "@/server/auth";
import { getAuthConfig } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Informa ao frontend se o Apify está configurado — sem nunca revelar o token. */
export async function GET(request: Request) {
  if (!(await requestIsAuthorized(request))) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", message: "Faça login novamente." }, { status: 401 });
  }
  const config = getApifyConfig();
  return NextResponse.json(
    {
      mode: config.demoMode ? "demo" : "apify",
      actorId: config.actorId.replace("~", "/"),
      maxLeads: config.maxLeads,
      configError: config.configError,
      authRequired: getAuthConfig().required,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
