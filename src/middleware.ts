import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/sign-in", "/"];
  if (publicPaths.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_to", pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_to", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /sign-in (login page)
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - /static/* (static files)
     * - /favicon.ico, /robots.txt (public files)
     */
    "/((?!sign-in|api|_next|static|favicon.ico).*)",
  ],
};
