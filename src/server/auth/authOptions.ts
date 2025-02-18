import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import { sendSESEmail } from "@/lib/sendMail";
import { default as LoginRequestMail } from "@/emails/login-request";
import { providers } from "./config";

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
