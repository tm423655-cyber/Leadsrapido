import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, getAuthConfig, isAuthorized, safeNextPath } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar · NexaLeads" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNextPath(next);
  const config = getAuthConfig();
  const cookieStore = await cookies();
  if (!config.misconfigured && (await isAuthorized(cookieStore.get(SESSION_COOKIE)?.value, config))) redirect(target);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-brand-gradient font-display text-2xl font-bold shadow-lg shadow-indigo-900/50" aria-hidden>
            N
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
            Nexa<span className="text-gradient">Leads</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Acesso restrito · Nexa Agency</p>
        </div>
        {config.misconfigured ? (
          <div className="card p-5 text-sm text-amber-100" role="alert">
            <p className="font-semibold">Senha de acesso não configurada</p>
            <p className="mt-2 text-muted">
              Por segurança, o app fica bloqueado até você definir a variável <code className="rounded bg-black/30 px-1">NEXALEADS_PASSWORD</code> nas
              configurações da Vercel (Settings → Environment Variables) e fazer um novo deploy.
            </p>
          </div>
        ) : (
          <LoginForm next={target} />
        )}
      </div>
    </main>
  );
}
