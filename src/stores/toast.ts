import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

const DEFAULT_DURATION = 5000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  function addToast(toast: Omit<Toast, 'id'>): string {
    const id = generateId()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_DURATION,
    }

    toasts.value.push(newToast)

    // Auto-remove after duration (if duration > 0)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAll() {
    toasts.value = []
  }

  // Convenience methods
  function success(title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) {
    return addToast({ type: 'success', title, description, ...options })
  }

  function error(title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) {
    return addToast({ type: 'error', title, description, duration: 8000, ...options })
  }

  function warning(title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) {
    return addToast({ type: 'warning', title, description, ...options })
  }

  function info(title: string, description?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'description'>>) {
    return addToast({ type: 'info', title, description, ...options })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  }
})

// Composable for easy access outside of components
export function useToast() {
  const store = useToastStore()
  return {
    success: store.success,
    error: store.error,
    warning: store.warning,
    info: store.info,
    dismiss: store.removeToast,
    clearAll: store.clearAll,
  }
}
