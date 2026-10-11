"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import TemplateDemo from "@components/ResumeComponents/TemplateDemo";
import { hydrateResume } from "@redux/resume/features";
import templatePresets from "@utils/templatePresets";

const PreviewClient = () => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const requestedPreset = Number(searchParams.get("preset"));
    const preset = useMemo(() => templatePresets.find((item) => item.id === requestedPreset) || templatePresets[0], [requestedPreset]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(false);
        dispatch(hydrateResume({ resume_uid: null, title: preset.name, content: preset.data }));
        const frame = window.requestAnimationFrame(() => setReady(true));
        return () => window.cancelAnimationFrame(frame);
    }, [dispatch, preset]);

    if (!ready) return null;
    const { customization } = preset.data;
    return (
        <main className="min-h-screen bg-slate-200 py-8">
            <div
                id="resume-preview"
                data-preset={preset.id}
                className="mx-auto min-h-[1200px] w-[850px] bg-white px-12 py-8 shadow-xl"
                style={{ color: "#1f2937", borderTop: `14px solid ${customization.colors.accentColorValue}`, fontFamily: customization.font.font }}
            >
                <TemplateDemo resumeData={preset.data} />
            </div>
        </main>
    );
};

export default PreviewClient;
