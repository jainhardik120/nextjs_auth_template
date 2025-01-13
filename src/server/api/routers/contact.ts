import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const contactRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        subject: z.string(),
        email: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.message.create({
        data: {
          subject: input.subject,
          email: input.email,
          message: input.message,
        },
      });
    }),
  listMessages: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.message.findMany();
  }),
});
