import { mergeTimeline } from "@/lib/derived";
import { customEvents, scholarships, universities } from "@/lib/mock-data";

export async function GET() {
  // Frontend boundary only: later this proxies DB-service with server-to-server auth.
  return Response.json(mergeTimeline(universities, scholarships, customEvents));
}
