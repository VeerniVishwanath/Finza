"use server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { getAuth } from "./auth";
import { serializeTransaction } from "./serializeTransaction";

export async function getTransactions(accountId) {
  try {
    const { userId } = await getAuth();

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
        account: {
          userId,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions.map(serializeTransaction) };
  } catch (error) {
    throw new Error(`Error while fetching transactions: ${error.message}`);
  }
}

export async function getBudgetSpent(id) {
  try {
    const { userId } = await getAuth();

    let accountId = id;

    if (!accountId) {
      const defaultAccount = await prisma.account.findFirst({
        where: { isDefault: true, userId },
      });

      if (!defaultAccount) return null;

      accountId = defaultAccount.id;
    }
    const transactions = await prisma.transaction.aggregate({
      where: {
        accountId,
      },
      _sum: {
        amount: true,
      },
    });

    const totalAmount = transactions._sum.amount
      ? transactions._sum.amount.toNumber()
      : 0;

    return { success: true, data: totalAmount };
  } catch (error) {
    throw new Error(`Error while fetching Budget spent: ${error.message}`);
  }
}

export async function getBudget() {
  try {
    const { userId } = await getAuth();

    const budget = await prisma.budget.findUnique({
      where: {
        userId,
      },
    });
    return { success: true, data: budget.amount.toNumber() };
  } catch (error) {
    throw new Error(`Error while fetching Budget : ${error.message}`);
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await getAuth();

    const budget = await prisma.budget.upsert({
      where: {
        userId,
      },
      update: {
        amount: new Decimal(amount),
      },
      create: {
        amount: new Decimal(amount),
        userId,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(budget).amount };
  } catch (error) {
    throw new Error("Error while updating the Budget ", error.message);
  }
}

export async function getAccounts(accountId) {
  try {
    const { userId } = await getAuth();

    const include = accountId ? { transactions: true } : {};

    const accounts = await prisma.account.findMany({
      where: {
        id: accountId,
        userId,
      },
      include,
    });

    // If fetching a single account, ensure transactions are serialized
    if (accountId) {
      accounts[0] = {
        ...accounts[0],
        transactions: accounts[0].transactions.map(serializeTransaction),
      };
    }

    return { success: true, data: accounts.map(serializeTransaction) };
  } catch (error) {
    throw new Error("Error while Fetching accounts ", error.message);
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await getAuth();

    //Convert Balance to Decimal for Prisma
    const balance = new Decimal(data.balance);

    //Check if user has accounts
    const accounts = await prisma.account.findMany({
      where: {
        userId,
      },
    });

    // Check for Default and update accounts
    const isDefault = accounts.length === 0 || data.isDefault;

    if (isDefault) {
      await prisma.account.updateMany({
        data: {
          isDefault: false,
        },
        where: {
          userId,
          isDefault: true,
        },
      });
    }

    const account = await prisma.account.create({
      data: {
        ...data,
        balance,
        userId,
        isDefault,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error("Error while creating new Account ", error.message);
  }
}

export async function updateDefault(accountId) {
  try {
    const { userId } = await getAuth();

    // Set other default acc to false
    await prisma.account.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set current acc to default
    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    throw new Error("Error while updating Default ", error.message);
  }
}
