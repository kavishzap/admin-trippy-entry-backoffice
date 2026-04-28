import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats"
import { RecentBookings } from "@/components/admin/dashboard/recent-bookings"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch dashboard statistics
  const [
    { count: totalConcerts },
    { count: totalBookings },
    { count: totalUsers },
    { data: bookings },
  ] = await Promise.all([
    supabase.from("concerts").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*, concerts(name, artist), users(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
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

  // Calculate tickets sold
  const { data: ticketsSold } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "sold")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your ticketing platform.
        </p>
      </div>

      <DashboardStats
        totalConcerts={totalConcerts || 0}
        totalBookings={totalBookings || 0}
        totalUsers={totalUsers || 0}
        totalRevenue={totalRevenue}
        ticketsSold={ticketsSold?.count || 0}
      />

      <RecentBookings bookings={bookings || []} />
    </div>
  )
}
