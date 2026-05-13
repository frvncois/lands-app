import { onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/features/editor/stores/editor'


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
