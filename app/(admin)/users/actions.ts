"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateUserType(userId: string, userTypeId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("users")
    .update({
      user_type_id: userTypeId === "none" ? null : userTypeId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function toggleAdminStatus(userId: string, isAdmin: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("users")
    .update({
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/users")
  return { success: true }
}
