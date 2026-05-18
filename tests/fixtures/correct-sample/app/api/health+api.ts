export async function GET(_req: Request) {
  return Response.json({ ok: true, time: Date.now() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { ping?: string };
  if (typeof body.ping !== "string") {
    return new Response(JSON.stringify({ error: "ping required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  return Response.json({ pong: body.ping }, { status: 201 });
}
