import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'

export function useProjectActions() {
  const router = useRouter()
  const store = useProjectsStore()

  return {
    edit: (id: string) =>
      router.push({ name: 'designer', params: { projectId: id } }),

    settings: (id: string) =>
      router.push({ name: 'settings', params: { projectId: id } }),

    analytics: (id: string) =>
      router.push({ name: 'analytics', params: { projectId: id } }),

    publish: async (id: string) => {
      // Fetch content if not already loaded
      if (!store.getProjectContent(id)) {
        await store.fetchProjectContent(id)
      }
      return store.publishProject(id)
    },

    unpublish: (id: string) => store.unpublishProject(id),

    duplicate: (id: string) => store.duplicateProject(id),

    delete: (id: string) => store.deleteProject(id),

    openSite: (slug: string, publishedUrl?: string) => {
      const url = publishedUrl || `https://${slug}.lands.app`
      window.open(url, '_blank')
    },
  }
}
