"use client";
import Nav from "@components/Nav";
import { API_BASE } from "@utils/api";
import { addUserData } from "@redux/auth/features";
import { trackEvent } from "@utils/analytics";
import { useAppSelector } from "@redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

const SignUp = () => {
    const userData = useAppSelector((state) => state.persistedReducer.auth.userData);
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const dispatch = useDispatch();
    const passwordChecks = useMemo(() => ({ length: password.length >= 8, number: /\d/.test(password), letter: /[A-Za-z]/.test(password) }), [password]);

    useEffect(() => {
        if (userData.access_token) router.replace(returnTo);
    }, [returnTo, router, userData.access_token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!email.trim()) nextErrors.email = "Enter an email address.";
        if (!password) nextErrors.password = "Create a password to continue.";
        else if (!passwordChecks.length || !passwordChecks.number || !passwordChecks.letter) nextErrors.password = "Use at least 8 characters with a letter and a number.";
        setFieldErrors(nextErrors);
        setError("");
        if (Object.keys(nextErrors).length) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/signup`, {
                headers: { "content-type": "application/json" },
                method: "POST",
                body: JSON.stringify({ email: email.trim(), password, name: "NOT PROVIDED" }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.access_token || !data.user) throw new Error(data.message || "We couldn't create your account. Please try again.");
            dispatch(addUserData(data));
            trackEvent("signup");
            router.replace(returnTo);
        } catch (err) {
            setError(err.message || "We couldn't create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav />
            <main className="auth-page flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-10">
                <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg rounded-[1rem] bg-white p-8 shadow-md sm:p-12 md:p-14">
                    <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Save your progress</p>
                    <h1 className="text-center text-[32px] font-bold text-primaryBlack">Create account</h1>
                    <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-gray-500">Sync resumes across devices and keep your application materials organised.</p>
                    {error && <div className="auth-error mt-6" role="alert">{error}</div>}
                    <div className="mt-10 space-y-7">
                        <div>
                            <label htmlFor="emailId" className="field-label">Email</label>
                            <input id="emailId" name="email" type="email" autoComplete="email" className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(fieldErrors.email)} />
                            {fieldErrors.email && <p className="auth-field-error">{fieldErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="passwordId" className="field-label">Password</label>
                            <div className="relative"><input id="passwordId" name="password" type={show ? "text" : "password"} autoComplete="new-password" className={`auth-input pr-16 ${fieldErrors.password ? "auth-input-error" : ""}`} placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.password)} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-700" onClick={() => setShow((current) => !current)}>{show ? "Hide" : "Show"}</button></div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-bold"><span className={passwordChecks.length ? "auth-check auth-check-on" : "auth-check"}>8+ chars</span><span className={passwordChecks.letter ? "auth-check auth-check-on" : "auth-check"}>A letter</span><span className={passwordChecks.number ? "auth-check auth-check-on" : "auth-check"}>A number</span></div>
                            {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
                        </div>
                    </div>
                    <label className="mt-7 flex items-start gap-2 text-sm text-gray-600"><input type="checkbox" name="productUpdateNotifications" className="mt-1" /><span>Get KungaCV updates. No spam ever.</span></label>
                    <button type="submit" disabled={loading} className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 px-7 text-[17px] font-extrabold text-white shadow-product transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Creating account…" : "Create account"}</button>
                    <p className="mt-8 text-center text-sm text-gray-600">Already have an account? <a className="font-bold text-primaryBlack hover:underline" href={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Log in</a></p>
                    <p className="mt-6 text-center text-xs leading-5 text-gray-500">By creating an account, you agree to our <a className="font-bold underline" href="/terms-of-service">Terms</a> and <a className="font-bold underline" href="/privacy-policy">Privacy Policy</a>.</p>
                </form>
            </main>
        </>
    );
};
export default SignUp;
