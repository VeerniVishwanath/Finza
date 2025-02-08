"use client";
import { getAccounts } from "@/actions/dashboard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { use } from "react";
import SpendingChart from "../_components/SpendingChart";
import Transactions from "../_components/Transactions";

export default function Page({ params }) {
  const { accountId } = use(params);

  const defaultQueryOptions = {
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  };

  const { data: account } = useSuspenseQuery({
    queryKey: ["account"],
    queryFn: () => getAccounts(accountId),
    ...defaultQueryOptions,
  });

  const { name, type, balance, transactions } = account.data[0];

  return (
    <div className="px-4 mx-4 space-y-8">
      {/* Head Section */}
      <div className="flex justify-between">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold">{name}</h2>
          <p className="text-sm text-gray-400">{type} ACCOUNT</p>
        </div>
        <div>
          <p className="text-2xl font-medium">₹ {balance}</p>
          <p className="text-gray-400 text-sm text-right">
            {transactions?.length} Transactions
          </p>
        </div>
      </div>

      {/* AreaChart Section  */}
      <SpendingChart transactions={transactions} />

      {/* Transactions Section */}
      <Transactions transactions={transactions} />
    </div>
  );
}
