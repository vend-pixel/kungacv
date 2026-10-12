const baseUrl = (process.env.SMOKE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const request = async (path) => {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.text();
    return { response, body };
};

const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

const home = await request("/");
assert(home.response.ok, `Landing page returned ${home.response.status}`);
assert(home.body.includes("Build a job-winning resume for free"), "Landing page is missing the primary hero copy");
assert(home.body.includes("Free resume templates"), "Landing page is missing the template gallery heading");
assert(home.body.includes("/resume/create?template=4"), "Landing page is missing the template deep link");
assert(!home.body.includes("/_next/image"), "Landing page still requires the Next image optimizer for template assets");

const editor = await request("/resume/create?template=4");
assert(editor.response.ok, `Editor route returned ${editor.response.status}`);
assert(editor.body.includes("/_next/static/"), "Editor route is missing its client bundle references");

const asset = await fetch(`${baseUrl}/templates/template-01.webp`);
assert(asset.ok, `Template asset returned ${asset.status}`);
assert(asset.headers.get("content-type")?.startsWith("image/"), "Template asset does not have an image content type");

console.log(`Production smoke passed for ${baseUrl}`);
