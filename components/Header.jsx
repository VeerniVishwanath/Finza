import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

function Header() {
  return (
    <header className="fixed top-0 z-10  backdrop-blur-lg shadow-sm flex justify-center w-full mx-auto ">
      <nav className="container flex p-2 justify-between items-center ">
        <Link href={"/"}>
          <Image src={"/logo.png"} width={200} height={100} alt="logo" />
        </Link>

        <div className="menu">
          <SignedOut>
            <div className="flex gap-6 items-center">
              <Link href={"#features"} className="text-gray-600 hover:scale-x-105">Features</Link>
              <Link href={"#testimonials"} className="text-gray-600 hover:scale-x-105">Testimonials</Link>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Login</Link>
              </Button>
            </div>
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
        </div>
      </nav>
    </header>
  );
}

export default Header;
