"use client";
import { createAccount } from "@/actions/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFetch } from "@/hooks/useFetch";
import { accountSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

function AccountDrawer() {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0,
      isDefault: false,
    },
  });

  const {
    data: createAccountData,
    loading: createAccountLoading,
    fn: createAccountFn,
  } = useFetch(createAccount);

  const onSubmit = async (values) => {
    await createAccountFn(values);
    form.reset();
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Card className="h-44 text-muted-foreground hover:text-gray-900 font-semibold flex flex-col items-center justify-center hover:shadow-lg transition-all hover:cursor-pointer">
          <PlusIcon size={"2.5rem"} />
          Add a new Account
        </Card>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full px-5">
          <DrawerHeader className="px-0 py-5">
            <DrawerTitle className="font-medium text-2xl">
              Create New Account
            </DrawerTitle>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel className="font-normal text-md">
                      Account Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Main Checking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel className="font-normal text-md">
                      Account Type
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="CURRENT">CURRENT</SelectItem>
                            <SelectItem value="SAVINGS">SAVINGS</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel className="font-normal text-md">
                      Initial Balance
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel className="font-normal text-md">
                      Account Name
                    </FormLabel>
                    <FormControl>
                      <Card className="flex justify-between items-center">
                        <CardHeader>
                          <CardTitle className="font-medium">
                            Set as Default
                          </CardTitle>
                          <CardDescription>
                            This account will be selected as Default for
                            transactions.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
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
              <DrawerFooter className="grid grid-cols-2">
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
                <Button type="submit" disabled={createAccountLoading}>
                  {createAccountLoading ? "Processing..." : "Submit"}
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default AccountDrawer;
