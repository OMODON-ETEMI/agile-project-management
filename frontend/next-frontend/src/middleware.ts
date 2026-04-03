import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

/**
 * Middleware function to authenticate and redirect users
 */
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const path = request.nextUrl.pathname;
  const isPublicPath = isPublicRoute(path);
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const pythonBackendUrl =
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://127.0.0.1:5000/";

  if (refreshToken) {
    console.log("Found refresh token in cookies, attempting to refresh access token...");
    const authRes = await fetch(`${pythonBackendUrl}auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
    if (authRes.ok) {
      const { token } = await authRes.json();
      const newCookie = authRes.headers.get("set-cookie");
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-internal-at", token);
      if (newCookie) res.headers.set("set-cookie", newCookie);
      res.headers.set("x-internal-AT", token);
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      const loginUrl = new URL("/user/signup", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("refresh_token", "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.cookies.delete("refresh_token");
      return response;
    }
    return res;
  }

  // Redirect users to the sign-up page if they're not logged in and accessing a protected route
  if (!isPublicPath && !refreshToken) {
    // Take the user to Login page
    const loginUrl = new URL("/user/signup", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  // If the user is authenticated and trying to access the sign-up page, redirect them to the home page
  if (refreshToken && path === "/user/signup") {
    const homeUrl = new URL("/organisation", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

/**
 * Helper function to check if a route is public
 * @param {string} path - The route path
 * @returns {boolean} True if the route is public, false otherwise
 */
function isPublicRoute(path: string) {
  return ["/user/signup", "/user/signin", "/"].includes(path);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
