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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createTicket, updateTicket } from "@/app/(admin)/tickets/actions"
import { toast } from "sonner"

const ticketSchema = z.object({
  concert_id: z.string().min(1, "Concert is required"),
  ticket_name: z.string().min(1, "Ticket name is required"),
  price: z.string().min(1, "Price is required"),
  quantity: z.string().min(1, "Quantity is required"),
})

type TicketFormValues = z.infer<typeof ticketSchema>

interface Ticket {
  id: string | number
  concert_id: string | null
  ticket_name: string | null
  price: string | null
  quantity: string | null
}

interface ConcertOption {
  id: string | number
  concert_name: string | null
}

interface TicketDialogProps {
  ticket?: Ticket
  concerts: ConcertOption[]
  trigger?: React.ReactNode
}

export function TicketDialog({ ticket, concerts, trigger }: TicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!ticket

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      concert_id: ticket?.concert_id || "",
      ticket_name: ticket?.ticket_name || "",
      price: ticket?.price || "",
      quantity: ticket?.quantity || "",
    },
  })

  const onSubmit = async (data: TicketFormValues) => {
    setIsLoading(true)
    try {
      const result = isEditing
        ? await updateTicket(String(ticket.id), data)
        : await createTicket(data)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(isEditing ? "Ticket updated" : "Ticket created")
      setOpen(false)
      form.reset()
    } catch {
      toast.error("Failed to save ticket")
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
            Add Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Ticket" : "Add Ticket"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update ticket details." : "Create a new ticket."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="concert_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concert</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select concert" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {concerts.map((concert) => (
                        <SelectItem key={String(concert.id)} value={String(concert.id)}>
                          {concert.concert_name || `Concert ${concert.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ticket_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="VIP / General / Early Bird" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
