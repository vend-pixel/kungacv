import Link from "next/link";
import Logo from "../Logo";

const LegalPage = ({ title, lastUpdated, children }) => {
    return (
        <div className="min-h-screen bg-white text-ink-900 flex flex-col">
            <header className="bg-ink-950">
                <div className="pageContainer flex items-center justify-between py-5">
                    <Link href="/" aria-label="KungaCV home">
                        <Logo variant="dark" size="sm" />
                    </Link>
                    <nav className="flex gap-6 text-sm text-ink-300">
                        <Link href="/terms-of-service" className="hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link href="/privacy-policy" className="hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link href="/refund-policy" className="hover:text-white transition-colors">
                            Refunds
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pageContainer grow max-w-3xl py-12 md:py-16">
                <h1 className="text-3xl md:text-4xl font-extrabold text-ink-950">{title}</h1>
                <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
                <div className="legal-content mt-8">{children}</div>
            </main>

            <footer className="border-t border-gray-200">
                <div className="pageContainer max-w-3xl py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} KungaCV. All rights reserved.</p>
                    <div className="flex gap-5">
                        <Link href="/terms-of-service" className="hover:text-brand-600">
                            Terms of Service
                        </Link>
                        <Link href="/privacy-policy" className="hover:text-brand-600">
                            Privacy Policy
                        </Link>
                        <Link href="/refund-policy" className="hover:text-brand-600">
                            Refund Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LegalPage;
