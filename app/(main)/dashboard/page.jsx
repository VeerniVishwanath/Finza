import { getAccounts } from "@/actions/dashboard";
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
import { PencilIcon } from "lucide-react";
import { v4 as uuid } from "uuid";
import AccountCard from "./_components/AccountCard";
import AccountDrawer from "./_components/AccountDrawer";

async function Home() {
  const [accounts] = await Promise.all([getAccounts()]);

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-6">
      {/* Heading */}
      <h1 className=" text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800">
        Dashboard
      </h1>

      {/* Monthly Budget */}
      <Card className="">
        <CardHeader>
          <CardTitle className="font-medium ">
            Monthly Budget (Default Account)
          </CardTitle>
          <CardDescription className="flex gap-2 items-center">
            No Budget Set <PencilIcon color="black" size={"1rem"} />
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-medium flex justify-between items-center ">
              Recent Transactions
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardTitle>
            <CardDescription className="">
              <p className="p-3 text-center">No recent transactions</p>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Monthly Expense Breakdown */}
        <Card className="">
          <CardHeader>
            <CardTitle className="font-medium flex justify-between items-center h-9">
              Monthly Expense Breakdown
            </CardTitle>
            <CardDescription>
              <p className="p-3 text-center">No expenses this month</p>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Accounts Section */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ">
        {/* Account Drawer */}
        <AccountDrawer />

        {/* Existing Accounts */}

        {accounts.data?.map((account) => (
          <AccountCard key={uuid()} account={account} />
        ))}
      </div>
    </div>
  );
}

export default Home;
