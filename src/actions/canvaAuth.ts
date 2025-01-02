"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";
import crypto from "crypto";
import { redirect } from "next/navigation";

function generateCodeVerifierAndChallenge() {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const hash = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge: hash };
}

async function saveSession(
  sessionId: string,
  codeVerifier: string,
  userId: string,
) {
  await prisma.canvaSessionState.create({
    data: {
      sessionId,
      codeVerifier,
      userId,
      expires: new Date(Date.now() + 300 * 1000),
    },
  });
}

export default async function canvaAuth() {
  const userSession = await auth();
  if (!userSession) {
    return;
  }
  const userId = userSession.user.id;
  const { codeVerifier, codeChallenge } = generateCodeVerifierAndChallenge();
  const sessionId = crypto.randomBytes(16).toString("hex");
  await saveSession(sessionId, codeVerifier, userId);
  const authUrl = new URL("https://www.canva.com/api/oauth/authorize");
  authUrl.searchParams.append(
    "client_id",
    process.env.CANVA_CLIENT_ID as string,
  );
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append(
    "scope",
    "design:meta:read design:content:read design:content:write design:permission:read design:permission:write",
  );
  authUrl.searchParams.append("state", sessionId);
  authUrl.searchParams.append("code_challenge", codeChallenge);
  authUrl.searchParams.append("code_challenge_method", "S256");
  redirect(authUrl.toString());
}
