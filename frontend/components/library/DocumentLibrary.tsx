"use client";

import { DragEvent, useState } from "react";
import { librarySlotLabel, t } from "@/lib/i18n";
import type { Action } from "@/lib/reducer";
import type { Lang, LibraryCategory, LibraryFile } from "@/lib/types";

const slots: Array<{ key: Exclude<LibraryCategory, "other"> }> = [
  { key: "german" },
  { key: "prep" },
  { key: "certs" }
];

function sizeLabel(lang: Lang, size?: number) {
  if (!size) return t(lang, "library.ready");
  return `${Math.round(size / 1024)} KB`;
}

export default function DocumentLibrary({ lang = "en", files, otherFiles, readOnly, dispatch }: {
  lang?: Lang;
  files: LibraryFile[];
  otherFiles: LibraryFile[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  function addFile(category: LibraryCategory, slotKey: string | null, file: File) {
    dispatch({
      type: "add-library-file",
      file: {
        id: crypto.randomUUID(),
        slotKey,
        category,
        name: slotKey && category !== "other" ? librarySlotLabel(lang, category) : file.name,
        fileUrl: typeof URL !== "undefined" && "createObjectURL" in URL ? URL.createObjectURL(file) : undefined,
        fileName: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString()
      }
    });
    setStatus(t(lang, "library.added", { name: file.name }));
  }

  function addDroppedFiles(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    if (readOnly) return;
    Array.from(event.dataTransfer.files).forEach((file) => addFile("other", null, file));
  }

  function removeButton(file: LibraryFile) {
    const label = file.name;
    if (pendingRemove === file.id) {
      return (
        <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`${t(lang, "library.confirmRemove")} ${label}`} onClick={() => dispatch({ type: "remove-library-file", id: file.id })}>
          {t(lang, "library.confirmRemove")}
        </button>
      );
    }
    return (
      <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`${t(lang, "library.remove")} ${label}`} onClick={() => setPendingRemove(file.id)}>
        {t(lang, "library.remove")}
      </button>
    );
  }

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">{t(lang, "library.title")}</h1>
        <p className="page-kicker">{t(lang, "library.kicker")}</p>
      </header>
      <div className="library-list">
        {slots.map((slot) => {
          const file = files.find((item) => item.slotKey === slot.key);
          return (
            <section className="card" key={slot.key}>
              <div className="row">
                <div>
                  <h2 className="card-title">{librarySlotLabel(lang, slot.key)}</h2>
                  <p className="muted">{file?.fileName ?? t(lang, "library.noFile")}</p>
                </div>
                <div className="library-file-actions">
                  {file?.fileUrl ? <a className="btn btn-quiet" href={file.fileUrl}>{t(lang, "library.view")}</a> : null}
                  <label className="btn btn-primary">
                    {file ? t(lang, "library.replace") : t(lang, "library.upload")}
                    <input className="sr-only" type="file" disabled={readOnly} onChange={(event) => event.target.files?.[0] && addFile(slot.key, slot.key, event.target.files[0])} />
                  </label>
                  {file ? removeButton(file) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <section
        className="dropzone"
        aria-label={t(lang, "library.otherDropzone")}
        onDragOver={(event) => event.preventDefault()}
        onDrop={addDroppedFiles}
      >
        <strong>{t(lang, "library.other")}</strong>
        <p className="muted">{t(lang, "library.otherHelp")}</p>
        <label className="btn btn-quiet">
          {t(lang, "library.browse")}
          <input className="sr-only" type="file" multiple disabled={readOnly} onChange={(event) => Array.from(event.target.files ?? []).forEach((file) => addFile("other", null, file))} />
        </label>
        {status ? <p className="status-text">{status}</p> : null}
      </section>
      <section className="card">
        <h2 className="card-title">{t(lang, "library.otherList")}</h2>
        <div className="row-list">
          {otherFiles.map((file) => (
            <div className="row" key={file.id}>
              <span className="row-main truncate"><strong>{file.fileName ?? file.name}</strong><br /><span className="muted">{sizeLabel(lang, file.sizeBytes)}</span></span>
              {removeButton(file)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
