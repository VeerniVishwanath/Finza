import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function NavButton({
  children,
  link,
  name,
  variant = "",
  className,
}) {
  return (
    <Button variant={variant} className={className} asChild>
      <Link href={link}>
        {children}
        <span className="hidden lg:block">{name}</span>
      </Link>
    </Button>
  );
}
