"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface UserTypeData {
  name: string
  description?: string
  discount_percentage: number
}

export async function createUserType(data: UserTypeData) {
  const supabase = await createClient()

  const { error } = await supabase.from("user_types").insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/user-types")
  return { success: true }
}

export async function updateUserType(id: string, data: UserTypeData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("user_types")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/user-types")
  return { success: true }
}

export async function deleteUserType(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("user_types").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/user-types")
  return { success: true }
}
