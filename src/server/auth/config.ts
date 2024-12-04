import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

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
  {
    id: "email",
    name: "Email",
    type: "email",
    maxAge: 60 * 60 * 24,
    sendVerificationRequest: async (props) => {
      console.log(props);
    },
  },
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
        const verificationToken = await generateVerificationToken(
          existingUser.email,
        );
        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token,
        );
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

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return {
        id: providerData.id,
        name: providerData.name,
        type: providerData.type,
      };
    } else {
      return { id: provider.id, name: provider.name, type: provider.type };
    }
  })
  .filter(
    (provider) => provider.type !== "credentials" && provider.type !== "email",
  );

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
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
