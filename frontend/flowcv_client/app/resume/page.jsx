"use client";

import { useEffect, useState } from "react";
import Footer from "@components/LandingPage/Footer";
import Nav from "@components/Nav";
import Link from "next/link";
import { useAppSelector } from "@redux/hooks";
import { deleteResume, duplicateResume, listResumes } from "@utils/api";

const ResumeMain = () => {
    const token = useAppSelector((state) => state.persistedReducer.auth.access_token);
    const [resumes, setResumes] = useState(null); // null = not loaded yet
    const [listError, setListError] = useState(false);

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

    const formatEdited = (iso) => {
        try {
            return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
        } catch (e) {
            return null;
        }
    };

    return (
        <>
            <Nav />
            <section className="py-[6rem] bg-[#EEF0F4]">
                <div className="flex justify-center items-center w-[100vw] min-h-[80vh] ">
                    <div className="flex flex-col justify-center items-center gap-20">
                        <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row justify-start items-center ml-auto mr-auto">
                            <div className="relative w-[100px] md:w-[120px] lg:order-2 lg:w-[310px] xl:w-[340px]">
                                <img src="/blob.svg" alt="blob" className="absolute left-0 right-0 top-0 z-10 w-full" />
                                <div className="relative z-10 mt-2 flex w-full items-center justify-center">
                                    {/* svg2 */}
                                    <img src="/svg2.svg" alt="svg2" className="ml-2 w-4/5 lg:px-1" />
                                </div>
                            </div>

                            <div className="mt-10 w-full md:mt-12 lg:mt-8">
                                <h1 className="text-center text-4xl font-bold md:text-5xl lg:text-left lg:text-5xl">Let&apos;s boost your career</h1>
                                <h2 className="mt-4 text-center text-lg text-gray-500 md:text-xl lg:text-left lg:text-xl">
                                    Showcase your skills and talents. Make a great first impression.
                                </h2>
                            </div>
                        </div>

                        {/*RESUME CARD*/}
                        <div className="ml-auto mr-auto w-full">
                            <h2 className="mx-5 text-2xl font-bold md:mx-0 md:text-3xl lg:text-4xl">Resumes</h2>
                            <p className="mx-5 text-sm text-gray-500 md:mx-0 md:mt-3 md:text-base">
                                Your first resume – 100% free, forever, all features, unlimited downloads, yes really.
                            </p>
                            <div className="mt-6 grid grid-cols-1 justify-start gap-12 md:mt-10 md:grid-cols-[min-content_1fr]">
                                <div className="hidden h-[200px] w-[200px] items-center justify-center rounded-full border-[10px] border-solid border-white md:flex cursor-pointer hover:opacity-80">
                                    <img src="/svg3.svg" alt="svg3" className="w-20" />
                                </div>

                                {/* BOTTOM SECTION */}
                                <div>
                                    <Link
                                        className=" flex items-center rounded-lg px-5 relative w-full min-h-[100px]  border border-dashed border-gray-300 md:h-20 hover:border-brand-400 transition-colors"
                                        href="/resume/create"
                                    >
                                        <div className="mr-3 grow">
                                            <p className="text-lg font-bold md:text-xl ">New resume</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="border-none cursor-pointer appearance-none touch-manipulation flex items-center justify-center focus-visible:outline-blue-600 hover:opacity-80 min-h-[30px] min-w-[30px] text-white h-9 w-20 shrink-0 rounded-full sm:hidden"
                                        >
                                            <img src="/svg5.svg" alt="svg5" className="w-10" />
                                        </button>
                                        <button
                                            type="button"
                                            className="border-none cursor-pointer appearance-none touch-manipulation items-center justify-center focus-visible:outline-blue-600 hover:opacity-80 p-2 rounded-full font-extrabold h-10 text-[15px] min-w-[120px] text-white bg-black hidden w-auto sm:flex"
                                        >
                                            <span className="flex items-center justify-center mr-2 -ml-1 md:mr-3 md:-ml-[6px] pb-0 md:pb-0">
                                                <img src="/svg6.svg" alt="svg6" />
                                            </span>
                                            Create
                                        </button>
                                        <div className="rounded-full bg-brand-600 hover:bg-brand-700 px-3 text-sm font-bold text-white absolute left-8 top-full z-[6] -mt-2 flex w-min shrink space-x-1 sm:left-12 md:-left-8 md:top-0 md:mt-3">
                                            <span className="">free</span>
                                            <span className="ml-1 mt-1 -mr-[3px] h-1 w-1 rounded-full bg-white"></span>
                                        </div>
                                    </Link>

                                    {/* saved resumes */}
                                    {!token && (
                                        <p className="mt-5 text-sm text-gray-500">
                                            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                                                Sign in
                                            </Link>{" "}
                                            to save resumes to your account.
                                        </p>
                                    )}
                                    {token && listError && (
                                        <p className="mt-5 text-sm text-red-600">Couldn&apos;t load your resumes. Refresh to try again.</p>
                                    )}
                                    {token && resumes && resumes.length > 0 && (
                                        <div className="mt-5 space-y-3">
                                            {resumes.map((resume) => {
                                                const edited = formatEdited(resume.updatedAt);
                                                return (
                                                    <div
                                                        key={resume.resume_uid}
                                                        className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 min-h-[72px] hover:border-brand-400 transition-colors"
                                                    >
                                                        <Link href={`/resume/create?rid=${resume.resume_uid}`} className="grow min-w-0">
                                                            <p className="truncate text-lg font-bold">{resume.title}</p>
                                                            {edited && <p className="text-xs text-gray-500">Edited {edited}</p>}
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDuplicate(resume)}
                                                            className="shrink-0 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:border-gray-400 hover:text-black transition-colors"
                                                        >
                                                            Duplicate
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(resume)}
                                                            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {token && resumes && resumes.length === 0 && !listError && (
                                        <p className="mt-5 text-sm text-gray-500">No saved resumes yet — your first save will appear here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default ResumeMain;
