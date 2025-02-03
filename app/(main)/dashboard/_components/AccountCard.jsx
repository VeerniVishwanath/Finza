"use client";
import { updateDefault } from "@/actions/dashboard";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useFetch } from "@/hooks/useFetch";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

function AccountCard({ account: { name, type, balance, isDefault, id } }) {
  const { data, loading, error, fn: updateDefaultFn } = useFetch(updateDefault);

  const onCheckedChange = (id) => {
    if (isDefault) {
      toast.warning("You need atleast one Account");
      return;
    }
    updateDefaultFn(id);
  };

  return (
    <Card key={uuid()} className="h-44 hover:shadow-lg transition-all">
      <CardHeader>
        <CardTitle className="font-normal flex justify-between">
          {name}{" "}
          <Switch
            checked={isDefault}
            onCheckedChange={() => onCheckedChange(id)}
            disabled={loading}
          />
        </CardTitle>
        <CardDescription>
          <h2 className="text-2xl font-bold text-black">{balance}</h2>
          {type}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <span>
          <ArrowUpRightIcon className="inline" color="lightgreen" /> Income
        </span>
        <span>
          <ArrowDownRightIcon className="inline" color="red" /> Expense
        </span>
      </CardFooter>
    </Card>
  );
}

export default AccountCard;
