const visible = (value) => ({ ...value, visible: true });

const date = (year, month, presentyear = false) => ({ year, month, dontshow: false, onlyyear: false, presentyear });
const experience = (id, employer, jobTitle, description, start, end, city = "Lilongwe", country = "Malawi") =>
    visible({ id, employer, jobTitle, description, startDate: date(start, "January"), endDate: date(end, "December"), city, country, link: "" });
const education = (id, school, degree, description, start, end, city = "Blantyre", country = "Malawi") =>
    visible({ id, school, degree, description, startDate: date(start, "September"), endDate: date(end, "June"), city, country, link: "" });
const skill = (id, name, level, description = "") => visible({ id, skill: name, skillLevel: level, description });
const language = (id, name, level, description = "") => visible({ id, language: name, languageLevel: level, description });
const project = (id, title, subTitle, description) =>
    visible({ id, title, subTitle, description, projectTitle: title, startDate: date("2023", "March"), endDate: date("2024", "October") });
const interest = (id, value, description = "") => visible({ id, interest: value, description });
const certificate = (id, value, description = "") => visible({ id, certificate: value, description, link: "" });
const reference = (id, name, jobTitle, organization, email, phone) => visible({ id, name, jobTitle, organization, email, phone });

const people = [
    { fullName: "Thoko Banda", jobTitle: "Product Designer", email: "thoko.banda@example.com", phone: "+265 888 120 440", address: "Lilongwe, Malawi", links: { website: "thokobanda.design", linkedin: "linkedin.com/in/thokobanda" }, image: {} },
    { fullName: "Mphatso Chirwa", jobTitle: "Software Engineer", email: "mphatso.chirwa@example.com", phone: "+265 999 235 710", address: "Blantyre, Malawi", links: { github: "github.com/mphatso", linkedin: "linkedin.com/in/mphatso" }, image: {} },
    { fullName: "Lina Phiri", jobTitle: "Marketing Strategist", email: "lina.phiri@example.com", phone: "+265 888 441 208", address: "Mzuzu, Malawi", links: { website: "linaphiri.co", linkedin: "linkedin.com/in/linaphiri" }, image: {} },
    { fullName: "Tapiwa Mwale", jobTitle: "Operations Lead", email: "tapiwa.mwale@example.com", phone: "+265 999 771 002", address: "Zomba, Malawi", links: { linkedin: "linkedin.com/in/tapiwamwale" }, image: {} },
];

const baseEntries = (personIndex) => ({
    personalInfo: people[personIndex % people.length],
    education: [
        education("edu-1", "University of Malawi", "BSc Information Systems", "Dean's list; human-centred systems", "2014", "2018"),
        education("edu-2", "Lilongwe Academy", "MS Office & Digital Communication", "Professional certificate", "2012", "2013"),
    ],
    professionalExperience: [
        experience("exp-1", "MobiWorks Africa", people[personIndex % people.length].jobTitle, "Led cross-functional delivery of customer-facing digital products and improved activation by 28%.", "2021", "2024"),
        experience("exp-2", "Bright Valley Studio", "Associate Consultant", "Translated research into clear plans, prototypes and measurable launch milestones.", "2018", "2021", "Blantyre"),
        experience("exp-3", "Cedar Labs", "Project Intern", "Supported a small team with documentation, testing and client workshops.", "2017", "2018", "Lilongwe"),
    ],
    skills: [skill("skill-1", "Product strategy", "expert"), skill("skill-2", "Figma", "experienced"), skill("skill-3", "Research", "experienced"), skill("skill-4", "Writing", "skillful"), skill("skill-5", "Stakeholder facilitation", "skillful")],
    languages: [language("lang-1", "English", "native"), language("lang-2", "Chichewa", "native"), language("lang-3", "French", "working")],
    certificates: [certificate("cert-1", "Google Project Management", "Coursera, 2023"), certificate("cert-2", "Design Thinking", "IDEO U, 2021")],
    interests: [interest("int-1", "Community design"), interest("int-2", "Photography"), interest("int-3", "Long-distance running")],
    projects: [project("proj-1", "Market access toolkit", "Lead researcher", "A practical toolkit helping small businesses reach new local customers."), project("proj-2", "Open data weekend", "Volunteer organiser", "A two-day community event pairing civic questions with simple data stories.")],
    references: [reference("ref-1", "Grace Tembo", "Director of Product", "MobiWorks Africa", "grace.tembo@example.com", "+265 888 300 121"), reference("ref-2", "Peter Mbewe", "Studio Principal", "Bright Valley Studio", "peter.mbewe@example.com", "+265 999 300 122")],
    courses: [],
});

const customization = ({ accent = "rgb(56, 111, 164)", direction = "top", columns = 1, left = 50, right = 50, headingStyle = 0, headingSize = "M", textTransform = "capitalize", headerType = 2, headerDetails = "Icon", nameSize = "L", nameBold = true, creativeFont = false, nameFont = "Poppins", jobStyle = "normal", skillsType = "level", skillLevel = "dots", languageType = "level", languageLevel = "dots", interestType = "text", interestSeparator = "wrap", spacingSize = 10, lineHeight = 1.35, entryType = "Job title - Employer", educationType = "Degree - School" } = {}) => ({
    spacing: { value: { fontSize: spacingSize, lineHeight, lRMargin: 1, tBMargin: 1, spaceBtwEntries: 2 }, transform: { fontSize: spacingSize, lineHeight, lRMargin: 1, tBMargin: 1, spaceBtwEntries: 2 } },
    layout: { direction, columns, contentArrangement: [], columnsArrangement: { left: [], right: [] }, columnWidth: { left, right } },
    colors: { basic: false, advanced: false, border: false, accent: false, accentColorValue: accent, multicolor: false, multiColorValue: null, applyAccentColorTo: {} },
    font: { family: "sans", font: "Poppins" },
    heading: { style: headingStyle, textTransform, size: headingSize, icons: headingStyle === 1 },
    entryLayout: { size: "M", subtitleStyle: "normal", subtitlePlacement: "below", listStyle: "disc" },
    header: { type: headerType, details: headerDetails, sections: [] },
    name: { size: nameSize, bold: nameBold, creativeFont, fontFamily: nameFont },
    job: { size: "M", position: "same line", style: jobStyle },
    photo: { size: "M", show: false, grayscale: false },
    footer: { page: false, name: false, email: false },
    date: { format: "MM/DD/YYYY", month: "short", delimiter: "slash" },
    skills: { type: skillsType, level: skillLevel, separator: "wrap" },
    language: { type: languageType, level: languageLevel, separator: "wrap" },
    interest: { type: interestType, separator: interestSeparator },
    certificate: { type: "text", separator: "wrap" },
    education: { type: educationType },
    professionalExperience: { type: entryType },
});

const makePreset = (id, name, personIndex, options) => ({ id, name, data: { ...baseEntries(personIndex), customization: customization(options) } });

export const templatePresets = [
    makePreset(1, "Classic Blue", 0, { accent: "rgb(56, 111, 164)", headingStyle: 3, headerType: 2, headingSize: "L" }),
    makePreset(2, "Sage Sidebar", 1, { accent: "rgb(84, 121, 128)", direction: "right", columns: 2, left: 62, right: 38, headingStyle: 0, nameFont: "Lora", headingSize: "M" }),
    makePreset(3, "Warm Dots", 2, { accent: "rgb(192, 108, 132)", headingStyle: 1, skillsType: "level", skillLevel: "dots", languageType: "level", languageLevel: "dots", headerDetails: "Bullet" }),
    makePreset(4, "Editorial Frame", 3, { accent: "rgb(103, 152, 192)", headingStyle: 3, headerType: 2, textTransform: "uppercase", nameFont: "Crimson Pro", nameSize: "XL" }),
    makePreset(5, "Lavender Split", 0, { accent: "rgb(103, 45, 80)", direction: "left", columns: 2, left: 38, right: 62, headingStyle: 1, nameFont: "Vollkorn", skillsType: "level", skillLevel: "bar" }),
    makePreset(6, "Minimal Script", 1, { accent: "rgb(73, 89, 99)", headingStyle: 4, textTransform: "uppercase", creativeFont: true, nameFont: "Caveat", nameSize: "XL", headerDetails: "Bar", spacingSize: 9 }),
    makePreset(7, "Quiet Serif", 2, { accent: "rgb(84, 121, 128)", direction: "right", columns: 2, left: 68, right: 32, headingStyle: 0, nameFont: "Lora", jobStyle: "italic" }),
    makePreset(8, "Grid Skills", 3, { accent: "rgb(52, 138, 167)", headingStyle: 2, skillsType: "grid", languageType: "grid", headerType: 1, nameFont: "Work Sans" }),
    makePreset(9, "Language Bubbles", 0, { accent: "rgb(199, 65, 123)", headingStyle: 1, skillsType: "bubble", languageType: "bubble", interestType: "text", headerType: 2 }),
    makePreset(10, "Compact Work Sans", 1, { accent: "rgb(73, 89, 99)", headingStyle: 2, headingSize: "S", spacingSize: 9, lineHeight: 1.15, nameFont: "Work Sans", nameSize: "M", skillsType: "text", languageType: "text" }),
    makePreset(11, "Uppercase Studio", 2, { accent: "rgb(56, 111, 164)", headingStyle: 4, textTransform: "uppercase", headerType: 1, headerDetails: "Bar", skillsType: "level", skillLevel: "bar" }),
    makePreset(12, "Modern Neutral", 3, { accent: "rgb(103, 152, 192)", direction: "left", columns: 2, left: 58, right: 42, headingStyle: 0, nameFont: "Alegreya", languageType: "bubble", interestType: "bubble", interestSeparator: "wrap" }),
];

export default templatePresets;
