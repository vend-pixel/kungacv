import { AVAILABLE_COMPONENTS } from "@utils/Constants";

const MobileNav = ({ currentComponent, setCurrentComponent, setDemo }) => {
    return (
        <nav className="fixed flex flex-col gap-4 sm:hidden right-4 bottom-20 z-[8]" aria-label="Editor sections">
            <button
                type="button"
                aria-label="Edit resume content"
                aria-current={currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "page" : undefined}
                className={`flex flex-col bg-white shadow-xl border rounded-full px-4 py-4 justify-center items-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
                    currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "text-brand-600" : ""
                }`}
                onClick={() => setCurrentComponent(AVAILABLE_COMPONENTS.personalInfo)}
            >
                <img src={currentComponent === AVAILABLE_COMPONENTS.personalInfo ? "/content.svg" : "/content1.svg"} alt="" className="w-8" />
            </button>
            <button
                type="button"
                aria-label="Customize resume"
                aria-current={currentComponent === "CUSTOMIZE" ? "page" : undefined}
                className={`flex flex-col bg-white shadow-xl border rounded-full px-4 py-4 justify-center items-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
                    currentComponent === "CUSTOMIZE" ? "text-brand-600" : ""
                }`}
                onClick={() => setCurrentComponent("CUSTOMIZE")}
            >
                <img src={currentComponent === "CUSTOMIZE" ? "/customize1.svg" : "/customize.svg"} alt="" className="w-8" />
            </button>
            <button
                type="button"
                aria-label="Preview resume"
                className="border-none cursor-pointer appearance-none touch-manipulation flex items-center justify-center focus-visible:outline-blue-600 transition-transform duration-200 hover:scale-[1.03] min-h-[30px] min-w-[30px] text-white bg-primaryBlack px-4 py-4 rounded-full"
                onClick={() => setDemo(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 38" className="w-10" aria-hidden="true">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M33.049 18.226v-5.367l-8.225-8.177H14.025c-3.343 0-6.224 2.587-6.224 5.78v16.642c0 3.373 2.691 6.025 6.224 6.025.825 0 4.442-.06 6.25 0"
                    />
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M24.398 4.663v4.509c0 2.201 1.865 3.987 4.17 3.991 2.137.005 4.323.006 4.471-.003"
                    />
                    <ellipse cx="29.41" cy="28.15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" rx="6.386" ry="5.805" />
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M33.852 32.49l2.503 2.27" />
                </svg>
            </button>
        </nav>
    );
};

export default MobileNav;
