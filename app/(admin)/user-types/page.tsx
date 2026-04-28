import { createClient } from "@/lib/supabase/server"
import { UserTypesTable } from "@/components/admin/user-types/user-types-table"
import { UserTypeDialog } from "@/components/admin/user-types/user-type-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UserTypesPage() {
  const supabase = await createClient()

  const { data: userTypes } = await supabase
    .from("user_types")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Types</h1>
          <p className="text-muted-foreground">
            Manage user membership tiers and discount levels.
          </p>
        </div>
        <UserTypeDialog />
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All User Types</CardTitle>
          <CardDescription>
            Configure user types with different discount percentages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTypesTable userTypes={userTypes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
