"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiBriefcase, FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import Nav from "@components/Nav";

const stages = ["Saved", "Applied", "Interview", "Offer", "Closed"];
const emptyJob = { company: "", role: "", stage: "Saved", nextFollowUp: "", resume: "", coverLetter: "" };

const JobTracker = () => {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState(emptyJob);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        try {
            const stored = JSON.parse(window.localStorage.getItem("kungacv-jobs"));
            if (Array.isArray(stored)) setJobs(stored);
        } catch (error) {
            // A corrupt local tracker should never block the workspace.
        }
    }, []);
    const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const addJob = (event) => {
        event.preventDefault();
        if (!form.company.trim() || !form.role.trim()) return;
        const next = [{ ...form, id: `${Date.now()}`, company: form.company.trim(), role: form.role.trim() }, ...jobs];
        setJobs(next);
        window.localStorage.setItem("kungacv-jobs", JSON.stringify(next));
        setForm(emptyJob);
        setOpen(false);
    };
    const updateStage = (id, stage) => {
        const next = jobs.map((job) => (job.id === id ? { ...job, stage } : job));
        setJobs(next);
        window.localStorage.setItem("kungacv-jobs", JSON.stringify(next));
    };
    const removeJob = (id) => {
        const next = jobs.filter((job) => job.id !== id);
        setJobs(next);
        window.localStorage.setItem("kungacv-jobs", JSON.stringify(next));
    };
    return (
        <>
            <Nav />
            <main className="workspace-page min-h-screen bg-[#F5F4F0] text-ink-950"><div className="pageContainer py-8 md:py-12">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><Link href="/resume" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-brand-700"><FiArrowLeft /> Workspace</Link><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Application loop</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">Job tracker</h1><p className="mt-3 max-w-2xl text-base text-ink-500">Keep the next follow-up visible while your resume and cover letter stay close by.</p></div><button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white"><FiPlus /> Add application</button></div>
                <div className="mb-6 grid gap-3 sm:grid-cols-4">{stages.slice(0, 4).map((stage) => <div key={stage} className="rounded-xl border border-[#deddd6] bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-500">{stage}</p><p className="mt-2 text-2xl font-extrabold">{jobs.filter((job) => job.stage === stage).length}</p></div>)}</div>
                {open && <form onSubmit={addJob} className="mb-6 rounded-[1.5rem] border border-[#deddd6] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,20,0.06)] md:p-7"><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow">New application</p><h2 className="mt-1 text-xl font-extrabold">Capture the next action</h2></div><button type="button" className="text-sm font-bold text-ink-500" onClick={() => setOpen(false)}>Cancel</button></div><div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Company<input className="field-input" value={form.company} onChange={(event) => updateForm("company", event.target.value)} required placeholder="e.g. Press Corporation" /></label><label className="field-label">Role<input className="field-input" value={form.role} onChange={(event) => updateForm("role", event.target.value)} required placeholder="e.g. Marketing Officer" /></label><label className="field-label">Stage<select className="field-input" value={form.stage} onChange={(event) => updateForm("stage", event.target.value)}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="field-label">Next follow-up<input className="field-input" type="date" value={form.nextFollowUp} onChange={(event) => updateForm("nextFollowUp", event.target.value)} /></label><label className="field-label">Linked resume<input className="field-input" value={form.resume} onChange={(event) => updateForm("resume", event.target.value)} placeholder="e.g. Marketing resume" /></label><label className="field-label">Linked cover letter<input className="field-input" value={form.coverLetter} onChange={(event) => updateForm("coverLetter", event.target.value)} placeholder="e.g. Press Corp letter" /></label></div><button type="submit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white"><FiCheck /> Save application</button></form>}
                {jobs.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-ink-300 bg-white/60 px-6 py-14 text-center"><FiBriefcase className="mx-auto text-3xl text-brand-600" /><h2 className="mt-4 text-xl font-extrabold">Your application list is empty</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">Add your first application after you have a resume and cover letter ready.</p><button type="button" onClick={() => setOpen(true)} className="mt-5 rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white">Add first application</button></div> : <div className="space-y-3">{jobs.map((job) => <article key={job.id} className="saved-document-card"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef5ff] text-brand-700"><FiBriefcase /></div><div className="min-w-0 grow"><h2 className="truncate font-extrabold">{job.role}</h2><p className="mt-1 text-sm text-ink-500">{job.company}{job.nextFollowUp ? ` · Follow up ${job.nextFollowUp}` : ""}</p><p className="mt-1 text-xs text-ink-400">{job.resume || "No resume linked"}{job.coverLetter ? ` · ${job.coverLetter}` : ""}</p></div><select aria-label={`Stage for ${job.role} at ${job.company}`} className="field-input max-w-[125px]" value={job.stage} onChange={(event) => updateStage(job.id, event.target.value)}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select><button type="button" className="icon-button text-red-600" aria-label={`Delete ${job.role} at ${job.company}`} onClick={() => removeJob(job.id)}><FiTrash2 /></button></article>)}</div>}
            </div></main>
        </>
    );
};
export default JobTracker;
