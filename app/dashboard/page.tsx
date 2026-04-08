import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()     { return cookieStore.getAll() },
        setAll(list) { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [subRes] = await Promise.all([
    supabase
      .from("subscribers")
      .select("id, subscribed_at, is_active")
      .eq("email", user.email ?? "")
      .single(),
  ])

  const isAdmin = ["tanvir@supanovlabs.com", "ryan@supanovlabs.com",
    "vhoratanvir1610@gmail.com", "vhoratanvir1604@gmail.com"].includes(user.email ?? "")

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "", name: user.user_metadata?.full_name ?? "" }}
      isSubscribed={!!subRes.data?.is_active}
      subscribedAt={subRes.data?.subscribed_at ?? null}
      isAdmin={isAdmin}
    />
  )
}
