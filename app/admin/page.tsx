import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import AdminDashboard from "./admin-dashboard"

const ADMIN_EMAILS = [
  "tanvir@supanovlabs.com", "ryan@supanovlabs.com",
  "vhoratanvir1610@gmail.com", "vhoratanvir1604@gmail.com",
]

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/admin")

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ""

  if (!ADMIN_EMAILS.includes(email)) redirect("/?error=Access+denied")

  return <AdminDashboard userEmail={email} />
}
