import LegalPage from "@components/Legal/LegalPage";

export const metadata = {
    title: "Terms of Service — KungaCV",
    description: "The terms and conditions that govern your use of KungaCV.",
    alternates: { canonical: "/terms-of-service" },
};

const TermsOfService = () => {
    return (
        <LegalPage title="Terms of Service" lastUpdated="7 October 2026">
            <p>
                These Terms of Service (“Terms”) govern your access to and use of KungaCV (the “Service”), a resume builder available at our website.
                By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
            </p>

            <h2>1. The Service</h2>
            <p>
                KungaCV lets you create, customize, and export resumes from your browser. The Service is provided “as is” and may change over time as
                we add, modify, or remove features.
            </p>

            <h2>2. Accounts</h2>
            <ul>
                <li>You must provide accurate and current information when creating an account.</li>
                <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
                <li>You must be at least 13 years old to use the Service.</li>
                <li>Notify us promptly at contact@kungacv.com if you suspect unauthorised use of your account.</li>
            </ul>

            <h2>3. Free and Pro plans</h2>
            <ul>
                <li>
                    <strong>Free plan:</strong> you can build and export your resume for free, with a discreet KungaCV watermark on exported
                    documents.
                </li>
                <li>
                    <strong>Pro plan:</strong> a paid one-time upgrade (for the pass period shown at checkout) that removes the watermark and unlocks
                    additional Pro features.
                </li>
                <li>Features, availability, and prices may be updated over time. The price and pass period are always shown before you pay.</li>
            </ul>

            <h2>4. Payments</h2>
            <ul>
                <li>Payments are processed by our payment provider, PayChangu. We do not store your full card details.</li>
                <li>Prices are displayed in Malawian Kwacha (MWK) at checkout unless stated otherwise.</li>
                <li>
                    Pro is a one-time purchase for a fixed pass period. We do not auto-renew and will not charge you again — you can buy another pass
                    any time to extend.
                </li>
                <li>You are responsible for any applicable taxes related to your purchase.</li>
            </ul>

            <h2>5. Refunds</h2>
            <p>
                Our refund eligibility and process are described in our <a href="/refund-policy">Refund Policy</a>, which is part of these Terms.
            </p>

            <h2>6. Your content</h2>
            <ul>
                <li>You keep ownership of the resume content and personal information you enter into the Service.</li>
                <li>
                    You grant us a limited licence to host, store, process, and display that content solely to operate and improve the Service for
                    you.
                </li>
                <li>You are responsible for the accuracy of your content and for having the right to include it.</li>
            </ul>

            <h2>7. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
                <li>use the Service for any unlawful, fraudulent, or harmful purpose;</li>
                <li>infringe the intellectual property or privacy rights of others;</li>
                <li>attempt to gain unauthorised access to the Service, other accounts, or our systems;</li>
                <li>scrape, reverse engineer, or resell the Service except where we give written permission;</li>
                <li>interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>

            <h2>8. Our intellectual property</h2>
            <p>
                The Service, including its branding, interface, and resume template designs, is owned by us or our licensors and is protected by
                intellectual property laws. These Terms do not transfer any of our intellectual property to you.
            </p>

            <h2>9. Third-party services</h2>
            <p>
                The Service relies on third-party providers (for example, payment processing and hosting). Our use of them is described in our{" "}
                <a href="/privacy-policy">Privacy Policy</a>. Links to third-party sites are provided for convenience; we are not responsible for
                their content.
            </p>

            <h2>10. Suspension and termination</h2>
            <ul>
                <li>You may stop using the Service at any time and request account deletion (see the Privacy Policy).</li>
                <li>We may suspend or terminate access if you breach these Terms, if required by law, or to protect the Service and its users.</li>
                <li>Sections that by their nature should survive termination (including content licences and liability limits) will survive.</li>
            </ul>

            <h2>11. Disclaimers and liability</h2>
            <ul>
                <li>We do not guarantee any particular hiring outcome, ATS result, or uninterrupted availability of the Service.</li>
                <li>
                    To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages, and our total
                    liability for claims relating to the Service is limited to the amount you paid us in the 12 months before the claim arose (or MWK
                    0 if you have paid nothing).
                </li>
                <li>Nothing in these Terms excludes liability that cannot be excluded under applicable law.</li>
            </ul>

            <h2>12. Changes to these Terms</h2>
            <p>
                We may update these Terms from time to time. Material changes will be announced on this page with an updated date. Continued use of
                the Service after changes take effect means you accept the updated Terms.
            </p>

            <h2>13. Governing law</h2>
            <p>These Terms are governed by the laws of Malawi, without regard to conflict-of-law rules.</p>

            <h2>14. Contact</h2>
            <p>
                Questions about these Terms: <a href="mailto:contact@kungacv.com">contact@kungacv.com</a>.
            </p>
        </LegalPage>
    );
};

export default TermsOfService;
