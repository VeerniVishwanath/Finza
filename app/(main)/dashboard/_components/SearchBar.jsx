import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchBar({
  searchParams,
  setSearchParams,
  txnType,
  setTxnType,
  isRecurring,
  setIsRecurring,
  resetFilters,
  checked,
  handleDelete,
}) {
  // State to manage the visibility of the delete button
  const [showDelete, setShowDelete] = useState(false);

  // Effect to update delete button visibility when selection changes
  useEffect(() => {
    if (Object.values(checked).some((txn) => txn)) setShowDelete(true);
    else {
      setShowDelete(false);
    }
  }, [checked]);

  return (
    <div className="flex gap-2">
      {/* Search Input */}
      <div className="relative w-full">
        <SearchIcon
          className="absolute text-gray-500 top-1/2 -translate-y-1/2 left-2 "
          size="1rem"
        />
        <Input
          type="text"
          placeholder="Search Transactions"
          className="px-8"
          value={searchParams}
          onChange={(e) => setSearchParams(e.target.value?.toLowerCase())}
        />
      </div>
      {/* Transaction Type Filter */}
      <Select value={txnType || ""} onValueChange={setTxnType}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INCOME">INCOME</SelectItem>
          <SelectItem value="EXPENSE">EXPENSES</SelectItem>
        </SelectContent>
      </Select>

      {/* Recurring Type Filter */}
      <Select value={isRecurring || ""} onValueChange={setIsRecurring}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Recurring Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Recurring Only</SelectItem>
          <SelectItem value="false">Non Recurring Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Reset Filters Button (Visible when filters are applied) */}
      {(txnType || isRecurring) && (
        <Button
          variant="destructive"
          className="hover:cursor-pointer"
          asChild
          onClick={() => {
            resetFilters();
          }}
        >
          <span>
            <XIcon />
          </span>
        </Button>
      )}

      {/* Delete Button (Visible when transactions are selected) */}
      {showDelete && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}
