"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { t } from "@/lib/i18n";
import type { ChatMessage, Lang } from "@/lib/types";

export default function FloatingChat({ lang = "en", messages, loading, failedMessage, onSend }: {
  lang?: Lang;
  messages: ChatMessage[];
  loading: boolean;
  failedMessage?: string | null;
  onSend: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setDraft("");
    onSend(message);
  }

  return (
    <div className="floating-chat">
      {open ? (
        <section className="floating-chat-panel" aria-label={t(lang, "chat.aria")}>
          <header className="chat-head">
            <div>
              <strong>{t(lang, "chat.title")}</strong>
              <p className="chat-scope">{t(lang, "chat.scope")}</p>
            </div>
            <button className="icon-btn" type="button" aria-label={t(lang, "chat.close")} onClick={() => setOpen(false)}><X size={16} /></button>
          </header>
          <div className="chat-log">
            {messages.length ? messages.map((message) => (
              <p className={`chat-bubble ${message.role}`} key={message.id}>{message.content}</p>
            )) : <p className="chat-bubble assistant">{t(lang, "chat.empty")}</p>}
            {loading ? <p className="chat-bubble assistant">{t(lang, "chat.thinking")}</p> : null}
            {failedMessage ? (
              <div className="chat-retry">
                <p className="error-text">{t(lang, "chat.failed")}</p>
                <button className="btn btn-quiet" type="button" onClick={() => onSend(failedMessage)}>
                  {t(lang, "chat.retry")}
                </button>
              </div>
            ) : null}
          </div>
          <form className="chat-compose" onSubmit={submit}>
            <input aria-label={t(lang, "chat.message")} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t(lang, "chat.placeholder")} />
            <button className="icon-btn" type="submit" aria-label={t(lang, "chat.send")} disabled={loading}><Send size={16} /></button>
          </form>
        </section>
      ) : null}
      <button className="floating-chat-button" type="button" aria-label={t(lang, "chat.open")} onClick={() => setOpen(true)}>
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
