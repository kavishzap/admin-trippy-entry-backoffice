import QRCode from "qrcode"

export type TicketLineQr = { name: string; quantity: number }

/** Keep canvas export aligned with the on-screen overlay in `BookingTicketVisual`. */
export const QR_LAYOUT = {
  rightPct: 4.3,
  bottomPct: 15,
  widthPct: 14,
  maxWidthPx: 80,
  refDisplayWidthPx: 576,
  paddingPx: 2,
} as const

export const TICKET_IMAGE_PATH = "/ticket.png"

export function buildQrPayload(
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

export function computeQrSizePx(imageWidthPx: number): number {
  const { widthPct, maxWidthPx, refDisplayWidthPx } = QR_LAYOUT
  const fromPct = (imageWidthPx * widthPct) / 100
  const fromMax = (maxWidthPx * imageWidthPx) / refDisplayWidthPx
  return Math.min(fromPct, fromMax)
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
}

export function drawTicketWithQr(ticketImg: HTMLImageElement, qrImg: HTMLImageElement): HTMLCanvasElement {
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

export function qrDataUrlForText(qrText: string): Promise<string> {
  return QRCode.toDataURL(qrText, {
    width: 190,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  })
}

export interface TicketWithQrInput {
  bookingId: string | number
  userName: string | null
  email: string | null
  phone: string | null
  ticketLines: TicketLineQr[]
  confirmed: boolean
}

/** Full `data:image/png;base64,...` string (same as download preview composite). */
export async function buildTicketWithQrDataUrl(input: TicketWithQrInput): Promise<string> {
  const qrText = buildQrPayload(
    input.bookingId,
    input.userName,
    input.email,
    input.phone,
    input.ticketLines,
    input.confirmed,
  )
  const qrDataUrl = await qrDataUrlForText(qrText)
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const ticketSrc = `${origin}${TICKET_IMAGE_PATH}`
  const [ticketImg, qrImg] = await Promise.all([loadImage(ticketSrc), loadImage(qrDataUrl)])
  const canvas = drawTicketWithQr(ticketImg, qrImg)
  return canvas.toDataURL("image/png", 0.95)
}

/**
 * Raw base64 (no `data:image/png;base64,` prefix) for EmailJS **Variable attachment**.
 * In EmailJS: Template → Attachments → Variable attachment → parameter name must match the key you send (e.g. `ticket_png`).
 */
export async function buildTicketWithQrPngBase64(input: TicketWithQrInput): Promise<string> {
  const dataUrl = await buildTicketWithQrDataUrl(input)
  const prefix = "data:image/png;base64,"
  if (!dataUrl.startsWith(prefix)) {
    throw new Error("Unexpected ticket image data URL format")
  }
  return dataUrl.slice(prefix.length)
}
