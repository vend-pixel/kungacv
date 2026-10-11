const steps = [
    {
        number: "01",
        title: "Add your details",
        description: "Fill in guided sections for experience, education, skills and more — no blank pages, no guesswork.",
    },
    {
        number: "02",
        title: "Make it yours",
        description: "Pick a template, then tune colours, fonts, spacing and section order with live preview as you go.",
    },
    {
        number: "03",
        title: "Download & apply",
        description: "Export a clean, ATS-readable PDF in seconds — your CV is always ready for the next opportunity.",
    },
];

const HowItWorks = () => {
    return (
        <section className="pageContainer pt-4 md:pt-8 pb-12 lg:pt-28 lg:pb-28 flex flex-col justify-center items-center">
            <h2 className="text-3xl xl:text-4xl font-extrabold">From blank page to job-winning CV</h2>
            <p className="mt-4 leading-relaxed md:text-xl text-gray-500">Three simple steps, no design skills required</p>
            <div className="mt-6 md:mt-7 lg:mt-8 h-[2px] w-[3rem] bg-brand-600"></div>
            <div className="mt-8 md:mt-10 lg:mt-12 w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step) => (
                    <div key={step.number} className="rounded-md border border-gray-200 bg-white p-7">
                        <p className="text-4xl font-extrabold text-brand-600">{step.number}</p>
                        <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                        <p className="mt-2 leading-relaxed text-gray-500">{step.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
