"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
// import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";
import { createQueryClient } from "./query-client";
import { getBaseUrl } from "@/lib/getBaseUrl";

// export type RouterInputs = inferRouterInputs<AppRouter>;

// export type RouterOutputs = inferRouterOutputs<AppRouter>;

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

const config = {
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    unstable_httpBatchStreamLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-react");
        return headers;
      },
    }),
  ],
};

export const client = createTRPCClient<AppRouter>(config);

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() => api.createClient(config));

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
