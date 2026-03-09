import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// Module-level singleton so all composable calls share the same list
const toasts = ref<Toast[]>([])

export function useToast() {
  function addToast(
    message: string,
    type: Toast['type'] = 'success',
    duration = 3000,
  ) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}
