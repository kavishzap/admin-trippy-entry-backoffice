"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface TicketTypeData {
  name: string
  description?: string
  price_multiplier: number
}

export async function createTicketType(data: TicketTypeData) {
  const supabase = await createClient()

  const { error } = await supabase.from("ticket_types").insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/ticket-types")
  return { success: true }
}

export async function updateTicketType(id: string, data: TicketTypeData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("ticket_types")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/ticket-types")
  return { success: true }
}

export async function deleteTicketType(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("ticket_types").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/ticket-types")
  return { success: true }
}
