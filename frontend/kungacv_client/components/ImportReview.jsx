"use client";
import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheck, FiFileText, FiX } from "react-icons/fi";

const MAX_IMPORT_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "txt"];

const ImportReview = ({ file, onCancel, onApply }) => {
    const [content, setContent] = useState("");
    const [reading, setReading] = useState(true);
    const [error, setError] = useState("");
    const extension = file?.name?.split(".").pop()?.toLowerCase() || "";
    const supported = allowedExtensions.includes(extension);
    const isReadableText = extension === "txt" || file?.type?.startsWith("text/");
    const lines = useMemo(() => content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean), [content]);

    useEffect(() => {
        let cancelled = false;
        if (!file) return undefined;
        if (!supported) {
            setError("This file type is not supported. Choose a PDF, DOCX, image, or text file.");
            setReading(false);
            return undefined;
        }
        if (file.size === 0) {
            setError("This file is empty. Choose another file or paste your resume text.");
            setReading(false);
            return undefined;
        }
        if (file.size > MAX_IMPORT_SIZE) {
            setError("This file is larger than 10 MB. Choose a smaller file.");
            setReading(false);
            return undefined;
        }
        if (!isReadableText) {
            setReading(false);
            return undefined;
        }
        file.text().then((text) => {
            if (!cancelled) {
                setContent(text.slice(0, 50000));
                setReading(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setError("We couldn't read this file in the browser. Paste the resume text below instead.");
                setReading(false);
            }
        });
        return () => { cancelled = true; };
    }, [file, isReadableText, supported]);

    const apply = () => {
        if (!supported || !file || file.size === 0 || file.size > MAX_IMPORT_SIZE) return;
        onApply({ fileName: file.name, fileType: extension, content: content.trim(), lines });
    };

    return (
        <div className="import-review-backdrop" role="presentation">
            <section className="import-review" role="dialog" aria-modal="true" aria-labelledby="import-review-title">
                <div className="flex items-start justify-between gap-4">
                    <div><p className="eyebrow">Import review</p><h2 id="import-review-title" className="mt-1 text-2xl font-extrabold">Check before we add anything</h2><p className="mt-2 text-sm leading-6 text-ink-500">Your original file stays unchanged. Review the content, edit it if needed, then apply it to a new local draft.</p></div>
                    <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel import"><FiX /></button>
                </div>
                <div className="import-review-file"><FiFileText /><span className="min-w-0"><strong className="block truncate">{file?.name}</strong><small>{file ? `${(file.size / 1024).toFixed(0)} KB · ${extension.toUpperCase()}` : "No file selected"}</small></span><FiCheck className="ml-auto text-green-600" /></div>
                {error && <div className="auth-error mt-4" role="alert"><FiAlertCircle /> {error}</div>}
                {reading && <p className="mt-5 text-sm text-ink-500">Reading your file…</p>}
                {!reading && !error && !isReadableText && <div className="import-review-note mt-5"><strong>File validated.</strong> We can preserve the file as a reference, but this browser build cannot safely extract formatted PDF/DOCX/image content yet. Paste the text you want to bring into the draft below.</div>}
                {!reading && !error && <label className="field-label mt-5">Imported text<textarea className="field-input min-h-[220px] resize-y leading-6" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste your resume text here…" /></label>}
                <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="rounded-full border border-ink-300 px-5 py-3 text-sm font-bold" onClick={onCancel}>Cancel</button><button type="button" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={apply} disabled={reading || Boolean(error)}><FiCheck /> Apply to draft</button></div>
            </section>
        </div>
    );
};
export default ImportReview;
