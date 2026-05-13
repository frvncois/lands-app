import { ref } from 'vue'

export function useClipboardCopy() {
  const copied = ref<string | null>(null)

  async function copy(text: string, key = 'default') {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => { copied.value = null }, 2000)
  }

  return { copy, copied }
}
