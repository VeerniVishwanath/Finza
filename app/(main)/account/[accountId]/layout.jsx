import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";
import AccountPage from "./page";

export default function AccountLayout({ params }) {
  return (
    <div className="container mx-auto">
      <div className="px-4 mx-4 space-y-8 py-8">
        <Suspense fallback={<LoaderSuspense />}>
          <AccountPage params={params} />
        </Suspense>
      </div>
    </div>
  );
}
