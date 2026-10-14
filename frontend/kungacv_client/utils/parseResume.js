const MAX_TEXT_LENGTH = 100000;
const SECTION_ALIASES = {
    summary: "summary",
    profile: "summary",
    objective: "summary",
    experience: "experience",
    "work experience": "experience",
    employment: "experience",
    "professional experience": "experience",
    education: "education",
    academic: "education",
    skills: "skills",
    "technical skills": "skills",
    projects: "projects",
    languages: "languages",
    certifications: "certificates",
    certificates: "certificates",
    interests: "interests",
};

const makeId = (section, index) => `import-${section}-${index + 1}`;
const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const linesOf = (text) => String(text || "").split(/\r?\n/).map(clean).filter(Boolean);
const isHeading = (line) => SECTION_ALIASES[clean(line).replace(/[:\-]+$/, "").toLowerCase()] || null;
const isBullet = (line) => /^[-•*▪◦]\s+/.test(line);
const stripBullet = (line) => clean(line.replace(/^[-•*▪◦]\s+/, ""));
const splitList = (value) => clean(value).split(/[,;|•]/).map(clean).filter(Boolean);

const datePart = (value) => {
    const match = clean(value).match(/(\d{4})(?:\D+(\d{1,2}))?/);
    return match ? { year: match[1], month: match[2] || null, onlyyear: !match[2], dontshow: false, presentyear: false } : { year: null, month: null, onlyyear: true, dontshow: true, presentyear: false };
};

const emptyDate = () => ({ year: null, month: null, onlyyear: true, dontshow: true, presentyear: false });
const datesFrom = (value) => {
    const parts = clean(value).split(/\s*(?:-|–|—|to)\s*/i).filter(Boolean);
    const startDate = datePart(parts[0]);
    const endDate = parts[1] ? datePart(parts[1]) : emptyDate();
    if (/present|current|now/i.test(value)) endDate.presentyear = true;
    return { startDate, endDate };
};

const emptyContent = () => ({
    personalInfo: { fullName: null, jobTitle: null, email: null, phone: null, address: null, links: {}, image: {} },
    professionalExperience: [], skills: [], languages: [], projects: [], certificates: [], interests: [], education: [], courses: [], references: [],
});

const normalizeStructured = (value) => {
    const content = emptyContent();
    const source = value?.content && typeof value.content === "object" ? value.content : value;
    if (!source || typeof source !== "object" || Array.isArray(source)) throw new Error("JSON resume must be an object.");
    if (source.personalInfo && typeof source.personalInfo === "object") content.personalInfo = { ...content.personalInfo, ...source.personalInfo };
    for (const key of Object.keys(content)) {
        if (key !== "personalInfo" && Array.isArray(source[key])) content[key] = source[key].slice(0, 100).map((item, index) => ({ ...item, id: item.id || makeId(key, index), visible: item.visible !== false }));
    }
    const title = clean(value.title || source.title) || "Imported resume";
    return { version: 1, title, content, confidence: { overall: 1, source: "structured-json" }, warnings: [] };
};

const parseText = (text) => {
    const lines = linesOf(text.slice(0, MAX_TEXT_LENGTH));
    if (!lines.length) throw new Error("The resume does not contain readable text.");
    const content = emptyContent();
    const email = lines.join(" ").match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0] || null;
    const phone = lines.join(" ").match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] || null;
    const contactIndex = lines.findIndex((line) => email && line.includes(email));
    const name = lines.find((line, index) => index <= Math.max(contactIndex, 2) && !isHeading(line) && !line.includes("@") && !/^https?:\/\//i.test(line) && !/^\+?[\d\s().-]{8,}$/.test(line) && line.length <= 80) || lines[0];
    const jobTitle = lines.find((line, index) => index > lines.indexOf(name) && index < 6 && !isHeading(line) && line !== name && line.length <= 100 && !line.includes("@")) || null;
    content.personalInfo = { ...content.personalInfo, fullName: name, jobTitle, email, phone };

    const buckets = { summary: [], experience: [], education: [], skills: [], projects: [], languages: [], certificates: [], interests: [] };
    let section = "summary";
    for (const line of lines) {
        const heading = isHeading(line);
        if (heading) { section = heading; continue; }
        if (line === name || line === jobTitle || line.includes(email || "__never__") || line === phone) continue;
        buckets[section].push(line);
    }
    const summary = buckets.summary.filter((line) => !isBullet(line)).slice(0, 8).join(" ");
    if (summary) content.summary = summary;

    const experienceBlocks = [];
    let current = null;
    for (const line of buckets.experience) {
        if (!isBullet(line) && (line.match(/\b\d{4}\b/) || line.includes(" | ") || !current)) {
            if (current) experienceBlocks.push(current);
            const [heading, dateText] = line.split(/\s*[|•]\s*/);
            const dates = datesFrom(dateText || line.match(/\d{4}[^\d]*(?:\d{4}|present|current)?/i)?.[0] || "");
            current = { jobTitle: clean(heading.replace(/\s*\([^)]*\)$/, "")), employer: clean(dateText && !/\d{4}|present|current/i.test(dateText) ? dateText : ""), description: "", ...dates };
        } else if (current) current.description += `${current.description ? "\n" : ""}${stripBullet(line)}`;
    }
    if (current) experienceBlocks.push(current);
    content.professionalExperience = experienceBlocks.slice(0, 20).map((item, index) => ({ ...item, id: makeId("experience", index), visible: true }));
    content.education = buckets.education.filter((line) => !isBullet(line)).slice(0, 20).map((line, index) => ({ school: clean(line.split(/\s*[|•]\s*/)[0]), degree: clean(line.split(/\s*[|•]\s*/)[1] || ""), description: "", startDate: emptyDate(), endDate: emptyDate(), id: makeId("education", index), visible: true }));
    content.skills = splitList(buckets.skills.filter((line) => isBullet(line) || line.includes(",") ? stripBullet(line) : line).join(",")).slice(0, 60).map((skill, index) => ({ skill, skillLevel: null, description: "", id: makeId("skills", index), visible: true }));
    content.projects = buckets.projects.filter((line) => !isBullet(line)).slice(0, 20).map((line, index) => ({ projectTitle: line, title: line, description: "", startDate: emptyDate(), endDate: emptyDate(), id: makeId("projects", index), visible: true }));
    content.languages = splitList(buckets.languages.map(stripBullet).join(",")).slice(0, 20).map((language, index) => ({ language, languageLevel: null, description: "", id: makeId("languages", index), visible: true }));
    content.certificates = buckets.certificates.map(stripBullet).slice(0, 20).map((certificate, index) => ({ certificate, description: "", id: makeId("certificates", index), visible: true }));
    content.interests = splitList(buckets.interests.map(stripBullet).join(",")).slice(0, 20).map((interest, index) => ({ interest, description: "", id: makeId("interests", index), visible: true }));
    const detected = [content.personalInfo.fullName, content.personalInfo.email, content.personalInfo.phone, content.summary, ...content.professionalExperience, ...content.education, ...content.skills].filter(Boolean).length;
    return { version: 1, title: clean(content.personalInfo.fullName) ? `${content.personalInfo.fullName} resume` : "Imported resume", content, confidence: { overall: Math.min(0.95, 0.35 + detected / 20), source: "text-heuristic" }, warnings: ["Review inferred sections before applying them to your draft."] };
};

export const parseResumeFile = async (file) => {
    const extension = file?.name?.split(".").pop()?.toLowerCase() || "";
    const text = await file.text();
    if (extension === "json" || /^\s*[\[{]/.test(text)) {
        try { return normalizeStructured(JSON.parse(text)); } catch { throw new Error("This JSON resume is invalid or uses an unsupported structure."); }
    }
    return parseText(text);
};

export const IMPORT_MAX_TEXT_LENGTH = MAX_TEXT_LENGTH;
export const IMPORT_SUPPORTED_EXTENSIONS = ["txt", "json"];
