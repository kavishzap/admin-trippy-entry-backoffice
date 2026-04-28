export type TicketLine = { ticket_id?: number; quantity?: number }

export function parseBookingTicketLines(tickets: unknown): TicketLine[] {
  if (tickets == null) return []
  if (typeof tickets === "string") {
    try {
      const parsed = JSON.parse(tickets) as unknown
      return parseBookingTicketLines(parsed)
    } catch {
      return []
    }
  }
  if (!Array.isArray(tickets)) return []
  return tickets.map((row) => {
    const o = row as Record<string, unknown>
    const ticket_id =
      typeof o.ticket_id === "number"
        ? o.ticket_id
        : typeof o.ticket_id === "string"
          ? Number(o.ticket_id)
          : undefined
    const quantity =
      typeof o.quantity === "number"
        ? o.quantity
        : typeof o.quantity === "string"
          ? Number(o.quantity)
          : 0
    return {
      ticket_id: Number.isFinite(ticket_id) ? ticket_id : undefined,
      quantity: Number.isFinite(quantity) ? quantity : 0,
    }
  })
}

export function formatTicketLinesDisplay(
  lines: TicketLine[],
  ticketNameById: Record<string, string>,
): string {
  if (lines.length === 0) return "—"
  return lines
    .map((l) => {
      const id = l.ticket_id != null ? String(l.ticket_id) : ""
      const name = id ? ticketNameById[id] || `Ticket #${id}` : "Ticket"
      const qty = l.quantity ?? 0
      return `${name} × ${qty}`
    })
    .join(", ")
}

export function userProfileFullName(p: {
  first_name: string | null
  last_name: string | null
  email?: string | null
} | null): string {
  if (!p) return ""
  const n = [p.first_name, p.last_name].filter(Boolean).join(" ").trim()
  return n || (p.email ?? "") || ""
}
