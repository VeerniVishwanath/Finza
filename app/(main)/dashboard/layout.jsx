import { getAccounts, getBudget, getTransactions } from "@/actions/dashboard";
import { getQueryClient } from "@/app/reactQuery/get-query-client";
import {
  HydrationBoundary,
  dehydrate
} from "@tanstack/react-query";

export default async function DashBoardLayout({ children }) {
  const queryClient = getQueryClient();

  const defaultQueryOptions = {
    staleTime: 1000 * 60 * 5, // Keep the data fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["accounts"],
      queryFn: getAccounts,
      ...defaultQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: ["budget"],
      queryFn: getBudget,
      ...defaultQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: ["transactions"],
      queryFn: getTransactions,
      ...defaultQueryOptions,
    }),
  ]);

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </main>
  );
}
