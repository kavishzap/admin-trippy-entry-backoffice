import { createClient } from "@/lib/supabase/server"
import { BookingsTable } from "@/components/admin/bookings/bookings-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { CalendarCheck, CheckCircle, Clock, XCircle, DollarSign } from "lucide-react"

export default async function BookingsPage() {
  const supabase = await createClient()

  const [
    { data: bookings },
    { count: totalBookings },
    { count: confirmedBookings },
    { count: pendingBookings },
    { count: cancelledBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, concerts(name, artist), users(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
  ])

  // Calculate total revenue
  const { data: revenueData } = await supabase
    .from("bookings")
    .select("total_amount")
    .eq("payment_status", "completed")

  const totalRevenue = revenueData?.reduce(
    (sum, booking) => sum + (booking.total_amount || 0),
    0
  ) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">
          Manage all booking transactions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Bookings"
          value={totalBookings || 0}
          icon={CalendarCheck}
        />
        <StatsCard
          title="Confirmed"
          value={confirmedBookings || 0}
          icon={CheckCircle}
        />
        <StatsCard
          title="Pending"
          value={pendingBookings || 0}
          icon={Clock}
        />
        <StatsCard
          title="Cancelled"
          value={cancelledBookings || 0}
          icon={XCircle}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground">All Bookings</CardTitle>
          <CardDescription>
            View and manage all booking transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings || []} />
        </CardContent>
      </Card>
    </div>
  )
}
