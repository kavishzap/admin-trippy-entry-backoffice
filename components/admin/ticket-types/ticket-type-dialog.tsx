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
import { Textarea } from "@/components/ui/textarea"
import { createTicketType, updateTicketType } from "@/app/(admin)/ticket-types/actions"
import { toast } from "sonner"

const ticketTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price_multiplier: z.coerce.number().min(0.1),
})

type TicketTypeFormValues = z.infer<typeof ticketTypeSchema>

interface TicketType {
  id: string
  name: string
  description: string | null
  price_multiplier: number
}

interface TicketTypeDialogProps {
  ticketType?: TicketType
  trigger?: React.ReactNode
}

export function TicketTypeDialog({ ticketType, trigger }: TicketTypeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!ticketType

  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: {
      name: ticketType?.name || "",
      description: ticketType?.description || "",
      price_multiplier: ticketType?.price_multiplier || 1.0,
    },
  })

  const onSubmit = async (data: TicketTypeFormValues) => {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateTicketType(ticketType.id, data)
        : await createTicketType(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(isEditing ? "Ticket type updated" : "Ticket type created")
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
            Add Ticket Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Ticket Type" : "Add Ticket Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the ticket type details."
              : "Create a new ticket type with pricing."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description of this ticket type..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_multiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Multiplier</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0.1" {...field} />
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
