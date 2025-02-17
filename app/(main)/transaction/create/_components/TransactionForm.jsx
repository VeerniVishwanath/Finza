"use client";

// External Libraries
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Icons
import { CalendarIcon } from "lucide-react";

// Internal Utilites & Hooks
import { useFetch } from "@/hooks/useFetch";
import { transactionSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

// Data & API Calls
import {
  createTransaction,
  editTransaction,
  scanReceipt,
} from "@/actions/transaction";
import { defaultCategories } from "@/data/categories";

// Components
import ScanReceipt from "./ScanReceipt";

export default function TransactionForm({
  accounts,
  initialData,
  editMode = false,
}) {
  const router = useRouter();
  const editId = useSearchParams().get("edit");

  /** Find Default Account */
  const defaultAcc = accounts?.find((acc) => acc.isDefault);

  /** Form Handling */
  const form = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData?.type,
            amount: initialData?.amount.toString(),
            description: initialData?.description,
            accountId: initialData?.accountId,
            category: initialData?.category,
            date: new Date(initialData?.date),
            isRecurring: initialData?.isRecurring,
            ...(initialData?.recurringInterval && {
              recurringInterval: initialData?.recurringInterval,
            }),
          }
        : {
            date: new Date(),
            description: "",
            category: "",
            amount: "",
            type: "INCOME",
            isRecurring: false,
            recurringInterval: undefined,
            accountId: defaultAcc?.id || "",
          },
  });

  /** Form State */
  const type = form.watch("type", "INCOME");
  const isRecurring = form.watch("isRecurring", false);
  const { setValue } = form;

  /** Fetch Hook for Transaction */
  const { loading, fn: createTransactionFn } = useFetch(
    editMode ? editTransaction : createTransaction
  );

  /** Form Submit Handler */
  const onSubmit = async (values) => {
    if (editMode) {
      await createTransactionFn(editId, values);
    } else {
      await createTransactionFn(values);
    }

    form.reset();
    if (defaultAcc.id) {
      await router.push(`/account/${defaultAcc.id}`);
      router.refresh();
    }
  };

  /** Fetch Hook for Scanning Receipt */
  const {
    data: scannedData,
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
  } = useFetch(scanReceipt);

  /** Scan Receipt Handler */
  const handleScanReceipt = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("File size should be <5MB");
      return;
    }
    if (!file.type.includes("image")) {
      toast.warning("File should be an Image");
      return;
    }
    scanReceiptFn(file);
  };

  /** Effect to Populate Form from Scanned Receipt */
  useEffect(() => {
    if (scannedData && !scanReceiptLoading)
      Object.entries(scannedData).map(([key, value]) => {
        setValue(key, value);
      });
  }, [scannedData, scanReceiptLoading, setValue]);

  return (
    <div className="max-w-3xl mx-auto space-y-4 mb-32 p-4 ">
      <h1 className="font-bold text-5xl lg:text-6xl text-center mb-10">
        {editMode ? "Edit Transaction" : "Add Transaction"}
      </h1>

      {/* Scan Receipt Button */}
      {!editMode && (
        <ScanReceipt
          scanReceiptLoading={scanReceiptLoading}
          handleScanReceipt={handleScanReceipt}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">INCOME</SelectItem>
                      <SelectItem value="EXPENSE">EXPENSE</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Amount & Account */}
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Account</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map((acc) => (
                          <SelectItem value={acc.id} key={acc.id}>
                            <span>{acc.name}</span>
                            <span className="text-gray-500">
                              {" "}
                              [ ₹{acc.balance}]
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultCategories.map((cat) => (
                        <SelectItem
                          className={`${type === cat.type ? "" : "hidden"}`}
                          key={uuid()}
                          value={cat.id}
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter Description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* isRecurring */}
          <FormField
            control={form.control}
            name="isRecurring"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Card className="w-full pt-5">
                    <CardContent className="flex justify-between items-center w-full">
                      <div className="flex flex-col">
                        <h2 className="font-medium text-lg">
                          Recurring Transaction
                        </h2>
                        <p className="text-sm text-gray-500">
                          Setup a recurring schedule for this transaction
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </CardContent>
                  </Card>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Recurring Interval */}
          {isRecurring && (
            <FormField
              control={form.control}
              name="recurringInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recurring Interval</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              className="w-1/2"
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button className="w-1/2" type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : editMode
                  ? "Update Transaction"
                  : "Create Transaction"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
