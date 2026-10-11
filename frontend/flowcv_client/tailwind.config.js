/** @type {import('tailwindcss').Config} */

// KungaCV design tokens — derived from the logo:
//   brand = logo blue ramp (#1080F0 bright → #0040D0 deep), ink = logo black background.
//   The default Tailwind `blue` scale is remapped onto the brand ramp so existing
//   blue-* utility usage rebrands coherently without a mass rewrite.
const brand = {
    50: "#EEF6FF",
    100: "#D9EBFF",
    200: "#B6D8FF",
    300: "#7DBBFF",
    400: "#4DA3FF",
    500: "#1080F0",
    600: "#0070F0",
    700: "#0050E0",
    800: "#0040D0",
    900: "#00309B",
};

const ink = {
    950: "#0A0A0B",
    900: "#111114",
    850: "#17171A",
    800: "#1E1E22",
    700: "#2A2A2F",
    600: "#3A3A42",
    500: "#6B6B76",
    400: "#8A8A93",
    300: "#B4B4BD",
    200: "#D7D7DE",
    100: "#ECECF1",
    50: "#F5F6F8",
};

module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                brand,
                ink,
                blue: brand,
                indigo: { 600: brand[600], 700: brand[700] },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [require("tailwind-scrollbar")],
};
