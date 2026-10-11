// INNER IMPORTS
import "@styles/globals.css";
import { Providers } from "@redux/provider";
import { SITE_URL } from "@utils/seo";
import Analytics from "@components/Analytics";

const DESCRIPTION =
    "KungaCV is a free resume builder for Malawi and beyond: ATS-friendly templates, live preview, and unlimited watermark-free PDF downloads.";

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: "KungaCV — Build a job-winning resume for free",
    description: DESCRIPTION,
    applicationName: "KungaCV",
    openGraph: {
        type: "website",
        siteName: "KungaCV",
        title: "KungaCV — Build a job-winning resume for free",
        description: DESCRIPTION,
        url: "/",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "KungaCV — Build a job-winning resume for free",
        description: DESCRIPTION,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: "/" },
};

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <Analytics />
                <Providers>
                    <main>{children}</main>
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
