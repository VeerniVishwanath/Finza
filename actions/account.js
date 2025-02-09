"use server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "./auth";
import { revalidatePath } from "next/cache";

export async function deleteTransactions(ids) {
  try {
    if (!Array.isArray(ids)) {
      throw new Error("No valid transaction ids provided");
    }
    await getAuth();

    await prisma.transaction.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error while deleting Transactions:", error); // Log full error
    throw new Error(`Error while deleting Transactions: ${error.message}`);
  }
}
