import PersonalData from "@components/ResumeTemplate/PersonalData";
import Education from "@components/ResumeTemplate/EducationCoursesAndExp";
import SkillsComponent from "@components/ResumeTemplate/Skills";
import Languages from "@components/ResumeTemplate/Languages";
import Certificates from "@components/ResumeTemplate/Certificates";
import InterestComponent from "@components/ResumeTemplate/InterestComponent";
import Projects from "@components/ResumeTemplate/Projects";
import References from "@components/ResumeTemplate/References";
import { COLUMN_LAYOUT } from "@utils/Constants";

const defaultOrder = ["education", "professionalExperience", "courses", "skills", "languages", "certificates", "interests", "projects", "references"];
const titleToKey = {
    Education: "education",
    "Professional Experience": "professionalExperience",
    Skills: "skills",
    Languages: "languages",
    Projects: "projects",
    Interests: "interests",
    Certificates: "certificates",
    Courses: "courses",
    References: "references",
};

const normalizeOrder = (arr = []) => arr.map((item) => titleToKey[item?.title] || item?.id).filter((key) => defaultOrder.includes(key));

const TemplateDemo = ({ resumeData }) => {
    const customization = resumeData.customization || {};
    const { layout = {}, spacing = {}, heading = {}, header = {}, name = {}, footer = {}, job = {}, date = {}, skills = {}, language = {}, interest = {}, certificate = {}, education = {}, professionalExperience = {} } = customization;
    const safeSpacing = { value: { fontSize: 10, lineHeight: 1.35, spaceBtwEntries: 2, ...spacing.value } };
    const safeLayout = { direction: "top", columns: 1, columnWidth: { left: 50, right: 50 }, ...layout };
    const storedOrder = normalizeOrder(safeLayout.contentArrangement);
    const orderedSections = storedOrder.length ? [...storedOrder, ...defaultOrder.filter((key) => !storedOrder.includes(key))] : defaultOrder;

    const renderSection = (key) => {
        switch (key) {
            case "education":
                return <Education key={key} education={education} date={date} spacing={safeSpacing} heading={heading} currentComponent="education" />;
            case "professionalExperience":
                return <Education key={key} professionalExperience={professionalExperience} date={date} spacing={safeSpacing} heading={heading} currentComponent="professional Experience" />;
            case "courses":
                return <Education key={key} date={date} spacing={safeSpacing} heading={heading} currentComponent="courses" />;
            case "skills":
                return <SkillsComponent key={key} skills={skills} spacing={safeSpacing} heading={heading} />;
            case "languages":
                return <Languages key={key} language={language} spacing={safeSpacing} heading={heading} />;
            case "certificates":
                return <Certificates key={key} certificate={certificate} spacing={safeSpacing} heading={heading} />;
            case "interests":
                return <InterestComponent key={key} interest={interest} spacing={safeSpacing} heading={heading} />;
            case "projects":
                return <Projects key={key} date={date} spacing={safeSpacing} heading={heading} />;
            case "references":
                return <References key={key} spacing={safeSpacing} heading={heading} />;
            default:
                return null;
        }
    };

    const renderSections = (keys) => keys.map(renderSection);
    const leftKeys = normalizeOrder(safeLayout.columnsArrangement?.left).filter((key) => key !== "personalInfo");
    const rightKeys = normalizeOrder(safeLayout.columnsArrangement?.right);
    const fallbackLeft = orderedSections.slice(0, 4);
    const fallbackRight = orderedSections.slice(4);
    const columnsLeft = leftKeys.length ? leftKeys : fallbackLeft;
    const columnsRight = rightKeys.length ? rightKeys : fallbackRight;

    return (
        <div className="relative h-full min-h-screen w-full pb-[3rem] resume-paper">
            {safeLayout.direction === "top" || !safeLayout.direction ? (
                <div style={{ display: "flex", flexDirection: "column", rowGap: `${safeSpacing.value.spaceBtwEntries}px` }}>
                    <PersonalData job={job} name={name} header={header} spacing={safeSpacing} />
                    {safeLayout.columns === 1 ? renderSections(orderedSections) : <div className="flex gap-4"><div className="w-1/2">{renderSections(columnsLeft)}</div><div className="w-1/2">{renderSections(columnsRight)}</div></div>}
                </div>
            ) : (
                <>
                    {safeLayout.columns === 2 && (
                        <div className={COLUMN_LAYOUT.layout[safeLayout.direction]}>
                            <div style={{ width: `${safeLayout.columnWidth.left}%`, display: "flex", flexDirection: "column", rowGap: `${safeSpacing.value.spaceBtwEntries}px` }}>
                                {safeLayout.direction === "left" && <PersonalData job={job} name={name} header={header} spacing={safeSpacing} />}
                                {renderSections(columnsLeft)}
                            </div>
                            <div style={{ width: `${safeLayout.columnWidth.right}%`, display: "flex", flexDirection: "column", rowGap: `${safeSpacing.value.spaceBtwEntries}px` }}>
                                {safeLayout.direction === "right" && <PersonalData job={job} name={name} header={header} spacing={safeSpacing} />}
                                {renderSections(columnsRight)}
                            </div>
                        </div>
                    )}
                    {safeLayout.columns === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", rowGap: `${safeSpacing.value.spaceBtwEntries}px` }}>
                            <div className={safeLayout.direction === "left" ? "flex gap-2" : "flex justify-end"}>
                                <div style={{ width: `${safeLayout.columnWidth.left}%` }}>{safeLayout.direction === "left" && <PersonalData job={job} name={name} header={header} spacing={safeSpacing} />}</div>
                                <div style={{ width: `${safeLayout.columnWidth.right}%` }}>{safeLayout.direction === "right" && <PersonalData job={job} name={name} header={header} spacing={safeSpacing} />}</div>
                            </div>
                            {renderSections(orderedSections)}
                        </div>
                    )}
                </>
            )}
            {(footer.name || footer.page || footer.email) && (
                <div className="absolute bottom-4 flex w-full items-center justify-between text-[.6rem] text-gray-600"><div>{footer.name && resumeData.personalInfo?.fullName}</div><div>{footer.email && resumeData.personalInfo?.email}</div><div>{footer.page && "1/1"}</div></div>
            )}
        </div>
    );
};

export default TemplateDemo;
