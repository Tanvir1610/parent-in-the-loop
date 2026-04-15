import type React from "react"
import type { Metadata } from "next"
import { Nunito, Quicksand } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ScrollRevealProvider from "@/components/scroll-reveal-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import AIChatbot from "@/components/ai-chatbot"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Parent in the Loop – AI Literacy for Families",
  description:
    "Help your elementary and middle-school kids develop a joyful, empowered understanding of artificial intelligence. Weekly articles, family activities, and conversations that build curiosity, critical thinking, and ethical awareness.",
  keywords: ["AI literacy", "kids and AI", "family conversations", "parenting", "AI education", "critical thinking"],
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png",  media: "(prefers-color-scheme: dark)"  },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignInUrl="/" afterSignUpUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en" suppressHydrationWarning>
        <body className={`${nunito.variable} ${quicksand.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ScrollRevealProvider />
            {children}
            <AIChatbot />
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
