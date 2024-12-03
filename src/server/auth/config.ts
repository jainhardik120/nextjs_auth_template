import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"


const providers: Provider[] = [
  {
    id: "email",
    name: "Email",
    type: "email",
    maxAge: 60 * 60 * 24,
    sendVerificationRequest: async (props) => {
      console.log(props);
    }
  },
  Credentials({
    async authorize(credentials) {
      const validatedFields = LoginSchema.safeParse(credentials);
      if (validatedFields.success) {
        const { email, password } = validatedFields.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          return user
        };
      }
      return null;
    },
  }),
]

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name, type: providerData.type }
    } else {
      return { id: provider.id, name: provider.name, type: provider.type }
    }
  })
  .filter((provider) => ((provider.type !== "credentials") && (provider.type !== "email")))


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  }
} satisfies NextAuthConfig;
