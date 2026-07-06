"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ChatMessage } from "@/lib/types";

export default function FloatingChat({ messages, loading, failedMessage, onSend }: {
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
        <section className="floating-chat-panel" aria-label="Assistant chat">
          <header className="chat-head">
            <div>
              <strong>Assistant</strong>
              <p className="chat-scope">Uses only tracker data in this workspace.</p>
            </div>
            <button className="icon-btn" type="button" aria-label="Close chat" onClick={() => setOpen(false)}><X size={16} /></button>
          </header>
          <div className="chat-log">
            {messages.length ? messages.map((message) => (
              <p className={`chat-bubble ${message.role}`} key={message.id}>{message.content}</p>
            )) : <p className="chat-bubble assistant">Ask about deadlines, documents, costs, scholarships, or next steps.</p>}
            {loading ? <p className="chat-bubble assistant">Thinking...</p> : null}
            {failedMessage ? (
              <div className="chat-retry">
                <p className="error-text">Advisor request failed. Your tracker data is still available.</p>
                <button className="btn btn-quiet" type="button" onClick={() => onSend(failedMessage)}>
                  Retry last message
                </button>
              </div>
            ) : null}
          </div>
          <form className="chat-compose" onSubmit={submit}>
            <input aria-label="Chat message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask next steps..." />
            <button className="icon-btn" type="submit" aria-label="Send" disabled={loading}><Send size={16} /></button>
          </form>
        </section>
      ) : null}
      <button className="floating-chat-button" type="button" aria-label="Open chat" onClick={() => setOpen(true)}>
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
