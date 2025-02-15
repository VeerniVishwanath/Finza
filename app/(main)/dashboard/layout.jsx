"use client";
import LoaderSuspense from "@/app/loaderSuspense";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function DashBoardLayout({ children }) {
  const path = usePathname();

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-6">
      {/* Heading */}
      <h1 className=" text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
        Dashboard
      </h1>

      <Suspense key={`${path}-${Date.now()}`} fallback={<LoaderSuspense />}>
        {children}
      </Suspense>
    </div>
  );
}
