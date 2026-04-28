"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Eye, XCircle } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateBookingStatus, refundBooking } from "@/app/(admin)/bookings/actions"
import { toast } from "sonner"

interface Booking {
  id: string
  quantity: number
  total_amount: number
  discount_applied: number
  status: string
  payment_status: string
  payment_method: string | null
  booking_date: string
  created_at: string
  concerts?: { name: string; artist: string } | null
  users?: { full_name: string | null; email: string } | null
}

interface BookingsTableProps {
  bookings: Booking[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [refundId, setRefundId] = useState<string | null>(null)
  const [isRefunding, setIsRefunding] = useState(false)

  const handleStatusChange = async (bookingId: string, status: string) => {
    const result = await updateBookingStatus(bookingId, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Booking status updated")
    }
  }

  const handleRefund = async () => {
    if (!refundId) return
    setIsRefunding(true)
    try {
      const result = await refundBooking(refundId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Booking refunded successfully")
      }
    } catch {
      toast.error("Failed to refund booking")
    } finally {
      setIsRefunding(false)
      setRefundId(null)
    }
  }

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      render: (booking: Booking) => (
        <span className="font-mono text-xs text-muted-foreground">
          {booking.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "customer",
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
      key: "quantity",
      header: "Qty",
      render: (booking: Booking) => (
        <span className="text-card-foreground">{booking.quantity}</span>
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
      render: (booking: Booking) => (
        <Select
          defaultValue={booking.status}
          onValueChange={(value) => handleStatusChange(booking.id, value)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue>
              <StatusBadge status={booking.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "payment_status",
      header: "Payment",
      render: (booking: Booking) => <StatusBadge status={booking.payment_status} />,
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
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (booking: Booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setViewBooking(booking)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setRefundId(booking.id)}
              disabled={booking.status === "refunded"}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Refund
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable data={bookings} columns={columns} emptyMessage="No bookings found" />

      {/* View Booking Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking ID: {viewBooking?.id}
            </DialogDescription>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewBooking.users?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{viewBooking.users?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concert</p>
                  <p className="font-medium">{viewBooking.concerts?.name}</p>
                  <p className="text-sm text-muted-foreground">{viewBooking.concerts?.artist}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{viewBooking.quantity} ticket(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">${viewBooking.total_amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discount Applied</p>
                  <p className="font-medium">${viewBooking.discount_applied?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{viewBooking.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Status</p>
                  <StatusBadge status={viewBooking.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <StatusBadge status={viewBooking.payment_status} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Confirmation */}
      <AlertDialog open={!!refundId} onOpenChange={() => setRefundId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refund Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to refund this booking? This will update the booking and payment status to refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={isRefunding}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRefunding ? "Processing..." : "Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
