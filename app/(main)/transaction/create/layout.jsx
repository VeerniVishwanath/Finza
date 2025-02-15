import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";
import TransactionPage from "./page";

export default function TransactionLayout({ searchParams }) {
  return (
    <main className="container mx-auto py-4">
      <Suspense fallback={<LoaderSuspense />}>
        <TransactionPage searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
