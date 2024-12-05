import { getBaseUrl } from "@/lib/getBaseUrl";
import { sendMail } from "./sendMail";

const appUrl = getBaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${appUrl}/auth/new-verification?token=${token}`;
  sendMail(email, "Verify your email", "Click to verify your email", confirmLink, "");
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${appUrl}/auth/new-password?token=${token}`;
  sendMail(email, "Reset your password", "Click to reset your password", resetLink, "");
};
