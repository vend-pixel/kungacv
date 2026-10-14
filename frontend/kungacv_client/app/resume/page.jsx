"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiFileText, FiGrid, FiUpload, FiMoreHorizontal, FiPlus, FiTrash2, FiCopy, FiPenTool, FiBriefcase } from "react-icons/fi";
import Nav from "@components/Nav";
import { useAppSelector } from "@redux/hooks";
import { deleteResume, duplicateResume, listResumes } from "@utils/api";
import templatePresets from "@utils/templatePresets";

const filters = [
    { id: "all", label: "All templates" },
    { id: "simple", label: "Simple", icon: <FiFileText /> },
    { id: "modern", label: "Modern", icon: <FiGrid /> },
    { id: "creative", label: "Creative", icon: <FiPenTool /> },
];

const templateGroup = (id) => (id % 3 === 1 ? "simple" : id % 3 === 2 ? "modern" : "creative");

const ResumeMain = () => {
    const token = useAppSelector((state) => state.persistedReducer.auth.access_token);
    const [resumes, setResumes] = useState(null);
    const [listError, setListError] = useState(false);
    const [filter, setFilter] = useState("all");
    const [notice, setNotice] = useState("");
    const importRef = useRef(null);

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

    const handleImport = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setNotice(`${file.name} is ready to import. Content extraction will keep your formatting choices in the next step.`);
        event.target.value = "";
    };

    return (
        <>
            <Nav />
            <main className="workspace-page min-h-screen bg-gray-50 text-black">
                <div className="pageContainer py-8 md:py-12">
                    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                        <aside className="hidden lg:block">
                            <div className="sticky top-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                <p className="px-3 pb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Workspace</p>
                                <nav className="space-y-1" aria-label="Workspace navigation">
                                    <Link href="/resume" className="workspace-nav-link workspace-nav-link-active"><FiFileText /> Resume</Link>
                                    <Link href="/cover-letter" className="workspace-nav-link"><FiPenTool /> Cover letter</Link>
                                    <Link href="/resume" className="workspace-nav-link workspace-nav-link-muted"><FiBriefcase /> Job tracker <span className="ml-auto text-[10px] uppercase">Soon</span></Link>
                                </nav>
                                <div className="mt-12 rounded-2xl bg-brand-50 p-4">
                                    <p className="text-sm font-bold">Your first resume is free</p>
                                    <p className="mt-2 text-xs leading-5 text-ink-500">Build, preview and export without a credit card.</p>
                                    <Link href="/resume/create" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-brand-700">Start building <FiArrowUpRight /></Link>
                                </div>
                            </div>
                        </aside>

                        <section>
                            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                                <div>
                                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Your career studio</p>
                                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Start building your resume</h1>
                                    <p className="mt-3 max-w-2xl text-base text-ink-500">Choose a design you like. Add your story. Switch templates whenever you want.</p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-brand-600 bg-transparent px-5 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-600 hover:text-white">
                                    <FiUpload /> Import existing resume
                                    <input ref={importRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="sr-only" onChange={handleImport} />
                                </label>
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
                                {token && resumes?.length > 0 && <div className="space-y-3">{resumes.map((resume) => <div key={resume.resume_uid} className="saved-document-card"><Link href={`/resume/create?rid=${resume.resume_uid}`} className="min-w-0 grow"><p className="truncate font-extrabold">{resume.title}</p><p className="mt-1 text-xs text-ink-500">Last edited {new Date(resume.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p></Link><div className="flex items-center gap-1"><button type="button" aria-label={`Duplicate ${resume.title}`} onClick={() => handleDuplicate(resume)} className="icon-button"><FiCopy /></button><button type="button" aria-label={`Delete ${resume.title}`} onClick={() => handleDelete(resume)} className="icon-button text-red-600"><FiTrash2 /></button><FiMoreHorizontal className="ml-2 text-ink-400" /></div></div>)}</div>}
                            </section>
                        </section>
                    </div>
                </div>
            </main>
        </>
    );
};

export default ResumeMain;
