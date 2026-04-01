import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const redirectUrl = req.nextUrl.searchParams.get("redirect") || "/";
    const response = await fetch("http://127.0.0.1:5000/auth/refresh", {
      method: "POST",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });
    if (response.status === 200) {
      const setCookies = response.headers.get("Set-Cookie");
      const res = NextResponse.redirect(
        `${req.nextUrl.origin}${redirectUrl}`,
        307
      );
      if (setCookies) {
        res.headers.set("Set-Cookie", setCookies);
      }

      return res;
    } else {
      const data = await response.json();
      const res = NextResponse.redirect(new URL("/user/signup", req.url), 307);
      res.cookies.set("refresh_token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), // force expiry
      });
      return res;
      // throw new Error("Failed to refresh authentication token")
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to refresh authentication token: ${error}` },
      { status: 500 }
    );
  }
}
