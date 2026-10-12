import { useAppSelector } from "@redux/hooks";
import { updateCustomization } from "@redux/resume/features";
import { FONTS } from "@utils/Constants";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const FontElement = ({ title, setFontFamily, fontFamily }) => {
    const selected = fontFamily.family === title;
    return (
        <button
            type="button"
            aria-pressed={selected}
            aria-label={`${title} font family`}
            className={`border ${selected ? "border-blue-700 bg-blue-100" : "border-gray-300 bg-white"} rounded-xl w-[5rem] h-[5rem] cursor-pointer hover:opacity-80`}
            onClick={() => setFontFamily({ font: null, family: title })}
        >
            <span className={`${selected ? "text-blue-700" : "text-black"} h-full flex flex-col items-center justify-center`}>
                <span className="text-2xl font-semibold">Aa</span>
                <span className="text-sm">{title}</span>
            </span>
        </button>
    );
};

const Font = () => {
    const { font } = useAppSelector((state) => state.persistedReducer.resume.customization);
    const dispatch = useDispatch();
    const [fontFamily, setFontFamily] = useState({ family: font.family || "Serif", font: font.font || "" });

    const handleCustomization = () => {
        dispatch(updateCustomization({ key: "font", value: { family: fontFamily.family, font: fontFamily.font } }));
    };

    useEffect(() => {
        handleCustomization();
    }, [fontFamily]);

    return (
        <section className="bg-white rounded-2xl w-full pt-6 pb-9 px-5 md:px-7 lg:px-9 relative max-w-full mt-4" aria-labelledby="font-heading">
            <h2 id="font-heading" className="text-xl font-bold mb-5">Font</h2>
            <div className="flex gap-[2rem] my-3" role="group" aria-label="Font family">
                <FontElement title="Serif" fontFamily={fontFamily} setFontFamily={setFontFamily} />
                <FontElement title="Sans" fontFamily={fontFamily} setFontFamily={setFontFamily} />
                <FontElement title="Mono" fontFamily={fontFamily} setFontFamily={setFontFamily} />
            </div>
            <div className="w-full max-w-[30rem] grid grid-cols-2 sm:grid-cols-3 gap-4 my-4" role="group" aria-label={`${fontFamily.family} fonts`}>
                {FONTS[fontFamily.family.toLowerCase()].map((c) => (
                    <button
                        type="button"
                        aria-pressed={fontFamily.font === c}
                        onClick={() => setFontFamily({ ...fontFamily, font: c })}
                        key={c}
                        className={`${fontFamily.font === c ? "border-blue-700 bg-blue-100 text-blue-700" : "border-gray-300 bg-white text-black"} cursor-pointer hover:opacity-80 border text-xs rounded-md text-center grid place-content-center w-full h-[40px]`}
                        style={{ fontFamily: c.toLowerCase() }}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default Font;
