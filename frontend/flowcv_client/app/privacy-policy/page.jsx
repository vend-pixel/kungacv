import LegalPage from "@components/Legal/LegalPage";

export const metadata = {
    title: "Privacy Policy — KungaCV",
    description: "How KungaCV collects, uses, stores, and protects your personal information.",
    alternates: { canonical: "/privacy-policy" },
};

const PrivacyPolicy = () => {
    return (
        <LegalPage title="Privacy Policy" lastUpdated="7 October 2026">
            <p>
                This Privacy Policy explains what personal information KungaCV (the “Service”) collects, how we use it, who we share it with, and the
                rights you have. By using the Service you agree to the practices described here.
            </p>

            <h2>1. Information we collect</h2>
            <ul>
                <li>
                    <strong>Account information:</strong> your name, email address, and password (stored in hashed form).
                </li>
                <li>
                    <strong>Resume content:</strong> the personal details, work history, education, and other information you choose to enter into
                    your resume.
                </li>
                <li>
                    <strong>Payment information:</strong> payments are handled by our provider PayChangu. We receive payment confirmations and basic
                    transaction details, but we do not store your full card number.
                </li>
                <li>
                    <strong>Technical and usage data:</strong> log data such as IP address, browser type, pages viewed, and approximate location
                    derived from IP, used to secure and improve the Service.
                </li>
                <li>
                    <strong>Local storage:</strong> we store your resume draft, preferences, and login token in your browser’s local storage so your
                    work persists between visits on that device.
                </li>
            </ul>

            <h2>2. How we use your information</h2>
            <ul>
                <li>To provide, save, and export your resume;</li>
                <li>To create and secure your account (including authentication and fraud prevention);</li>
                <li>To process payments and deliver Pro features;</li>
                <li>To understand how the Service is used and improve it;</li>
                <li>To respond to your questions, feedback, and support requests;</li>
                <li>To comply with legal obligations.</li>
            </ul>
            <p>
                Where data protection law requires a legal basis, we rely on performance of our contract with you, legitimate interests in running and
                securing the Service, or your consent (for example, optional communications).
            </p>

            <h2>3. What we do not do</h2>
            <ul>
                <li>We do not sell your personal information or resume content.</li>
                <li>We do not use the content of your resume to train third-party AI models.</li>
                <li>We do not share your data with advertisers.</li>
            </ul>

            <h2>4. Sharing of information</h2>
            <ul>
                <li>
                    <strong>PayChangu</strong> — payment processing; they receive the information needed to charge you and issue refunds.
                </li>
                <li>
                    <strong>Hosting and infrastructure providers</strong> — who store and process data on our behalf under contract.
                </li>
                <li>
                    <strong>Analytics providers</strong> — to understand aggregate usage of the Service (we do not sell this data).
                </li>
                <li>
                    <strong>Authorities</strong> — where we are legally required to disclose information, or to protect the rights, safety, and
                    property of KungaCV, our users, or the public.
                </li>
            </ul>

            <h2>5. International transfers</h2>
            <p>
                Our servers and service providers may process information in countries other than yours. Where required, we use appropriate safeguards
                for such transfers.
            </p>

            <h2>6. Retention</h2>
            <ul>
                <li>Account and resume data are kept while your account is active.</li>
                <li>Payment records are retained as required by law and for fraud prevention.</li>
                <li>You can delete your account and data at any time (see Section 7); deletions are propagated to backups on a rolling schedule.</li>
            </ul>

            <h2>7. Your rights</h2>
            <p>Subject to applicable law, you can:</p>
            <ul>
                <li>Access a copy of the personal information we hold about you;</li>
                <li>Correct inaccurate information;</li>
                <li>Delete your account and associated data;</li>
                <li>Withdraw consent where processing is based on consent;</li>
                <li>Object to or restrict certain processing.</li>
            </ul>
            <p>
                To exercise these rights, email <a href="mailto:contact@kungacv.com">contact@kungacv.com</a> from the address registered on your
                account. You can also delete your account from within the Service.
            </p>

            <h2>8. Security</h2>
            <p>
                We use industry-standard measures to protect your information, including HTTPS encryption in transit, hashed passwords, and
                token-based authentication. No system is completely secure, so please use a strong, unique password and notify us of any suspected
                compromise.
            </p>

            <h2>9. Cookies and local storage</h2>
            <ul>
                <li>
                    <strong>Local storage:</strong> keeps you signed in and preserves your resume draft on your device. You can clear it through your
                    browser settings (this signs you out and clears the local draft).
                </li>
                <li>
                    <strong>Cookies:</strong> we use strictly necessary cookies for security and session handling. Any optional analytics is
                    configured to respect applicable consent requirements.
                </li>
            </ul>

            <h2>10. Children</h2>
            <p>The Service is not directed at children under 13, and we do not knowingly collect information from them.</p>

            <h2>11. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. Material changes will be announced on this page with an updated date.</p>

            <h2>12. Contact</h2>
            <p>
                Privacy questions and data requests: <a href="mailto:contact@kungacv.com">contact@kungacv.com</a>.
            </p>
        </LegalPage>
    );
};

export default PrivacyPolicy;
