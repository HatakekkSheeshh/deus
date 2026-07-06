"use client";

import { DragEvent, useState } from "react";
import type { Action } from "@/lib/reducer";
import type { LibraryCategory, LibraryFile } from "@/lib/types";

const slots: Array<{ key: LibraryCategory; name: string }> = [
  { key: "german", name: "German certificates" },
  { key: "prep", name: "Preparation files" },
  { key: "certs", name: "Official certificates" }
];

function sizeLabel(size?: number) {
  if (!size) return "ready";
  return `${Math.round(size / 1024)} KB`;
}

export default function DocumentLibrary({ files, otherFiles, readOnly, dispatch }: {
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
        name: slotKey ? slots.find((slot) => slot.key === category)?.name ?? file.name : file.name,
        fileUrl: typeof URL !== "undefined" && "createObjectURL" in URL ? URL.createObjectURL(file) : undefined,
        fileName: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString()
      }
    });
    setStatus(`${file.name} added.`);
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
        <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`Confirm remove ${label}`} onClick={() => dispatch({ type: "remove-library-file", id: file.id })}>
          Confirm remove
        </button>
      );
    }
    return (
      <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`Remove ${label}`} onClick={() => setPendingRemove(file.id)}>
        Remove
      </button>
    );
  }

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">Document Library</h1>
        <p className="page-kicker">Fixed slots for expected files, plus a free-form holding area.</p>
      </header>
      <div className="library-list">
        {slots.map((slot) => {
          const file = files.find((item) => item.slotKey === slot.key);
          return (
            <section className="card" key={slot.key}>
              <div className="row">
                <div>
                  <h2 className="card-title">{slot.name}</h2>
                  <p className="muted">{file?.fileName ?? "No file uploaded"}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {file?.fileUrl ? <a className="btn btn-quiet" href={file.fileUrl}>View</a> : null}
                  <label className="btn btn-primary">
                    {file ? "Replace" : "Upload"}
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
        aria-label="Other files dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={addDroppedFiles}
      >
        <strong>Other files</strong>
        <p className="muted">Drop or browse supporting files that do not belong to a fixed slot.</p>
        <label className="btn btn-quiet">
          Browse files
          <input className="sr-only" type="file" multiple disabled={readOnly} onChange={(event) => Array.from(event.target.files ?? []).forEach((file) => addFile("other", null, file))} />
        </label>
        {status ? <p className="status-text">{status}</p> : null}
      </section>
      <section className="card">
        <h2 className="card-title">Other files list</h2>
        <div className="row-list">
          {otherFiles.map((file) => (
            <div className="row" key={file.id}>
              <span className="row-main truncate"><strong>{file.fileName ?? file.name}</strong><br /><span className="muted">{sizeLabel(file.sizeBytes)}</span></span>
              {removeButton(file)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
