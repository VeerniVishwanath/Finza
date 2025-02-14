"use client";
import { updateBudget } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useFetch } from "@/hooks/useFetch";
import { CheckIcon, PencilIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function BudgetCard({ budget, accounts, transactions }) {
  const [editBudget, setEditBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(budget || "");
  const [progress, setProgress] = useState(0);
  const [budgetSpent, setBudgetSpent] = useState("");
  const { loading, fn: updateBudgetFn } = useFetch(updateBudget);

  const handleBudgetUpdate = async () => {
    if (budgetAmount < 0) {
      toast.warning("Budget can't be less than zero");
      return;
    }
    await updateBudgetFn(budgetAmount, "budget");
    setEditBudget(false);
  };

  // Calculating monthly expenses
  useEffect(() => {
    if (transactions) {
      const defaultAcc = accounts?.find((curr) => curr.isDefault)?.id;

      setBudgetSpent(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth());

        return transactions?.reduce((acc, txn) => {
          if (
            txn.type === "EXPENSE" &&
            txn.accountId === defaultAcc &&
            txn.date > firstDay
          )
            return acc + txn.amount;
          return acc;
        }, 0);
      });
    }
  }, [transactions, accounts]);

  // Progress bar percentage
  useEffect(() => {
    setProgress(Math.min((budgetSpent * 100) / budget, 100));
  }, [budget, budgetSpent]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium ">
          Monthly Budget (Default Account)
        </CardTitle>
        <CardDescription className="flex gap-1 items-center h-8">
          {editBudget ? (
            <>
              <Input
                name="budgetInput"
                type="number"
                placeholder="Enter Budget"
                className="w-32"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />

              <Button
                variant="ghost"
                disabled={loading}
                onClick={handleBudgetUpdate}
              >
                <CheckIcon className="text-green-500" />
              </Button>

              <Button
                variant="ghost"
                disabled={loading}
                onClick={() => setEditBudget(false)}
              >
                <X className="text-red-500" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col w-full">
              <div className="flex gap-2 items-center mb-2">
                <span>
                  {budgetSpent === 0
                    ? "No expenses this month"
                    : `₹ ${budgetSpent} of ₹ ${budget} spent`}
                </span>
                <PencilIcon
                  color="black"
                  size={"1.5rem"}
                  className="hover:cursor-pointer p-1 rounded-lg hover:bg-gray-200"
                  onClick={() => setEditBudget(true)}
                />
              </div>
              <Progress
                color={` ${
                  progress < 50
                    ? "bg-green-500"
                    : progress < 90
                      ? "bg-orange-500"
                      : " bg-red-500 "
                }`}
                value={progress}
              />
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default BudgetCard;
