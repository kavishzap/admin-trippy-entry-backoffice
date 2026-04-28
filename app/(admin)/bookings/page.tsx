import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { BookingsTable } from "@/components/admin/bookings/bookings-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/stats-card"
import { CalendarCheck, CheckCircle, Clock, DollarSign } from "lucide-react"
import {
  formatTicketLinesDisplay,
  parseBookingTicketLines,
  userProfileFullName,
} from "@/lib/bookings-display"

const PAGE_SIZE = 10

function parseTotal(value: string | null | undefined): number {
  if (value == null || value === "") return 0
  const n = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

interface BookingsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const [
    { data: bookingsRaw, count: bookingsTotal },
    { count: totalBookings },
    { count: confirmedBookings },
    { count: pendingBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, created_at, userid, concertid, tickets, total, status, ticket_pdf_url", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", true),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", false),
  ])

  const { data: confirmedTotals } = await supabase
    .from("bookings")
    .select("total")
    .eq("status", true)

  const totalRevenue =
    confirmedTotals?.reduce((sum, row) => sum + parseTotal(row.total as string | null), 0) ?? 0

  const bookingsList = bookingsRaw || []

  const concertIds = [
    ...new Set(
      bookingsList
        .map((b) => b.concertid)
        .filter((id): id is string => id != null && String(id).length > 0)
        .map((id) => String(id)),
    ),
  ]

  let concertNameById: Record<string, string> = {}
  if (concertIds.length > 0) {
    const ids = concertIds.map((id) => {
      const n = Number(id)
      return Number.isFinite(n) ? n : id
    })
    const { data: concerts } = await supabase
      .from("concerts")
      .select("id, concert_name")
      .in("id", ids as (string | number)[])

    if (concerts) {
      concertNameById = Object.fromEntries(
        concerts.map((c) => [String(c.id), c.concert_name || `Concert ${c.id}`]),
      )
    }
  }

  const userIds = [
    ...new Set(
      bookingsList
        .map((b) => b.userid)
        .filter((id): id is string => id != null && String(id).length > 0)
        .map((id) => String(id)),
    ),
  ]

  type UserFields = { displayName: string | null; email: string | null; phone: string | null }
  const userFieldsById: Record<string, UserFields> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name, email, phone")
      .in("id", userIds)

    if (profiles) {
      for (const p of profiles) {
        const idStr = String(p.id)
        userFieldsById[idStr] = {
          displayName: userProfileFullName(p) || p.email || null,
          email: p.email ?? null,
          phone: p.phone ?? null,
        }
      }
    }
  }

  const allTicketIds = new Set<number>()
  for (const b of bookingsList) {
    for (const line of parseBookingTicketLines(b.tickets)) {
      if (line.ticket_id != null && Number.isFinite(line.ticket_id)) {
        allTicketIds.add(line.ticket_id)
      }
    }
  }

  let ticketNameById: Record<string, string> = {}
  if (allTicketIds.size > 0) {
    const ids = [...allTicketIds]
    const { data: ticketRows } = await supabase
      .from("tickets")
      .select("id, ticket_name")
      .in("id", ids)

    if (ticketRows) {
      ticketNameById = Object.fromEntries(
        ticketRows.map((t) => [String(t.id), t.ticket_name || `Ticket ${t.id}`]),
      )
    }
  }

  const bookings = bookingsList.map((b) => {
    const uf = b.userid ? userFieldsById[String(b.userid)] : undefined
    const lines = parseBookingTicketLines(b.tickets)
    const tickets_qr = lines
      .filter((l) => l.ticket_id != null && Number.isFinite(l.ticket_id))
      .map((l) => ({
        name: ticketNameById[String(l.ticket_id!)] || `Ticket ${l.ticket_id}`,
        quantity: l.quantity ?? 0,
      }))
    return {
      ...b,
      concert_name:
        b.concertid != null ? concertNameById[String(b.concertid)] ?? null : null,
      user_display_name: uf?.displayName?.trim() || null,
      user_email: uf?.email ?? null,
      user_phone: uf?.phone ?? null,
      tickets_display: formatTicketLinesDisplay(lines, ticketNameById),
      tickets_qr,
    }
  })

  const tableTotal = bookingsTotal ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">
          Manage all booking transactions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          title="Total Revenue"
          description="Confirmed bookings only"
          value={`RS ${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
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
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
            <BookingsTable
              bookings={bookings}
              total={tableTotal}
              page={page}
              pageSize={PAGE_SIZE}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
