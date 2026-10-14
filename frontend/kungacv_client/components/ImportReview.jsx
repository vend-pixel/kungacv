"use client";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiFileText, FiX } from "react-icons/fi";
import { IMPORT_SUPPORTED_EXTENSIONS, parseResumeFile } from "@utils/parseResume";

const MAX_IMPORT_SIZE = 10 * 1024 * 1024;
const allowedExtensions = ["pdf", "doc", "docx", "png", "jpg", "jpeg", ...IMPORT_SUPPORTED_EXTENSIONS];

const ImportReview = ({ file, onCancel, onApply }) => {
    const [content, setContent] = useState("");
    const [parsed, setParsed] = useState(null);
    const [reading, setReading] = useState(true);
    const [error, setError] = useState("");
    const extension = file?.name?.split(".").pop()?.toLowerCase() || "";
    const supported = allowedExtensions.includes(extension);
    const isSupportedForParsing = IMPORT_SUPPORTED_EXTENSIONS.includes(extension);

    useEffect(() => {
        let cancelled = false;
        if (!file) return undefined;
        const read = async () => {
            if (!supported) throw new Error("This file type is not supported. Choose a TXT or JSON resume for structured import.");
            if (file.size === 0) throw new Error("This file is empty. Choose another file.");
            if (file.size > MAX_IMPORT_SIZE) throw new Error("This file is larger than 10 MB. Choose a smaller file.");
            const text = await file.text();
            if (!isSupportedForParsing) throw new Error("PDF, DOCX, and image parsing is not enabled yet. Use TXT or JSON for structured import, or paste the text below.");
            if (!text.trim()) throw new Error("The file does not contain readable text.");
            const result = await parseResumeFile(new File([text], file.name, { type: file.type }));
            if (!cancelled) { setContent(text.slice(0, 100000)); setParsed(result); setReading(false); }
        };
        read().catch((reason) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : "We couldn't parse this file."); setReading(false); } });
        return () => { cancelled = true; };
    }, [file, isSupportedForParsing, supported]);

    const reparse = async () => {
        try { setError(""); setReading(true); setParsed(await parseResumeFile(new File([content], file.name, { type: "text/plain" }))); setReading(false); }
        catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn't parse this text."); setReading(false); }
    };

    const apply = () => {
        if (!parsed || reading || error) return;
        onApply({ fileName: file.name, fileType: extension, content, parsed });
    };

    const counts = parsed ? [
        ["Contact", parsed.content.personalInfo?.email || parsed.content.personalInfo?.phone ? 1 : 0],
        ["Experience", parsed.content.professionalExperience?.length || 0],
        ["Education", parsed.content.education?.length || 0],
        ["Skills", parsed.content.skills?.length || 0],
        ["Projects", parsed.content.projects?.length || 0],
    ] : [];

    return (
        <div className="import-review-backdrop" role="presentation">
            <section className="import-review" role="dialog" aria-modal="true" aria-labelledby="import-review-title">
                <div className="flex items-start justify-between gap-4">
                    <div><p className="eyebrow">Import review</p><h2 id="import-review-title" className="mt-1 text-2xl font-extrabold">Check before we add anything</h2><p className="mt-2 text-sm leading-6 text-ink-500">Your original file stays unchanged. Review the detected fields, edit the source text if needed, then apply it to a local draft.</p></div>
                    <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel import"><FiX /></button>
                </div>
                <div className="import-review-file"><FiFileText /><span className="min-w-0"><strong className="block truncate">{file?.name}</strong><small>{file ? `${(file.size / 1024).toFixed(0)} KB · ${extension.toUpperCase()}` : "No file selected"}</small></span><FiCheck className="ml-auto text-green-600" /></div>
                {error && <div className="auth-error mt-4" role="alert"><FiAlertCircle /> {error}</div>}
                {reading && <p className="mt-5 text-sm text-ink-500">Parsing your resume…</p>}
                {!reading && !error && parsed && <>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Detected resume sections">{counts.map(([label, count]) => <div key={label} className="rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-center"><strong className="block text-lg">{count}</strong><span className="text-xs text-ink-500">{label}</span></div>)}</div>
                    <p className="mt-4 text-sm text-ink-500">Detection confidence: <strong>{Math.round(parsed.confidence.overall * 100)}%</strong>. {parsed.warnings.join(" ")}</p>
                    <label className="field-label mt-5">Imported text<textarea className="field-input min-h-[220px] resize-y leading-6" value={content} onChange={(event) => setContent(event.target.value)} onBlur={reparse} /></label>
                </>}
                {!reading && !parsed && !error && <label className="field-label mt-5">Imported text<textarea className="field-input min-h-[220px] resize-y leading-6" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Paste your resume text here…" /></label>}
                <div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="rounded-full border border-ink-300 px-5 py-3 text-sm font-bold" onClick={onCancel}>Cancel</button><button type="button" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={apply} disabled={reading || Boolean(error) || !parsed}><FiCheck /> Apply parsed draft</button></div>
            </section>
        </div>
    );
};
export default ImportReview;
