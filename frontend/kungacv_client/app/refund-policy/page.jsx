import LegalPage from "@components/Legal/LegalPage";

export const metadata = {
    title: "Refund Policy — KungaCV",
    description: "When and how you can get a refund for a KungaCV Pro purchase.",
    alternates: { canonical: "/refund-policy" },
};

const RefundPolicy = () => {
    return (
        <LegalPage title="Refund Policy" lastUpdated="7 October 2026">
            <p>
                We want you to be happy with KungaCV Pro. This policy explains when a refund is available and how to request one. It forms part of our{" "}
                <a href="/terms-of-service">Terms of Service</a>.
            </p>

            <h2>1. Eligibility</h2>
            <ul>
                <li>First-time Pro purchases are eligible for a full refund if requested within 7 days of purchase.</li>
                <li>The refund is issued in the original currency (Malawian Kwacha) through our payment provider, PayChangu.</li>
                <li>One refund per customer: repeat purchases after a refund are not eligible for a further refund.</li>
            </ul>

            <h2>2. How to request a refund</h2>
            <ul>
                <li>
                    Email <a href="mailto:contact@kungacv.com">contact@kungacv.com</a> from the email address registered on your account.
                </li>
                <li>Include your name and a brief reason for the request.</li>
                <li>We aim to respond within 2 business days.</li>
            </ul>

            <h2>3. Processing</h2>
            <ul>
                <li>Approved refunds are returned to the original payment method.</li>
                <li>Depending on your bank or card issuer, funds may take up to 10 business days to appear.</li>
                <li>Pro features are removed from the account once the refund is processed.</li>
            </ul>

            <h2>4. Exceptions</h2>
            <p>Refunds are not available for:</p>
            <ul>
                <li>requests made more than 7 days after purchase;</li>
                <li>accounts that have breached our Terms of Service;</li>
                <li>repeat or abusive refund requests;</li>
                <li>purchases made by someone else on your behalf (contact us and we will work it out).</li>
            </ul>

            <h2>5. Chargebacks</h2>
            <p>If you believe you were charged in error, contact us before filing a chargeback — most issues are resolved faster directly.</p>

            <h2>6. Contact</h2>
            <p>
                Refund questions: <a href="mailto:contact@kungacv.com">contact@kungacv.com</a>.
            </p>
        </LegalPage>
    );
};

export default RefundPolicy;
