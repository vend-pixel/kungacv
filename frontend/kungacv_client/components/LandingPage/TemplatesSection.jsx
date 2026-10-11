"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const TemplatesSection = () => {
    const [currentImage, setCurrentImage] = useState(0);
    const images = [
    "/templates/template-01.webp",
    "/templates/template-02.webp",
    "/templates/template-03.webp",
    "/templates/template-04.webp",
    "/templates/template-05.webp",
    "/templates/template-06.webp",
    "/templates/template-07.webp",
    "/templates/template-08.webp",
    "/templates/template-09.webp",
    "/templates/template-10.webp",
    "/templates/template-11.webp",
    "/templates/template-12.webp",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [images.length]);
    return (
        <section className="pageContainer pt-4 md:pt-8 pb-12 lg:pt-28 lg:pb-28 flex flex-col justify-center items-center">
            <h2 className="text-3xl xl:text-4xl font-extrabold">Free resume templates</h2>
            <p className="mt-4 leading-relaxed md:text-xl text-gray-500">Choose a template and customize it quickly</p>
            <div className="mt-6 md:mt-7 lg:mt-8 h-[2px] w-[3rem] bg-black"></div>
            <div className="w-full m-w-[1200px] my-6 md:my-7 lg:my-8">
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 justify-center gap-8">
                    {images.slice(currentImage, currentImage + 3).map((image, index) => (
                        <Image key={index} src={image} alt={`Slideshow ${index}`} height={380} width={381} className="shadow-gray-400 shadow-lg" />
                    ))}
                </div>
            </div>
            <Link
                href="/"
                className="mt-8 flex gradient border-none cursor-pointer appearance-none touch-manipulation items-center justify-center outline-none hover:opacity-80 rounded-full font-extrabold h-15 text-[17px] min-w-[180px] text-white bg-gradient-to-r from-brand-500 to-brand-700 py-4 px-8 text-sm"
            >
                Start with a template
            </Link>
        </section>
    );
};

export default TemplatesSection;
