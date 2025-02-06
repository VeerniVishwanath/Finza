import { Skeleton } from "@/components/ui/skeleton";

export const BudgetSkeleton = () => {
  return <Skeleton className="w-full h-full rounded-lg mt-4" />;
};

export const TxnSkeleton = () => {
  return <Skeleton className="w-full h-[300px] rounded-xl" />;
};

export const AccountSkeleton = () => {
  return <Skeleton className="w-full " />;
};
