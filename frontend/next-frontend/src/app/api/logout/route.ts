import { NextRequest, NextResponse } from "next/server";

const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://127.0.0.1:5000/";

export async function POST(req: NextRequest) {
  const response = await fetch(`${pythonBackendUrl}logout`, {
    method: "POST",
    headers: {
      Cookie: req.headers.get("cookie") || "",
    },
  });
  const res = NextResponse.redirect(new URL("/user/signup", req.url));

  res.cookies.set("refresh_token", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
  });

  return res;
}
