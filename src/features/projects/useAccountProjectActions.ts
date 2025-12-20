import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import type { Project, ProjectPlan } from '@/types/project'

export function useAccountProjectActions() {
  const router = useRouter()
  const projectsStore = useProjectsStore()
  const userStore = useUserStore()

  return {
    openDesigner: (id: string) =>
      router.push({ name: 'designer', params: { projectId: id } }),

    openSettings: (id: string) =>
      router.push({ name: 'settings', params: { projectId: id } }),

    openAnalytics: (id: string) =>
      router.push({ name: 'analytics', params: { projectId: id } }),

    viewSite: (project: Project) => {
      const url = project.publishedUrl || `https://${project.slug}.lands.app`
      window.open(url, '_blank')
    },

    changePlan: async (projectId: string, plan: ProjectPlan) => {
      await projectsStore.updateProject(projectId, { plan })
    },

    deleteProject: (id: string) => projectsStore.deleteProject(id),

    leaveProject: async (project: Project) => {
      const currentUserId = userStore.authUser?.id
      if (!currentUserId) return

      const collaborators = projectsStore.getProjectCollaborators(project.id)
      const myCollaboration = collaborators.find(c => c.userId === currentUserId)

      if (myCollaboration) {
        await projectsStore.removeCollaborator(myCollaboration.id)
      }

      await projectsStore.fetchProjects()
    },

    isOwner: (project: Project) => {
      return project.userId === userStore.authUser?.id
    },
  }
}
