import { NextResponse } from "next/server";
import { getApifyConfig } from "@/server/config";

export const dynamic = "force-dynamic";

/** Informa ao frontend se o Apify está configurado — sem nunca revelar o token. */
export function GET() {
  const config = getApifyConfig();
  return NextResponse.json(
    {
      mode: config.demoMode ? "demo" : "apify",
      actorId: config.actorId.replace("~", "/"),
      maxLeads: config.maxLeads,
      configError: config.configError,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
