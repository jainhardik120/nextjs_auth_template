import Header from "@/components/sidebar/header";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
import { auth } from "@/server/auth";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SidebarLayout session={session}>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </SidebarLayout>
  );
}
