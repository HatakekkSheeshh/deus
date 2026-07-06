"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Action } from "@/lib/reducer";
import { glossaryDetail } from "@/lib/glossary";
import { documentCategoryLabel, t } from "@/lib/i18n";
import type { DocumentItem, Lang } from "@/lib/types";

const groups: DocumentItem["category"][] = ["Academic", "Personal", "Language", "APS & uni-assist", "Financial"];
type DocumentDraft = Pick<DocumentItem, "name" | "category">;

const documentNameLimit = 140;
const emptyDraft: DocumentDraft = { name: "", category: "Academic" };

function manualDocumentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `manual-${crypto.randomUUID()}`;
  return `manual-${Math.random().toString(36).slice(2)}`;
}

export default function DocumentChecklist({ lang = "en", documents, readOnly, dispatch }: {
  lang?: Lang;
  documents: DocumentItem[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const done = documents.filter((doc) => doc.done).length;
  const percent = documents.length ? Math.round(done / documents.length * 100) : 0;
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<DocumentDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DocumentDraft>(emptyDraft);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const documentsByCategory = useMemo(() => {
    const grouped = Object.fromEntries(groups.map((group) => [group, [] as DocumentItem[]])) as Record<DocumentItem["category"], DocumentItem[]>;
    for (const doc of documents) {
      grouped[doc.category].push(doc);
    }
    return grouped;
  }, [documents]);

  function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    if (!draft.name.trim()) {
      setFormError(t(lang, "documents.errorName"));
      return;
    }
    dispatch({
      type: "add-document",
      document: {
        id: manualDocumentId(),
        name: draft.name.trim(),
        category: draft.category,
        done: false
      }
    });
    setDraft(emptyDraft);
    setFormError("");
    setShowAddForm(false);
  }

  function startEdit(doc: DocumentItem) {
    setEditingId(doc.id);
    setEditDraft({ name: doc.name, category: doc.category });
    setEditError("");
    setPendingDelete(null);
  }

  function submitEdit(event: FormEvent<HTMLFormElement>, doc: DocumentItem) {
    event.preventDefault();
    if (readOnly) return;
    if (!editDraft.name.trim()) {
      setEditError(t(lang, "documents.errorName"));
      return;
    }
    dispatch({
      type: "update-document",
      id: doc.id,
      changes: { name: editDraft.name.trim(), category: editDraft.category }
    });
    setEditingId(null);
    setEditError("");
  }

  function deleteButton(doc: DocumentItem) {
    if (pendingDelete === doc.id) {
      return (
        <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`${t(lang, "documents.confirmDelete")} ${doc.name}`} onClick={() => dispatch({ type: "delete-document", id: doc.id })}>
          {t(lang, "documents.confirmDelete")}
        </button>
      );
    }
    return (
      <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`${t(lang, "documents.delete")} ${doc.name}`} onClick={() => setPendingDelete(doc.id)}>
        {t(lang, "documents.delete")}
      </button>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">{t(lang, "documents.title")}</h1>
          <p className="page-kicker">{t(lang, "documents.ready", { done, total: documents.length })}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" type="button" disabled={readOnly} onClick={() => {
            setShowAddForm((open) => !open);
            setFormError("");
          }}>
            {showAddForm ? t(lang, "documents.closeForm") : t(lang, "documents.add")}
          </button>
          <span className="chip">{percent}%</span>
        </div>
      </header>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
      {showAddForm ? (
        <form className="card document-form" onSubmit={submitDocument} noValidate>
          <div className="form-intro">
            <h2 className="card-title">{t(lang, "documents.manualTitle")}</h2>
            <p className="muted">{t(lang, "documents.manualDetail")}</p>
          </div>
          <label className="field">
            <span>{t(lang, "documents.name")}</span>
            <input maxLength={documentNameLimit} value={draft.name} onChange={(event) => {
              setDraft((current) => ({ ...current, name: event.target.value }));
              if (formError) setFormError("");
            }} />
          </label>
          <label className="field">
            <span>{t(lang, "documents.category")}</span>
            <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as DocumentItem["category"] }))}>
              {groups.map((group) => <option key={group} value={group}>{documentCategoryLabel(lang, group)}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{t(lang, "documents.save")}</button>
            <button className="btn btn-quiet" type="button" onClick={() => { setDraft(emptyDraft); setShowAddForm(false); }}>
              {t(lang, "documents.cancel")}
            </button>
          </div>
          {formError ? <p className="error-text" role="alert">{formError}</p> : null}
        </form>
      ) : null}
      {groups.map((group) => (
        <section className="card" key={group}>
          <h2 className="card-title">{documentCategoryLabel(lang, group)}</h2>
          {group === "APS & uni-assist" ? (
            <p className="trust-note">{glossaryDetail("APS", lang)} {t(lang, "documents.apsNote")}</p>
          ) : null}
          <div className="row-list">
            {documentsByCategory[group].map((doc) => (
              <div className="document-item" key={doc.id}>
                <div className="document-row">
                  <label className={`check-row document-check ${doc.done ? "done" : ""}`}>
                    <input type="checkbox" checked={doc.done} disabled={readOnly} onChange={() => dispatch({ type: "toggle-document", id: doc.id })} />
                    <span>{doc.name}</span>
                  </label>
                  <div className="row-actions">
                    <button className="btn btn-quiet" type="button" disabled={readOnly} aria-label={`${t(lang, "documents.edit")} ${doc.name}`} onClick={() => startEdit(doc)}>
                      {t(lang, "documents.edit")}
                    </button>
                    {deleteButton(doc)}
                  </div>
                </div>
                {editingId === doc.id ? (
                  <form className="document-edit-form" onSubmit={(event) => submitEdit(event, doc)} noValidate>
                    <label className="field">
                      <span>{t(lang, "documents.editName")}</span>
                      <input maxLength={documentNameLimit} value={editDraft.name} onChange={(event) => {
                        setEditDraft((current) => ({ ...current, name: event.target.value }));
                        if (editError) setEditError("");
                      }} />
                    </label>
                    <label className="field">
                      <span>{t(lang, "documents.editCategory")}</span>
                      <select value={editDraft.category} onChange={(event) => setEditDraft((current) => ({ ...current, category: event.target.value as DocumentItem["category"] }))}>
                        {groups.map((item) => <option key={item} value={item}>{documentCategoryLabel(lang, item)}</option>)}
                      </select>
                    </label>
                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit">{t(lang, "documents.saveChanges")}</button>
                      <button className="btn btn-quiet" type="button" onClick={() => setEditingId(null)}>{t(lang, "documents.cancel")}</button>
                    </div>
                    {editError ? <p className="error-text" role="alert">{editError}</p> : null}
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
