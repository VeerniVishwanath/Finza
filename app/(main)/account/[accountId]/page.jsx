import { getAccounts } from "@/actions/dashboard";
import SpendingChart from "../_components/SpendingChart";
import Transactions from "../_components/Transactions";

export default async function Page({ params }) {
  const { accountId } = await params;

  const account = await getAccounts(accountId);

  const { name, type, balance, transactions } = account.data[0];

  return (
    <>
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
    </>
  );
}
