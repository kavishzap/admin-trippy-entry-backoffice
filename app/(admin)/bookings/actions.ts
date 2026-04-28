"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { parseBookingTicketLines } from "@/lib/bookings-display"

function parseStoredQuantity(value: string | null | undefined): number {
  const n = parseInt(String(value ?? "").replace(/,/g, ""), 10)
  return Number.isFinite(n) ? n : 0
}

async function rollbackTicketQuantities(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rollbacks: Array<{ ticketId: string | number; quantity: string }>,
) {
  for (const r of [...rollbacks].reverse()) {
    await supabase.from("tickets").update({ quantity: r.quantity }).eq("id", r.ticketId)
  }
}

export async function updateBookingStatus(id: string, status: boolean) {
  const supabase = await createClient()

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status, tickets")
    .eq("id", id)
    .single()

  if (fetchError || !booking) {
    return { error: fetchError?.message || "Booking not found" }
  }

  const wasConfirmed = booking.status === true
  if (wasConfirmed === status) {
    revalidatePath("/bookings")
    revalidatePath("/")
    return { success: true }
  }

  const lines = parseBookingTicketLines(booking.tickets)
  /** Confirm → −1 per line; pending → +1 per line (per your spec). */
  const delta = status === true ? -1 : 1

  const rollbacks: Array<{ ticketId: string | number; quantity: string }> = []

  for (const line of lines) {
    if (line.ticket_id == null || !Number.isFinite(line.ticket_id)) continue

    const ticketId = line.ticket_id
    const { data: ticketRow, error: ticketFetchError } = await supabase
      .from("tickets")
      .select("id, quantity")
      .eq("id", ticketId)
      .single()

    if (ticketFetchError || !ticketRow) {
      await rollbackTicketQuantities(supabase, rollbacks)
      return { error: ticketFetchError?.message || `Ticket ${ticketId} not found` }
    }

    const current = parseStoredQuantity(ticketRow.quantity as string | null)
    const next = current + delta

    if (status === true && next < 0) {
      await rollbackTicketQuantities(supabase, rollbacks)
      return { error: `Not enough stock for ticket #${ticketId} (have ${current}, need at least 1).` }
    }

    const { error: updError } = await supabase
      .from("tickets")
      .update({ quantity: String(Math.max(0, next)) })
      .eq("id", ticketId)

    if (updError) {
      await rollbackTicketQuantities(supabase, rollbacks)
      return { error: updError.message }
    }

    rollbacks.push({
      ticketId,
      quantity: String(current),
    })
  }

  const { error: bookingError } = await supabase.from("bookings").update({ status }).eq("id", id)

  if (bookingError) {
    await rollbackTicketQuantities(supabase, rollbacks)
    return { error: bookingError.message }
  }

  revalidatePath("/bookings")
  revalidatePath("/tickets")
  revalidatePath("/")
  return { success: true }
}
