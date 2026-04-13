import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Routes that require authentication
const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
])

// Routes only for non-authenticated users
const isAuthPage = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/login(.*)",
  "/signup(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // Protect dashboard + admin — redirect to sign-in if not logged in
  if (isProtected(request) && !userId) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("redirect_url", request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect logged-in users away from sign-in/sign-up pages
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
