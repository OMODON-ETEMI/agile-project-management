import { NextRequest, NextResponse } from "next/server";
import { AxiosInstance } from "axios";
import { cache } from "react";
/**
 * Extracts the Cookie string from a NextRequest to forward to the backend
 */

function getCookiesFromSource(req: NextRequest | AxiosInstance): string {
  if (!req) return "";

  if ("defaults" in req) {
    const axiosCookie =
      req.defaults.headers["Cookie"] || req.defaults.headers.common["Cookie"];

    return typeof axiosCookie === "string" ? axiosCookie : "";
  }

  if ("cookies" in req && typeof req.cookies.getAll === "function") {
    return req.cookies
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  }

  if ("headers" in req && typeof req.headers.get === "function") {
    return req.headers.get("cookie") || "";
  }

  return "";
}

let refreshTokenPromise: Promise<string | null> | null = null;

/** Get a fresh access token for SSR using the HttpOnly Refresh Token. */
export const getServerAccessToken = async (
  req: NextRequest | AxiosInstance,
) => {
  if (refreshTokenPromise) {
    return refreshTokenPromise;
  }

  refreshTokenPromise = (async () => {
    const cookieHeader = getCookiesFromSource(req);
    try {
      const res = await fetch("http://127.0.0.1:5000/auth/server/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
      });

      if (!res.ok) {
        const resClone = res.clone();
        const errorText = await res.text();
        console.warn(`Token refresh failed (${res.status}): ${errorText}`);
        const data = await resClone.json();
        return data;
      }
      const data = await res.json();
      return data.token;
    } catch (error) {
      return null;
    } finally{
      refreshTokenPromise = null;
    }
  })()
  return refreshTokenPromise;
};

// --- PART 2: ROUTE HANDLER ---

async function handler(
  req: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  let backendUrl = "";
  const slugPath = params.slug.join("/");
  const queryString = req.nextUrl.search || "";

  if (params.slug?.[0] === "node") {
    const nodeSlug = params.slug.slice(1).join("/");
    backendUrl = `http://127.0.0.1:4000/${nodeSlug}${queryString}`;
  } else {
    backendUrl = `http://127.0.0.1:5000/${slugPath}${queryString}`;
  }

  try {
    let body = undefined;
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const contentLength = req.headers.get("content-length");
      if (contentLength && contentLength !== "0") {
        try {
          const jsonBody = await req.json();
          body = JSON.stringify(jsonBody);
        } catch {
          console.log("Body was not JSON, sending undefined");
        }
      }
    }

    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers: req.headers,
      body: body,
    });

    let data;
    try {
      data = await backendResponse.json();
    } catch (e) {
      data = null;
    }

    const response = NextResponse.json(data || {}, {
      status: backendResponse.status,
    });

    const backendSetCookie = backendResponse.headers.get("Set-Cookie");
    if (backendSetCookie) {
      response.headers.set("Set-Cookie", backendSetCookie);
    }
    return response;
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
