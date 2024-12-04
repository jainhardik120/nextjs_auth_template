"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ComputerIcon } from "lucide-react";
import { mainNav } from "./mobile-nav";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center gap-2 lg:mr-6">
        <ComputerIcon className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">NextJS Pro</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        {mainNav
          .filter((item) => item.href !== "/")
          .map(
            (item) =>
              item.href && (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith(item.href)
                      ? "text-foreground"
                      : "text-foreground/80",
                  )}
                >
                  {item.title}
                </Link>
              ),
          )}
      </nav>
    </div>
  );
}
