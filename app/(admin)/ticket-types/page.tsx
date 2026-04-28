import { createClient } from "@/lib/supabase/server"
import { TicketTypesTable } from "@/components/admin/ticket-types/ticket-types-table"
import { TicketTypeDialog } from "@/components/admin/ticket-types/ticket-type-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TicketTypesPage() {
  const supabase = await createClient()

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Types</h1>
          <p className="text-muted-foreground">
            Manage ticket categories and price multipliers.
          </p>
        </div>
        <TicketTypeDialog />
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Ticket Types</CardTitle>
          <CardDescription>
            Configure ticket types with different price multipliers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketTypesTable ticketTypes={ticketTypes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
