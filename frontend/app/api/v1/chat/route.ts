export async function POST(request: Request) {
  const body = await request.json() as { message?: string; role?: string; lang?: string };
  const message = body.message?.trim() || "";
  return Response.json({
    role: "assistant",
    content: message
      ? `I can help prioritize your German Master's application tasks based on your shortlist, costs, and deadlines. You asked: ${message}`
      : "Ask about deadlines, documents, costs, scholarships, or next steps."
  });
}
