import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"])
const isAuthPage  = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])

export default clerkMiddleware(async (auth, request) => {
  // Safety: if keys missing, pass through everything
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  if (isProtected(request) && !userId) {
    const url = new URL("/sign-in", request.url)
    url.searchParams.set("redirect_url", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage(request) && userId) {
    return NextResponse.redirect(new URL("/", request.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
