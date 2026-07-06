export async function POST() {
  // Frontend boundary only: later this proxies DB-service with server-to-server auth.
  return Response.json({ ok: true });
}
