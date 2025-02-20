import { getAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import TransactionForm from "./_components/TransactionForm";

export const dynamic = "force-dynamic";

export default async function TransactionPage({ searchParams }) {
  const params = await searchParams;
  const edit = params?.edit || null;

  const [accounts, transaction] = await Promise.all([
    getAccounts(),
    edit ? getTransaction(edit) : Promise.resolve(null),
  ]);

  return (
    <TransactionForm
      accounts={accounts?.data}
      initialData={transaction?.data}
      editMode={!!edit}
    />
  );
}
