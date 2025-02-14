"use client";

import { deleteTransactions } from "@/actions/account";
import { useFetch } from "@/hooks/useFetch";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import SearchBar from "../../dashboard/_components/SearchBar";
import TransactionTable from "./TransactionTable";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Transactions({ transactions }) {
  const ITEMS_PER_PAGE = 10;

  const [txns, setTxns] = useState(transactions);
  const [paginatedTxns, setPaginatedTxns] = useState(txns);
  const [currPage, setCurrPage] = useState(1);

  const [searchParams, setSearchParams] = useState("");
  const [txnType, setTxnType] = useState(null);
  const [isRecurring, setIsRecurring] = useState(null);
  const [sortKey, setSortKey] = useState({ key: "date", order: "desc" });
  const [checked, setChecked] = useState({});
  const [toBeDeletedIds, setToBeDeletedIds] = useState([]);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  const { fn: deleteTransactionsFn } = useFetch(deleteTransactions);

  // Search Transactions
  useEffect(() => {
    const filtered = transactions.filter(
      (txn) =>
        txn?.description?.toLowerCase().includes(searchParams) ||
        format(txn?.date, "PP").toLowerCase().includes(searchParams) ||
        txn.category?.toLowerCase().includes(searchParams)
    );
    setTxns(filtered);
    setCurrPage(1);
  }, [searchParams, transactions]);

  // Apply Filters
  useEffect(() => {
    if (txnType || isRecurring) {
      setTxns(
        transactions.filter((txn) => {
          const matchType = txnType ? txn.type === txnType : true;
          const matchRecurring = isRecurring
            ? txn.isRecurring.toString() === isRecurring
            : true;

          return matchType && matchRecurring;
        })
      );
      setCurrPage(1);
    }
  }, [transactions, txnType, isRecurring]);

  // Applying Sorting
  useEffect(() => {
    if (!sortKey.key) return;

    setTxns((prevTxns) =>
      [...prevTxns].sort((a, b) => {
        const { key, order } = sortKey;
        const isAscending = order === "asc";

        if (key === "category") {
          return isAscending
            ? a.category.localeCompare(b.category)
            : b.category.localeCompare(a.category);
        }

        if (key === "date") {
          return isAscending
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }

        if (key === "amount")
          return isAscending ? a.amount - b.amount : b.amount - a.amount;

        return 0;
      })
    );
  }, [sortKey]);

  // Pagination
  useEffect(() => {
    const startPage = (currPage - 1) * ITEMS_PER_PAGE;
    setPaginatedTxns([...txns].slice(startPage, startPage + ITEMS_PER_PAGE));
  }, [currPage, txns]);

  const resetFilters = () => {
    setTxnType(null);
    setIsRecurring(null);
    setTxns(transactions);
  };

  const toggleCheckAll = () => {
    const updatedChecked = transactions.reduce((acc, txn) => {
      acc[txn.id] = !checked[txn.id];
      return acc;
    }, {});

    setChecked(updatedChecked);
  };

  const handleDelete = (id) => {
    const selectedIds = id
      ? [id]
      : Object.entries(checked).reduce((acc, [key, value]) => {
          if (value) {
            acc.push(key);
          }

          return acc;
        }, []);

    setToBeDeletedIds(selectedIds);
    setOpenAlertDialog(true);
  };

  const totalPages = Math.ceil(txns.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <SearchBar
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        txnType={txnType}
        setTxnType={setTxnType}
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        resetFilters={resetFilters}
        checked={checked}
        handleDelete={handleDelete}
        toBeDeletedIds={toBeDeletedIds}
      />
      <TransactionTable
        paginatedTxns={paginatedTxns}
        sortKey={sortKey}
        setSortKey={setSortKey}
        checked={checked}
        setChecked={setChecked}
        toggleCheckAll={toggleCheckAll}
        handleDelete={handleDelete}
      />

      <Pagination>
        <PaginationContent className="flex-wrap">
          {/* Prev */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrPage((prev) => Math.max(prev - 1, 1))}
            />
          </PaginationItem>

          {[...Array(totalPages)].map((_, idx) => (
            <PaginationItem key={uuid()}>
              <PaginationLink
                isActive={currPage === idx + 1}
                onClick={() => setCurrPage(idx + 1)}
              >
                {idx + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrPage((prev) => Math.min(prev + 1, totalPages))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteTransactionsFn(toBeDeletedIds);
                setOpenAlertDialog(false);
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
