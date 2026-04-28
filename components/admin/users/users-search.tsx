"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface UsersSearchProps {
  defaultQuery: string
}

export function UsersSearch({ defaultQuery }: UsersSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultQuery)

  useEffect(() => {
    setValue(defaultQuery)
  }, [defaultQuery])

  const apply = (nextQ: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = nextQ.trim()
    if (trimmed) {
      params.set("q", trimmed)
    } else {
      params.delete("q")
    }
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    apply(value)
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email, name, or phone…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-secondary pl-9"
          aria-label="Search users"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {defaultQuery ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setValue("")
              apply("")
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  )
}
