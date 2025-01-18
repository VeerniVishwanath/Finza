"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";

export default function HeroSection() {
  const imageRef = useRef(null);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (imageRef.current) {
        if (window.scrollY > 100) {
          imageRef.current.classList.add("scrolled");
        } else {
          imageRef.current.classList.remove("scrolled");
        }
      }
    });
  }, []);

  return (
    <section className="container heroSection text-center my-24 flex flex-col items-center gap-6">
      <h1 className="text-5xl md:text-8xl lg:text-[105px] font-bold">
        Manage Your Finances <br /> with Intelligence
      </h1>
      <p className="text-xl text-gray-600">
        An AI-powered financial management platform that helps you track,
        <br />
        analyze, and optimize your spending with real-time insights.
      </p>
      <Button className="w-fit px-8 py-6">
        <Link href={"/dashboard"}>Get Started</Link>
      </Button>

      <div className="heroImage-wrapper">
        <div className=" heroImage" ref={imageRef}>
          <Image
            className="mx-auto rounded-lg"
            src={"/banner.jpeg"}
            width={1280}
            height={760}
            alt="Hero Image"
          />
        </div>
      </div>
    </section>
  );
}
