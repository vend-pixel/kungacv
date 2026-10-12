const questions = [
    {
        question: "Can I create a resume without an account?",
        answer: "Yes. Start locally without an account, then create an account when you want to save and manage resumes across devices.",
    },
    {
        question: "Can I download my resume as a PDF?",
        answer: "Yes. Use the Download action in the editor to print or save your resume as a PDF.",
    },
    {
        question: "Can I customize the templates?",
        answer: "Yes. You can change layout, colors, fonts, spacing, and resume sections while previewing the result live.",
    },
];

const FAQ = () => (
    <section className="pageContainer py-12 lg:py-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-3xl xl:text-4xl font-extrabold text-center">
            Frequently asked questions
        </h2>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-gray-200 rounded-2xl bg-white shadow-sm">
            {questions.map(({ question, answer }) => (
                <details key={question} className="group p-5">
                    <summary className="cursor-pointer list-none pr-8 text-lg font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
                        {question}
                        <span aria-hidden="true" className="float-right text-brand-600 group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 max-w-2xl leading-relaxed text-gray-600">{answer}</p>
                </details>
            ))}
        </div>
    </section>
);

export default FAQ;
