"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import QRCode from "qrcode"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export type TicketLineQr = { name: string; quantity: number }

/** Keep canvas export aligned with the on-screen overlay. */
const QR_LAYOUT = {
  rightPct: 3.5,
  bottomPct: 18,
  widthPct: 15,
  maxWidthPx: 80,
  /** Matches ticket container `max-w-xl` (~36rem) for scaling `max-w-[80px]`. */
  refDisplayWidthPx: 576,
  paddingPx: 2,
} as const

export interface BookingTicketVisualProps {
  bookingId: string | number
  userName: string | null
  email: string | null
  phone: string | null
  ticketLines: TicketLineQr[]
  /** Booking is confirmed (true) or pending (false). Included in QR JSON as `status`. */
  confirmed: boolean
}

const TICKET_IMAGE_PATH =
  "/WhatsApp%20Image%202026-04-28%20at%2022.16.16.jpeg"

function buildQrPayload(
  bookingId: string | number,
  userName: string | null,
  email: string | null,
  phone: string | null,
  ticketLines: TicketLineQr[],
  confirmed: boolean,
): string {
  const payload: Record<string, unknown> = {
    bookingId: String(bookingId),
    status: confirmed ? "Confirmed" : "Pending",
  }
  const name = userName?.trim()
  if (name) payload.name = name
  const em = email?.trim()
  if (em) payload.email = em
  const ph = phone?.trim()
  if (ph) payload.phone = ph
  if (ticketLines.length > 0) {
    payload.tickets = ticketLines.map((t) => ({
      name: t.name,
      quantity: t.quantity,
    }))
  }
  return JSON.stringify(payload)
}

function computeQrSizePx(imageWidthPx: number): number {
  const { widthPct, maxWidthPx, refDisplayWidthPx } = QR_LAYOUT
  const fromPct = (imageWidthPx * widthPct) / 100
  const fromMax = (maxWidthPx * imageWidthPx) / refDisplayWidthPx
  return Math.min(fromPct, fromMax)
}

function drawTicketWithQr(
  ticketImg: HTMLImageElement,
  qrImg: HTMLImageElement,
): HTMLCanvasElement {
  const w = ticketImg.naturalWidth
  const h = ticketImg.naturalHeight
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  ctx.drawImage(ticketImg, 0, 0, w, h)

  const qrW = computeQrSizePx(w)
  const pad = Math.max(
    1,
    Math.round((QR_LAYOUT.paddingPx * w) / QR_LAYOUT.refDisplayWidthPx),
  )
  const rightGap = (w * QR_LAYOUT.rightPct) / 100
  const bottomGap = (h * QR_LAYOUT.bottomPct) / 100
  const x = w - rightGap - qrW
  const y = h - bottomGap - qrW

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(x - pad, y - pad, qrW + pad * 2, qrW + pad * 2)
  ctx.drawImage(qrImg, x, y, qrW, qrW)

  return canvas
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
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
    QRCode.toDataURL(qrText, {
      width: 190,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    })
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
    if (!dataUrl) {
      toast.error("QR is not ready yet. Try again in a moment.")
      return
    }
    setIsDownloading(true)
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const ticketSrc = `${origin}${TICKET_IMAGE_PATH}`
      const [ticketImg, qrImg] = await Promise.all([loadImage(ticketSrc), loadImage(dataUrl)])
      const canvas = drawTicketWithQr(ticketImg, qrImg)
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not create image file"))
              return
            }
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `ticket-${String(bookingId)}.png`
            a.click()
            URL.revokeObjectURL(url)
            resolve()
          },
          "image/png",
          0.95,
        )
      })
      toast.success("Ticket image downloaded")
    } catch (e) {
      console.error(e)
      toast.error("Could not build download. If this persists, check that the ticket image loads from this site.")
    } finally {
      setIsDownloading(false)
    }
  }, [bookingId, dataUrl])

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
