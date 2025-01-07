import RootLayout from "@/components/root-layout";
import { trpc } from "@/trpc/pages";
import type { AppType } from "next/app";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
};

export default trpc.withTRPC(MyApp);