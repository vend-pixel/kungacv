"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiDownload, FiFileText, FiPenTool, FiRefreshCw } from "react-icons/fi";
import Nav from "@components/Nav";
import { useAppSelector } from "@redux/hooks";

const starterLetter = {
    title: "Untitled cover letter",
    recipientName: "Hiring Manager",
    company: "Company name",
    role: "Role you are applying for",
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date()),
    subject: "Application for the role of [role]",
    greeting: "Dear Hiring Manager,",
    body: "I am excited to apply for the [role] position at [company]. With a background in [your strongest area], I bring a practical, thoughtful approach and a record of turning ideas into outcomes.\n\nIn my recent work, I have built experience that maps closely to this opportunity. I would welcome the chance to bring that energy to your team and contribute from day one.\n\nThank you for considering my application. I would be glad to discuss how my experience can support your goals.",
    closing: "Kind regards,",
};

const templates = [
    { id: "classic", label: "Classic", accent: "#0070F0" },
    { id: "editorial", label: "Editorial", accent: "#111114" },
    { id: "warm", label: "Warm", accent: "#B85C75" },
];

const CoverLetter = () => {
    const personalInfo = useAppSelector((state) => state.persistedReducer.resume.personalInfo);
    const resume = useAppSelector((state) => state.persistedReducer.resume);
    const [letter, setLetter] = useState(starterLetter);
    const [template, setTemplate] = useState("classic");
    const [saved, setSaved] = useState(false);
    const [savedLetters, setSavedLetters] = useState([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(window.localStorage.getItem("kungacv-cover-letter"));
            if (stored?.letter) setLetter({ ...starterLetter, ...stored.letter });
            if (stored?.template) setTemplate(stored.template);
            const copies = JSON.parse(window.localStorage.getItem("kungacv-cover-letters"));
            if (Array.isArray(copies)) setSavedLetters(copies);
        } catch (e) {
            // A corrupt local draft should never block the editor.
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.localStorage.setItem("kungacv-cover-letter", JSON.stringify({ letter, template }));
            setSaved(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [letter, template]);

    const name = personalInfo?.fullName || "Your name";
    const jobTitle = personalInfo?.jobTitle || "Your professional title";
    const email = personalInfo?.email || "you@example.com";
    const phone = personalInfo?.phone || "+265 000 000 000";
    const address = personalInfo?.address || "Your location";
    const accent = templates.find((item) => item.id === template)?.accent || "#0070F0";
    const body = useMemo(() => letter.body.replaceAll("[role]", letter.role || "the role").replaceAll("[company]", letter.company || "your company"), [letter.body, letter.role, letter.company]);

    const update = (key, value) => {
        setSaved(false);
        setLetter((current) => ({ ...current, [key]: value }));
    };

    const saveCopy = () => {
        const copy = { ...letter, id: `${Date.now()}`, title: letter.title || `${letter.company} — ${letter.role}`, template, savedAt: new Date().toISOString() };
        const next = [copy, ...savedLetters].slice(0, 12);
        setSavedLetters(next);
        window.localStorage.setItem("kungacv-cover-letters", JSON.stringify(next));
        setLetter((current) => ({ ...current, title: copy.title }));
        setSaved(true);
    };

    const loadCopy = (copy) => {
        setLetter({ ...starterLetter, ...copy });
        setTemplate(copy.template || "classic");
        setSaved(false);
    };

    const syncFromResume = () => {
        const experience = resume?.professionalExperience?.[0];
        update("body", `I am excited to apply for the [role] position at [company]. With a background in ${jobTitle}, I bring a practical, thoughtful approach and a record of turning ideas into outcomes.\n\nIn my recent work at ${experience?.employer || "my recent role"}, I have built experience that maps closely to this opportunity. I would welcome the chance to bring that energy to your team and contribute from day one.\n\nThank you for considering my application. I would be glad to discuss how my experience can support your goals.`);
    };

    const printLetter = () => {
        document.body.classList.add("printing-cover-letter");
        window.print();
        window.setTimeout(() => document.body.classList.remove("printing-cover-letter"), 500);
    };

    return (
        <>
            <Nav />
            <main className="cover-letter-page min-h-screen bg-[#F5F4F0] text-ink-950">
                <div className="pageContainer py-6 md:py-10">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3"><Link href="/resume" className="icon-button bg-white"><FiArrowLeft /></Link><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Career studio</p><h1 className="mt-1 text-2xl font-extrabold md:text-3xl">Cover letter</h1></div></div>
                        <div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs font-semibold text-ink-500 sm:flex"><FiCheck className={saved ? "text-green-600" : "text-ink-300"} /> {saved ? "Saved locally" : "Saving…"}</span><button type="button" onClick={saveCopy} className="hidden rounded-full border border-ink-300 px-4 py-3 text-sm font-bold sm:inline-flex">Save a copy</button><button type="button" onClick={printLetter} className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-ink-700"><FiDownload /> Download PDF</button></div>
                    </div>

                    <div className="mb-6 flex gap-2 rounded-2xl border border-[#deddd6] bg-white/60 p-2 lg:hidden"><Link href="/resume" className="flex-1 rounded-xl px-3 py-2 text-center text-sm font-bold text-ink-500">Resume</Link><span className="flex-1 rounded-xl bg-ink-950 px-3 py-2 text-center text-sm font-bold text-white">Cover letter</span></div>

                    <div className="grid items-start gap-8 xl:grid-cols-[minmax(360px,460px)_1fr]">
                        <section className="space-y-5" aria-label="Cover letter editor">
                            <div className="rounded-[1.5rem] border border-[#deddd6] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,20,0.06)] md:p-7">
                                <div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-500">01 / Details</p><h2 className="mt-2 text-xl font-extrabold">Tailor this letter</h2></div><button type="button" onClick={syncFromResume} className="icon-button" title="Sync from resume"><FiRefreshCw /></button></div>
                                <div className="grid gap-4 sm:grid-cols-2"><label className="field-label sm:col-span-2">Document name<input className="field-input" value={letter.title} onChange={(e) => update("title", e.target.value)} /></label><label className="field-label">Recipient name<input className="field-input" value={letter.recipientName} onChange={(e) => update("recipientName", e.target.value)} /></label><label className="field-label">Company<input className="field-input" value={letter.company} onChange={(e) => update("company", e.target.value)} /></label><label className="field-label sm:col-span-2">Role you are applying for<input className="field-input" value={letter.role} onChange={(e) => update("role", e.target.value)} /></label><label className="field-label sm:col-span-2">Subject<input className="field-input" value={letter.subject} onChange={(e) => update("subject", e.target.value)} /></label></div>
                            </div>
                            <div className="rounded-[1.5rem] border border-[#deddd6] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,20,0.06)] md:p-7"><p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-500">02 / Your message</p><div className="mt-5 space-y-4"><label className="field-label">Greeting<input className="field-input" value={letter.greeting} onChange={(e) => update("greeting", e.target.value)} /></label><label className="field-label">Letter body<textarea className="field-input min-h-[260px] resize-y leading-7" value={letter.body} onChange={(e) => update("body", e.target.value)} /></label><label className="field-label">Closing<input className="field-input" value={letter.closing} onChange={(e) => update("closing", e.target.value)} /></label></div><button type="button" onClick={syncFromResume} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700"><FiRefreshCw /> Refresh from resume experience</button></div>
                            <div className="rounded-[1.5rem] border border-[#deddd6] bg-[#e9e7df] p-5 md:p-7"><p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-500">03 / Match your resume</p><p className="mt-2 text-sm leading-6 text-ink-600">Your contact details stay synced with the resume you are building. Pick a style and keep both documents consistent.</p><div className="mt-5 grid grid-cols-3 gap-3">{templates.map((item) => <button type="button" key={item.id} onClick={() => { setTemplate(item.id); setSaved(false); }} className={`rounded-xl border-2 bg-white p-2 text-left ${template === item.id ? "border-brand-600" : "border-transparent"}`}><div className="h-16 rounded-lg" style={{ background: `linear-gradient(135deg, ${item.accent} 0 18%, #fff 18% 100%)` }} /><span className="mt-2 block text-xs font-bold">{item.label}</span></button>)}</div></div>
                            {savedLetters.length > 0 && <div className="rounded-[1.5rem] border border-[#deddd6] bg-white p-5 md:p-7"><div className="flex items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-500">Saved copies</p><h2 className="mt-2 text-xl font-extrabold">Reuse a tailored letter</h2></div><span className="text-xs font-bold text-ink-400">{savedLetters.length} saved</span></div><div className="mt-4 space-y-2">{savedLetters.map((copy) => <button type="button" key={copy.id} onClick={() => loadCopy(copy)} className="flex w-full items-center justify-between rounded-xl border border-[#deddd6] px-3 py-3 text-left hover:bg-[#f5f4f0]"><span className="min-w-0"><strong className="block truncate text-sm">{copy.title}</strong><small className="text-xs text-ink-500">{copy.company} · {copy.role}</small></span><span className="text-xs font-bold text-brand-700">Open</span></button>)}</div></div>}
                        </section>

                        <section className="preview-stage" aria-label="Live cover letter preview"><div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-500">Live preview</p><p className="mt-1 text-sm text-ink-500">What employers will see</p></div><span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-ink-500">A4 document</span></div><article id="cover-letter-print-root" className={`cover-letter-paper cover-letter-${template}`} style={{ "--letter-accent": accent }}><header className="cover-letter-header"><div><h2>{name}</h2><p>{jobTitle}</p></div><div className="text-right text-xs leading-5 text-ink-500"><p>{email}</p><p>{phone}</p><p>{address}</p></div></header><div className="cover-letter-rule" /><div className="mb-10 flex justify-between text-sm text-ink-600"><div><p>{letter.recipientName}</p><p>{letter.company}</p></div><p>{letter.date}</p></div><p className="mb-7 text-sm font-bold" style={{ color: accent }}>{letter.subject}</p><p className="mb-5 text-base">{letter.greeting}</p><div className="space-y-5 whitespace-pre-line text-[15px] leading-7 text-ink-700">{body}</div><p className="mt-8 text-base">{letter.closing}<br /><strong className="mt-2 inline-block text-lg text-ink-950">{name}</strong></p><footer className="mt-16 flex items-center gap-2 text-xs text-ink-400"><FiFileText /> Prepared with KungaCV</footer></article></section>
                    </div>
                </div>
            </main>
        </>
    );
};

export default CoverLetter;
