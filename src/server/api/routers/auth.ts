import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { LoginSchema, NewPasswordSchema, RegisterSchema, ResetSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { generatePasswordResetToken, generateVerificationToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import * as z from "zod";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { signIn } from "@/server/auth";
import { AuthError } from "next-auth";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";


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
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      const validatedFields = LoginSchema.safeParse(input);

      if (!validatedFields.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid fields!",
        });
      }

      const { email, password } = validatedFields.data;

      const existingUser = await ctx.db.user.findUnique({
        where: { email }
      });

      if (!existingUser || !existingUser.email || !existingUser.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email does not exist or user signed in with OAuth!",
        });
      }

      if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: "Confirmation email sent!" };
      }

      try {
        await signIn("credentials", {
          email,
          password,
          redirect: false
        });
      } catch (error) {
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid credentials!",
              });
            default:
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong!",
              });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
        });
      }
      return { success: "Logged in successfully!" };
    }),
  resetPassword: publicProcedure
    .input(ResetSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const existingUser = await ctx.db.user.findUnique({ where: { email } });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email not found!",
        });
      }

      try {
        const passwordResetToken = await generatePasswordResetToken(email);
        await sendPasswordResetEmail(
          passwordResetToken.email,
          passwordResetToken.token,
        );

        return { success: "Reset password email sent" };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send reset email. Please try again later.",
        });
      }
    }),
  newPassword: publicProcedure
    .input(
      NewPasswordSchema.extend({
        token: z.string().min(1, "Missing or invalid token!"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { password, token } = input;

      // Validate and find the password reset token
      const existingToken = await getPasswordResetTokenByToken(token);

      if (!existingToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired token!",
        });
      }

      const hasExpired = new Date(existingToken.expires) < new Date();
      if (hasExpired) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token has expired!",
        });
      }

      // Get user and validate existence
      const existingUser = await ctx.db.user.findUnique({ where: { email: existingToken.email } });
      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found!",
        });
      }

      // Hash the new password and update the user's record
      const hashedPassword = await bcrypt.hash(password, 10);
      await ctx.db.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });

      // Delete the used password reset token
      await ctx.db.passwordResetToken.delete({
        where: { id: existingToken.id },
      });

      return { success: "Password updated successfully!" };
    }),
});