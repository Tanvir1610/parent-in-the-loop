import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import AdminDashboard from "./admin-dashboard"

// Only allow specific admin emails
const ADMIN_EMAILS = [
  "tanvir@supanovlabs.com",
  "ryan@supanovlabs.com",
  "vhoratanvir1610@gmail.com",
  "vhoratanvir1604@gmail.com",
]

export default async function AdminPage() {
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
  if (!user) redirect("/login?error=Please+sign+in+to+access+admin")
  if (!ADMIN_EMAILS.includes(user.email ?? "")) redirect("/?error=Access+denied")

  return <AdminDashboard userEmail={user.email ?? ""} />
}
