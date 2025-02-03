"use server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { getAuth } from "./auth";
import { serializeTransaction } from "./serializeTransaction";

export async function getAccounts() {
  try {
    const { userId } = await getAuth();

    const accounts = await prisma.account.findMany({
      where: {
        userId,
      },
    });

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
