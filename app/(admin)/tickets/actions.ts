"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface TicketData {
  concert_id: string
  ticket_name: string
  price: string
  quantity: string
}

export async function createTicket(data: TicketData) {
  const supabase = await createClient()

  const { error } = await supabase.from("tickets").insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/tickets")
  return { success: true }
}

export async function updateTicket(id: string, data: TicketData) {
  const supabase = await createClient()

  const { error } = await supabase.from("tickets").update(data).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/tickets")
  return { success: true }
}

export async function deleteTicket(id: string | number) {
  const supabase = await createClient()

  const { error } = await supabase.from("tickets").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/tickets")
  return { success: true }
}
