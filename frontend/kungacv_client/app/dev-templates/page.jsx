import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

export default function DevTemplatesPage() {
    if (process.env.NODE_ENV === "production") notFound();
    return <PreviewClient />;
}
