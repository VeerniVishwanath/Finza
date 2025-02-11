import { getAccounts } from "@/actions/dashboard";
import { getQueryClient } from "@/app/reactQuery/get-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function TransactionLayout({ children }) {
  const queryClient = getQueryClient();

  const defaultQueryOptions = {
    staleTime: 1000 * 60 * 5, // Keep the data fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  };

  await queryClient.prefetchQuery({
    queryKey: ["accounts"],
    queryFn: () => getAccounts(),
    ...defaultQueryOptions,
  });

  return (
    <main className="container mx-auto py-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </main>
  );
}
