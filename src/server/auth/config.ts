import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers"

const providers : Provider[] = [
  {
    id : "email",
    name : "Email",
    type : "email",
    maxAge : 60*60*24,
    sendVerificationRequest : async (props) => {
      console.log(props);
    }
  }
]

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name, type : providerData.type }
    } else {
      return { id: provider.id, name: provider.name, type : provider.type  }
    }
  })
  .filter((provider) => ((provider.type !== "credentials") && (provider.type !== "email")))


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  pages : {
    signIn : "/signin"
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
