import { FiArrowRight, FiCheckCircle, FiCircle } from "react-icons/fi";
import { AVAILABLE_COMPONENTS } from "@utils/Constants";

const EditorProgress = ({ resumeData, currentComponent, setCurrentComponent }) => {
    const steps = [
        {
            id: "identity",
            label: "Add your contact details",
            hint: "Name, title and a way to reach you",
            complete: Boolean(resumeData.personalInfo?.fullName && resumeData.personalInfo?.email),
            target: AVAILABLE_COMPONENTS.personalInfo,
        },
        {
            id: "experience",
            label: "Show your experience",
            hint: "Add at least one role or project",
            complete: (resumeData.professionalExperience || []).length > 0,
            target: AVAILABLE_COMPONENTS.professionalExperience,
        },
        {
            id: "skills",
            label: "Add your strongest skills",
            hint: "Keep the list relevant to the role",
            complete: (resumeData.skills || []).length > 0,
            target: AVAILABLE_COMPONENTS.skill,
        },
        {
            id: "education",
            label: "Complete your education",
            hint: "Add your most relevant qualification",
            complete: (resumeData.education || []).length > 0,
            target: AVAILABLE_COMPONENTS.education,
        },
        {
            id: "polish",
            label: "Polish the final look",
            hint: "Tune spacing, type and colour",
            complete: Boolean(resumeData.customization?.template),
            target: "CUSTOMIZE",
        },
    ];
    const completed = steps.filter((step) => step.complete).length;
    const next = steps.find((step) => !step.complete);
    const activeId = steps.find((step) => step.target === currentComponent)?.id;

    return (
        <section className="editor-progress" aria-labelledby="editor-progress-heading">
            <div className="editor-progress-heading">
                <div>
                    <p className="eyebrow">Your next best step</p>
                    <h2 id="editor-progress-heading">Make the essentials clear first</h2>
                </div>
                <span className="editor-progress-count">{completed}/{steps.length} complete</span>
            </div>
            <div className="editor-progress-bar" aria-label={`${completed} of ${steps.length} resume steps complete`}>
                <span style={{ width: `${(completed / steps.length) * 100}%` }} />
            </div>
            <div className="editor-progress-list">
                {steps.map((step) => (
                    <button
                        type="button"
                        key={step.id}
                        className={`editor-progress-step ${activeId === step.id ? "editor-progress-step-active" : ""}`}
                        onClick={() => setCurrentComponent(step.target)}
                    >
                        {step.complete ? <FiCheckCircle aria-hidden="true" /> : <FiCircle aria-hidden="true" />}
                        <span>
                            <strong>{step.label}</strong>
                            <small>{step.hint}</small>
                        </span>
                        <FiArrowRight className="editor-progress-arrow" aria-hidden="true" />
                    </button>
                ))}
            </div>
            {next && (
                <button type="button" className="editor-progress-cta" onClick={() => setCurrentComponent(next.target)}>
                    Continue with {next.label.toLowerCase()} <FiArrowRight aria-hidden="true" />
                </button>
            )}
        </section>
    );
};

export default EditorProgress;
