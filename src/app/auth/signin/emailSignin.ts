"use server";

import { signIn } from "@/server/auth";

export const emailSignin = async (email: string) => {
  await signIn("email", { email: email });
};
