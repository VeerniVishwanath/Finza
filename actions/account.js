"use server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { getAuth } from "./auth";

export async function deleteTransactions(ids) {
  try {
    if (!Array.isArray(ids)) {
      throw new Error("No valid transaction ids provided");
    }
    await getAuth();

    const txns = await prisma.transaction.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        amount: true,
        type: true,
        accountId: true,
      },
    });

    const accountId = txns[0].accountId;

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        balance: true,
      },
    });

    const oldBal = account.balance.toNumber();

    const newBal = txns.reduce((acc, txn) => {
      return txn.type === "INCOME"
        ? acc - txn.amount.toNumber()
        : acc + txn.amount.toNumber();
    }, oldBal);

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        balance: new Decimal(newBal),
      },
    });

    await prisma.transaction.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error while deleting Transactions:", error);
    throw new Error(`Error while deleting Transactions: ${error.message}`);
  }
}
