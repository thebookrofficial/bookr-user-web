import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";

  // Check if the user is on a mobile device
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);

  if (isMobile) {
    // Seamlessly proxy the request to the Mobile PWA Vercel deployment
    const pwaUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://bookr-app-pwa.vercel.app",
    );
    return NextResponse.rewrite(pwaUrl);
  }

  // If on desktop, proceed normally with the Desktop Web project
  return NextResponse.next();
}

export const config = {
  // Apply this middleware to all routes except static assets and API routes
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
