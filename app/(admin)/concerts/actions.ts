"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface ConcertData {
  concert_name: string
  concert_date: string
  concert_start_time: string
  concert_end_time: string
  concert_location_name: string
  concert_status: boolean
  front_image?: string | null
  logo?: string | null
  concert_description?: string | null
  terms?: string | null
}

export async function createConcert(data: ConcertData) {
  const supabase = await createClient()

  const payload = {
    ...data,
    front_image: data.front_image || null,
    logo: data.logo || null,
    concert_description: data.concert_description || null,
    terms: data.terms || null,
  }

  const { error } = await supabase.from("concerts").insert(payload)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/concerts")
  revalidatePath("/")
  return { success: true }
}

export async function updateConcert(id: string, data: ConcertData) {
  const supabase = await createClient()

  const payload = {
    ...data,
    front_image: data.front_image || null,
    logo: data.logo || null,
    concert_description: data.concert_description || null,
    terms: data.terms || null,
  }

  const { error } = await supabase
    .from("concerts")
    .update(payload)
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/concerts")
  revalidatePath("/")
  return { success: true }
}

export async function deleteConcert(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("concerts").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/concerts")
  revalidatePath("/")
  return { success: true }
}
