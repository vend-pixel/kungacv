import { useId } from "react";

const MARK_SIZES = { sm: "h-8", md: "h-9", lg: "h-11" };
const TEXT_SIZES = { sm: "text-lg", md: "text-xl", lg: "text-[1.7rem]" };

/**
 * KungaCV logo — blue "K" (logo gradient) with a document/person glyph behind it.
 * `variant`: "light" for light backgrounds (ink wordmark), "dark" for ink backgrounds (white wordmark).
 */
const Logo = ({ variant = "light", size = "md", markOnly = false, className = "" }) => {
    const gradientId = useId().replace(/:/g, "");
    const onDark = variant === "dark";
    const docFill = onDark ? "#FFFFFF" : "#0A0A0B";
    const glyphFill = onDark ? "#0A0A0B" : "#FFFFFF";

    return (
        <span
            className={`inline-flex items-center gap-2 font-extrabold leading-none tracking-tight ${MARK_SIZES[size]} ${className}`}
            aria-label="KungaCV"
        >
            <svg viewBox="0 0 64 64" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                <defs>
                    <linearGradient id={gradientId} x1="8" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38A0FF" />
                        <stop offset="1" stopColor="#0040D0" />
                    </linearGradient>
                </defs>
                <rect x="5" y="8" width="12" height="48" rx="2" fill={`url(#${gradientId})`} />
                <path d="M17 32L34 8H46L29 32H17Z" fill={`url(#${gradientId})`} />
                <path d="M17 32H29L46 56H34L17 32Z" fill={`url(#${gradientId})`} />
                <path d="M48 9H59a3 3 0 0 1 3 3v44a3 3 0 0 1-3 3H40a3 3 0 0 1-3-3V23L48 9Z" fill={docFill} />
                <circle cx="49.5" cy="31" r="5.5" fill={glyphFill} />
                <rect x="43" y="40" width="14" height="3" rx="1.5" fill={glyphFill} />
                <rect x="43" y="45.5" width="14" height="3" rx="1.5" fill={glyphFill} />
                <rect x="43" y="51" width="9" height="3" rx="1.5" fill={glyphFill} />
            </svg>
            {!markOnly && (
                <span className={`${TEXT_SIZES[size]} ${onDark ? "text-white" : "text-ink-950"}`}>
                    Kunga<span className={onDark ? "text-brand-400" : "text-brand-700"}>CV</span>
                </span>
            )}
        </span>
    );
};

export default Logo;
