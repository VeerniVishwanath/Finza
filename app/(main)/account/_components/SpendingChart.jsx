"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SpendingChart({ transactions }) {
  const [isClient, setIsClient] = useState(false);
  const [data, setData] = useState([{ name: "", income: 0, expense: 0 }]);
  const [dateRange, setDateRange] = useState(30);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const net = (income - expenses).toFixed(2);

  // Filters and converts data for Recharts
  useEffect(() => {
    if (!transactions.length) return;

    // filters based on date range
    const now = new Date();
    const filterRange = new Date(now);
    filterRange.setDate(now.getDate() - dateRange);

    const filterTxnsToRange = transactions.filter(
      (txn) => txn.date > filterRange
    );

    // groups data based on each date
    const groupedData = Object.groupBy(filterTxnsToRange, (txn) => {
      const date = new Date(txn.date);

      return format(date, "PP");
    });

    // converts into desired format for recharts
    const netTxns = { income: 0, expenses: 0 };

    const filteredData = Object.entries(groupedData).map(([name, group]) => {
      const { income, expense } = group.reduce(
        (acc, txn) => {
          if (txn.type === "EXPENSE") acc.expense += txn.amount;
          else acc.income += txn.amount;

          return acc;
        },
        {
          income: 0,
          expense: 0,
        }
      );

      netTxns.income += income;
      netTxns.expenses += expense;

      return {
        name: name.split(",")[0],
        income: income.toFixed(2),
        expense: expense.toFixed(2),
      };
    });

    setIncome(netTxns.income?.toFixed(2));
    setExpenses(netTxns.expenses?.toFixed(2));

    setData(filteredData);
  }, [transactions, dateRange]);

  // Prevents SSR rendering
  // Ensures it runs only on the client
  // Prevents recharts from causing hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium flex justify-between items-center">
          <p>Transaction Overview</p>
          {/* Drop Down */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={7}>Last 7 Days</SelectItem>
                <SelectItem value={30}>Last 1 Month</SelectItem>
                <SelectItem value={90}>Last 3 Months</SelectItem>
                <SelectItem value={180}>Last 6 Months</SelectItem>
                <SelectItem value={5000}>All Time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-auto space-y-6">
        <div className="flex justify-around">
          <div className="text-gray-500">
            Total Income
            <p className="text-green-500">₹ {income}</p>
          </div>
          <div className="text-gray-500">
            Total Expenses
            <p className="text-red-500">₹ {expenses}</p>
          </div>
          <div className="text-gray-500">
            Net
            <p className={cn(net > 0 ? "text-green-500" : "text-red-500")}>
              ₹ {net ? "" : "-"}
              {net}
            </p>
          </div>
        </div>
        {/* Rechart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%" className="px-10">
            <AreaChart
              width={730}
              height={250}
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, maxValue]}
                tickFormatter={(value) =>
                  Intl.NumberFormat("en-US", { notation: "compact" }).format(
                    value
                  )
                }
                tickCount={6}
              />
              <Tooltip />

              <Area
                dataKey="income"
                type="monotone"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorGreen)"
              />
              <Area
                dataKey="expense"
                type="monotone"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorRed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
