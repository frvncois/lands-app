import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ProjectMode = 'preview' | 'editor'

export const useProjectStore = defineStore('project', () => {
  const mode = ref<ProjectMode>('preview')

  function setMode(newMode: ProjectMode) {
    mode.value = newMode
  }

  return { mode, setMode }
})
