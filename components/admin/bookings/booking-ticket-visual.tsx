"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  buildQrPayload,
  buildTicketWithQrDataUrl,
  QR_LAYOUT,
  qrDataUrlForText,
  TICKET_IMAGE_PATH,
  type TicketLineQr,
} from "@/lib/ticket-with-qr-image"

export type { TicketLineQr }

export interface BookingTicketVisualProps {
  bookingId: string | number
  userName: string | null
  email: string | null
  phone: string | null
  ticketLines: TicketLineQr[]
  /** Booking is confirmed (true) or pending (false). Included in QR JSON as `status`. */
  confirmed: boolean
}

export function BookingTicketVisual({
  bookingId,
  userName,
  email,
  phone,
  ticketLines,
  confirmed,
}: BookingTicketVisualProps) {
  const qrText = useMemo(
    () => buildQrPayload(bookingId, userName, email, phone, ticketLines, confirmed),
    [bookingId, userName, email, phone, ticketLines, confirmed],
  )

  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    qrDataUrlForText(qrText)
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [qrText])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)
    try {
      const dataUrlFull = await buildTicketWithQrDataUrl({
        bookingId,
        userName,
        email,
        phone,
        ticketLines,
        confirmed,
      })
      const res = await fetch(dataUrlFull)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ticket-${String(bookingId)}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Ticket image downloaded")
    } catch (e) {
      console.error(e)
      toast.error("Could not build download. If this persists, check that the ticket image loads from this site.")
    } finally {
      setIsDownloading(false)
    }
  }, [bookingId, userName, email, phone, ticketLines, confirmed])

  const qrBoxStyle = {
    right: `${QR_LAYOUT.rightPct}%`,
    bottom: `${QR_LAYOUT.bottomPct}%`,
    width: `${QR_LAYOUT.widthPct}%`,
    maxWidth: QR_LAYOUT.maxWidthPx,
  } as const

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!dataUrl || isDownloading}
          onClick={() => void handleDownload()}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Preparing…" : "Download image"}
        </Button>
      </div>
      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-border shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset preview */}
        <img src={TICKET_IMAGE_PATH} alt="Ticket design" className="block w-full select-none" />
        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-sm bg-white p-[2px] shadow-sm ring-1 ring-black/10"
          style={qrBoxStyle}
        >
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="" className="h-auto w-full" />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-sm bg-neutral-200" />
          )}
        </div>
      </div>
    </div>
  )
}
