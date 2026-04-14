import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
])

const isAuthPage = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  // If Clerk keys are missing, let the request through so the site doesn't crash
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  if (isProtected(request) && !userId) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect_url", request.url)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPage(request) && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
