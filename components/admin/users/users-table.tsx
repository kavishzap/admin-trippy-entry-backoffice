"use client"

import { format } from "date-fns"
import { DataTable } from "@/components/admin/data-table"
import { UrlPagination } from "@/components/admin/url-pagination"
import { UsersSearch } from "@/components/admin/users/users-search"

interface User {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  created_at: string
}

interface UsersTableProps {
  users: User[]
  total: number
  page: number
  pageSize: number
  query: string
}

export function UsersTable({ users, total, page, pageSize, query }: UsersTableProps) {
  const columns = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
            {(user.first_name?.[0] || user.email?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-card-foreground">
              {[user.first_name, user.last_name].filter(Boolean).join(" ") || "No name"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user: User) => (
        <span className="text-card-foreground">{user.email || "No email"}</span>
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
      key: "created_at",
      header: "Joined",
      render: (user: User) => (
        <span className="text-muted-foreground">
          {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "N/A"}
        </span>
      ),
    },
  ]

  return (
    <div>
      <UsersSearch defaultQuery={query} />
      <DataTable data={users} columns={columns} emptyMessage="No users found" />
      <UrlPagination basePath="/users" page={page} pageSize={pageSize} total={total} />
    </div>
  )
}
