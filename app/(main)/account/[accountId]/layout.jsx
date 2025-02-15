"use client";
import LoaderSuspense from "@/app/loaderSuspense";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function AccountLayout({ children }) {
  const path = usePathname();

  return (
    <div className="container mx-auto">
      <div className="px-4 mx-4 space-y-8 py-8">
        <Suspense key={`${path}-${Date.now()}`} fallback={<LoaderSuspense />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
