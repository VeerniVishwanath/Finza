import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";

export default async function AccountLayout({ children }) {
  return (
    <div className="container mx-auto">
      <div className="px-4 mx-4 space-y-8 py-8">
        <Suspense fallback={<LoaderSuspense />}>{children}</Suspense>
      </div>
    </div>
  );
}
