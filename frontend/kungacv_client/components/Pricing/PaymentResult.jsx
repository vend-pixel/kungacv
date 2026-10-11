"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@redux/hooks";
import { setIsPro } from "@redux/auth/features";
import { apiFetch } from "@utils/api";
import { trackEvent } from "@utils/analytics";
import Logo from "../Logo";

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 2500;

const PaymentResult = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.persistedReducer.auth.userData?.access_token);

    const [phase, setPhase] = useState("checking"); // checking | success | failed | waiting | error | unsigned
    const [txRef, setTxRef] = useState(null);
    const trackedRef = useRef(false);

    const checkStatus = useCallback(
        async (ref, attempt = 0) => {
            try {
                const data = await apiFetch(`/payments/${encodeURIComponent(ref)}/status`, {}, accessToken);
                const status = data?.payment?.status;

                if (status === "success") {
                    dispatch(setIsPro(true));
                    if (!trackedRef.current) {
                        trackedRef.current = true;
                        trackEvent("checkout_completed", { plan: "pro", currency: "MWK", tx_ref: ref });
                    }
                    setPhase("success");
                    return;
                }
                if (status === "failed") {
                    setPhase("failed");
                    return;
                }
            } catch (err) {
                const message = String(err.message || "");
                if (message.includes("404") || message.includes("not found")) {
                    setPhase("error");
                    return;
                }
                // transient network/gateway error — keep polling while attempts remain
            }

            if (attempt + 1 >= MAX_POLL_ATTEMPTS) {
                setPhase("waiting");
                return;
            }

            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            checkStatus(ref, attempt + 1);
        },
        [accessToken, dispatch]
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get("tx_ref") || params.get("transaction_id");
        const urlStatus = params.get("status");

        if (!accessToken) {
            setPhase("unsigned");
            return;
        }

        if (ref) {
            setTxRef(ref);
            checkStatus(ref);
            return;
        }

        if (urlStatus === "failed") {
            setPhase("failed");
            return;
        }

        setPhase("error");
    }, [accessToken, checkStatus]);

    const retryNow = () => {
        if (!txRef) return;
        setPhase("checking");
        checkStatus(txRef);
    };

    if (phase === "unsigned") {
        return (
            <ResultShell>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">Sign in to confirm your payment</h1>
                <p className="mt-3 text-gray-600">We need your account to verify this transaction and unlock Pro downloads.</p>
                <PrimaryLink href="/login">Sign in</PrimaryLink>
            </ResultShell>
        );
    }

    if (phase === "success") {
        return (
            <ResultShell>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white text-2xl font-extrabold">
                    ✓
                </span>
                <h1 className="mt-5 text-2xl md:text-3xl font-extrabold text-ink-950">Payment confirmed — you&apos;re Pro!</h1>
                <p className="mt-3 text-gray-600">Your watermark-free downloads are unlocked. {txRef ? `Receipt reference: ${txRef}` : ""}</p>
                <PrimaryLink href="/resume/create">Back to the editor</PrimaryLink>
            </ResultShell>
        );
    }

    if (phase === "failed") {
        return (
            <ResultShell>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">Payment not completed</h1>
                <p className="mt-3 text-gray-600">You were not charged, or the payment failed. You can try again whenever you&apos;re ready.</p>
                <PrimaryLink href="/pricing">Back to pricing</PrimaryLink>
            </ResultShell>
        );
    }

    if (phase === "waiting") {
        return (
            <ResultShell>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">Still confirming…</h1>
                <p className="mt-3 text-gray-600">The gateway hasn&apos;t confirmed this payment yet. This can take a moment.</p>
                <button
                    type="button"
                    onClick={retryNow}
                    className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3 font-bold text-white hover:bg-brand-700 transition-colors"
                >
                    Check again
                </button>
            </ResultShell>
        );
    }

    if (phase === "error") {
        return (
            <ResultShell>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">We couldn&apos;t find that payment</h1>
                <p className="mt-3 text-gray-600">
                    If you completed a purchase, it will be confirmed shortly — check your pricing page or contact support.
                </p>
                <PrimaryLink href="/pricing">Back to pricing</PrimaryLink>
            </ResultShell>
        );
    }

    return (
        <ResultShell>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950">Confirming your payment…</h1>
            <p className="mt-3 text-gray-600">Hang tight while we verify this transaction with PayChangu.</p>
            <span className="mt-6 block h-2 w-40 overflow-hidden rounded-full bg-gray-200">
                <span className="block h-full w-1/3 animate-pulse bg-brand-600" />
            </span>
        </ResultShell>
    );
};

const ResultShell = ({ children }) => (
    <div className="min-h-screen bg-white text-ink-900 flex flex-col">
        <header className="bg-ink-950">
            <div className="pageContainer py-5">
                <Link href="/" aria-label="KungaCV home">
                    <Logo variant="dark" size="sm" />
                </Link>
            </div>
        </header>
        <main className="pageContainer grow py-16">
            <div className="max-w-xl mx-auto text-center flex flex-col items-center">{children}</div>
        </main>
        <footer className="border-t border-gray-200">
            <div className="pageContainer py-6 text-sm text-gray-500">© {new Date().getFullYear()} KungaCV. All rights reserved.</div>
        </footer>
    </div>
);

const PrimaryLink = ({ href, children }) => (
    <Link
        href={href}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-brand-600 px-7 py-3 font-bold text-white hover:bg-brand-700 transition-colors"
    >
        {children}
    </Link>
);

export default PaymentResult;
