"use client"

import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/concerts": "Concerts",
  "/tickets": "Tickets",
  "/bookings": "Bookings",
  "/users": "Users",
  "/user-types": "User Types",
  "/ticket-types": "Ticket Types",
  "/settings": "Settings",
}

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const pageTitle = pageTitles[pathname] || "Dashboard"

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="h-6" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="ml-auto gap-2"
        onClick={() => void handleLogout()}
      >
        <LogOut className="size-4" />
        Log out
      </Button>
    </header>
  )
}
