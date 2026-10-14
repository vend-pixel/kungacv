"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiFileText, FiGrid, FiUpload, FiMoreHorizontal, FiPlus, FiTrash2, FiCopy, FiPenTool, FiBriefcase } from "react-icons/fi";
import Nav from "@components/Nav";
import { useAppSelector } from "@redux/hooks";
import { useDispatch } from "react-redux";
import { addOrUpdatePersonalInfo } from "@redux/resume/features";
import { deleteResume, duplicateResume, listResumes } from "@utils/api";
import templatePresets from "@utils/templatePresets";
import ImportReview from "@components/ImportReview";

const filters = [
    { id: "all", label: "All templates" },
    { id: "simple", label: "Simple", icon: <FiFileText /> },
    { id: "modern", label: "Modern", icon: <FiGrid /> },
    { id: "creative", label: "Creative", icon: <FiPenTool /> },
];

const templateGroup = (id) => (id % 3 === 1 ? "simple" : id % 3 === 2 ? "modern" : "creative");

const ResumeMain = () => {
    const token = useAppSelector((state) => state.persistedReducer.auth.access_token);
    const resumeDraft = useAppSelector((state) => state.persistedReducer.resume);
    const [resumes, setResumes] = useState(null);
    const [listError, setListError] = useState(false);
    const [filter, setFilter] = useState("all");
    const [notice, setNotice] = useState("");
    const [importFile, setImportFile] = useState(null);
    const importRef = useRef(null);
    const dispatch = useDispatch();

    const loadResumes = async () => {
        if (!token) {
            setResumes(null);
            return;
        }
        try {
            setListError(false);
            setResumes(await listResumes(token));
        } catch (e) {
            setListError(true);
            setResumes([]);
        }
    };

    useEffect(() => {
        loadResumes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleDuplicate = async (resume) => {
        try {
            await duplicateResume(token, resume.resume_uid);
            await loadResumes();
        } catch (e) {
            setListError(true);
        }
    };

    const handleDelete = async (resume) => {
        if (!window.confirm(`Delete "${resume.title}"? This cannot be undone.`)) return;
        try {
            await deleteResume(token, resume.resume_uid);
            await loadResumes();
        } catch (e) {
            setListError(true);
        }
    };

    const filteredTemplates = useMemo(
        () => templatePresets.filter((template) => filter === "all" || templateGroup(template.id) === filter).slice(0, 6),
        [filter]
    );
    const hasDraft = Boolean(
        resumeDraft?.personalInfo?.fullName ||
        resumeDraft?.personalInfo?.email ||
        (resumeDraft?.professionalExperience || []).length ||
        (resumeDraft?.education || []).length
    );
    const orderedResumes = useMemo(() => {
        if (!Array.isArray(resumes)) return resumes;
        if (typeof window === "undefined") return resumes;
        let recent = [];
        try { recent = JSON.parse(window.localStorage.getItem("kungacv-recent-resumes")) || []; } catch (error) { recent = []; }
        const recentIndex = new Map(recent.map((item, index) => [item.id, index]));
        return [...resumes].sort((a, b) => (recentIndex.get(a.resume_uid) ?? 999) - (recentIndex.get(b.resume_uid) ?? 999));
    }, [resumes]);
    const markResumeOpened = (resume) => {
        let recent = [];
        try { recent = JSON.parse(window.localStorage.getItem("kungacv-recent-resumes")) || []; } catch (error) { recent = []; }
        const next = [{ id: resume.resume_uid, title: resume.title, openedAt: new Date().toISOString() }, ...recent.filter((item) => item.id !== resume.resume_uid)].slice(0, 12);
        window.localStorage.setItem("kungacv-recent-resumes", JSON.stringify(next));
    };

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setNotice("");
        setImportFile(file);
        event.target.value = "";
    };
    const handleImportApply = ({ fileName, content, lines }) => {
        const email = content.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
        const phone = content.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0];
        const firstLine = lines[0] || "";
        dispatch(addOrUpdatePersonalInfo({ fullName: firstLine.slice(0, 80) || undefined, email, phone }));
        window.localStorage.setItem("kungacv-last-import", JSON.stringify({ fileName, importedAt: new Date().toISOString(), content }));
        setImportFile(null);
        setNotice(content ? `${fileName} reviewed and added to your local draft. Check the contact card, then continue with your experience.` : `${fileName} validated. Add the content manually in the editor to keep your formatting safe.`);
    };

    return (
        <>
            <Nav />
            <main className="workspace-page min-h-screen bg-[#F5F4F0] text-ink-950">
                <div className="pageContainer py-8 md:py-12">
                    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-8 rounded-[1.5rem] border border-[#deddd6] bg-[#e9e7df] p-4">
                                <p className="px-3 pb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Workspace</p>
                                <nav className="space-y-1" aria-label="Workspace navigation">
                                    <Link href="/resume" className="workspace-nav-link workspace-nav-link-active"><FiFileText /> Resume</Link>
                                    <Link href="/cover-letter" className="workspace-nav-link"><FiPenTool /> Cover letter</Link>
                                    <Link href="/job-tracker" className="workspace-nav-link"><FiBriefcase /> Job tracker</Link>
                                </nav>
                                <div className="mt-12 rounded-2xl bg-white/70 p-4">
                                    <p className="text-sm font-bold">Your first resume is free</p>
                                    <p className="mt-2 text-xs leading-5 text-ink-500">Build, preview and export without a credit card.</p>
                                    <Link href="/resume/create" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-700">Start building <FiArrowUpRight /></Link>
                                </div>
                            </div>
                        </aside>

                        <section>
                            <nav className="workspace-mobile-nav" aria-label="Workspace navigation">
                                <Link href="/resume" className="workspace-mobile-nav-active"><FiFileText /> Resume</Link>
                                <Link href="/cover-letter"><FiPenTool /> Cover letter</Link>
                                <Link href="/job-tracker"><FiBriefcase /> Tracker</Link>
                            </nav>
                            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <div>
                                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Your career studio</p>
                                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Start building your resume</h1>
                                    <p className="mt-3 max-w-2xl text-base text-ink-500">Choose a design you like. Add your story. Switch templates whenever you want.</p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-ink-950 bg-transparent px-5 py-3 text-sm font-bold transition hover:bg-ink-950 hover:text-white">
                                    <FiUpload /> Import existing resume
                                    <input ref={importRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" className="sr-only" onChange={handleImport} />
                                </label>
                            </div>

                            <div className="workspace-next-step">
                                <div className="workspace-next-step-icon">{hasDraft ? "↗" : "+"}</div>
                                <div className="min-w-0">
                                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-700">{hasDraft ? "Continue where you left off" : "Your first move"}</p>
                                    <h2 className="mt-1 text-lg font-extrabold">{hasDraft ? "Keep shaping your resume" : "Pick a look, then make it yours"}</h2>
                                    <p className="mt-1 text-sm text-ink-500">{hasDraft ? "Your draft is still on this device. Open it to keep adding the details employers scan first." : "Start with a template or import your existing resume. You can change the design later."}</p>
                                </div>
                                <Link href="/resume/create" className="workspace-next-step-link">{hasDraft ? "Continue" : "Start building"} <FiArrowUpRight /></Link>
                            </div>

                            <div className="mb-7 flex flex-wrap gap-2" role="tablist" aria-label="Template filters">
                                {filters.map((item) => (
                                    <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`template-filter ${filter === item.id ? "template-filter-active" : ""}`}>
                                        {item.icon} {item.label}
                                    </button>
                                ))}
                            </div>

                            {notice && <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800" role="status">{notice}</div>}

                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                <Link href="/resume/create" className="template-card template-card-create group">
                                    <div className="template-create-paper"><FiPlus className="text-3xl" /></div>
                                    <div className="flex items-center justify-between pt-4"><div><p className="font-extrabold">Start from scratch</p><p className="mt-1 text-sm text-ink-500">Blank, flexible and yours</p></div><FiArrowUpRight className="text-xl transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
                                </Link>
                                {filteredTemplates.map((template) => (
                                    <Link key={template.id} href={`/resume/create?template=${template.id}`} className="template-card group">
                                        <div className="template-image-wrap"><img src={`/templates/template-${String(template.id).padStart(2, "0")}.webp`} alt={`${template.name} resume template`} /><span className="template-use">Use template <FiArrowUpRight /></span></div>
                                        <div className="flex items-center justify-between pt-4"><div><p className="font-extrabold">{template.name}</p><p className="mt-1 text-sm text-ink-500">Customizable layout</p></div><FiArrowUpRight className="text-xl transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
                                    </Link>
                                ))}
                            </div>

                            <section className="mt-14" aria-labelledby="saved-heading">
                                <div className="mb-5 flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">Saved work</p><h2 id="saved-heading" className="mt-2 text-2xl font-extrabold">Your resumes</h2></div><Link href="/cover-letter" className="hidden items-center gap-2 text-sm font-bold text-brand-700 md:flex">Create a matching cover letter <FiArrowUpRight /></Link></div>
                                {!token && <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 px-6 py-5 text-sm text-ink-500">Your local draft is always available. <Link href="/login" className="font-bold text-brand-700">Sign in</Link> when you want to sync saved resumes across devices.</div>}
                                {token && listError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Couldn&apos;t load your resumes. Refresh to try again.</p>}
                                {token && resumes?.length === 0 && !listError && <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 px-6 py-8 text-center text-sm text-ink-500">No saved resumes yet — choose a template above and your first draft will appear here.</div>}
                                {token && orderedResumes?.length > 0 && <div className="space-y-3">{orderedResumes.map((resume, index) => <div key={resume.resume_uid} className="saved-document-card"><Link href={`/resume/create?rid=${resume.resume_uid}`} onClick={() => markResumeOpened(resume)} className="min-w-0 grow"><p className="truncate font-extrabold">{resume.title}</p><p className="mt-1 text-xs text-ink-500">{index === 0 ? "Recently opened" : "Last edited"} · {new Date(resume.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p></Link><div className="flex items-center gap-1"><button type="button" aria-label={`Duplicate ${resume.title}`} onClick={() => handleDuplicate(resume)} className="icon-button"><FiCopy /></button><button type="button" aria-label={`Delete ${resume.title}`} onClick={() => handleDelete(resume)} className="icon-button text-red-600"><FiTrash2 /></button><FiMoreHorizontal className="ml-2 text-ink-400" /></div></div>)}</div>}
                            </section>
                        </section>
                    </div>
                </div>
            </main>
            {importFile && <ImportReview file={importFile} onCancel={() => setImportFile(null)} onApply={handleImportApply} />}
        </>
    );
};

export default ResumeMain;
