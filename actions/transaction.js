"use server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "./auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Decimal } from "@prisma/client/runtime/library";
import { request } from "@arcjet/next";
import { aj } from "@/lib/arcjet";
import { calculateNextRecurringDate } from "./utils";
import { serializeTransaction } from "./serializeTransaction";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function createTransaction(data) {
  try {
    const { userId } = await getAuth();

    // Get Req data for arcjet
    const req = await request();

    // Check rate limiting
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: { remaining, resetInSeconds: reset },
        });
      }
      throw new Error("Request Blocked");
    }

    const {
      type,
      amount,
      category,
      date: txnDate,
      description,
      isRecurring,
      recurringInterval,
      accountId,
    } = data;

    const date = new Date(txnDate);

    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
      select: {
        balance: true,
      },
    });

    const oldBal = account.balance.toNumber();

    const newBal = type === "INCOME" ? oldBal + amount : oldBal - amount;

    await prisma.account.update({
      where: {
        id: accountId,
      },
      data: {
        balance: newBal,
      },
    });

    await prisma.transaction.create({
      data: {
        type,
        amount: new Decimal(amount),
        category,
        date,
        description,
        isRecurring,
        recurringInterval,
        accountId,
        nextRecurringDate:
          data.isRecurring && data.recurringInterval
            ? calculateNextRecurringDate(data.date, data.recurringInterval)
            : null,
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error while creating Transaction:", error);
    throw new Error(`Error while creating Transaction: ${error.message}`);
  }
}

export async function getTransaction(id) {
  try {
    await getAuth();

    if (!id) throw new Error("no Transaction id");

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    });

    if (!transaction) throw new Error("No transaction found");

    return { success: true, data: serializeTransaction(transaction) };
  } catch (error) {
    console.error("Error while fetching Transaction:", error);
    throw new Error(`Error while fetching Transaction: ${error.message}`);
  }
}

export async function editTransaction(id, data) {
  try {
    await getAuth();

    await prisma.$transaction(async (tx) => {
      const originalTxn = await tx.transaction.findUnique({
        where: { id },
        include: {
          account: true,
        },
      });

      if (!originalTxn) throw new Error("Transaction not found");

      const oldBalChange =
        originalTxn.type === "INCOME"
          ? originalTxn.amount.toNumber()
          : -originalTxn.amount.toNumber();

      const newBalChange = data.type === "INCOME" ? data.amount : -data.amount;

      const netBalChange = newBalChange - oldBalChange;

      // update acc bal
      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: { increment: netBalChange },
        },
      });

      // update transaction
      await tx.transaction.update({
        where: {
          id,
          accountId: data.accountId,
        },
        data: {
          ...data,
          date: new Date(data.date),
          amount: new Decimal(data.amount),
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true };
  } catch (error) {
    console.error("Error while updating Transaction:", error);
    throw new Error(`Error while updating Transaction: ${error.message}`);
  }
}

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Convert the file to Array Buffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert Array Buffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount converted to rupees (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary of less than 50 characters)
      - Type of transaction INCOME / EXPENSE
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "category": "string"
        "type": "string"
      }

      If its not a receipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: { data: base64String, mimeType: file.type },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);

      return {
        type: data.type,
        amount: Number.parseFloat(data.amount).toString(),
        category: data.category,
        date: new Date(data.date),
        description: data.description,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error while scanning receipt: ", error);
    throw new Error(`Error while scanning receipt: ${error.message}`);
  }
}
