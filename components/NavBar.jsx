"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  HouseIcon,
  LayoutDashboardIcon,
  LogInIcon,
  SquarePenIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavButton from "./NavButton";

export default function NavBar() {
  const pathName = usePathname();

  return (
    <nav className="container flex p-2 justify-between items-center ">
      <Link href={"/"}>
        <Image
          src={"/logo.png"}
          width={200}
          height={100}
          alt="logo"
          className="w-32 sm:w-[200px]"
        />
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
          {pathName !== "/" && (
            <NavButton
              link={"/"}
              name="Home"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <HouseIcon />
            </NavButton>
          )}

          <SignedIn>
            {pathName !== "/dashboard" && (
              <NavButton link={"/dashboard"} name="Dashboard" variant="outline">
                <LayoutDashboardIcon />
              </NavButton>
            )}
          </SignedIn>

          {(pathName === "/dashboard" || pathName.startsWith("/account")) && (
            <NavButton link={"/transaction/create"} name={"Add Transaction"}>
              <SquarePenIcon />
            </NavButton>
          )}

          <>
            <SignedOut>
              <NavButton link={"/dashboard"} variant="outline">
                <LogInIcon /> Login
              </NavButton>
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
  );
}
