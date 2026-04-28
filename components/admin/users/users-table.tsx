"use client"

import { useState } from "react"
import { format } from "date-fns"
import { MoreHorizontal, Shield, ShieldOff, Trash2 } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserType, toggleAdminStatus, deleteUser } from "@/app/(admin)/users/actions"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
  user_types?: { name: string } | null
  user_type_id: string | null
}

interface UserType {
  id: string
  name: string
}

interface UsersTableProps {
  users: User[]
  userTypes: UserType[]
}

export function UsersTable({ users, userTypes }: UsersTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUserTypeChange = async (userId: string, userTypeId: string) => {
    const result = await updateUserType(userId, userTypeId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("User type updated")
    }
  }

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    const result = await toggleAdminStatus(userId, !isAdmin)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(isAdmin ? "Admin privileges revoked" : "Admin privileges granted")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const result = await deleteUser(deleteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("User deleted successfully")
      }
    } catch {
      toast.error("Failed to delete user")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
            {(user.full_name?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-card-foreground">
              {user.full_name || "No name"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (user: User) => (
        <span className="text-card-foreground">{user.phone || "N/A"}</span>
      ),
    },
    {
      key: "user_type",
      header: "User Type",
      render: (user: User) => (
        <Select
          defaultValue={user.user_type_id || "none"}
          onValueChange={(value) => handleUserTypeChange(user.id, value)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue>
              {user.user_types?.name || "None"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {userTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "is_admin",
      header: "Role",
      render: (user: User) => (
        <Badge
          variant={user.is_admin ? "default" : "secondary"}
          className={user.is_admin ? "bg-primary/20 text-primary" : ""}
        >
          {user.is_admin ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (user: User) => (
        <span className="text-muted-foreground">
          {format(new Date(user.created_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => handleToggleAdmin(user.id, user.is_admin)}>
              {user.is_admin ? (
                <>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Remove Admin
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Make Admin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteId(user.id)}
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
      <DataTable data={users} columns={columns} emptyMessage="No users found" />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
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
