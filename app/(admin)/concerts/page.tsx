import { createClient } from "@/lib/supabase/server"
import { ConcertsTable } from "@/components/admin/concerts/concerts-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ConcertsPage() {
  const supabase = await createClient()

  const { data: concerts } = await supabase.from("concerts").select("*").order("id", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Concerts</h1>
          <p className="text-muted-foreground">
            Manage all concerts and events on your platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/concerts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Concert
          </Link>
        </Button>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Concerts</CardTitle>
          <CardDescription>
            A list of all concerts including schedule, location, type, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConcertsTable concerts={concerts || []} />
        </CardContent>
      </Card>
    </div>
  )
}
