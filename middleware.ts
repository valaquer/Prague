import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Session refresh and auth protection handled in server components.
  // Middleware is minimal to avoid Edge Runtime compatibility issues.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
