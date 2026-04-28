import { createClient } from "@/lib/supabase/server"
import { TicketsTable } from "@/components/admin/tickets/tickets-table"
import { TicketDialog } from "@/components/admin/tickets/ticket-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TicketsPage() {
  const supabase = await createClient()

  const [{ data: tickets }, { data: concerts }] = await Promise.all([
    supabase
      .from("tickets")
      .select("*")
      .order("id", { ascending: false })
      .limit(100),
    supabase.from("concerts").select("id, concert_name").order("concert_name"),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground">
            Manage all tickets across concerts.
          </p>
        </div>
        <TicketDialog concerts={concerts || []} />
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Tickets</CardTitle>
          <CardDescription>
            View and manage ticket definitions for each concert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketsTable tickets={tickets || []} concerts={concerts || []} />
        </CardContent>
      </Card>
    </div>
  )
}
