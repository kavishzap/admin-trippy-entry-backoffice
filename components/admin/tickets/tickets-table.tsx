"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { TicketDialog } from "./ticket-dialog"
import { deleteTicket } from "@/app/(admin)/tickets/actions"
import { toast } from "sonner"

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

interface TicketsTableProps {
  tickets: Ticket[]
  concerts: ConcertOption[]
}

export function TicketsTable({ tickets, concerts }: TicketsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const concertNameById = Object.fromEntries(
    concerts.map((concert) => [String(concert.id), concert.concert_name || `Concert ${concert.id}`])
  )

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteTicket(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Ticket deleted successfully")
      }
    } catch {
      toast.error("Failed to delete ticket")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "id",
      header: "Ticket ID",
      render: (ticket: Ticket) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(ticket.id)}
        </span>
      ),
    },
    {
      key: "concert",
      header: "Concert",
      render: (ticket: Ticket) => (
        <span className="font-medium text-card-foreground">
          {ticket.concert_id ? concertNameById[ticket.concert_id] || "Unknown concert" : "No concert"}
        </span>
      ),
    },
    {
      key: "ticket_name",
      header: "Ticket Name",
      render: (ticket: Ticket) => (
        <span className="text-card-foreground">{ticket.ticket_name || "Untitled"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (ticket: Ticket) => (
        <span className="font-medium text-card-foreground">{ticket.price || "0"}</span>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (ticket: Ticket) => (
        <span className="text-card-foreground">{ticket.quantity || "0"}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (ticket: Ticket) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <TicketDialog
              ticket={ticket}
              concerts={concerts}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteId(String(ticket.id))}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable data={tickets} columns={columns} emptyMessage="No tickets found" />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
