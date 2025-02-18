import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export enum ErrorCode {
  INVALID_CREDENTIALS = "invalid_credentials",
  USER_NOT_FOUND = "user_not_found",
  EMAIL_NOT_VERIFIED = "email_not_verified",
  INVALID_REQUEST = "invalid_request",
}

class CustomError extends CredentialsSignin {
  code: ErrorCode;
  constructor(code: ErrorCode, message?: string) {
    super(message || "An error occurred during the sign-in process");
    this.code = code;
    this.name = "CustomError";
  }
}

export const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: {
        label: "Email",
        type: "email",
        placeholder: "jsmith@example.com",
      },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const validatedFields = LoginSchema.safeParse(credentials);
      if (!validatedFields.success) {
        throw new CustomError(ErrorCode.INVALID_REQUEST);
      }
      const { email, password } = validatedFields.data;
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (!existingUser || !existingUser.email) {
        throw new CustomError(ErrorCode.USER_NOT_FOUND);
      }
      if (!existingUser.password) {
        throw new CustomError(ErrorCode.INVALID_CREDENTIALS);
      }
      if (!existingUser.emailVerified) {
        throw new CustomError(ErrorCode.EMAIL_NOT_VERIFIED);
      }
      const passwordsMatch = await bcrypt.compare(
        password,
        existingUser.password,
      );
      if (passwordsMatch) {
        return existingUser;
      }
      throw new CustomError(ErrorCode.INVALID_CREDENTIALS);
    },
  }),
];

export const authProviderOptions = {
  providers: providers,
} satisfies NextAuthConfig;
