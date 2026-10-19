import { serialize } from "cookie";

// No second argument: /api/login has no dynamic segment, so there are no
// route params, and this handler never read them. Next 14 did not check
// handler signatures and 16 does, which is what surfaced it.
export async function POST(request: Request) {
  const data: { password: string } = await request.json();
  const password = data.password;
  const maxAge = 3600 * 24 * 30; // 14 days
  const cookie = serialize(process.env.PASSWORD_COOKIE_NAME!, "true", {
    httpOnly: true,
    path: "/",
    maxAge,
  });

  if (process.env.PAGE_PASSWORD !== password) {
    return new Response("incorrect password", {
      status: 401,
    });
  }

  return new Response("password correct", {
    status: 200,
    headers: {
      "Set-Cookie": cookie,
    },
  });
}
