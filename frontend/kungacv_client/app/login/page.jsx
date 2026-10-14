"use client";
import Nav from "@components/Nav";
import { API_BASE } from "@utils/api";
import { addUserData } from "@redux/auth/features";
import { useAppSelector } from "@redux/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const userData = useAppSelector((state) => state.persistedReducer.auth.userData);
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") || "/";

    useEffect(() => {
        if (userData.access_token) router.replace(returnTo);
    }, [returnTo, router, userData.access_token]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (!email.trim()) nextErrors.email = "Enter the email address you used to create your account.";
        if (!password) nextErrors.password = "Enter your password to continue.";
        setFieldErrors(nextErrors);
        setError("");
        if (Object.keys(nextErrors).length) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                headers: { "content-type": "application/json" },
                method: "POST",
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.access_token || !data.user) throw new Error(data.message || "We couldn't sign you in. Check your details and try again.");
            dispatch(addUserData(data));
            router.replace(returnTo);
        } catch (err) {
            setError(err.message || "We couldn't sign you in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Nav />
            <main className="auth-page flex min-h-[80vh] w-full flex-col items-center justify-center px-4 py-10">
                <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg rounded-[1rem] bg-white p-8 shadow-md sm:p-12 md:p-14">
                    <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">Welcome back</p>
                    <h1 className="text-center text-[32px] font-bold text-primaryBlack">Log in</h1>
                    <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-gray-500">Continue building the document you were working on.</p>
                    {error && <div className="auth-error mt-6" role="alert">{error}</div>}
                    <div className="mt-10 space-y-7">
                        <div>
                            <label htmlFor="emailId" className="field-label">Email</label>
                            <input id="emailId" name="email" type="email" autoComplete="email" className={`auth-input ${fieldErrors.email ? "auth-input-error" : ""}`} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} />
                            {fieldErrors.email && <p id="email-error" className="auth-field-error">{fieldErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="passwordId" className="field-label">Password</label>
                            <input id="passwordId" name="password" type="password" autoComplete="current-password" className={`auth-input ${fieldErrors.password ? "auth-input-error" : ""}`} placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "password-error" : undefined} />
                            {fieldErrors.password && <p id="password-error" className="auth-field-error">{fieldErrors.password}</p>}
                        </div>
                    </div>
                    <div className="mt-4 text-right"><a className="text-sm font-bold text-brand-700 hover:underline" href="/forgot-password">Forgot password?</a></div>
                    <button type="submit" disabled={loading} className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 px-7 text-[17px] font-extrabold text-white shadow-product transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in…" : "Log in"}</button>
                    <p className="mt-8 text-center text-sm text-gray-600">New to KungaCV? <a className="font-bold text-primaryBlack hover:underline" href={`/signup?returnTo=${encodeURIComponent(returnTo)}`}>Create an account</a></p>
                </form>
            </main>
        </>
    );
};
export default LoginPage;
