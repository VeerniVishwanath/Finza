import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TransactionLayout({ children }) {
  return (
    <main className="container mx-auto py-4">
      <Suspense fallback={<LoaderSuspense />}>{children}</Suspense>
    </main>
  );
}
