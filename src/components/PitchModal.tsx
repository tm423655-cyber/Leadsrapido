"use client";

import { useEffect, useRef, useState } from "react";
import { PITCH_VARIANTS, generatePitch, whatsappLinkWithText } from "@/lib/pitch";
import type { StoredLead } from "@/lib/types";
import { CopyIcon, InfoIcon, RefreshIcon, UserCheckIcon, WhatsAppIcon, XIcon } from "./Icons";
import { SiteBadge } from "./LeadParts";

const SENDER_KEY = "nexaleads:v1:sender-name";

interface Props {
  lead: StoredLead;
  onClose: () => void;
  onCopy: (text: string) => void;
  onMarkContacted: (id: string) => void;
}

function loadSender(): string {
  try {
    return localStorage.getItem(SENDER_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function PitchModal({ lead, onClose, onCopy, onMarkContacted }: Props) {
  const [senderName, setSenderName] = useState(loadSender);
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState(() => generatePitch(lead, { senderName: loadSender(), variant: 0 }));
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Fecha com Esc, trava a rolagem da página e foca a mensagem.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    textRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  function regenerate(nextVariant: number, nextSender = senderName) {
    setVariant(nextVariant);
    setText(generatePitch(lead, { senderName: nextSender, variant: nextVariant }));
  }

  function changeSender(value: string) {
    setSenderName(value);
    try {
      localStorage.setItem(SENDER_KEY, value);
    } catch {
      /* ignora */
    }
    setText(generatePitch(lead, { senderName: value, variant }));
  }

  const waHref = whatsappLinkWithText(lead.whatsappLink, text);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pitch-title"
        className="card flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-b-none sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">Gerar abordagem</p>
            <h2 id="pitch-title" className="mt-0.5 font-display text-lg font-semibold break-words">
              {lead.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
              <SiteBadge lead={lead} />
              <span>{lead.phone ?? "Sem telefone"}</span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost shrink-0 px-2" onClick={onClose} aria-label="Fechar">
            <XIcon />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-sm font-medium">
              Seu nome <span className="font-normal text-faint">(opcional, fica salvo neste dispositivo)</span>
              <input
                className="field mt-1.5"
                value={senderName}
                maxLength={60}
                placeholder="Ex.: Thiago"
                onChange={(e) => changeSender(e.target.value)}
              />
            </label>
            <button type="button" className="btn btn-ghost h-[42px]" onClick={() => regenerate((variant + 1) % PITCH_VARIANTS)}>
              <RefreshIcon /> Outra versão <span className="text-faint">({variant + 1}/{PITCH_VARIANTS})</span>
            </button>
          </div>

          <label className="block text-sm font-medium">
            Mensagem <span className="font-normal text-faint">(edite como quiser)</span>
            <textarea
              ref={textRef}
              className="field mt-1.5 min-h-64 resize-y leading-relaxed"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Mensagem de abordagem"
            />
          </label>

          <p className="flex items-start gap-2 text-xs text-faint">
            <InfoIcon className="mt-0.5 shrink-0" size={14} />
            Nada é enviado automaticamente. O WhatsApp abre com a mensagem preenchida, e você revisa e envia manualmente.
          </p>
        </div>

        <footer className="grid gap-2 border-t border-line p-4 sm:grid-cols-3 sm:p-5">
          <button type="button" className="btn btn-ghost py-2.5" onClick={() => onCopy(text)}>
            <CopyIcon /> Copiar mensagem
          </button>
          {waHref ? (
            <a className="btn btn-whatsapp py-2.5" href={waHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Abrir no WhatsApp
            </a>
          ) : (
            <span className="btn btn-whatsapp py-2.5" aria-disabled="true" title="Lead sem telefone">
              <WhatsAppIcon /> Sem WhatsApp
            </span>
          )}
          <button
            type="button"
            className={`btn py-2.5 ${lead.status === "contatado" ? "border border-indigo-400/50 bg-indigo-400/15 text-indigo-100" : "btn-ghost"}`}
            onClick={() => onMarkContacted(lead.id)}
            aria-pressed={lead.status === "contatado"}
          >
            <UserCheckIcon /> {lead.status === "contatado" ? "Contatado" : "Marcar como contatado"}
          </button>
        </footer>
      </div>
    </div>
  );
}
