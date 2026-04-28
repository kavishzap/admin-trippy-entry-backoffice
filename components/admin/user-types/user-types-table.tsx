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
import { UserTypeDialog } from "./user-type-dialog"
import { deleteUserType } from "@/app/(admin)/user-types/actions"
import { toast } from "sonner"

interface UserType {
  id: string
  name: string
  description: string | null
  discount_percentage: number
  created_at: string
}

interface UserTypesTableProps {
  userTypes: UserType[]
}

export function UserTypesTable({ userTypes }: UserTypesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteUserType(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("User type deleted successfully")
      }
    } catch {
      toast.error("Failed to delete user type")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (userType: UserType) => (
        <span className="font-medium text-card-foreground">{userType.name}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (userType: UserType) => (
        <span className="text-muted-foreground">
          {userType.description || "No description"}
        </span>
      ),
    },
    {
      key: "discount_percentage",
      header: "Discount",
      render: (userType: UserType) => (
        <Badge variant="secondary" className="bg-success/20 text-success">
          {userType.discount_percentage}% off
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (userType: UserType) => (
        <span className="text-muted-foreground">
          {format(new Date(userType.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (userType: UserType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <UserTypeDialog userType={userType} trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            } />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteId(userType.id)}
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
      <DataTable data={userTypes} columns={columns} emptyMessage="No user types found" />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user type? Users with this type will have their type set to none.
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
