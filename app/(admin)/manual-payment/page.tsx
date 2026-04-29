import { createClient } from "@/lib/supabase/server"
import { ManualPaymentTable } from "@/components/admin/manual-payment/manual-payment-table"
import { ManualPaymentDialog } from "@/components/admin/manual-payment/manual-payment-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ManualPaymentPage() {
  const supabase = await createClient()

  const { data: manualPayments } = await supabase
    .from("manual_payment")
    .select("id, created_at, juice_mobile_number, bank_number, bank_name")
    .order("created_at", { ascending: false })
  const rows = manualPayments || []
  const hasEntry = rows.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manual Payment</h1>
          <p className="text-muted-foreground">
            Manage posted payment contact details for mobile and bank transfers.
          </p>
        </div>
        {!hasEntry ? <ManualPaymentDialog /> : null}
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Payment Entries</CardTitle>
          <CardDescription>
            {hasEntry
              ? "Only one payment entry is allowed. Edit the existing record below."
              : "Create and edit manual payment details shown to users."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualPaymentTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  )
}
