import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    EllipsisIcon,
    RefreshCwIcon,
} from "lucide-react";
import { v4 as uuid } from "uuid";

export default function TransactionTable({
  paginatedTxns,
  sortKey,
  setSortKey,
  checked,
  setChecked,
  toggleCheckAll,
  handleDelete,
}) {
  // Handle column sorting
  const handleSort = (column) => {
    if (sortKey.key === column) {
      setSortKey((prev) => ({
        ...prev,
        order: prev.order === "asc" ? "desc" : "asc",
      }));
    } else {
      setSortKey({ key: column, order: "asc" });
    }
  };

  // Extract sorting key and order
  const { key, order } = sortKey;

  // Sorting icon component
  const SortOrder = ({ name }) => (
    <div className={cn(key === name ? "" : "hidden", "span")}>
      {order === "asc" ? <ChevronDownIcon /> : <ChevronUpIcon />}
    </div>
  );

  return (
    <div className="border-[1px] rounded-lg">
      <Table className="overflow-hidden">
        {/* Table Header */}
        <TableHeader>
          <TableRow className="hover:cursor-pointer">
            <TableHead className="w-10 text-left">
              <Checkbox onClick={toggleCheckAll} />
            </TableHead>
            <TableHead
              onClick={() => handleSort("date")}
              className=" w-[180px] hover:text-gray-900"
            >
              <span className="flex justify-start items-center gap-2 ">
                Date <SortOrder name="date" />
              </span>
            </TableHead>
            <TableHead className="w-[300px] hover:text-gray-900">
              Description
            </TableHead>
            <TableHead
              onClick={() => handleSort("category")}
              className=" w-[250px] hover:text-gray-900 text-center"
            >
              <span className="flex justify-center items-center gap-2 ">
                Category <SortOrder name="category" />
              </span>
            </TableHead>
            <TableHead
              onClick={() => handleSort("amount")}
              className=" text-right hover:text-gray-900"
            >
              <span className="flex justify-end items-center gap-2 ">
                <SortOrder name="amount" />
                Amount
              </span>
            </TableHead>
            <TableHead className="w-[300px] hover:text-gray-900">
              Recurring
            </TableHead>
            <TableHead className="w-[60px]"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Table Row */}
          {paginatedTxns.map((txn) => (
            <TableRow key={uuid()}>
              <TableCell>
                <Checkbox
                  checked={checked[txn.id]}
                  onCheckedChange={(val) =>
                    setChecked((prev) => ({ ...prev, [txn.id]: val }))
                  }
                />
              </TableCell>
              {/* Date */}
              <TableCell>{format(txn?.date, "PP")}</TableCell>
              {/* Description */}
              <TableCell>{txn?.description}</TableCell>
              {/* Category */}
              <TableCell className="text-center">
                <Badge
                  variant={"outline"}
                  className={`${
                    categoryColors[txn.category]
                  } text-sm text-white font-medium`}
                >
                  {txn?.category}
                </Badge>
              </TableCell>
              {/* Amount */}
              <TableCell
                className={cn(
                  txn?.type === "EXPENSE" ? "text-red-500" : "text-green-500",
                  "text-right"
                )}
              >
                {txn?.amount}
              </TableCell>
              {/* Recurring */}
              <TableCell>
                {txn.isRecurring ? (
                  <TooltipProvider>
                    <Tooltip>
                      {/* Trigger */}
                      <TooltipTrigger asChild>
                        <Badge
                          variant={"outline"}
                          className="space-x-1 p-[5px] px-3 bg-purple-100 text-purple-700 hover:cursor-pointer"
                        >
                          <RefreshCwIcon size={"0.8rem"} />
                          <span>{txn.recurringInterval}</span>
                        </Badge>
                      </TooltipTrigger>
                      {/* Content */}
                      <TooltipContent className="flex flex-col text-sm ">
                        <span className="font-medium">Next Date:</span>
                        <span>
                          {format(txn?.nextRecurringDate, "PP") || ""}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant={"outline"} className="space-x-1 p-[5px] px-3">
                    <ClockIcon size={"0.8rem"} />
                    <span className="font-medium">One-Time</span>
                  </Badge>
                )}
              </TableCell>
              {/* Options */}
              <TableCell>
                <DropdownMenu>
                  {/* Trigger */}
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hover:cursor-pointer"
                      asChild
                    >
                      <div>
                        <EllipsisIcon />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  {/* Content */}
                  <DropdownMenuContent>
                    <DropdownMenuItem className="hover:cursor-pointer">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(txn.id)}
                      className="hover:cursor-pointer text-red-500"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            {/* <TableCell className="text-right">$2</TableCell> */}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
