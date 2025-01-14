import { ModeToggle } from "@/components/theme-toggle";
import React from "react";
import { MobileNav } from "./mobile-nav";
import { MainNav } from "./main-nav";
import { CommandMenu } from "./command-menu";
import UserButton from "./auth/user-button";

const Header = () => {
  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
        <div className="flex h-14 items-center px-4">
          <MainNav />
          <MobileNav />
          <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <CommandMenu />
            </div>
            {/* @ts-expect-error Server Component */}
            <UserButton />
            <ModeToggle />
          </div>
        </div>
      </header>
      <div className="min-h-14"></div>
    </>
  );
};

export default Header;
