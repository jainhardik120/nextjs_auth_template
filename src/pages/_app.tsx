import "@/styles/globals.css";
import "@/styles/prosemirror.css";
import { trpc } from "@/trpc/pages";
import { ThemeProvider } from "next-themes";
import type { AppType } from "next/app";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default trpc.withTRPC(MyApp);
