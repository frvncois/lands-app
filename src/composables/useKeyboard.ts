import { onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  )
}

export function useKeyboardShortcuts() {
  const editor = useEditorStore()

  function handler(e: KeyboardEvent) {
    // Escape: deselect section → exit edit mode
    if (e.key === 'Escape') {
      if (editor.activeSection) {
        editor.setActiveSection(null)
      } else if (editor.isEditMode) {
        editor.exitEditMode()
      }
    }

    // Cmd/Ctrl+E: toggle edit mode
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault()
      if (editor.isEditMode) {
        editor.exitEditMode()
      } else {
        editor.enterEditMode()
      }
    }
  }

  onMounted(() => document.addEventListener('keydown', handler))
  onUnmounted(() => document.removeEventListener('keydown', handler))
}
