"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface SettingUpdate {
  key: string
  value: string
}

export async function updateSettings(updates: SettingUpdate[]) {
  const supabase = await createClient()

  for (const update of updates) {
    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          key: update.key,
          value: update.value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath("/settings")
  return { success: true }
}
