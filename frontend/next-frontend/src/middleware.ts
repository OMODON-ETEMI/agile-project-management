import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

/**
 * Middleware function to authenticate and redirect users
 */
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = isPublicRoute(path);
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;

  if (refreshToken) {
    try {
      const authRes = await fetch(`${pythonBackendUrl}auth/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
      });

      if (authRes.ok) {
        const { token } = await authRes.json();
        const newCookie = authRes.headers.get("set-cookie");

        const response = NextResponse.next();

        response.headers.set("x-internal-at", token);

        if (newCookie) {
          response.headers.set("set-cookie", newCookie);
        }

        if (path === "/user/signup" || path === "/user/signin") {
          return NextResponse.redirect(new URL("/organisation", request.url));
        }

        return response;
      } 
    
      if (authRes.status === 401 || authRes.status === 403) {
        console.log("Unaouthorised Error: ", await authRes.text());
        throw new Error("Unauthorized");
      }
    } catch (error) {
      console.log("Error refreshing token:", error);
      const response = NextResponse.redirect(new URL("/user/signup", request.url));
      response.cookies.delete("refresh_token");
      return response;
    }
  }

  if (!isPublicPath && !refreshToken) {
    const loginUrl = new URL("/user/signup", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
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
