export type ServiceSlug =
  | 'repair'
  | 'parts'
  | 'pickup_georgia'
  | 'tow_truck'
  | 'auction_us_japan'

export interface OrderMedia {
  id: string
  type: 'photo' | 'video'
  url: string
}

export interface OrderTimelineEvent {
  id: string
  /** i18n key under timeline.events.* */
  messageKey: string
  created_at: string
}

export interface StoredOrder {
  unique_code: string
  service_type: ServiceSlug
  /** i18n key under order.status.* */
  statusKey: string
  estimated_arrival_date: string | null
  /** 0..4 — этапы прогресса из BRD */
  progress_stage: number
  media: OrderMedia[]
  timeline: OrderTimelineEvent[]
  /** произвольный текст с формы заявки */
  client_notes?: string
}

/** Подбор/заказ с аукциона за границей — единственная услуга с отслеживанием по коду в этом разделе. */
export const AUCTION_IMPORT_SERVICE_SLUG: ServiceSlug = 'auction_us_japan'

export function isAuctionImportOrder(order: StoredOrder): boolean {
  return order.service_type === AUCTION_IMPORT_SERVICE_SLUG
}

const STORAGE_KEY = 'motoservice-orders'

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readAll(): Record<string, StoredOrder> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, StoredOrder>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getOrder(code: string): StoredOrder | null {
  const key = code.trim().toUpperCase()
  if (!key) return null
  const all = readAll()
  return all[key] ?? null
}

export function saveOrder(order: StoredOrder) {
  const all = readAll()
  all[order.unique_code.toUpperCase()] = {
    ...order,
    unique_code: order.unique_code.toUpperCase(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += chars[Math.floor(Math.random() * chars.length)]!
  }
  return s
}

export function createOrderFromForm(
  service: ServiceSlug,
  clientNotes?: string,
): StoredOrder {
  const unique_code = generateAccessCode()
  const now = new Date().toISOString()
  const trimmed = clientNotes?.trim()
  return {
    unique_code,
    service_type: service,
    statusKey: 'new',
    estimated_arrival_date: null,
    progress_stage: 0,
    media: [],
    timeline: [
      {
        id: newId(),
        messageKey: 'order_created',
        created_at: now,
      },
    ],
    ...(trimmed ? { client_notes: trimmed } : {}),
  }
}
