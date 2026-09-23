"use client";

import { useState } from "react";
import { LoaderIcon, ShieldIcon } from "@/components/Icons";

export default function LoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!password) {
      setError("Digite a senha.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) {
        setError(data.message ?? "Não foi possível entrar.");
        setBusy(false);
        return;
      }
      window.location.replace(next);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-5 sm:p-6" noValidate>
      <label className="block text-sm font-medium" htmlFor="password">
        Senha
      </label>
      <div className="relative -mt-2">
        <input
          id="password"
          type={show ? "text" : "password"}
          className="field pr-20"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          autoComplete="current-password"
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-muted hover:text-ink"
          onClick={() => setShow((s) => !s)}
        >
          {show ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {error && (
        <p id="login-error" className="text-sm text-bad" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary h-11 w-full text-base" disabled={busy}>
        {busy ? <LoaderIcon className="animate-spin" size={18} /> : <ShieldIcon size={18} />}
        {busy ? "Entrando…" : "Entrar"}
      </button>
      <p className="text-center text-xs text-faint">Você continua conectado neste dispositivo por 30 dias.</p>
    </form>
  );
}
