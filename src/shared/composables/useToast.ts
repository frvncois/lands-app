import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  persistent?: boolean
  action?: { label: string; onClick: () => void }
}

export const toasts = ref<Toast[]>([])

export function addToast(
  message: string,
  type: Toast['type'] = 'success',
  duration = 3000,
  options?: { persistent?: boolean; action?: Toast['action'] },
) {
  const id = crypto.randomUUID()
  toasts.value.push({ id, message, type, ...options })
  if (!options?.persistent) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

export function removeToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}
