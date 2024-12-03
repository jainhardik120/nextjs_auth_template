import { getBaseUrl } from "@/lib/getBaseUrl";


const appUrl = getBaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${appUrl}/auth/new-verification?token=${token}`;
  console.log(confirmLink)
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${appUrl}/auth/new-password?token=${token}`;
  console.log(resetLink)
};
