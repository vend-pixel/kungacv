"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@redux/hooks";
import { apiFetch, PRO_PRICE_MWK, PRO_PASS_DAYS } from "@utils/api";
import { trackEvent } from "@utils/analytics";
import Logo from "../Logo";

const PricingCheckout = () => {
    const router = useRouter();
    const isPro = useAppSelector((state) => state.persistedReducer.auth.isPro);
    const accessToken = useAppSelector((state) => state.persistedReducer.auth.userData?.access_token);

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        apiFetch("/payments/plans")
            .then((data) => {
                if (!cancelled) setPlan(data?.plans?.[0] || null);
            })
            .catch(() => {
                if (!cancelled) setPlan(null); // fall back to display constants
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const price = plan?.price || PRO_PRICE_MWK;
    const days = plan?.days || PRO_PASS_DAYS;

    const handleUpgrade = async () => {
        if (!accessToken) {
            router.push("/login");
            return;
        }

        setStarting(true);
        setError("");

        try {
            const data = await apiFetch(
                "/payments/initiate",
                {
                    method: "POST",
                    body: JSON.stringify({ plan: "pro" }),
                },
                accessToken
            );

            const checkoutUrl = data?.payment?.checkout_url;
            if (!checkoutUrl) throw new Error("no checkout url returned");
            trackEvent("checkout_initiated", { plan: "pro", price_mwk: price, currency: "MWK" });
            setTimeout(() => {
                window.location.href = checkoutUrl;
            }, 300);
        } catch (err) {
            setError(err.message || "could not start checkout");
            setStarting(false);
        }
    };

    const freeFeatures = ["Build and edit your resume", "Autosave in your browser", "Watermarked PDF download", "Core resume sections"];

    const proFeatures = ["Watermark-free PDF download", "All templates and layouts", "Everything in Free", `One-time payment — no auto-renewal`];

    return (
        <div className="min-h-screen bg-white text-ink-900 flex flex-col">
            <header className="bg-ink-950">
                <div className="pageContainer flex items-center justify-between py-5">
                    <Link href="/" aria-label="KungaCV home">
                        <Logo variant="dark" size="sm" />
                    </Link>
                    <nav className="flex gap-6 text-sm text-ink-300">
                        <Link href="/" className="hover:text-white transition-colors">
                            Home
                        </Link>
                        <Link href="/resume" className="hover:text-white transition-colors">
                            My resumes
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pageContainer grow py-12 md:py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-ink-950">One plan. No subscriptions.</h1>
                    <p className="mt-3 text-gray-600">Pay once with PayChangu (card or mobile money) and download your resume without a watermark.</p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                    {/* Free */}
                    <div className="rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col">
                        <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Free</p>
                        <p className="mt-2 text-4xl font-extrabold text-ink-950">
                            MWK 0<span className="text-base font-semibold text-gray-500"> forever</span>
                        </p>
                        <ul className="mt-6 space-y-3 text-[15px] text-gray-700 grow">
                            {freeFeatures.map((feature) => (
                                <li key={feature} className="flex gap-3">
                                    <span className="text-brand-600 font-bold">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/resume"
                            className="mt-8 inline-flex items-center justify-center rounded-full border border-ink-950 px-6 py-3 font-bold text-ink-950 hover:bg-ink-950 hover:text-white transition-colors"
                        >
                            Start for free
                        </Link>
                    </div>

                    {/* Pro */}
                    <div className="rounded-2xl border-2 border-brand-600 p-6 md:p-8 flex flex-col relative">
                        <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white">Most popular</span>
                        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Pro {days}-day pass</p>
                        <p className="mt-2 text-4xl font-extrabold text-ink-950">
                            MWK {price.toLocaleString()}
                            <span className="text-base font-semibold text-gray-500"> once</span>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">No auto-renewal. Buy again any time to extend.</p>
                        <ul className="mt-6 space-y-3 text-[15px] text-gray-700 grow">
                            {proFeatures.map((feature) => (
                                <li key={feature} className="flex gap-3">
                                    <span className="text-brand-600 font-bold">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {isPro && <p className="mt-6 text-sm font-semibold text-brand-700">Your Pro pass is active — buying again extends it.</p>}
                        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
                        <button
                            type="button"
                            onClick={handleUpgrade}
                            disabled={starting || loading}
                            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700 transition-colors disabled:opacity-60"
                        >
                            {starting ? "Redirecting…" : !accessToken ? "Sign in to upgrade" : isPro ? "Extend Pro" : "Get Pro"}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500 max-w-2xl mx-auto">
                    Payments are processed securely by PayChangu. Not satisfied? See our{" "}
                    <Link href="/refund-policy" className="text-brand-600 hover:underline">
                        refund policy
                    </Link>
                    .
                </p>
            </main>

            <footer className="border-t border-gray-200">
                <div className="pageContainer py-6 text-sm text-gray-500">© {new Date().getFullYear()} KungaCV. All rights reserved.</div>
            </footer>
        </div>
    );
};

export default PricingCheckout;
