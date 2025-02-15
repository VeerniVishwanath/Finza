"use client";
import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";

export default function TransactionLayout({ children }) {
  const path = usePathname();

  return (
    <main className="container mx-auto py-4">
      <Suspense key={`${path}-${Date.now()}`} fallback={<LoaderSuspense />}>
        {children}
      </Suspense>
    </main>
  );
}
