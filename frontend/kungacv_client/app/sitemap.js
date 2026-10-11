import { SITE_URL } from "@utils/seo";

const CHANGE_FREQUENCY = {
    "": "weekly",
    "/pricing": "monthly",
    "/privacy-policy": "yearly",
    "/terms-of-service": "yearly",
    "/refund-policy": "yearly",
};

const PRIORITY = {
    "": 1,
    "/pricing": 0.9,
    "/privacy-policy": 0.3,
    "/terms-of-service": 0.3,
    "/refund-policy": 0.3,
};

const sitemap = () => {
    const lastModified = new Date();
    return Object.keys(CHANGE_FREQUENCY).map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified,
        changeFrequency: CHANGE_FREQUENCY[route],
        priority: PRIORITY[route],
    }));
};

export default sitemap;
