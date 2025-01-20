import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { NewPasswordSchema, RegisterSchema, ResetSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import {
  generatePasswordResetToken,
  generateVerificationToken,
} from "@/lib/tokens";
import { default as ResetPasswordMail } from "@/emails/reset-password";
import * as z from "zod";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { default as VerifyMailEmail } from "@/emails/verify-email";
import { sendSESEmail } from "@/lib/sendMail";

const appUrl = getBaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${appUrl}/auth/new-verification?token=${token}`;
  await sendSESEmail(
    [email],
    "Verify your email",
    VerifyMailEmail({ resetLink: confirmLink }),
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${appUrl}/auth/new-password?token=${token}`;
  await sendSESEmail(
    [email],
    "Reset your password",
    ResetPasswordMail({ resetLink }),
  );
};

export const authRouter = createTRPCRouter({
  sessionDetails: publicProcedure.query(async ({ ctx }) => {
    return ctx.session;
  }),
  register: publicProcedure
    .input(RegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const validatedFields = RegisterSchema.safeParse(input);
      if (!validatedFields.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid fields!",
        });
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
          message: "Email already in use!",
        });
      }
      await ctx.db.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
      return { success: "Confirmation email sent!" };
    }),
  sendVerificationEmail: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const email = input;
      const existingUser = await ctx.db.user.findUnique({ where: { email } });
      if (!existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email does not exist!",
        });
      }
      if (existingUser.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already verified!",
        });
      }
      const verificationToken = await generateVerificationToken(email);
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );
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
      } catch (error) {
        console.log(error);
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
      }),
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
      const existingUser = await ctx.db.user.findUnique({
        where: { email: existingToken.email },
      });
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
