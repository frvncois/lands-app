import { ref, computed, nextTick, watch } from 'vue'

export function useOtpInput(options: { length?: number; onComplete?: (code: string) => void } = {}) {
  const length = options.length ?? 8
  const digits = ref<string[]>(Array(length).fill(''))
  const inputRefs = ref<HTMLInputElement[]>([])
  const code = computed(() => digits.value.join(''))
  const isComplete = computed(() => code.value.length === length && digits.value.every(d => d !== ''))

  function onInput(index: number, e: Event) {
    const input = e.target as HTMLInputElement
    const val = input.value.replace(/\D/g, '').slice(-1)
    digits.value[index] = val
    if (val && index < length - 1) {
      inputRefs.value[index + 1]?.focus()
    }
  }

  function onKeydown(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !digits.value[index] && index > 0) {
      inputRefs.value[index - 1]?.focus()
    }
  }

  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? ''
    const nums = text.replace(/\D/g, '').slice(0, length).split('')
    nums.forEach((d, i) => { digits.value[i] = d })
    const nextEmpty = nums.length < length ? nums.length : length - 1
    nextTick(() => inputRefs.value[nextEmpty]?.focus())
    e.preventDefault()
  }

  function reset() {
    digits.value = Array(length).fill('')
    focusFirst()
  }

  function focusFirst() {
    nextTick(() => inputRefs.value[0]?.focus())
  }

  function setInputRef(i: number, el: HTMLInputElement | null) {
    if (el) inputRefs.value[i] = el
  }

  if (options.onComplete) {
    watch(isComplete, (complete) => {
      if (complete) options.onComplete!(code.value)
    })
  }

  return { digits, code, isComplete, onInput, onKeydown, onPaste, reset, focusFirst, setInputRef, length }
}
