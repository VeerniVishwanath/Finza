"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { v4 as uuid } from "uuid";
import { TxnSkeleton } from "./skeleton";

export default function SpendingSummary({ accounts, transactionsAll, state }) {
  const [accountId, setAccountId] = useState("");
  const [transactions, setTransactions] = useState("");
  const [data, setData] = useState("");

  useEffect(() => {
    if (accounts) {
      setAccountId(accounts.data.find((acc) => acc.isDefault)?.id);
    }
  }, [accounts]);

  useEffect(() => {
    if (transactionsAll?.data) {
      setTransactions(
        transactionsAll?.data.filter((tnx) => tnx.accountId === accountId)
      );
    }
  }, [transactionsAll?.data, accountId]);

  useEffect(() => {
    if (transactions?.length || accountId) {
      const groupedTnxs = Object.groupBy(transactions, ({ type, category }) => {
        if (type === "EXPENSE") return category;
      });

      setData(
        Object.entries(groupedTnxs)
          .map(([category, items]) => {
            if (category !== "undefined") {
              const expenses = items.reduce((acc, obj) => acc + obj.amount, 0);

              return { category, expenses };
            }
          })
          .filter(Boolean)
      );
    }
  }, [transactions, accountId]);

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
      {/* Recent Transactions  */}
      <Card>
        <CardHeader>
          {/* Title */}
          <CardTitle className="font-medium flex justify-between items-center ">
            Recent Transactions
            {/* Drop Down */}
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {accounts?.data.map((acc) => (
                    <SelectItem value={acc.id} key={uuid()}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardTitle>
          {/* Transactions */}
          <CardDescription className="flex flex-col gap-4 py-4">
            {!accounts || !transactionsAll ? (
              <TxnSkeleton />
            ) : transactions?.length !== 0 ? (
              transactions?.slice(0, 5).map((tnx) => (
                <div className="flex justify-between items-center" key={uuid()}>
                  <div>
                    <h4 className="font-medium text-base text-gray-800">
                      {tnx.description}
                    </h4>
                    <p>{format(new Date(tnx.date), "PP")}</p>
                  </div>
                  {tnx.type === "EXPENSE" ? (
                    <span className=" text-red-500">
                      <ArrowDownRightIcon className="inline text-red-500" />
                      {tnx.amount}
                    </span>
                  ) : (
                    <span className=" text-green-500">
                      <ArrowUpRightIcon className="inline text-green-500" />
                      {tnx.amount}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="p-3 text-center">No recent transactions</p>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
      {/* Monthly Expense Breakdown */}{" "}
      <Card className="h-auto">
        <CardHeader>
          <CardTitle className="font-medium flex justify-between items-center h-9">
            Monthly Expense Breakdown
          </CardTitle>
          <CardDescription
            className={cn(data.length > 0 ? "h-[350px]" : "h-auto", "pt-4")}
          >
            {/* Recharts */}
            {!transactionsAll || !accounts ? (
              <TxnSkeleton />
            ) : data.length === 0 ? (
              <p className="p-3 text-center">No expenses this month</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
                  <Radar
                    dataKey="expenses"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
