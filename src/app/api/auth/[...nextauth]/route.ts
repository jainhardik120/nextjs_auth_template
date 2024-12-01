import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/app/prisma"


const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      sendVerificationRequest(params) {
        console.log(params);
      }
    })
  ]
});

export { handler as GET, handler as POST }