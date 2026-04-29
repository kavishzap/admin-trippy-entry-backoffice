"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createManualPayment, updateManualPayment } from "@/app/(admin)/manual-payment/actions"
import { toast } from "sonner"

const manualPaymentSchema = z
  .object({
    juice_mobile_number: z.string().optional(),
    bank_number: z.string().optional(),
    bank_name: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const hasAny = Object.values(values).some((v) => (v || "").trim().length > 0)
    if (!hasAny) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["juice_mobile_number"],
        message: "Enter at least one payment field.",
      })
    }
  })

type ManualPaymentFormValues = z.infer<typeof manualPaymentSchema>

export interface ManualPaymentRow {
  id: number
  created_at: string
  juice_mobile_number: string | null
  bank_number: string | null
  bank_name: string | null
}

interface ManualPaymentDialogProps {
  row?: ManualPaymentRow
  trigger?: React.ReactNode
}

export function ManualPaymentDialog({ row, trigger }: ManualPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!row

  const form = useForm<ManualPaymentFormValues>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: {
      juice_mobile_number: row?.juice_mobile_number || "",
      bank_number: row?.bank_number || "",
      bank_name: row?.bank_name || "",
    },
  })

  const onSubmit = async (data: ManualPaymentFormValues) => {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateManualPayment(row.id, data)
        : await createManualPayment(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? "Manual payment updated" : "Manual payment created")
        setOpen(false)
        form.reset()
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Manual Payment" : "Add Manual Payment"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the stored payment details."
              : "Create a new manual payment entry."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="juice_mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Juice Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+230 5XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="MCB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Number</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
