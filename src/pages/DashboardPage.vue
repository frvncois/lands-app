<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useUserStore } from '@/stores/user'
import type { Project } from '@/types/project'

import { Header, Card, Button, Icon, Badge } from '@/components/ui'
import { ProjectsGrid, ProjectsEmpty, ProjectsSkeleton } from '@/features/projects'
import ProjectCreate from '@/components/modal/ProjectCreate.vue'
import ProjectCreateWizard from '@/components/modal/ProjectCreateWizard.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import SupportChat from '@/components/modal/SupportChat.vue'

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
  <div class="max-w-6xl mx-auto p-10">
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

    <!-- Empty State -->
    <ProjectsEmpty v-else @create="handleCreate" />

    <!-- Resources Section -->
    <div v-if="!isLoading" class="mt-12 pt-10 border-t border-border">
      <h2 class="text-lg font-semibold text-foreground mb-1">Resources & Support</h2>
      <p class="text-sm text-muted-foreground mb-6">Learn, get help, and make the most of Lands.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <!-- Learn Lands -->
        <Card class="group hover:border-primary/30 transition-colors cursor-pointer" @click="router.push({ name: 'support', query: { tab: 'documentation' } })">
          <Card.Content class="p-5">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Icon name="lni-book-1" class="text-xl text-blue-500" />
              </div>
              <div>
                <h3 class="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">Learn how to use Lands</h3>
                <p class="text-xs text-muted-foreground">Guides, tutorials, and tips to build beautiful landing pages.</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <!-- Chat with us -->
        <Card class="group hover:border-primary/30 transition-colors cursor-pointer" @click="showChat = true">
          <Card.Content class="p-5">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="lni-comment-1-text" class="text-xl text-primary" />
              </div>
              <div>
                <h3 class="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">Chat with us</h3>
                <p class="text-xs text-muted-foreground">Get quick answers from our support team.</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <!-- Book a session -->
        <Card class="group hover:border-primary/30 transition-colors cursor-pointer" @click="router.push({ name: 'support' })">
          <Card.Content class="p-5">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Icon name="lni-video-1" class="text-xl text-green-500" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-foreground group-hover:text-primary transition-colors">Book a free session</h3>
                  <Badge variant="success" size="xs">Free</Badge>
                </div>
                <p class="text-xs text-muted-foreground">30-min training or 1-hour setup with our team.</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Did you know -->
        <Card class="bg-muted/30">
          <Card.Content class="p-5">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Icon name="lni-bulb-1" class="text-lg text-amber-500" />
              </div>
              <div>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Did you know?</p>
                <p class="text-sm text-foreground">{{ currentTip }}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <!-- Pro Plan CTA -->
        <Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <Card.Content class="p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-foreground">Upgrade to Pro</h3>
                  <Badge variant="default" size="xs">$6/mo per project</Badge>
                </div>
                <p class="text-xs text-muted-foreground mb-3">
                  Plans are per-project, so you only pay for what you need. Get custom domains, remove watermarks, analytics, integrations, and more.
                </p>
                <Button size="sm" variant="outline" @click="router.push({ name: 'support' })">
                  Learn more
                </Button>
              </div>
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="lni-crown-1" class="text-xl text-primary" />
              </div>
            </div>
          </Card.Content>
        </Card>
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
