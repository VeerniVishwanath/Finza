import { getAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import TransactionForm from "./_components/TransactionForm";

export default async function page({ searchParams }) {
  const { edit } = await searchParams;

  const [accounts, transaction] = await Promise.all([
    getAccounts(),
    edit ? getTransaction(edit) : Promise.resolve(null),
  ]);

  return (
    <TransactionForm accounts={accounts.data} initialData={transaction?.data} />
  );
}
