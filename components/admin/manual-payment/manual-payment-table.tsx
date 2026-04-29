"use client"

import { format } from "date-fns"
import { MoreHorizontal, Pencil } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ManualPaymentDialog, type ManualPaymentRow } from "./manual-payment-dialog"

interface ManualPaymentTableProps {
  rows: ManualPaymentRow[]
}

export function ManualPaymentTable({ rows }: ManualPaymentTableProps) {
  const columns = [
    {
      key: "juice_mobile_number",
      header: "Juice",
      render: (row: ManualPaymentRow) => (
        <span className="font-medium text-card-foreground">{row.juice_mobile_number || "-"}</span>
      ),
    },
    {
      key: "bank_name",
      header: "Bank Name",
      render: (row: ManualPaymentRow) => (
        <span className="text-card-foreground">{row.bank_name || "-"}</span>
      ),
    },
    {
      key: "bank_number",
      header: "Bank Number",
      render: (row: ManualPaymentRow) => (
        <span className="text-card-foreground">{row.bank_number || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ManualPaymentRow) => {
        const ready = !!(
          row.juice_mobile_number?.trim() ||
          row.bank_name?.trim() ||
          row.bank_number?.trim()
        )
        return (
          <Badge variant="secondary" className={ready ? "bg-success/15 text-success" : ""}>
            {ready ? "Configured" : "Empty"}
          </Badge>
        )
      },
    },
    {
      key: "created_at",
      header: "Created",
      render: (row: ManualPaymentRow) => (
        <span className="text-muted-foreground">{format(new Date(row.created_at), "MMM d, yyyy")}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (row: ManualPaymentRow) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ManualPaymentDialog
              row={row}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return <DataTable data={rows} columns={columns} emptyMessage="No payment entries found" />
}
