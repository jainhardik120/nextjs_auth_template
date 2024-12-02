import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    
  ]
} satisfies NextAuthConfig;