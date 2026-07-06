import { initialMockState } from "@/lib/mock-data";

export async function POST(request: Request) {
  // Frontend boundary only: later this proxies DB-service with server-to-server auth.
  const body = await request.json() as { token?: string };
  if (body.token === initialMockState.accessTokens.family) return Response.json({ role: "family", token: body.token });
  if (body.token === initialMockState.accessTokens.counselor) return Response.json({ role: "counselor", token: body.token });
  return Response.json({ error: "Invalid token" }, { status: 401 });
}
