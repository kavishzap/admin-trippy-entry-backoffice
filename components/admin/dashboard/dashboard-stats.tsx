import { Music, CalendarCheck, Users, DollarSign, Ticket } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"

interface DashboardStatsProps {
  totalConcerts: number
  totalBookings: number
  totalUsers: number
  totalRevenue: number
  ticketsSold: number
}

export function DashboardStats({
  totalConcerts,
  totalBookings,
  totalUsers,
  totalRevenue,
  ticketsSold,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatsCard title="Total Concerts" value={totalConcerts} icon={Music} />
      <StatsCard title="Total Bookings" value={totalBookings} icon={CalendarCheck} />
      <StatsCard title="Total Users" value={totalUsers} icon={Users} />
      <StatsCard title="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
      <StatsCard title="Tickets Sold" value={ticketsSold} icon={Ticket} />
    </div>
  )
}
