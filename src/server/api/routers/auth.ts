import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { RegisterSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import * as z from "zod";
import { getVerificationTokenByToken } from "@/data/verification-token";


export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const validatedFields = RegisterSchema.safeParse(input);
      if (!validatedFields.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid fields!"
        })
      }

      const { email, password, name } = validatedFields.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      let existingUser;
      try {
        existingUser = await ctx.db.user.findUnique({ where: { email } });
      } catch {
        existingUser = null;
      }
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already in use!"
        })
      }
      await ctx.db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token);
      return { success: "Confirmation email sent!" };
    }),
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      const existingToken = await getVerificationTokenByToken(token);
      if (!existingToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token does not exist.",
        });
      }
      const hasExpired = new Date(existingToken.expires) < new Date();
      if (hasExpired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token has expired.",
        });
      }
      const existingUser = await ctx.db.user.findUnique({
        where: { email: existingToken.email },
      });
      if (!existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email does not exist.",
        });
      }
      await ctx.db.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: new Date(),
          email: existingToken.email,
        },
      });
      await ctx.db.emailVerificationToken.delete({
        where: { id: existingToken.id },
      });
      return { success: "Email verified!" };
    }),
});
