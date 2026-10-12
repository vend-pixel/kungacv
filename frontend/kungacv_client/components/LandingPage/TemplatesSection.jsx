import Link from "next/link";

const templates = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    image: `/templates/template-${String(index + 1).padStart(2, "0")}.webp`,
}));

const TemplatesSection = () => {
    return (
        <section className="pageContainer pt-4 md:pt-8 pb-12 lg:pt-28 lg:pb-28" aria-labelledby="templates-heading">
            <div className="flex flex-col justify-center items-center">
                <h2 id="templates-heading" className="text-3xl xl:text-4xl font-extrabold">
                    Free resume templates
                </h2>
                <p className="mt-4 leading-relaxed md:text-xl text-gray-500">Choose a template and customize it quickly</p>
                <div className="mt-6 md:mt-7 lg:mt-8 h-[2px] w-[3rem] bg-black" />
            </div>
            <div className="w-full max-w-[1200px] mx-auto my-6 md:my-7 lg:my-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 justify-center gap-8">
                    {templates.map(({ id, image }) => (
                        <Link
                            key={id}
                            href={`/resume/create?template=${id}`}
                            className="group rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                            aria-label={`Use resume template ${id}`}
                        >
                            <img
                                src={image}
                                alt={`Resume template ${id} preview`}
                                width={381}
                                height={380}
                                loading={id > 3 ? "lazy" : "eager"}
                                className="w-full shadow-gray-400 shadow-lg transition-transform group-hover:-translate-y-1"
                            />
                            <span className="sr-only">Use this template</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TemplatesSection;
