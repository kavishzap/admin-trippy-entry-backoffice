"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { deleteConcert } from "@/app/(admin)/concerts/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Concert {
  id: string | number
  concert_name: string | null
  concert_date: string | null
  concert_start_time: string | null
  concert_end_time: string | null
  concert_location_name: string | null
  concert_type: string | null
  concert_status: boolean | null
  front_image: string | null
}

interface ConcertsTableProps {
  concerts: Concert[]
}

export function ConcertsTable({ concerts }: ConcertsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteConcert(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Concert deleted successfully")
      }
    } catch {
      toast.error("Failed to delete concert")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "front_image",
      header: "Image",
      className: "w-20",
      render: (concert: Concert) => (
        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
          {concert.front_image ? (
            <img
              src={concert.front_image}
              alt={concert.concert_name || "Concert image"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              No image
            </div>
          )}
        </div>
      ),
    },
    {
      key: "concert_name",
      header: "Concert",
      render: (concert: Concert) => (
        <div>
          <p className="font-medium text-card-foreground">{concert.concert_name || "Untitled concert"}</p>
          <p className="text-sm text-muted-foreground">{concert.concert_type || "No type selected"}</p>
        </div>
      ),
    },
    {
      key: "concert_date",
      header: "Date & Time",
      render: (concert: Concert) => (
        <div className="text-card-foreground">
          <p>{concert.concert_date || "--/--/----"}</p>
          <p className="text-sm text-muted-foreground">
            {concert.concert_start_time || "--:--"} - {concert.concert_end_time || "--:--"}
          </p>
        </div>
      ),
    },
    {
      key: "concert_location_name",
      header: "Location",
      render: (concert: Concert) => (
        <span className="text-card-foreground">{concert.concert_location_name || "No location set"}</span>
      ),
    },
    {
      key: "concert_status",
      header: "Status",
      render: (concert: Concert) => {
        const isActive = !!concert.concert_status
        return (
          <Badge
            variant="outline"
            className={isActive
              ? "bg-success/20 text-success border-success/30"
              : "bg-muted text-muted-foreground border-muted"
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (concert: Concert) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                router.push(`/concerts/${concert.id}/edit`)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteId(String(concert.id))}
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
      <DataTable data={concerts} columns={columns} emptyMessage="No concerts found" />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Concert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this concert? This action cannot be undone.
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
