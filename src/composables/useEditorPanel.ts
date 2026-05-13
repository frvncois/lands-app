import { ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'

export type Tab = 'content' | 'design'
export type DesignPanel = 'theme' | 'colors' | 'typography'

export const DESIGN_PANEL_LABELS: Record<DesignPanel, string> = {
  theme: 'Theme',
  colors: 'Color Palette',
  typography: 'Typography',
}

// ─── Module-level singleton state ───
const activeTab = ref<Tab>('content')
const activeDesignPanel = ref<DesignPanel | null>(null)
const tabDirection = ref<'forward' | 'back'>('forward')
const direction = ref<'forward' | 'back'>('forward')
const isSubItemEditing = ref(false)

const tabs: Tab[] = ['content', 'design']
let initialized = false

export function useEditorPanel() {
  const editorStore = useEditorStore()

  function setTab(tab: Tab) {
    tabDirection.value = tabs.indexOf(tab) > tabs.indexOf(activeTab.value) ? 'forward' : 'back'
    activeTab.value = tab
    activeDesignPanel.value = null
  }

  function openDesignPanel(panel: DesignPanel) {
    tabDirection.value = 'forward'
    activeDesignPanel.value = panel
  }

  function backFromDesign() {
    tabDirection.value = 'back'
    activeDesignPanel.value = null
  }

  function reset() {
    isSubItemEditing.value = false
    activeTab.value = 'content'
    activeDesignPanel.value = null
  }

  if (!initialized) {
    initialized = true

    watch(() => editorStore.showSectionSettings, (val) => {
      direction.value = val ? 'forward' : 'back'
      if (!val) reset()
    })

    watch(() => editorStore.isEditMode, (val) => {
      if (!val) {
        activeTab.value = 'content'
        activeDesignPanel.value = null
      }
    })
  }

  return {
    activeTab,
    activeDesignPanel,
    tabDirection,
    direction,
    isSubItemEditing,
    setTab,
    openDesignPanel,
    backFromDesign,
    reset,
  }
}
