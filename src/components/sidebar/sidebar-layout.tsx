"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, data } from "@/components/sidebar/app-sidebar";
import { Session } from "next-auth";

export function SidebarLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: Session | null;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar
        teams={data.teams}
        user={{
          name: session?.user.name ?? "",
          email: session?.user.email ?? "",
          avatar: session?.user.image ?? "",
        }}
        navItems={data.navItems}
        projects={data.projects}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
