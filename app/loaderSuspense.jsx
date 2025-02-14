"use client";
import Image from "next/image";
import React, { useEffect } from "react";

export default function LoaderSuspense() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full h-[85dvh] flex justify-center items-center">
      <Image
        src={"/loader.gif"}
        width={800}
        height={300}
        className="mb-24"
        alt="loader"
        unoptimized={true}
      />
    </div>
  );
}
