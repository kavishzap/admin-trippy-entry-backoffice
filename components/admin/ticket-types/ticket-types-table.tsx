"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
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
import { TicketTypeDialog } from "./ticket-type-dialog"
import { deleteTicketType } from "@/app/(admin)/ticket-types/actions"
import { toast } from "sonner"

interface TicketType {
  id: string
  name: string
  description: string | null
  price_multiplier: number
  created_at: string
}

interface TicketTypesTableProps {
  ticketTypes: TicketType[]
}

export function TicketTypesTable({ ticketTypes }: TicketTypesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteTicketType(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Ticket type deleted successfully")
      }
    } catch {
      toast.error("Failed to delete ticket type")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (ticketType: TicketType) => (
        <span className="font-medium text-card-foreground">{ticketType.name}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (ticketType: TicketType) => (
        <span className="text-muted-foreground">
          {ticketType.description || "No description"}
        </span>
      ),
    },
    {
      key: "price_multiplier",
      header: "Price Multiplier",
      render: (ticketType: TicketType) => (
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          {ticketType.price_multiplier}x
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (ticketType: TicketType) => (
        <span className="text-muted-foreground">
          {format(new Date(ticketType.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (ticketType: TicketType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <TicketTypeDialog ticketType={ticketType} trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            } />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteId(ticketType.id)}
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
      <DataTable data={ticketTypes} columns={columns} emptyMessage="No ticket types found" />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket type? Tickets with this type will have their type set to none.
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
