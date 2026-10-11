import PricingCheckout from "@components/Pricing/PricingCheckout";

export const metadata = {
    title: "Pricing — KungaCV",
    description: "One-time Pro pass for KungaCV: watermark-free PDF resume exports. Pay once with PayChangu, no auto-renewal.",
    alternates: { canonical: "/pricing" },
};

const PricingPage = () => {
    return <PricingCheckout />;
};

export default PricingPage;
