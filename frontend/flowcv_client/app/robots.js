import { SITE_URL } from "@utils/seo";

const robots = () => ({
    rules: [
        {
            userAgent: "*",
            allow: "/",
            disallow: ["/resume", "/payment"],
        },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
