"use client";
import { checkUser } from "@/lib/checkUser";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LayoutDashboardIcon, SquarePenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "./ui/button";

function Header() {
  const pathName = usePathname();

  useEffect(() => {
    const checkForNewUser = async () => {
      await checkUser();
    };

    checkForNewUser();
  }, []);

  return (
    <header className="fixed top-0 z-10  backdrop-blur-lg shadow-sm flex justify-center w-full mx-auto ">
      <nav className="container flex p-2 justify-between items-center ">
        <Link href={"/"}>
          <Image src={"/logo.png"} width={200} height={100} alt="logo" />
        </Link>

        {pathName === "/" && (
          <div>
            <Link
              href={"#features"}
              className="hidden md:inline text-gray-600 hover:scale-x-105"
            >
              Features
            </Link>
            <Link
              href={"#testimonials"}
              className="hidden md:inline text-gray-600 hover:scale-x-105 ml-5"
            >
              Testimonials
            </Link>
          </div>
        )}

        <div className="menu">
          <div className="flex gap-6 items-center">
            {pathName !== "/dashboard" ? (
              <Button variant="outline" asChild>
                <Link href={"/dashboard"}>
                  <LayoutDashboardIcon /> Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link href={"/"}>Home</Link>
              </Button>
            )}

            {(pathName === "/dashboard" || pathName.startsWith("/account")) && (
              <Button asChild>
                <Link href={"/transaction/create"}>
                  <SquarePenIcon /> Add Transaction
                </Link>
              </Button>
            )}

            <>
              <SignedOut>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Login</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-12 h-12 ",
                    },
                  }}
                />
              </SignedIn>
            </>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
