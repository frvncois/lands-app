import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '../views/EditorView.vue'
import ProjectsView from '@/views/ProjectsView.vue'
import AccountView from '@/views/AccountView.vue'
import TeamView from '@/views/TeamView.vue'
import IntegrationsView from '@/views/IntegrationsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'projects',
      component: ProjectsView
    },
    {
      path: '/projects/:id',
      name: 'project',
      component: EditorView,
      props: true,
    },
    {
      path: '/team/',
      name: 'team',
      component: TeamView,
    },
    {
      path: '/integrations/',
      name: 'integrations',
      component: IntegrationsView,
    },
    {
      path: '/account/',
      name: 'account',
      component: AccountView,
    },
  ],
})

export default router
