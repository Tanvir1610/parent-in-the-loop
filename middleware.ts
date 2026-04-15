import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"])

export default clerkMiddleware(async (auth, request) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  // Protect dashboard + admin
  if (isProtected(request) && !userId) {
    const url = new URL("/sign-in", request.url)
    url.searchParams.set("redirect_url", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // DO NOT redirect signed-in users away from sign-in/sign-up
  // The page itself handles the redirect after setActive() is called
  // Middleware redirect causes session to not be set properly

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
