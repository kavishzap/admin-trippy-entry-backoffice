import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats"
import { RecentBookings } from "@/components/admin/dashboard/recent-bookings"
import {
  formatTicketLinesDisplay,
  parseBookingTicketLines,
  userProfileFullName,
} from "@/lib/bookings-display"

function parseTotal(value: string | null | undefined): number {
  if (value == null || value === "") return 0
  const n = Number(String(value).replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalConcerts },
    { count: totalBookings },
    { count: totalUsers },
    { data: bookingsRaw },
  ] = await Promise.all([
    supabase.from("concerts").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id, created_at, userid, concertid, tickets, total, status, ticket_pdf_url")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const { data: confirmedBookings } = await supabase
    .from("bookings")
    .select("total, tickets")
    .eq("status", true)

  const totalRevenue =
    confirmedBookings?.reduce((sum, row) => sum + parseTotal(row.total as string | null), 0) ?? 0

  const ticketsSoldCount =
    confirmedBookings?.reduce((sum, row) => {
      const lines = parseBookingTicketLines(row.tickets)
      const units = lines.reduce((s, line) => s + (line.quantity ?? 0), 0)
      return sum + units
    }, 0) ?? 0

  const list = bookingsRaw || []

  const concertIds = [
    ...new Set(
      list
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
      list
        .map((b) => b.userid)
        .filter((id): id is string => id != null && String(id).length > 0)
        .map((id) => String(id)),
    ),
  ]

  let nameByUserId: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("id, first_name, last_name, email")
      .in("id", userIds)

    if (profiles) {
      nameByUserId = Object.fromEntries(
        profiles.map((p) => [String(p.id), userProfileFullName(p) || (p.email ?? "")]),
      )
    }
  }

  const allTicketIds = new Set<number>()
  for (const b of list) {
    for (const line of parseBookingTicketLines(b.tickets)) {
      if (line.ticket_id != null && Number.isFinite(line.ticket_id)) {
        allTicketIds.add(line.ticket_id)
      }
    }
  }

  let ticketNameById: Record<string, string> = {}
  if (allTicketIds.size > 0) {
    const { data: ticketRows } = await supabase
      .from("tickets")
      .select("id, ticket_name")
      .in("id", [...allTicketIds])

    if (ticketRows) {
      ticketNameById = Object.fromEntries(
        ticketRows.map((t) => [String(t.id), t.ticket_name || `Ticket ${t.id}`]),
      )
    }
  }

  const bookings = list.map((b) => ({
    ...b,
    concert_name:
      b.concertid != null ? concertNameById[String(b.concertid)] ?? null : null,
    user_display_name: b.userid ? nameByUserId[String(b.userid)] || null : null,
    tickets_display: formatTicketLinesDisplay(parseBookingTicketLines(b.tickets), ticketNameById),
  }))

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
        ticketsSold={ticketsSoldCount || 0}
      />

      <RecentBookings bookings={bookings} />
    </div>
  )
}
