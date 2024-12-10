import Header from "@/components/sidebar/header";
import { SidebarLayout } from "@/components/sidebar/sidebar-layout";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarLayout>
      <Header />
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </SidebarLayout>
  );
}
