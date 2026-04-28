"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UrlPaginationProps {
  basePath: string
  page: number
  pageSize: number
  total: number
}

export function UrlPagination({ basePath, page, pageSize, total }: UrlPaginationProps) {
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const hrefForPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(p))
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page <= 1 ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none gap-1 opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        ) : (
          <Link
            href={hrefForPage(page - 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
            scroll={false}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        )}
        <span className="text-sm text-muted-foreground tabular-nums">
          Page {page} / {totalPages}
        </span>
        {page >= totalPages ? (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none gap-1 opacity-50"
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={hrefForPage(page + 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
            scroll={false}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
