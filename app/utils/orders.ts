export type ServiceSlug =
  | 'repair'
  | 'parts'
  | 'pickup_georgia'
  | 'tow_truck'

export interface OrderMedia {
  id: string
  type: 'photo' | 'video'
  url: string
}

export interface OrderTimelineEvent {
  id: string
  messageKey: string
  created_at: string
}

export interface StoredOrder {
  unique_code: string
  service_type: ServiceSlug
  statusKey: string
  estimated_arrival_date: string | null
  progress_stage: number
  media: OrderMedia[]
  timeline: OrderTimelineEvent[]
  client_notes?: string
}

const STORAGE_KEY = 'motoservice-orders'

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
  const trimmed = clientNotes?.trim()
  return {
    unique_code,
    service_type: service,
    statusKey: 'new',
    estimated_arrival_date: null,
    progress_stage: 0,
    media: [],
    timeline: [],
    ...(trimmed ? { client_notes: trimmed } : {}),
  }
}
