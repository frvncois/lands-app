<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectsStore } from '@/stores/projects'
import { Card, Input, FormField, Button, ToggleItem, Badge, Avatar, Header, ListItem, Dropdown, RadioGroup } from '@/components/ui'
import PasswordChange from '@/components/modal/PasswordChange.vue'
import AccountDelete from '@/components/modal/AccountDelete.vue'
import PlanChange from '@/components/modal/PlanChange.vue'
import ProjectLeave from '@/components/modal/ProjectLeave.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import type { Project, ProjectPlan } from '@/types/project'

const router = useRouter()
const userStore = useUserStore()
const projectsStore = useProjectsStore()

const settings = computed(() => userStore.settings)
const projects = computed(() => projectsStore.projects)
const currentUserId = computed(() => userStore.authUser?.id)

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const showPasswordModal = ref(false)
const showDeleteModal = ref(false)
const showPlanModal = ref(false)
const showLeaveModal = ref(false)
const showProjectDeleteModal = ref(false)
const selectedProject = ref<Project | null>(null)

onMounted(() => {
  projectsStore.fetchProjects()
})

function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function isProjectOwner(project: Project) {
  return project.userId === currentUserId.value
}

function viewSite(project: Project) {
  if (project.publishedUrl) {
    window.open(project.publishedUrl, '_blank')
  } else {
    window.open(`https://${project.slug}.lands.app`, '_blank')
  }
}

function openEditor(projectId: string) {
  router.push({ name: 'editor', params: { projectId } })
}

function openSettings(projectId: string) {
  router.push({ name: 'settings', params: { projectId } })
}

function openAnalytics(projectId: string) {
  router.push({ name: 'analytics', params: { projectId } })
}

function openPlanModal(project: Project) {
  selectedProject.value = project
  showPlanModal.value = true
}

function openLeaveModal(project: Project) {
  selectedProject.value = project
  showLeaveModal.value = true
}

function openDeleteProjectModal(project: Project) {
  selectedProject.value = project
  showProjectDeleteModal.value = true
}

async function handlePlanChanged(plan: ProjectPlan) {
  if (!selectedProject.value) return
  await projectsStore.updateProject(selectedProject.value.id, { plan })
  selectedProject.value = null
}

async function handleProjectLeft() {
  if (!selectedProject.value || !currentUserId.value) return

  const collaborators = projectsStore.getProjectCollaborators(selectedProject.value.id)
  const myCollaboration = collaborators.find(c => c.userId === currentUserId.value)

  if (myCollaboration) {
    await projectsStore.removeCollaborator(myCollaboration.id)
  }

  await projectsStore.fetchProjects()
  selectedProject.value = null
}

function handleProjectDeleted() {
  selectedProject.value = null
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Account Settings"
        description="Manage your profile, preferences, and projects."
      />

      <!-- Masonry Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Left Column: Profile, Preferences -->
        <div class="space-y-8">
          <!-- Profile Card -->
          <Card>
            <Card.Header title="Profile" icon="lni-user-4" />
            <Card.Content class="space-y-5">
            <!-- Avatar -->
            <div class="space-y-3">
              <FormField label="Full Name">
                <Input
                  :model-value="settings.profile.name"
                  placeholder="Your name"
                  @update:model-value="userStore.updateProfile({ name: $event as string })"
                />
              </FormField>

              <FormField label="Email">
                <Input
                  :model-value="settings.profile.email"
                  type="email"
                  placeholder="you@example.com"
                  @update:model-value="userStore.updateProfile({ email: $event as string })"
                />
              </FormField>
            </div>

            <Button variant="default" size="sm" class="h-auto p-0" @click="showPasswordModal = true">
              Change password
            </Button>
            </Card.Content>
          </Card>

          <!-- Payment Card -->
          <Card>
            <Card.Header title="Payment Method" icon="lni-credit-card-multiple" />
            <Card.Content>
              <div class="flex items-center justify-between p-4 border border-dashed border-border rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name="credit-card-multiple" class="text-muted-foreground" />
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">No payment method added</p>
                    <p class="text-xxs text-muted-foreground/70">Add a card to upgrade your projects</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Add Card
                </Button>
              </div>
            </Card.Content>
          </Card>

          <!-- Theme Card -->
          <Card>
            <Card.Header title="System theme" icon="lni-sun-1" />
            <Card.Content>
              <RadioGroup
                :model-value="settings.preferences.theme"
                orientation="horizontal"
                @update:model-value="userStore.updatePreferences({ theme: $event as 'light' | 'dark' | 'system' })"
              >
                <RadioGroup.Option
                  v-for="option in themeOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </RadioGroup>
            </Card.Content>
          </Card>

          <!-- Notifications Card -->
          <Card>
            <Card.Header title="Notifications" icon="lni-bell-1" />
            <Card.Content class="space-y-4">
              <ToggleItem
                v-model="settings.preferences.emailNotifications"
                label="Email Notifications"
                description="Receive updates about your projects"
                @update:model-value="userStore.updatePreferences({ emailNotifications: $event })"
              />

              <ToggleItem
                v-model="settings.preferences.marketingEmails"
                label="Marketing Emails"
                description="Receive tips, news, and offers"
                @update:model-value="userStore.updatePreferences({ marketingEmails: $event })"
              />
            </Card.Content>
          </Card>

          </div>

        <!-- Right Column: Projects, Danger Zone -->
        <div class="space-y-6">

          <!-- Projects Section -->
          <Card>
            <Card.Header title="Your Projects" icon="lni-folder-1" />
            <Card.Content class="space-y-3">
              <ListItem v-for="project in projects" :key="project.id">
                <ListItem.Thumbnail :initial="getProjectInitial(project.title)" />

                <div class="min-w-0 flex-1 space-y-2">
                  <ListItem.Title>
                    <Button
                      variant="link"
                      size="xs"
                      class="h-auto p-0 truncate"
                      @click="openEditor(project.id)"
                    >
                      {{ project.title }}
                    </Button>
                  </ListItem.Title>

                  <ListItem.Content>
                    <Badge :variant="project.isPublished ? 'success' : 'secondary'" size="xs" dot>
                      {{ project.isPublished ? 'Published' : 'Draft' }}
                    </Badge>
                    <Badge
                      :variant="project.plan === 'pro' ? 'info' : 'outline'"
                      size="xs"
                      dot
                    >
                      {{ project.plan === 'pro' ? 'Pro' : 'Free' }}
                    </Badge>
                    <Badge v-if="!isProjectOwner(project)" variant="warning" size="xs">
                      Collaborator
                    </Badge>
                  </ListItem.Content>
                </div>

                <ListItem.Actions>
                  <Dropdown>
                    <Dropdown.Item v-if="project.isPublished" icon="app-show" @click="viewSite(project)">
                      View Site
                    </Dropdown.Item>
                    <Dropdown.Item icon="lni-pencil-1" @click="openEditor(project.id)">
                      Open Editor
                    </Dropdown.Item>
                    <Dropdown.Item icon="lni-bar-chart-4" @click="openAnalytics(project.id)">
                      Analytics
                    </Dropdown.Item>
                    <Dropdown.Item icon="lni-gear-1" @click="openSettings(project.id)">
                      Settings
                    </Dropdown.Item>
                    <template v-if="isProjectOwner(project)">
                      <Dropdown.Item icon="lni-credit-card-multiple" @click="openPlanModal(project)">
                        Change Plan
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item icon="lni-trash-3" destructive @click="openDeleteProjectModal(project)">
                        Delete Project
                      </Dropdown.Item>
                    </template>
                    <template v-else>
                      <Dropdown.Divider />
                      <Dropdown.Item icon="app-logout" destructive @click="openLeaveModal(project)">
                        Leave Project
                      </Dropdown.Item>
                    </template>
                  </Dropdown>
                </ListItem.Actions>
              </ListItem>

              <!-- Empty State -->
              <div v-if="projects.length === 0" class="py-4 text-center">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <p class="text-sm text-muted-foreground">No projects yet</p>
                <p class="text-xs text-muted-foreground mt-1">Create your first project from the sidebar</p>
              </div>
            </Card.Content>
          </Card>

          <!-- Invoices Card -->
          <Card>
            <Card.Header title="Invoices" icon="lni-clipboard" />
            <Card.Content>
              <div class="flex flex-col items-center justify-center py-6 text-center">
                <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <Icon name="clipboard" class="text-muted-foreground" />
                </div>
                <p class="text-xs text-muted-foreground">No invoices yet</p>
                <p class="text-xxs text-muted-foreground/70">Your billing history will appear here</p>
              </div>
            </Card.Content>
          </Card>

          <!-- Danger Zone -->
          <Card variant="destructive">
            <Card.Header :border-bottom="false">
              <template #icon>
                <Icon name="xmark-circle" class="text-sm" />
              </template>
              <h2 class="text-xs font-medium text-destructive">Danger Zone</h2>
              <template #action>
                <Button variant="destructive" size="sm" @click="showDeleteModal = true">
                  Delete Account
                </Button>
              </template>
            </Card.Header>
          </Card>

        </div>
      </div>
    </div>

    <!-- Modals -->
    <PasswordChange v-model:open="showPasswordModal" />
    <AccountDelete v-model:open="showDeleteModal" />
    <PlanChange
      v-model:open="showPlanModal"
      :project="selectedProject"
      @changed="handlePlanChanged"
    />
    <ProjectLeave
      v-model:open="showLeaveModal"
      :project="selectedProject"
      @left="handleProjectLeft"
    />
    <ProjectDelete
      v-if="selectedProject"
      v-model:open="showProjectDeleteModal"
      :project-id="selectedProject.id"
      :project-title="selectedProject.title"
      @deleted="handleProjectDeleted"
    />
  </div>
</template>
