export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export const trackEvent = (name, params = {}) => {
    if (!GTM_ID || typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
};
