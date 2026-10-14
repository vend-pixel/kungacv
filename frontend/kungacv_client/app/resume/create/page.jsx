"use client";

import _ from "lodash";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useAppSelector } from "@redux/hooks";
import { _camelize } from "../../../utils/helpers";
import { AVAILABLE_COMPONENTS } from "@utils/Constants";
import { createResume, fetchResume, updateResume } from "@utils/api";
import { trackEvent } from "@utils/analytics";
import Skills from "@components/ResumeComponents/Skills";
import Language from "@components/ResumeComponents/Language";
import Interest from "@components/ResumeComponents/Interests";
import { applyTemplatePreset, hydrateResume, setEditObj, setActiveResumeUid, setPrevObj, setResumeTitle, setSaveStatus } from "@redux/resume/features";
import AddContent from "@components/ResumeComponents/AddContent";
import Certificate from "@components/ResumeComponents/Certificate";
import ProjectComponent from "@components/ResumeComponents/Project";
import References from "@components/ResumeComponents/References";
import PersonalInfo from "@components/ResumeComponents/PersonalInfo";
import ProfessionalExperience from "@components/ResumeComponents/ProfessionalExpAndEducation";
import DropDownComp from "@components/ResumeComponents/minicomponents/DropDownComp/DropDownComp";
import Customization from "@components/customization/Customization";
import MobileNav from "@components/ResumeComponents/MobileNav";
import TemplateDemo from "@components/ResumeComponents/TemplateDemo";
import { AiFillCloseCircle } from "react-icons/ai";
import Logo from "@components/Logo";
import templatePresets from "@utils/templatePresets";
import EditorProgress from "@components/ResumeComponents/EditorProgress";

const CreateResume = () => {
    const [addContent, setAddContent] = useState(false);
    const [demo, setDemo] = useState(false);
    const [currentComponent, setCurrentComponent] = useState(AVAILABLE_COMPONENTS.personalInfo);

    const resumeData = useAppSelector((state) => state.persistedReducer.resume);
    const isPro = useAppSelector((state) => state.persistedReducer.auth.isPro);

    const { spacing, font } = resumeData.customization || {};
    console.log("CUSTOMIZATION OBJ", resumeData.customization);

    const previewStyle = {};
    if (spacing?.value?.tBMargin != null && spacing?.value?.lRMargin != null) {
        previewStyle.padding = `${spacing.value.tBMargin - 9.5}mm ${spacing.value.lRMargin}mm`;
    }
    if (font?.font) {
        previewStyle.fontFamily = `${font.font}${font.family ? `, ${font.family}` : ""}`;
    }

    const dispatch = useDispatch();

    const token = useAppSelector((state) => state.persistedReducer.auth.access_token);
    const saveStatus = resumeData.saveStatus;

    const [ready, setReady] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [draftTitle, setDraftTitle] = useState("");
    const [exportWarnings, setExportWarnings] = useState([]);
    const latestRef = useRef(resumeData);
    latestRef.current = resumeData;
    const chainRef = useRef(Promise.resolve());

    // Server payload: the resume state minus editor-only/meta fields.
    const serverPayload = useMemo(() => {
        const content = _.omit(resumeData, ["editObj", "prevObj", "title", "activeResumeUid", "saveStatus"]);
        const fullName = content?.personalInfo?.fullName;
        return { title: resumeData.title || (fullName ? `${fullName} - Resume` : undefined), content };
    }, [resumeData]);
    const payloadKey = useMemo(() => JSON.stringify(serverPayload), [serverPayload]);
    const serverPayloadRef = useRef(serverPayload);
    serverPayloadRef.current = serverPayload;

    const doPersist = useCallback(async () => {
        if (!token) return;
        const payload = serverPayloadRef.current;
        const uid = latestRef.current.activeResumeUid;
        dispatch(setSaveStatus("saving"));
        try {
            if (uid) {
                await updateResume(token, uid, payload);
            } else {
                const created = await createResume(token, payload);
                dispatch(setActiveResumeUid(created.resume_uid));
                if (created.title && !latestRef.current.title) dispatch(setResumeTitle(created.title));
                trackEvent("resume_created");
            }
            dispatch(setSaveStatus("saved"));
        } catch (e) {
            dispatch(setSaveStatus("error"));
        }
    }, [token, dispatch]);

    // Saves run sequentially so an older write can never land after a newer one.
    const persist = useCallback(() => {
        if (!token) return;
        chainRef.current = chainRef.current.then(() => doPersist());
    }, [token, doPersist]);

    // Load a saved CV when ?rid= is present; otherwise start/keep a fresh local draft.
    useEffect(() => {
        const rid = new URLSearchParams(window.location.search).get("rid");
        if (!token || !rid) {
            const templateId = Number(new URLSearchParams(window.location.search).get("template"));
            const template = templatePresets.find((preset) => preset.id === templateId);
            if (!rid && template) dispatch(applyTemplatePreset(template.data));
            dispatch(setActiveResumeUid(null));
            setReady(true);
            return undefined;
        }
        let cancelled = false;
        fetchResume(token, rid)
            .then((resume) => {
                if (!cancelled && resume) dispatch(hydrateResume(resume));
            })
            .catch(() => {
                if (!cancelled) {
                    dispatch(setActiveResumeUid(null));
                    dispatch(setSaveStatus("error"));
                }
            })
            .finally(() => {
                if (!cancelled) setReady(true);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Debounced autosave — 1.5s after the last change.
    useEffect(() => {
        if (!token || !ready) return undefined;
        const timer = setTimeout(persist, 1500);
        return () => clearTimeout(timer);
    }, [payloadKey, token, ready, persist]);

    // Retry as soon as connectivity returns.
    useEffect(() => {
        if (!token || !ready) return undefined;
        const onOnline = () => persist();
        window.addEventListener("online", onOnline);
        return () => window.removeEventListener("online", onOnline);
    }, [token, ready, persist]);

    const displayTitle = resumeData.title || (resumeData.personalInfo?.fullName ? `${resumeData.personalInfo.fullName} - Resume` : "Untitled resume");
    const statusLabel = !token
        ? "Local draft"
        : !ready
        ? "Loading…"
        : saveStatus === "saving"
        ? "Saving…"
        : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
        ? "Not saved — will retry"
        : "Not saved yet";

    const handleDownload = (force = false) => {
        const fullName = resumeData?.personalInfo?.fullName;
        const warnings = [];
        if (!fullName) warnings.push("Add your name so employers know whose resume they are reading.");
        if (!resumeData?.personalInfo?.email) warnings.push("Add an email address so employers can contact you.");
        if (!(resumeData?.professionalExperience || []).length && !(resumeData?.projects || []).length) warnings.push("Add experience or a project to show what you can contribute.");
        if (warnings.length && !force) {
            setExportWarnings(warnings);
            return;
        }
        setExportWarnings([]);
        const previousTitle = document.title;
        if (fullName) document.title = `${fullName} - CV`;

        // Element padding only lands on the first/last printed page; move the page margin
        // into @page so continuation pages keep the same margins.
        const marginTopBottom = spacing?.value?.tBMargin != null ? Math.max(spacing.value.tBMargin - 9.5, 0) : 10;
        const marginLeftRight = spacing?.value?.lRMargin != null ? spacing.value.lRMargin : 10;
        document.getElementById("kungacv-print-page")?.remove();
        const pageStyle = document.createElement("style");
        pageStyle.id = "kungacv-print-page";
        pageStyle.textContent = `@media print { @page { size: A4; margin: ${marginTopBottom}mm ${marginLeftRight}mm; } #resume-print-root { padding: 0 !important; } }`;
        document.head.appendChild(pageStyle);

        const restoreTitle = () => {
            document.title = previousTitle;
            document.getElementById("kungacv-print-page")?.remove();
            window.removeEventListener("afterprint", restoreTitle);
        };
        window.addEventListener("afterprint", restoreTitle);
        trackEvent("pdf_download");
        window.print();
    };

    const beginRename = () => {
        setDraftTitle(displayTitle === "Untitled resume" ? "" : displayTitle);
        setRenaming(true);
    };

    const commitRename = () => {
        const nextTitle = draftTitle.trim();
        if (nextTitle) dispatch(setResumeTitle(nextTitle));
        setRenaming(false);
    };

    const handleCurrentComponent = (e) => {
        setCurrentComponent(e.title);
        setAddContent(false);
    };

    const currentComponentWrapper = (value) => {
        return () => {
            setCurrentComponent(value);
        };
    };

    const handleEditObj = (key, value) => {
        dispatch(setEditObj({ key, value }));
        dispatch(setPrevObj({ key, value: null }));
    };

    useEffect(() => {
        console.log("RESUME DATA", resumeData);
    }, []);

    return (
        <div className="editor-shell min-h-[90vh] w-[100vw] flex gap-5 relative bg-[#EEF0F4] px-0 sm:px-10">
            <a className="skip-link" href="#editor-content">
                Skip to editor content
            </a>
            {/* mobile menus  */}
            <MobileNav currentComponent={currentComponent} setCurrentComponent={setCurrentComponent} setDemo={setDemo} />

            {/* left */}
            <div className="flex grow items-start gap-8 relative">
                {/* left */}
                <nav className="grow-0 sticky top-8 z-[10000] hidden sm:flex flex-col items-center justify-center gap-10 px-2 py-5 rounded-xl shadow-lg bg-gray-50" aria-label="Editor sections">
                    <Link href={"/"}>
                        <Logo variant="light" size="lg" markOnly />
                    </Link>
                    <button
                        type="button"
                        aria-current={currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "page" : undefined}
                        aria-label="Edit resume content"
                        className={`flex flex-col px-4 py-3 justify-center items-center cursor-pointer rounded-xl ${
                            currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "text-brand-600 bg-gray-100" : ""
                        }`}
                        onClick={() => setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo)}
                    >
                        <img
                            src={currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "/content.svg" : "/content1.svg"}
                            alt=""
                            className="w-10"
                        />
                        <p>Content</p>
                    </button>
                    <button
                        type="button"
                        aria-current={currentComponent === "CUSTOMIZE" ? "page" : undefined}
                        aria-label="Customize resume"
                        className={`flex flex-col px-4 py-3 justify-center items-center cursor-pointer rounded-xl ${
                            currentComponent === "CUSTOMIZE" ? "text-brand-600 bg-gray-100" : ""
                        } `}
                        onClick={() => setCurrentComponent("CUSTOMIZE")}
                    >
                        <img src={currentComponent === "CUSTOMIZE" ? "/customize1.svg" : "/customize.svg"} alt="" className="w-10" />
                        <p>Customize</p>
                    </button>
                </nav>

                {/* right */}
                <main id="editor-content" className="flex grow flex-col justify-center items-stretch gap-4" aria-label="Resume editor">
                    <div className="sticky top-0 rounded-b-lg pt-0 sm:pt-[2rem] bg-[#EEF0F4] z-[6] mb-6 w-full shadow-sm">
                        <div className="sticky top-8 z-[1000]  grid grid-cols-[min-content_1fr_min-content] items-center bg-white px-6 py-3 md:px-8 md:py-4  lg:px-9 lg:py-5 rounded-xl shadow-none sm:shadow-lg">
                            <Link
                                href={"/resume"}
                                aria-label="Back to resumes"
                                className="sidebar:hidden mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-white hover:cursor-pointer hover:opacity-80"
                            >
                                <img src="/arrow.svg" alt="" className="w-6" />
                            </Link>
                            <div className="min-w-0">
                                {renaming ? (
                                    <form className="flex items-center gap-2 pr-4" onSubmit={(event) => { event.preventDefault(); commitRename(); }}>
                                        <label htmlFor="resume-title" className="sr-only">Resume name</label>
                                        <input id="resume-title" autoFocus value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} onBlur={commitRename} className="min-w-0 max-w-[20rem] border-b-2 border-brand-600 bg-transparent text-xl font-extrabold outline-none" />
                                        <button type="submit" aria-label="Save resume name" className="icon-button text-brand-700">✓</button>
                                    </form>
                                ) : (
                                    <div className="flex w-full items-center space-x-2 pr-4">
                                        <p className="text-black truncate text-2xl font-extrabold">{displayTitle}</p>
                                        <button type="button" aria-label="Rename resume" onClick={beginRename} className="icon-button text-gray-400">
                                            <img src="/edit.svg" alt="" className="w-5" />
                                        </button>
                                    </div>
                                )}
                                <p role="status" aria-live="polite" className={`pr-4 text-xs font-medium ${token && saveStatus === "error" ? "text-red-600" : "text-gray-400"}`}>
                                    {statusLabel}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {!isPro && (
                                    <Link
                                        href="/pricing"
                                        className="hidden md:inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2 text-[15px] font-extrabold h-10 min-w-[100px] text-white hover:bg-brand-700"
                                    >
                                        Upgrade
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="border-none cursor-pointer appearance-none touch-manipulation flex items-center justify-center focus-visible:outline-blue-600 hover:opacity-80 min-h-[30px] min-w-[30px] text-white bg-black h-12 w-12 rounded-full md:hidden"
                                >
                                    <img src="/download.svg" alt="" className="w-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="border-none cursor-pointer appearance-none touch-manipulation items-center justify-center focus-visible:outline-blue-600 hover:opacity-80 px-7 py-2 rounded-full font-extrabold h-10 text-[15px] min-w-[120px] text-white bg-black hidden md:flex"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                        <div className="editor-action-row">
                            <span className="editor-action-label">Build flow</span>
                            <button type="button" className={currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "editor-action-active" : ""} onClick={() => setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo)}>Content</button>
                            <button type="button" className={currentComponent === "CUSTOMIZE" ? "editor-action-active" : ""} onClick={() => setCurrentComponent("CUSTOMIZE")}>Customize</button>
                            <Link href="/cover-letter">Matching cover letter <span aria-hidden="true">↗</span></Link>
                        </div>
                    </div>

                    {/* resume components */}
                    <div className="w-full max-w-[800px] pb-16 px-4 sm:px-0">
                        {currentComponent === AVAILABLE_COMPONENTS.personalInfo && (
                            <EditorProgress resumeData={resumeData} currentComponent={currentComponent} setCurrentComponent={setCurrentComponent} />
                        )}
                        {currentComponent === AVAILABLE_COMPONENTS.skill && <Skills setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === "CUSTOMIZE" && <Customization setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.language && <Language setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.interests && <Interest setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.certificate && <Certificate setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.project && <ProjectComponent setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.references && <References setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.personalInfo && <PersonalInfo setCurrentComponent={setCurrentComponent} />}
                        {currentComponent === AVAILABLE_COMPONENTS.professionalExperience && (
                            <ProfessionalExperience
                                setCurrentComponent={setCurrentComponent}
                                mainHeading={"Create Professional Experience"}
                                subOne={"employer"}
                                subTwo={"jobTitle"}
                            />
                        )}
                        {currentComponent === AVAILABLE_COMPONENTS.education && (
                            <ProfessionalExperience
                                setCurrentComponent={setCurrentComponent}
                                mainHeading={"Create Education"}
                                subOne={"school"}
                                subTwo={"degree"}
                            />
                        )}
                        {currentComponent === AVAILABLE_COMPONENTS.course && (
                            <ProfessionalExperience
                                setCurrentComponent={setCurrentComponent}
                                mainHeading={"Create Course"}
                                subOne={"courseTitle"}
                                subTwo={"institution"}
                            />
                        )}

                        {/* LIST WISE DROPDOWN */}
                        {currentComponent === "personalInfo" && (resumeData.professionalExperience || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.professionalExperience.map((c) => ({ ...c, name: c.jobTitle }))}
                                title={_camelize("Professional Experience")}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.professionalExperience)}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.skills.length || []) > 0 && (
                            <DropDownComp
                                list={resumeData.skills.map((c) => ({ ...c, name: c.skill }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.skill)}
                                title={_camelize("Skills")}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.languages || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.languages.map((c) => ({ ...c, name: c.language }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.language)}
                                title={"Languages"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.projects || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.projects.map((c) => ({ ...c, name: c.title }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.project)}
                                title={"Projects"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.interests || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.interests.map((c) => ({ ...c, name: c.interest }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.interests)}
                                title={"Interests"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.certificates || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.certificates.map((c) => ({ ...c, name: c.certificate }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.certificate)}
                                title={"Certificates"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.education || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.education.map((c) => ({ ...c, name: c.degree }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.education)}
                                title={"Education"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.courses || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.courses.map((c) => ({ ...c, name: c.courseTitle }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.course)}
                                title={"Courses"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                        {currentComponent === "personalInfo" && (resumeData.references || []).length > 0 && (
                            <DropDownComp
                                list={resumeData.references.map((c) => ({ ...c, name: c.name }))}
                                handleClick={currentComponentWrapper(AVAILABLE_COMPONENTS.references)}
                                title={"References"}
                                handleEditObj={handleEditObj}
                            />
                        )}
                    </div>
                    {currentComponent === "personalInfo" && (
                        <div className="flex justify-center mb-10">
                            <button
                                type="button"
                                aria-label="Add resume content"
                                className="mt-8  flex gradient border-none cursor-pointer appearance-none touch-manipulation items-center justify-center outline-none hover:scale-105 transition-transform shadow-md rounded-full font-extrabold h-15 text-[17px] min-w-[180px] text-white bg-gradient-to-r from-brand-500 to-brand-700 py-4 px-[4rem]"
                                onClick={() => setAddContent(true)}
                            >
                                <AiOutlinePlus className="text-3xl mr-2" />
                                Add Content
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Template demo */}
            <aside
                id="resume-print-root"
                aria-label="Resume preview"
                className={`hidden sm:block grow-[4] bg-white min-h-screen h-full my-[2rem] w-1/4 px-[3rem] overflow-hidden break-words sticky top-8${
                    isPro ? "" : " is-watermarked"
                }`}
                style={previewStyle}
            >
                <TemplateDemo resumeData={resumeData} />
            </aside>

            {/* Template Demo for Mobile */}
            {demo && (
                <div className="fixed sm:hidden top-0 left-0 h-screen w-full text-sm z-[500] px-4 py-[3rem] grid place-content-center bg-[rgba(0,0,0,0.7)]" role="dialog" aria-modal="true" aria-label="Resume preview">
                    <div>
                        <button type="button" className="absolute top-4 right-6 text-5xl text-white" aria-label="Close resume preview" onClick={() => setDemo(false)}>
                            <AiFillCloseCircle />
                        </button>
                        <div className={`bg-white scale-[0.5] h-auto my-[2rem] w-[40rem] px-[3rem] overflow-hidden break-words`} style={previewStyle}>
                            <TemplateDemo resumeData={resumeData} />
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 flex justify-center gap-3"><button type="button" className="rounded-full bg-white px-4 py-3 text-sm font-bold" onClick={() => setDemo(false)}>Back to edit</button><button type="button" className="rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white" onClick={() => handleDownload()}>Download</button></div>
                    </div>
                </div>
            )}

            {addContent && <AddContent setAddContent={setAddContent} handleCurrentComponent={handleCurrentComponent} />}
            {exportWarnings.length > 0 && <div className="import-review-backdrop" role="presentation"><section className="export-check" role="dialog" aria-modal="true" aria-labelledby="export-check-title"><p className="eyebrow">Export check</p><h2 id="export-check-title" className="mt-1 text-2xl font-extrabold">Your resume can still download</h2><p className="mt-2 text-sm leading-6 text-ink-500">Before you send it, consider these quick improvements:</p><ul className="mt-5 space-y-3 text-sm text-ink-700">{exportWarnings.map((warning) => <li key={warning} className="flex gap-2"><span className="text-brand-600">•</span>{warning}</li>)}</ul><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="rounded-full border border-ink-300 px-5 py-3 text-sm font-bold" onClick={() => setExportWarnings([])}>Keep editing</button><button type="button" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-bold text-white" onClick={() => handleDownload(true)}>Download anyway</button></div></section></div>}
        </div>
    );
};

export default CreateResume;

// , certificate, education, course
