import Link from "next/link";

const templates = [
    { id: 1, name: "Classic Blue", category: "Simple" },
    { id: 2, name: "Sage Sidebar", category: "Modern" },
    { id: 3, name: "Warm Dots", category: "Creative" },
    { id: 4, name: "Editorial Frame", category: "Simple" },
];

const TemplatesSection = () => {
    return (
        <section className="pageContainer pt-4 pb-12 md:pt-8 lg:pb-28 lg:pt-28" aria-labelledby="templates-heading">
            <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Made to be customized</p>
                <h2 id="templates-heading" className="mt-3 text-3xl font-extrabold xl:text-4xl">Start with a look you like</h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-gray-500 md:text-xl">Preview a few directions, then browse the full collection inside the builder. Your details start blank.</p>
                <div className="mt-6 h-[2px] w-[3rem] bg-brand-600" />
            </div>
            <div className="mx-auto my-8 grid w-full max-w-[1040px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {templates.map(({ id, name, category }) => (
                    <Link key={id} href={`/resume/create?template=${id}`} className="group rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600" aria-label={`Preview and use ${name} template`}>
                        <div className="relative overflow-hidden rounded-xl bg-blue-50">
                            <img src={`/templates/template-${String(id).padStart(2, "0")}.webp`} alt={`${name} resume template preview`} width={381} height={380} loading={id > 2 ? "lazy" : "eager"} className="aspect-[0.78] w-full object-cover object-top transition-transform group-hover:scale-[1.03]" />
                            <span className="absolute bottom-2 left-2 rounded-full bg-brand-600 px-2.5 py-1 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">Use this look</span>
                        </div>
                        <div className="px-2 pb-2 pt-3 text-left"><p className="font-bold">{name}</p><p className="mt-1 text-xs text-gray-500">{category} · Live preview</p></div>
                    </Link>
                ))}
            </div>
            <div className="flex justify-center"><Link href="/resume" className="inline-flex items-center rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700">Browse all templates</Link></div>
        </section>
    );
};

export default TemplatesSection;
