import NextAuth from "next-auth";
import { cache } from "react";
import { authOptions } from "./authOptions";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authOptions);

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };

export const currentUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user?.role;
};
