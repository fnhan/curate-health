import { serialize } from "cookie";

export async function POST(request: Request, params: { slug: string }) {
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
