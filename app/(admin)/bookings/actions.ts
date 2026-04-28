"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateBookingStatus(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/bookings")
  revalidatePath("/")
  return { success: true }
}

export async function refundBooking(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "refunded",
      payment_status: "refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/bookings")
  revalidatePath("/")
  return { success: true }
}
