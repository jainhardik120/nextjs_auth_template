import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

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
      if (validatedFields.success) {
        const { email, password } = validatedFields.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          return user;
        }
      }
      return null;
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
