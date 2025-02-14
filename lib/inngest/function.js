import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { prisma } from "../prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Budget Alerts with event batching
export const checkBudgetAlerts = inngest.createFunction(
  {
    name: "Check Budget Alerts",
  },
  { cron: "0 */6 * * *  " }, // Runs every 6 hours
  async ({ step }) => {
    // Fetch all budgets along with their user and default account
    const budgets = await step.run(
      "fetch-budgets",
      async () =>
        await prisma.budget.findMany({
          include: {
            user: {
              include: {
                accounts: {
                  where: {
                    isDefault: true,
                  },
                },
              },
            },
          },
        })
    );

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; //skip if no default Account

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1); //Start of current month

        // Calculate total expenses for the default account
        const expenses = await prisma.transaction.aggregate({
          where: {
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        //Check if we should send an alert
        if (
          percentageUsed > 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          //Send Email
          await sendEmail({
            to: [budget.user.email],
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: Number.parseInt(budgetAmount).toFixed(1),
                totalExpenses: Number.parseInt(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          });

          // Update last alert sent
          await prisma.budget.update({
            where: {
              id: budget.id,
            },
            data: {
              lastAlertSent: new Date(),
            },
          });
        }
      });
    }
  }
);

// 2.Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await prisma.transaction.findMany({
          where: {
            isRecurring: true,
            OR: [
              {
                lastProcessed: null,
              },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
          include: {
            account: {
              select: {
                userId: true,
              },
            },
          },
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((txn) => {
        return {
          name: "transaction.recurring.process",
          data: {
            transactionId: txn.id,
            userId: txn.account.userId,
          },
        };
      });

      // Send events directly using inngest.send()
      await inngest.send(events);
    }
    return { triggered: recurringTransactions.length };
  }
);

//  Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data: ", event);
      return { error: "Missing required data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await prisma.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          account: {
            userId: event.data.userId,
          },
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account bal
      await prisma.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account bal
        const balanceChange =
          transaction.type === "INCOME"
            ? transaction.amount.toNumber()
            : -transaction.amount.toNumber();

        await tx.account.update({
          where: {
            id: transaction.accountId,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// 3. Monthly Report Generation
export const generateMonthlyReports = inngest.createFunction(
  { id: "generate-monthly-reports", name: "Generate Monthly Reports" },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await prisma.user.findMany({ include: { accounts: true } });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        //Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }
    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: ₹${stats.totalIncome}
    - Total Expenses: ₹${stats.totalExpenses}
    - Net Income: ₹${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: ₹${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

// Utility functions
function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextRecurringDate = new Date(transaction.nextRecurringDate);

  return nextRecurringDate <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

function isNewMonth(lastAlertSent, currentDate) {
  return (
    lastAlertSent.getMonth() !== currentDate.getMonth() ||
    lastAlertSent.getFullYear() !== currentDate.getFullYear()
  );
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (transactions.length === 0) {
    }

    return transactions.reduce(
      (stats, t) => {
        const amount = t.amount.toNumber();
        if (t.type === "EXPENSE") {
          stats.totalExpenses += amount;
          stats.byCategory[t.category] =
            (stats.byCategory[t.category] || 0) + amount;
        } else {
          stats.totalIncome += amount;
        }
        return stats;
      },
      {
        totalExpenses: 0,
        totalIncome: 0,
        byCategory: {},
        transactionCount: transactions.length,
      }
    );
  } catch (error) {
    console.error("Failed while fetching transactions", error);
  }
}
