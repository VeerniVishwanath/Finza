import { getAccounts, getBudget, getTransactions } from "@/actions/dashboard";
import { v4 as uuid } from "uuid";
import AccountCard from "./_components/AccountCard";
import AccountDrawer from "./_components/AccountDrawer";
import BudgetCard from "./_components/BudgetCard";
import SpendingSummary from "./_components/SpendingSummary";

export const dynamic = "force-dynamic"; // Ensures fresh user-specific data

export default async function DashBoardPage() {
  const [accounts, budget, transactions] = await Promise.all([
    getAccounts(),
    getBudget(),
    getTransactions(),
  ]);

  return (
    <>
      {/* Monthly Budget */}
      <BudgetCard
        budget={budget?.data}
        accounts={accounts?.data}
        transactions={transactions?.data}
      />

      {/* Recent Transactions And Monthly BreakDown */}
      <SpendingSummary accounts={accounts} transactionsAll={transactions} />

      {/* Accounts Section */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
        {/* Account Drawer */}
        <AccountDrawer />

        {/* Existing Accounts */}
        {accounts?.data?.length > 0 &&
          accounts.data.map((account) => (
            <AccountCard key={uuid()} account={account} />
          ))}
      </div>
    </>
  );
}
