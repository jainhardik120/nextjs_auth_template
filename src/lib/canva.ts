import { createClient } from "@hey-api/client-fetch";
import * as jose from "jose";
import { OauthService } from "@/canva-client";
import { PrismaClient } from "@prisma/client";

export async function getAccessTokenForUser(
  id: string,
  prisma: PrismaClient,
): Promise<string> {
  const storedToken = await prisma.canvaUserToken.findFirst({
    where: {
      userId: id,
    },
  });
  if (!storedToken) {
    throw new Error("No token found for user");
  }
  const claims = jose.decodeJwt(storedToken.accessToken);
  const refreshBufferSeconds = 60 * 10;
  if (claims.exp) {
    const aBitBeforeExpirationSeconds = claims.exp - refreshBufferSeconds;
    const nowSeconds = Date.now() / 1000;
    if (nowSeconds < aBitBeforeExpirationSeconds) {
      return storedToken.accessToken;
    }
  }
  const refreshToken = storedToken.refreshToken;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const result = await OauthService.exchangeAccessToken({
    client: getBasicAuthClient(),
    body: params,
    bodySerializer: (params) => params.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  if (result.error) {
    throw new Error(`Failed to refresh token ${result.error}`);
  }
  if (!result.data) {
    throw new Error(
      "No data returned when exchanging oauth code for token, but no error was returned either.",
    );
  }
  const refreshedToken = result.data;
  await prisma.canvaUserToken.updateMany({
    where: {
      userId: id,
    },
    data: {
      accessToken: refreshedToken.access_token,
      refreshToken: refreshedToken.refresh_token,
    },
  });
  return refreshedToken.access_token;
}

export function getUserClient(token: string) {
  const localClient = createClient({
    global: false,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}}`,
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`,
      );
    }
    return res;
  });

  return localClient;
}

export function getBasicAuthClient() {
  const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`;
  const localClient = createClient({
    global: false,
    headers: {
      Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
    },
    baseUrl: process.env.BASE_CANVA_CONNECT_API_URL,
  });

  localClient.interceptors.response.use((res) => {
    const requestId = res.headers.get("x-request-id");
    if (res.status >= 400) {
      console.warn(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}, ${res.body}`,
      );
    } else {
      console.log(
        `Response status ${res.status} on ${res.url}: request id: ${requestId}`,
      );
    }
    return res;
  });

  return localClient;
}
