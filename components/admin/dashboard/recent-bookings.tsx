"use client"

import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"

interface Booking {
  id: string
  total_amount: number
  status: string
  created_at: string
  concerts?: { name: string; artist: string } | null
  users?: { full_name: string | null; email: string } | null
}

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const columns = [
    {
      key: "user",
      header: "Customer",
      render: (booking: Booking) => (
        <div>
          <p className="font-medium text-card-foreground">
            {booking.users?.full_name || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">{booking.users?.email}</p>
        </div>
      ),
    },
    {
      key: "concert",
      header: "Concert",
      render: (booking: Booking) => (
        <div>
          <p className="font-medium text-card-foreground">
            {booking.concerts?.name || "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">{booking.concerts?.artist}</p>
        </div>
      ),
    },
    {
      key: "total_amount",
      header: "Amount",
      render: (booking: Booking) => (
        <span className="font-medium text-card-foreground">
          ${booking.total_amount?.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking: Booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      render: (booking: Booking) => (
        <span className="text-muted-foreground">
          {format(new Date(booking.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
  ]

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Recent Bookings</CardTitle>
        <CardDescription>Latest 5 booking transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable data={bookings} columns={columns} emptyMessage="No recent bookings" />
      </CardContent>
    </Card>
  )
}
