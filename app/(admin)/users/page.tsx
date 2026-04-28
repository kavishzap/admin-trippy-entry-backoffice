import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/admin/users/users-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { Users, UserCheck, Shield } from "lucide-react"

export default async function UsersPage() {
  const supabase = await createClient()

  const [
    { data: users },
    { data: userTypes },
    { count: totalUsers },
    { count: adminUsers },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*, user_types(name)")
      .order("created_at", { ascending: false }),
    supabase.from("user_types").select("*").order("name"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("is_admin", true),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">
          Manage all registered users on your platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Users"
          value={totalUsers || 0}
          icon={Users}
        />
        <StatsCard
          title="Admin Users"
          value={adminUsers || 0}
          icon={Shield}
        />
        <StatsCard
          title="Regular Users"
          value={(totalUsers || 0) - (adminUsers || 0)}
          icon={UserCheck}
        />
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Users</CardTitle>
          <CardDescription>
            View and manage user accounts and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users || []} userTypes={userTypes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
