"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Eye, ExternalLink, Mail } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
import { updateBookingStatus } from "@/app/(admin)/bookings/actions"
import { toast } from "sonner"
import { UrlPagination } from "@/components/admin/url-pagination"
import { formatTicketLinesDisplay, parseBookingTicketLines } from "@/lib/bookings-display"
import { BookingTicketVisual, type TicketLineQr } from "@/components/admin/bookings/booking-ticket-visual"

export type { TicketLineQr }

export interface BookingRow {
  id: string | number
  created_at: string
  userid: string | null
  concertid: string | null
  tickets: unknown
  total: string | null
  status: boolean | null
  ticket_pdf_url: string | null
  concert_name?: string | null
  user_display_name?: string | null
  user_email?: string | null
  user_phone?: string | null
  tickets_display?: string
  tickets_qr?: TicketLineQr[]
}

interface BookingsTableProps {
  bookings: BookingRow[]
  total: number
  page: number
  pageSize: number
}

export function BookingsTable({ bookings, total, page, pageSize }: BookingsTableProps) {
  const router = useRouter()
  const [viewBooking, setViewBooking] = useState<BookingRow | null>(null)
  const [statusDialog, setStatusDialog] = useState<{
    booking: BookingRow
    nextConfirmed: boolean
  } | null>(null)
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  const isConfirmed = (b: BookingRow) => b.status === true

  const openStatusDialog = (booking: BookingRow, nextConfirmed: boolean) => {
    if (nextConfirmed === isConfirmed(booking)) return
    setStatusDialog({ booking, nextConfirmed })
  }

  const confirmStatusChange = async () => {
    if (!statusDialog) return
    setIsSavingStatus(true)
    try {
      const result = await updateBookingStatus(String(statusDialog.booking.id), statusDialog.nextConfirmed)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(statusDialog.nextConfirmed ? "Booking marked confirmed" : "Booking marked pending")
      setStatusDialog(null)
      router.refresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setIsSavingStatus(false)
    }
  }

  const ticketsDetailText = (booking: BookingRow) => {
    if (booking.tickets_display) return booking.tickets_display
    return formatTicketLinesDisplay(parseBookingTicketLines(booking.tickets), {})
  }

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      render: (booking: BookingRow) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(booking.id)}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (booking: BookingRow) => (
        <div>
          <p className="font-medium text-card-foreground">
            {booking.user_display_name?.trim() || "Unknown"}
          </p>
          {booking.userid ? (
            <p className="text-xs text-muted-foreground font-mono">{booking.userid}</p>
          ) : null}
        </div>
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
          {booking.concertid != null && (
            <p className="text-xs text-muted-foreground">ID: {booking.concertid}</p>
          )}
        </div>
      ),
    },
    {
      key: "tickets",
      header: "Tickets",
      render: (booking: BookingRow) => (
        <span className="max-w-[260px] text-sm text-card-foreground" title={booking.tickets_display}>
          {booking.tickets_display || ticketsDetailText(booking)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (booking: BookingRow) => (
        <span className="font-medium text-card-foreground">
          RS {booking.total != null && booking.total !== "" ? String(booking.total) : "0"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking: BookingRow) => (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={isConfirmed(booking)}
              onCheckedChange={(checked) => openStatusDialog(booking, checked)}
              aria-label={isConfirmed(booking) ? "Confirmed" : "Pending"}
            />
            <Badge
              variant="outline"
              className={
                isConfirmed(booking)
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-warning/30 bg-warning/10 text-warning"
              }
            >
              {isConfirmed(booking) ? "Confirmed" : "Pending"}
            </Badge>
          </div>
        </div>
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
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (booking: BookingRow) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setViewBooking({ ...booking, tickets_qr: booking.tickets_qr ?? [] })
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {isConfirmed(booking) ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    toast.info("Email sending will be available soon.", {
                      description: `Booking #${String(booking.id)} — connect your mail provider to send tickets automatically.`,
                    })
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send ticket by email
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable data={bookings} columns={columns} emptyMessage="No bookings found" />
      <UrlPagination basePath="/bookings" page={page} pageSize={pageSize} total={total} />

      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="flex max-h-[min(92vh,900px)] w-[min(1180px,calc(100vw-1.5rem))] max-w-[min(1180px,calc(100vw-1.5rem))] flex-col gap-4 overflow-hidden p-5 sm:max-w-[min(1180px,calc(100vw-1.5rem))]">
          <DialogHeader className="shrink-0 space-y-1">
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>Booking ID: {viewBooking ? String(viewBooking.id) : ""}</DialogDescription>
          </DialogHeader>
          {viewBooking && (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-5 overflow-hidden md:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] md:gap-6">
                <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1 md:overflow-y-visible md:pr-0">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium leading-tight">
                        {viewBooking.user_display_name?.trim() || "Unknown"}
                      </p>
                      {viewBooking.user_email?.trim() ? (
                        <p className="text-xs text-muted-foreground">{viewBooking.user_email.trim()}</p>
                      ) : null}
                      {viewBooking.user_phone?.trim() ? (
                        <p className="text-xs text-muted-foreground">{viewBooking.user_phone.trim()}</p>
                      ) : null}
                      {viewBooking.userid ? (
                        <p className="mt-0.5 text-[11px] text-muted-foreground font-mono leading-tight break-all">
                          {viewBooking.userid}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Concert</p>
                      <p className="font-medium leading-tight">{viewBooking.concert_name || "Unknown"}</p>
                      <p className="text-[11px] text-muted-foreground">concertid: {viewBooking.concertid || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="text-sm font-medium leading-snug">{ticketsDetailText(viewBooking)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-medium">
                        RS{" "}
                        {viewBooking.total != null && viewBooking.total !== "" ? viewBooking.total : "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant="outline"
                        className={
                          isConfirmed(viewBooking)
                            ? "border-success/30 bg-success/10 text-success"
                            : "border-warning/30 bg-warning/10 text-warning"
                        }
                      >
                        {isConfirmed(viewBooking) ? "Confirmed" : "Pending"}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {format(new Date(viewBooking.created_at), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Ticket PDF</p>
                      {viewBooking.ticket_pdf_url ? (
                        <a
                          href={viewBooking.ticket_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Open stored PDF
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">No PDF on file</p>
                      )}
                    </div>
                  </div>
                  {isConfirmed(viewBooking) ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full shrink-0 gap-2 sm:w-auto"
                      onClick={() =>
                        toast.info("Email sending will be available soon.", {
                          description: `Booking #${String(viewBooking.id)} — connect your mail provider to send tickets automatically.`,
                        })
                      }
                    >
                      <Mail className="h-4 w-4" />
                      Send ticket by email
                    </Button>
                  ) : null}
                </div>
                <div className="flex min-h-0 min-w-0 flex-col items-center justify-start gap-1 overflow-hidden md:max-h-[min(78vh,760px)]">
                  <p className="shrink-0 text-xs text-muted-foreground">
                    Ticket preview · QR encodes booking and contact when set
                  </p>
                  <div className="min-h-0 w-full max-w-[min(420px,100%)] shrink overflow-hidden">
                    <BookingTicketVisual
                      bookingId={viewBooking.id}
                      userName={viewBooking.user_display_name ?? null}
                      email={viewBooking.user_email ?? null}
                      phone={viewBooking.user_phone ?? null}
                      ticketLines={viewBooking.tickets_qr ?? []}
                      confirmed={isConfirmed(viewBooking)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!statusDialog}
        onOpenChange={(open) => {
          if (!open) setStatusDialog(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusDialog?.nextConfirmed ? "Mark booking as confirmed?" : "Mark booking as pending?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusDialog?.nextConfirmed
                ? "This marks the booking as confirmed. Revenue from this booking will count toward totals when confirmed."
                : "This marks the booking as pending. It will no longer count as confirmed revenue."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isSavingStatus}>
              {isSavingStatus ? "Saving…" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
