import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore, useToast } from '../toast'

describe('Toast Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  describe('useToastStore', () => {
    it('should add a toast', () => {
      const store = useToastStore()

      const id = store.addToast({ type: 'success', title: 'Test' })

      expect(store.toasts).toHaveLength(1)
      expect(store.toasts[0].id).toBe(id)
      expect(store.toasts[0].type).toBe('success')
      expect(store.toasts[0].title).toBe('Test')
    })

    it('should remove a toast', () => {
      const store = useToastStore()
      const id = store.addToast({ type: 'info', title: 'Test' })

      expect(store.toasts).toHaveLength(1)

      store.removeToast(id)

      expect(store.toasts).toHaveLength(0)
    })

    it('should clear all toasts', () => {
      const store = useToastStore()
      store.addToast({ type: 'success', title: 'Test 1' })
      store.addToast({ type: 'error', title: 'Test 2' })

      expect(store.toasts).toHaveLength(2)

      store.clearAll()

      expect(store.toasts).toHaveLength(0)
    })

    it('should auto-remove toast after duration', () => {
      const store = useToastStore()

      store.addToast({ type: 'success', title: 'Test', duration: 1000 })

      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(1000)

      expect(store.toasts).toHaveLength(0)
    })

    it('should not auto-remove if duration is 0', () => {
      const store = useToastStore()

      store.addToast({ type: 'success', title: 'Test', duration: 0 })

      expect(store.toasts).toHaveLength(1)

      vi.advanceTimersByTime(10000)

      expect(store.toasts).toHaveLength(1)
    })
  })

  describe('useToast composable', () => {
    it('should provide convenience methods', () => {
      const toast = useToast()
      const store = useToastStore()

      toast.success('Success!')
      expect(store.toasts[0].type).toBe('success')

      toast.error('Error!')
      expect(store.toasts[1].type).toBe('error')

      toast.warning('Warning!')
      expect(store.toasts[2].type).toBe('warning')

      toast.info('Info!')
      expect(store.toasts[3].type).toBe('info')
    })

    it('should dismiss toast by id', () => {
      const toast = useToast()
      const store = useToastStore()

      const id = toast.success('Test')
      expect(store.toasts).toHaveLength(1)

      toast.dismiss(id)
      expect(store.toasts).toHaveLength(0)
    })

    it('should clear all toasts', () => {
      const toast = useToast()
      const store = useToastStore()

      toast.success('Test 1')
      toast.error('Test 2')
      expect(store.toasts).toHaveLength(2)

      toast.clearAll()
      expect(store.toasts).toHaveLength(0)
    })
  })
})
