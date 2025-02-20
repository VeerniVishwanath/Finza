import LoaderSuspense from "@/app/loaderSuspense";
import { Suspense } from "react";
import DashBoardPage from "./page";

export default function DashBoardLayout() {
  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-6">
      {/* Heading */}
      <h1 className=" text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
        Dashboard
      </h1>

      <Suspense fallback={<LoaderSuspense />}>
        <DashBoardPage />
      </Suspense>
    </div>
  );
}
