"use client"

import { format } from "date-fns"
import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/admin/status-badge"

interface Concert {
  id: string
  name: string
  artist: string
  date: string
  status: string
  venues?: { name: string } | null
}

interface UpcomingConcertsProps {
  concerts: Concert[]
}

export function UpcomingConcerts({ concerts }: UpcomingConcertsProps) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Upcoming Concerts</CardTitle>
        <CardDescription>Next 5 scheduled events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {concerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming concerts</p>
          ) : (
            concerts.map((concert) => (
              <div
                key={concert.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium text-card-foreground">{concert.name}</p>
                  <p className="text-sm text-muted-foreground">{concert.artist}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(concert.date), "MMM d, yyyy")}
                    </span>
                    {concert.venues?.name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {concert.venues.name}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={concert.status} />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
