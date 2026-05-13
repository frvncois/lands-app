import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { toSlug } from '@/shared/lib/slug'

/**
 * Derives a URL handle from a title ref.
 * Auto-syncs the handle to the slugified title until the user manually edits it.
 */
export function useSlugFromTitle(title: Ref<string>) {
  const handle = ref('')
  let handleEdited = false

  watch(title, (val) => {
    if (!handleEdited) handle.value = toSlug(val)
  })

  function onHandleInput(e: Event) {
    handleEdited = true
    handle.value = toSlug((e.target as HTMLInputElement).value)
  }

  return { handle, onHandleInput }
}
