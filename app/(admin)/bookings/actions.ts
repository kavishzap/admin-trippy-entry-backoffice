"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { parseBookingTicketLines } from "@/lib/bookings-display"

const BOOKING_TICKETS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BOOKING_TICKETS_BUCKET ?? "booking-tickets"

/**
 * Uploads generated ticket image (PNG/JPEG base64) to Supabase Storage.
 * Bucket must exist and policies applied ? see `scripts/003_storage_booking_tickets.sql`.
 */
export async function uploadBookingTicketPng(bookingId: string, imageBase64OrDataUrl: string) {
  const supabase = await createClient()

  const raw = imageBase64OrDataUrl.trim()
  let b64 = raw
  let contentType: "image/png" | "image/jpeg" = "image/png"
  let ext: "png" | "jpg" = "png"

  if (raw.startsWith("data:image/png;base64,")) {
    b64 = raw.slice("data:image/png;base64,".length)
    contentType = "image/png"
    ext = "png"
  } else if (raw.startsWith("data:image/jpeg;base64,")) {
    b64 = raw.slice("data:image/jpeg;base64,".length)
    contentType = "image/jpeg"
    ext = "jpg"
  }

  const approxBytes = Math.floor((b64.length * 3) / 4)
  const maxBytes = 8 * 1024 * 1024
  if (approxBytes > maxBytes) {
    return { error: "Ticket image is too large to upload." }
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(b64, "base64")
  } catch {
    return { error: "Invalid ticket image data." }
  }

  const safeId = bookingId.replace(/[^a-zA-Z0-9-_]/g, "_")
  const path = `generated/${safeId}.${ext}`

  const { error } = await supabase.storage.from(BOOKING_TICKETS_BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  })

  if (error) {
    return { error: error.message }
  }

  const { data } = supabase.storage.from(BOOKING_TICKETS_BUCKET).getPublicUrl(path)
  return { publicUrl: data.publicUrl }
}

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
  /** Confirm => -1 per line; pending => +1 per line (per your spec). */
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
