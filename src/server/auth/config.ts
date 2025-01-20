import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { generateVerificationToken } from "@/lib/tokens";
import { sendSESEmail } from "@/lib/sendMail";
import { default as LoginRequestMail } from "@/emails/login-request";
// import { sendVerificationEmail } from "../api/routers/auth";

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

const providers: Provider[] = [
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
        // const verificationToken = await generateVerificationToken(
        //   existingUser.email
        // );
        // await sendVerificationEmail(
        //   verificationToken.email,
        //   verificationToken.token
        // );
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

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "email",
      name: "Email",
      type: "email",
      maxAge: 60 * 60 * 24,
      sendVerificationRequest: async (props) => {
        await sendSESEmail(
          [props.identifier],
          "New login request",
          LoginRequestMail({ resetLink: props.url }),
        );
      },
    },
    ...providers,
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    linkAccount: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "credentials") return true;
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id as string },
      });
      if (!existingUser?.emailVerified) return false;
      return true;
    },
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const existingUser = await prisma.user.findUnique({
        where: { id: token.sub },
      });

      if (!existingUser) return token;

      const existingAccount = await prisma.account.findFirst({
        where: { userId: existingUser.id },
      });
      token.role = existingUser.role;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.isOAuth = !!existingAccount;
      return token;
    },
    session: async ({ token, session }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
