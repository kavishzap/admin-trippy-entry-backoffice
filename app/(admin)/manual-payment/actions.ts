"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface ManualPaymentData {
  juice_mobile_number?: string
  bank_number?: string
  bank_name?: string
}

type ManualPaymentPayload = {
  juice_mobile_number: string | null
  bank_number: string | null
  bank_name: string | null
}

function toNullableText(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalize(data: ManualPaymentData): ManualPaymentPayload {
  return {
    juice_mobile_number: toNullableText(data.juice_mobile_number),
    bank_number: toNullableText(data.bank_number),
    bank_name: toNullableText(data.bank_name),
  }
}

export async function createManualPayment(data: ManualPaymentData) {
  const supabase = await createClient()

  const payload = normalize(data)
  const { error } = await supabase.from("manual_payment").insert(payload)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/manual-payment")
  return { success: true }
}

export async function updateManualPayment(id: number, data: ManualPaymentData) {
  const supabase = await createClient()

  const payload = normalize(data)
  const { error } = await supabase.from("manual_payment").update(payload).eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/manual-payment")
  return { success: true }
}
