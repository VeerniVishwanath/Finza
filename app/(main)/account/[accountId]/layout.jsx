import { getAccounts, getTransactions } from "@/actions/dashboard";
import { getQueryClient } from "@/app/reactQuery/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function AccountLayout({ children, params }) {
  const queryClient = getQueryClient();
  const { accountId } = await params;

  const defaultQueryOptions = {
    staleTime: 1000 * 60 * 5, // Keep the data fresh for 5 minutes
    cacheTime: 1000 * 60 * 60, // Cache for 1 hour
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["account"],
      queryFn: () => getAccounts(accountId),
      ...defaultQueryOptions,
    }),
  ]);

  return (
    <div className="container mx-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </div>
  );
}
