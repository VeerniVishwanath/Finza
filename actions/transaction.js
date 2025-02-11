"use server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "./auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Decimal } from "@prisma/client/runtime/library";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function createTransaction(data) {
  try {
    await getAuth();

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
      },
    });

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error while creating Transaction:", error);
    throw new Error(`Error while creating Transaction: ${error.message}`);
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
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}
