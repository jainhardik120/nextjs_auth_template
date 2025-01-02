import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { createCallerFactory } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { canvaRouter } from "@/server/api/routers/canva";
import { excalidrawRouter } from "./routers/excalidraw";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  canva: canvaRouter,
  excalidraw: excalidrawRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
