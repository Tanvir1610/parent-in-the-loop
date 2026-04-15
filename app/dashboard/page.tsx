import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import DashboardClient from "./dashboard-client"

const ADMIN_EMAILS = [
  "tanvir@supanovlabs.com", "ryan@supanovlabs.com",
  "vhoratanvir1610@gmail.com", "vhoratanvir1604@gmail.com",
]

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""
  const name  = user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : ""

  // Check subscription from Supabase
  let isSubscribed = false
  let subscribedAt: string | null = null

  if (email) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      const { data } = await supabase
        .from("subscribers")
        .select("id, subscribed_at, is_active")
        .eq("email", email)
        .single()
      isSubscribed = !!data?.is_active
      subscribedAt = data?.subscribed_at ?? null
    } catch {}
  }

  return (
    <DashboardClient
      user={{ id: userId, email, name }}
      isSubscribed={isSubscribed}
      subscribedAt={subscribedAt}
      isAdmin={ADMIN_EMAILS.includes(email)}
    />
  )
}
