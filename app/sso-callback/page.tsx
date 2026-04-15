"use client"

import { useEffect } from "react"
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF6F0" }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "#7C63B8", borderTopColor: "transparent" }} />
        <p className="text-sm font-semibold" style={{ color: "#7C63B8", fontFamily: "Nunito, sans-serif" }}>
          Completing sign in…
        </p>
        <p className="text-xs" style={{ color: "#B79D84", fontFamily: "Nunito, sans-serif" }}>
          You&apos;ll be redirected in a moment
        </p>
      </div>
      <AuthenticateWithRedirectCallback
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  )
}
