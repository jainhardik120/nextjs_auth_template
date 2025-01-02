import { getBaseUrl } from "@/lib/getBaseUrl";
import { sendMail, sendSESEmail } from "./sendMail";
import Email from "@/emails/reset-password";

const appUrl = getBaseUrl();

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${appUrl}/auth/new-verification?token=${token}`;
  sendMail(
    email,
    "Verify your email",
    "Click to verify your email",
    confirmLink,
    "",
  );
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${appUrl}/auth/new-password?token=${token}`;
  await sendSESEmail([email], "Reset your password", Email({ resetLink }));
};
