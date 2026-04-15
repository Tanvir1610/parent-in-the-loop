import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  const { userId } = await auth()
  const { pathname } = request.nextUrl

  // Protect dashboard + admin
  if (isProtected(request) && !userId) {
    const url = new URL("/sign-in", request.url)
    url.searchParams.set("redirect_url", pathname)
    return NextResponse.redirect(url)
  }

  // CRITICAL: Rewrite /sign-up/anything → /sign-up
  // This makes our simple page.tsx win over any [[...]] catch-all in the repo
  if (pathname.startsWith("/sign-up") && pathname !== "/sign-up") {
    return NextResponse.rewrite(new URL("/sign-up", request.url))
  }

  // CRITICAL: Rewrite /sign-in/anything → /sign-in  
  if (pathname.startsWith("/sign-in") && pathname !== "/sign-in") {
    return NextResponse.rewrite(new URL("/sign-in", request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
