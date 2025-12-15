import { ref } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useProjectsStore } from '@/stores/projects'

export function useProjectPublishing(projectId: string) {
  const projectStore = useProjectStore()
  const projectsStore = useProjectsStore()

  const isPublishing = ref(false)
  const isSettingUpAnalytics = ref(false)

  async function publish() {
    if (isPublishing.value) return
    isPublishing.value = true

    try {
      if (!projectsStore.getProjectContent(projectId)) {
        await projectsStore.fetchProjectContent(projectId)
      }
      await projectsStore.publishProject(projectId)
      projectStore.updatePublish({ isPublished: true, publishedAt: new Date().toISOString() })
    } finally {
      isPublishing.value = false
    }
  }

  async function unpublish() {
    isPublishing.value = true
    try {
      await projectsStore.unpublishProject(projectId)
      projectStore.updatePublish({ isPublished: false })
    } finally {
      isPublishing.value = false
    }
  }

  async function toggleAnalytics() {
    if (isSettingUpAnalytics.value) return

    const isCurrentlyEnabled = projectStore.settings.analytics.umamiEnabled
    isSettingUpAnalytics.value = true

    try {
      if (isCurrentlyEnabled) {
        await projectStore.disableUmamiAnalytics()
      } else {
        await projectStore.setupUmamiAnalytics()
      }

      if (projectStore.settings.publish.isPublished) {
        await publish()
      }
    } finally {
      isSettingUpAnalytics.value = false
    }
  }

  return {
    isPublishing,
    isSettingUpAnalytics,
    publish,
    unpublish,
    toggleAnalytics,
  }
}
