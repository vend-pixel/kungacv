// Shared site URL for SEO metadata (canonicals, sitemap, robots, OG).
// NEXT_PUBLIC_SITE_URL is the canonical production origin; VERCEL_URL covers Vercel previews.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");

export { SITE_URL };
