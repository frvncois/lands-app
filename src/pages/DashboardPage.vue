<script setup lang="ts">
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import type { Project } from '@/types/project'

import { Header, Button, Icon, Badge } from '@/components/ui'
import { ProjectsGrid, ProjectsEmpty, ProjectsSkeleton } from '@/features/projects'

// Lazy load modals for better performance
const ProjectCreate = defineAsyncComponent(() =>
  import('@/components/modal/ProjectCreate.vue')
)
const ProjectCreateWizard = defineAsyncComponent(() =>
  import('@/components/modal/ProjectCreateWizard.vue')
)
const ProjectDelete = defineAsyncComponent(() =>
  import('@/components/modal/ProjectDelete.vue')
)
const SupportChat = defineAsyncComponent(() =>
  import('@/components/modal/SupportChat.vue')
)

const router = useRouter()
const projectsStore = useProjectsStore()
const userStore = useUserStore()
const showChat = ref(false)

// EVENTUAL CONSISTENCY: Watch auth status and redirect if unauthenticated
watch(() => userStore.authStatus, (status) => {
  if (status === 'unauthenticated') {
    // Auth resolved to unauthenticated - redirect to login
    router.push({ name: 'auth' })
  } else if (status === 'authenticated' && !projectsStore.isLoading && projectsStore.projects.length === 0) {
    // Auth resolved to authenticated and projects not loaded yet - fetch them
    projectsStore.fetchProjects()
  }
})

// Did you know tips
const tips = [
  'You can duplicate any project to use it as a template for new landing pages.',
  'Custom domains are available on the Pro plan for each project.',
  'Use keyboard shortcuts: ⌘Z to undo, ⌘⇧Z to redo in the editor.',
  'You can preview your page in mobile view before publishing.',
  'Each project can have its own plan - upgrade only what you need.',
]
const currentTip = computed(() => tips[Math.floor(Math.random() * tips.length)])

const projects = computed(() => projectsStore.projects)
const isLoading = computed(() => {
  // Show loading if auth is unknown OR projects are loading
  return userStore.authStatus === 'unknown' || projectsStore.isLoading
})
const userName = computed(
  () => userStore.settings.profile?.name?.split(' ')[0] ?? 'there'
)

// Modal state
const showSimpleCreateModal = ref(false)
const showWizardModal = ref(false)
const showDeleteModal = ref(false)
const projectToDelete = ref<Project | null>(null)
const wizardProjectName = ref('')
const wizardProjectSlug = ref('')

onMounted(() => {
  // EVENTUAL CONSISTENCY: Only fetch if auth is already resolved to authenticated
  // Otherwise, the watcher will trigger fetch when auth resolves
  if (userStore.authStatus === 'authenticated') {
    projectsStore.fetchProjects()
  }
})

function handleCreate() {
  showSimpleCreateModal.value = true
}

function handleOpenWizard(data: { name: string; slug: string }) {
  wizardProjectName.value = data.name
  wizardProjectSlug.value = data.slug
  showSimpleCreateModal.value = false
  showWizardModal.value = true
}

function handleDelete(project: Project) {
  projectToDelete.value = project
  showDeleteModal.value = true
}

function handleDeleted() {
  projectToDelete.value = null
}
</script>

<template>
  <div class="flex h-full">
    <!-- Left Sidebar: Resources & Support -->
    <aside class="w-[260px] bg-sidebar-background border-r border-border overflow-y-auto">
      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-sm font-semibold text-foreground mb-1">Resources & Support</h2>
          <p class="text-xs text-muted-foreground">Learn, get help, and make the most of Lands.</p>
        </div>

        <!-- Learn Lands -->
        <button
          class="w-full text-left group"
          @click="router.push({ name: 'support', query: { tab: 'documentation' } })"
        >
          <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Icon name="lni-book-1" class="text-base text-blue-500" />
            </div>
            <div class="min-w-0">
              <h3 class="text-xs font-medium text-foreground mb-0.5 group-hover:text-primary transition-colors">Learn Lands</h3>
              <p class="text-[10px] text-muted-foreground leading-tight">Guides and tutorials</p>
            </div>
          </div>
        </button>

        <!-- Chat with us -->
        <button
          class="w-full text-left group"
          @click="showChat = true"
        >
          <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="lni-comment-1-text" class="text-base text-primary" />
            </div>
            <div class="min-w-0">
              <h3 class="text-xs font-medium text-foreground mb-0.5 group-hover:text-primary transition-colors">Chat with us</h3>
              <p class="text-[10px] text-muted-foreground leading-tight">Quick support answers</p>
            </div>
          </div>
        </button>

        <!-- Book a session -->
        <button
          class="w-full text-left group"
          @click="router.push({ name: 'support' })"
        >
          <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
            <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <Icon name="lni-video-1" class="text-base text-green-500" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <h3 class="text-xs font-medium text-foreground group-hover:text-primary transition-colors">Book a session</h3>
                <Badge variant="success" size="xs">Free</Badge>
              </div>
              <p class="text-[10px] text-muted-foreground leading-tight">30-min training or setup</p>
            </div>
          </div>
        </button>

        <!-- Divider -->
        <div class="border-t border-border" />

        <!-- Did you know -->
        <div class="p-3 rounded-lg bg-muted/30">
          <div class="flex items-start gap-2">
            <div class="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <Icon name="lni-bulb-1" class="text-sm text-amber-500" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Did you know?</p>
              <p class="text-xs text-foreground leading-tight">{{ currentTip }}</p>
            </div>
          </div>
        </div>

        <!-- Pro Plan CTA -->
        <div class="p-3 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div class="flex items-start gap-2 mb-2">
            <div class="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="lni-crown-1" class="text-sm text-primary" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 mb-0.5">
                <h3 class="text-xs font-medium text-foreground">Upgrade to Pro</h3>
                <Badge variant="default" size="xs">$6/mo</Badge>
              </div>
              <p class="text-[10px] text-muted-foreground leading-tight mb-2">
                Per-project plans. Custom domains, analytics, and more.
              </p>
              <Button size="sm" variant="outline" class="w-full text-xs h-7" @click="router.push({ name: 'support' })">
                Learn more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="mx-auto py-10 px-40">
        <!-- Header (shown when loading or has projects) -->
        <Header
          v-if="isLoading || projects.length"
          :title="`Welcome, ${userName}`"
          description="Manage and create your landing pages."
          button="New Project"
          @button-click="handleCreate"
        />

        <!-- Loading State -->
        <ProjectsSkeleton v-if="isLoading" />

        <!-- Projects Grid -->
        <ProjectsGrid
          v-else-if="projects.length"
          :projects="projects"
          @delete="handleDelete"
        />

        <!-- Load More Button -->
        <div
          v-if="projectsStore.hasMoreProjects && !isLoading"
          class="flex justify-center mt-8"
        >
          <Button
            variant="outline"
            :loading="projectsStore.isLoading"
            @click="projectsStore.loadMoreProjects"
          >
            Load more projects
          </Button>
        </div>

        <!-- Empty State -->
        <ProjectsEmpty v-else-if="!projects.length && !isLoading" @create="handleCreate" />
      </div>
    </div>
  </div>

  <!-- Modals -->
  <ProjectCreate
    v-model:open="showSimpleCreateModal"
    @created="(id) => router.push({ name: 'designer', params: { projectId: id } })"
    @open-wizard="handleOpenWizard"
  />

  <ProjectCreateWizard
    v-model:open="showWizardModal"
    :project-name="wizardProjectName"
    :project-slug="wizardProjectSlug"
    @created="(id) => router.push({ name: 'designer', params: { projectId: id } })"
  />

  <ProjectDelete
    v-if="projectToDelete"
    v-model:open="showDeleteModal"
    :project-id="projectToDelete.id"
    :project-title="projectToDelete.title"
    @deleted="handleDeleted"
  />

  <!-- Support Chat -->
  <SupportChat v-model:open="showChat" />
</template>
