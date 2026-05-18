---
name: expo-new-api-route
description: Scaffolds an Expo Router 55 server API route under app/api/<name>+api.ts. Produces a TypeScript file that exports named HTTP method handlers (GET, POST, PUT, DELETE) returning a Response object (via Response.json or new Response with content-type headers). Confirms that app.config.ts has web.output set to "server" so the API route runs server-side. Validates the request body with a typed schema before responding. Refuses default exports, bare object returns, returning data without Response wrapper, and Node-only APIs in routes intended for both web and native.
---

# expo-new-api-route

Use when the user asks for "an API endpoint", "a server route", or "a backend handler" inside an Expo Router project.

## Prerequisite

`app.config.ts` must set:

```ts
web: { bundler: "metro", output: "server" }
```

Without it, the `+api.ts` files are not compiled into the server bundle.

## File path

API routes live at `app/api/<name>+api.ts`. The URL is `/api/<name>`.

| Filename | URL |
|----------|-----|
| `app/api/health+api.ts` | `/api/health` |
| `app/api/posts/[id]+api.ts` | `/api/posts/:id` |

## Template

```ts
// app/api/posts/[id]+api.ts
type Post = { id: string; title: string };

export async function GET(req: Request, { id }: { id: string }) {
  const post: Post = { id, title: `Post ${id}` };
  return Response.json(post);
}

export async function PUT(req: Request, { id }: { id: string }) {
  const body = (await req.json()) as Partial<Post>;
  if (typeof body.title !== "string" || body.title.length === 0) {
    return new Response(JSON.stringify({ error: "title required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  return Response.json({ id, title: body.title } satisfies Post);
}

export async function DELETE(req: Request, { id }: { id: string }) {
  return new Response(null, { status: 204 });
}
```

## Refuses

- `export default function handler(...)` (must export named GET/POST/PUT/DELETE)
- `return { ok: true }` (must return a `Response` object)
- Using `fs`, `path`, or Node-only APIs without confirming the server runtime supports them
- Calling client-only Expo modules (`expo-camera`, `expo-image`) from inside a `+api.ts`
- Reading secrets from `EXPO_PUBLIC_*` (use plain `process.env.X` server-side)

## After scaffolding

Remind the user to deploy with `eas deploy` (or their hosting target) and that API routes do not run in the native mobile bundle (mobile clients call the deployed server URL).

Source: https://docs.expo.dev/router/reference/api-routes/
