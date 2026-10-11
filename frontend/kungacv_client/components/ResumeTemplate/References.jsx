import { useAppSelector } from "@redux/hooks";
import { HEADING_LAYOUT } from "@utils/Constants";
import React from "react";
import { FaUserFriends } from "react-icons/fa";

const References = ({ spacing, heading }) => {
    const data = useAppSelector((state) => state.persistedReducer.resume.references) || [];

    return data.filter((c) => c.visible).length ? (
        <div className="mt-4">
            <h1
                className={`font-semibold flex gap-2 items-center text-sm ${HEADING_LAYOUT[heading.style]} ${
                    heading.textTransform?.toLowerCase() || "capitalize"
                }`}
                style={{
                    textTransform: `${heading.textTransform?.toLowerCase()}`,
                    lineHeight: `${spacing.value.lineHeight}rem`,
                    fontSize: `${
                        spacing.value.fontSize +
                        0.5 +
                        (heading.size === "S" ? -1 : heading.size === "M" ? -0.5 : heading.size === "L" ? 0.5 : heading.size === "XL" ? 1 : 0)
                    }pt`,
                    borderTop: `${heading.style === 3 ? "2px solid #111" : ""} `,
                    borderBottom: `${heading.style === 3 ? "2px solid #111" : ""} `,
                }}
            >
                {heading.icons && <FaUserFriends className="text-lg" />} References
            </h1>
            {heading.style === 4 && <div className="w-[2.6em] mt-[3px] border-b-[6px] border-black rounded-[1px]"></div>}
            <div className="w-full">
                {data
                    .filter((c) => c.visible)
                    .map((c) => {
                        const meta = [c.jobTitle, c.organization].filter(Boolean).join(" · ");
                        const contact = [c.email, c.phone].filter(Boolean).join(" · ");

                        return (
                            <div
                                key={c.id}
                                className="my-2 text-xs break-words break-inside-avoid"
                                style={{ lineHeight: `${spacing.value.lineHeight}rem` }}
                            >
                                <div className="font-semibold">{c.name}</div>
                                {meta && <div>{meta}</div>}
                                {contact && <div>{contact}</div>}
                            </div>
                        );
                    })}
            </div>
        </div>
    ) : (
        <></>
    );
};

export default References;
