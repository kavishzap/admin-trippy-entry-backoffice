import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/admin/settings/settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .order("key")

  // Convert settings array to object for easier access
  const settingsMap = settings?.reduce(
    (acc, setting) => {
      acc[setting.key] = setting
      return acc
    },
    {} as Record<string, { id: string; key: string; value: string | null; description: string | null }>
  ) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your ticketing platform settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">General Settings</CardTitle>
            <CardDescription>
              Basic platform configuration options.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  id: settingsMap.site_name?.id || "",
                  key: "site_name",
                  value: settingsMap.site_name?.value || "Trippy Entry",
                  label: "Site Name",
                  description: "The name of your ticketing platform",
                },
                {
                  id: settingsMap.support_email?.id || "",
                  key: "support_email",
                  value: settingsMap.support_email?.value || "",
                  label: "Support Email",
                  description: "Customer support email address",
                },
                {
                  id: settingsMap.currency?.id || "",
                  key: "currency",
                  value: settingsMap.currency?.value || "USD",
                  label: "Currency",
                  description: "Default currency for transactions",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Booking Settings</CardTitle>
            <CardDescription>
              Configure booking rules and policies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              settings={[
                {
                  id: settingsMap.max_tickets_per_booking?.id || "",
                  key: "max_tickets_per_booking",
                  value: settingsMap.max_tickets_per_booking?.value || "10",
                  label: "Max Tickets Per Booking",
                  description: "Maximum tickets allowed per booking",
                  type: "number",
                },
                {
                  id: settingsMap.booking_fee_percentage?.id || "",
                  key: "booking_fee_percentage",
                  value: settingsMap.booking_fee_percentage?.value || "5",
                  label: "Booking Fee (%)",
                  description: "Service fee percentage added to bookings",
                  type: "number",
                },
                {
                  id: settingsMap.refund_policy_days?.id || "",
                  key: "refund_policy_days",
                  value: settingsMap.refund_policy_days?.value || "7",
                  label: "Refund Policy (Days)",
                  description: "Days before event for full refund eligibility",
                  type: "number",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">Database Information</CardTitle>
          <CardDescription>
            Current database statistics and information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DatabaseStats />
        </CardContent>
      </Card>
    </div>
  )
}

async function DatabaseStats() {
  const supabase = await createClient()

  const [
    { count: concerts },
    { count: tickets },
    { count: bookings },
    { count: users },
    { count: venues },
  ] = await Promise.all([
    supabase.from("concerts").select("*", { count: "exact", head: true }),
    supabase.from("tickets").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("venues").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Concerts", value: concerts || 0 },
    { label: "Tickets", value: tickets || 0 },
    { label: "Bookings", value: bookings || 0 },
    { label: "Users", value: users || 0 },
    { label: "Venues", value: venues || 0 },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-secondary/50 p-4 text-center"
        >
          <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
