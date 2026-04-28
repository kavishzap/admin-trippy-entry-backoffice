import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "available"
  | "reserved"
  | "sold"
  | "pending"
  | "confirmed"
  | "refunded"
  | "failed"

const statusStyles: Record<StatusType, string> = {
  upcoming: "bg-primary/20 text-primary border-primary/30",
  ongoing: "bg-success/20 text-success border-success/30",
  completed: "bg-muted text-muted-foreground border-muted",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
  available: "bg-success/20 text-success border-success/30",
  reserved: "bg-warning/20 text-warning border-warning/30",
  sold: "bg-primary/20 text-primary border-primary/30",
  pending: "bg-warning/20 text-warning border-warning/30",
  confirmed: "bg-success/20 text-success border-success/30",
  refunded: "bg-muted text-muted-foreground border-muted",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as StatusType
  const style = statusStyles[normalizedStatus] || "bg-muted text-muted-foreground"

  return (
    <Badge
      variant="outline"
      className={cn("capitalize", style, className)}
    >
      {status}
    </Badge>
  )
}
