import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/prisma"

export const authOptions : NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      sendVerificationRequest(params) {
        console.log(params);
      }
    })
  ]
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }