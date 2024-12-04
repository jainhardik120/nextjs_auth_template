"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Social } from "@/components/auth/social";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Route } from "next";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: Route;
  showSocial?: boolean;
}

export function CardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <p className="text-center text-lg font-bold">{headerLabel}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <Button variant="link" size="sm" className="w-full font-normal" asChild>
          <Link href={backButtonHref} className="text-sm text-muted-foreground">
            {backButtonLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
