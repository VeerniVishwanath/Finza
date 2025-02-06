"use client";
import { getAccounts, getBudget, getTransactions } from "@/actions/dashboard";
import { useSuspenseQueries } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import AccountCard from "./_components/AccountCard";
import AccountDrawer from "./_components/AccountDrawer";
import BudgetCard from "./_components/BudgetCard";
import SpendingSummary from "./_components/SpendingSummary";
import { AccountSkeleton } from "./_components/skeleton";

export default function Home() {
  const defaultQueryOptions = {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  };

  const [getAccountsQuery, getBudgetQuery, getTransactionsQuery] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ["accounts"],
          queryFn: getAccounts,
          ...defaultQueryOptions,
        },
        { queryKey: ["budget"], queryFn: getBudget, ...defaultQueryOptions },

        {
          queryKey: ["transactions"],
          queryFn: getTransactions,
          ...defaultQueryOptions,
        },
      ],
    });

  const { data: accounts, isLoading: isAccLoading } = getAccountsQuery;
  const { data: budget, isLoading: isBudgetLoading } = getBudgetQuery;

  const { data: transactions, isLoading: isTnxsLoading } = getTransactionsQuery;

  const state = [isAccLoading, isBudgetLoading, isTnxsLoading];

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-6">
      {/* Heading */}
      <h1 className=" text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
        Dashboard
      </h1>

      {/* Monthly Budget */}
      <BudgetCard
        budget={budget?.data}
        accounts={accounts?.data}
        transactions={transactions?.data}
        state={state}
      />

      {/* Recent Transactions And Monthly BreakDown */}
      <SpendingSummary
        accounts={accounts}
        transactionsAll={transactions}
        state={state}
      />

      {/* Accounts Section */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
        {/* Account Drawer */}
        <AccountDrawer />

        {/* Existing Accounts */}

        {accounts ? (
          accounts?.data?.map((account) => (
            <AccountCard key={uuid()} account={account} />
          ))
        ) : (
          <>
            <AccountSkeleton />
            <AccountSkeleton />
          </>
        )}
      </div>
    </div>
  );
}
