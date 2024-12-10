import { handlers } from "@/server/auth";
import { NextRequest } from "next/server";

async function apiHandler(req: NextRequest) {
  let response: Response;
  if (req.method === "GET") {
    response = await handlers.GET(req);
  } else if (req.method === "POST") {
    response = await handlers.POST(req);
  } else {
    return null;
  }
  return response;
}

export { apiHandler as GET, apiHandler as POST };
