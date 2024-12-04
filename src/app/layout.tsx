import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col">
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>
              <Header />
              <div className="min-h-14"></div>
              {children}
              <Footer />
            </SessionProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
