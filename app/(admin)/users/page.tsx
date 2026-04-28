import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/admin/users/users-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PAGE_SIZE = 10

interface UsersPageProps {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const q = (sp.q ?? "").trim()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  let listQuery = supabase
    .from("user_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (q) {
    const esc = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/,/g, " ")
    const pat = `%${esc}%`
    listQuery = listQuery.or(
      `email.ilike.${pat},phone.ilike.${pat},first_name.ilike.${pat},last_name.ilike.${pat}`,
    )
  }

  const { data: profiles, count } = await listQuery.range(from, to)

  let users = [...(profiles || [])]
  let total = count ?? 0

  const { data: authResult } = await supabase.auth.getUser()
  const authUser = authResult?.user

  if (authUser && !q) {
    const { data: profileRow } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle()

    if (!profileRow && page === 1) {
      const synthetic = {
        id: authUser.id,
        first_name: (authUser.user_metadata?.first_name as string | undefined) || null,
        last_name: (authUser.user_metadata?.last_name as string | undefined) || null,
        email: authUser.email || null,
        phone: authUser.phone || null,
        created_at: authUser.created_at || new Date().toISOString(),
      }
      if (!users.some((u) => u.id === synthetic.id)) {
        users.unshift(synthetic)
        if (users.length > PAGE_SIZE) {
          users = users.slice(0, PAGE_SIZE)
        }
        total += 1
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">
          View all registered users on your platform.
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Users</CardTitle>
          <CardDescription>
            Read-only list of registered users. Search by email, name, or phone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
            <UsersTable
              users={users}
              total={total}
              page={page}
              pageSize={PAGE_SIZE}
              query={q}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
