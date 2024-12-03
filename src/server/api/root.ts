import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { createCallerFactory } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth : authRouter
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
