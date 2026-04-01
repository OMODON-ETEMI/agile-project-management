import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

/**
 * Middleware function to authenticate and redirect users
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = isPublicRoute(path);
  const authStatus = request.cookies.get("refresh_token")?.value;

  // const {token, headers } = await getAccessToken(request);

  // Redirect users to the sign-up page if they're not logged in and accessing a protected route
  if (!isPublicPath && !authStatus) {
    // Take the user to Login page
    const loginUrl = new URL("/user/signup", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  // If the user is authenticated and trying to access the sign-up page, redirect them to the home page
  if (authStatus && path === "/user/signup") {
    const homeUrl = new URL("/organisation", request.url);
    return NextResponse.redirect(homeUrl);
  }
  // const response = NextResponse.next();
  // response.headers.set("x-access-token", token);
  // response.headers.set("set-cookie", headers || "");
  //
return NextResponse.next();
}

/**
 * Helper function to check if a route is public
 * @param {string} path - The route path
 * @returns {boolean} True if the route is public, false otherwise
 */
function isPublicRoute(path: string) {
  return ["/user/signup", "/user/signin", "/" ].includes(path);
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
