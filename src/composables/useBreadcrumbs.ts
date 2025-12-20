import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { PROJECT_NAV } from '@/settings/projectSettings'
import type { SettingsSection } from '@/types/settings'

export type Breadcrumb = {
  label: string
  route?: { name: string; params?: Record<string, string> }
}

export function useBreadcrumbs() {
  const route = useRoute()
  const projectsStore = useProjectsStore()

  const projectId = computed(() => route.params.projectId as string | undefined)
  const project = computed(() =>
    projectId.value ? projectsStore.getProjectById(projectId.value) : null
  )

  const section = computed<SettingsSection | undefined>(() =>
    PROJECT_NAV.find(s => s.routeName === route.name)
  )

  const breadcrumbs = computed<Breadcrumb[]>(() => {
    const items: Breadcrumb[] = []

    // Dashboard root
    items.push({
      label: 'Dashboard',
      route: { name: 'dashboard' },
    })

    // Project context
    if (project.value && projectId.value) {
      items.push({
        label: project.value.title,
        route: {
          name: 'designer',
          params: { projectId: projectId.value },
        },
      })
    }

    // Section (Editor / Analytics / Settings / etc.)
    if (section.value) {
      items.push({
        label: section.value.breadcrumbLabel ?? section.value.title,
      })
    }

    return items
  })

  return { breadcrumbs }
}
