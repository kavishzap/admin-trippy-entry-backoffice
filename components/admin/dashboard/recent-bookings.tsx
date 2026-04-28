"use client"

import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import type { BookingRow } from "@/components/admin/bookings/bookings-table"

interface RecentBookingsProps {
  bookings: BookingRow[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (booking: BookingRow) => (
        <span className="font-medium text-card-foreground">
          {booking.user_display_name?.trim() || "Unknown"}
        </span>
      ),
    },
    {
      key: "concert",
      header: "Concert",
      render: (booking: BookingRow) => (
        <div>
          <p className="font-medium text-card-foreground">
            {booking.concert_name || "Unknown"}
          </p>
        </div>
      ),
    },
    {
      key: "tickets",
      header: "Tickets",
      render: (booking: BookingRow) => (
        <span className="max-w-[200px] text-sm text-card-foreground" title={booking.tickets_display}>
          {booking.tickets_display || "—"}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (booking: BookingRow) => (
        <span className="font-medium text-card-foreground">
          RS {booking.total != null && booking.total !== "" ? booking.total : "0"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking: BookingRow) => (
        <Badge
          variant="outline"
          className={
            booking.status === true
              ? "border-success/30 bg-success/10 text-success"
              : "border-warning/30 bg-warning/10 text-warning"
          }
        >
          {booking.status === true ? "Confirmed" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (booking: BookingRow) => (
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
