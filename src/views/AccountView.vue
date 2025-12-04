<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProjectsStore } from '@/stores/projects'
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

const planOptions: { value: ProjectPlan; label: string; price: string; features: string[] }[] = [
  { value: 'free', label: 'Free', price: '$0', features: ['1 project', 'Basic analytics', 'Lands branding'] },
  { value: 'pro', label: 'Pro', price: '$12/mo', features: ['Unlimited projects', 'Advanced analytics', 'No branding', 'Custom domain'] },
  { value: 'business', label: 'Business', price: '$29/mo', features: ['Everything in Pro', 'Team collaboration', 'Priority support', 'API access'] },
]

const showPasswordModal = ref(false)
const showDeleteModal = ref(false)
const showPlanModal = ref(false)
const showLeaveModal = ref(false)
const deleteConfirmText = ref('')
const selectedProject = ref<Project | null>(null)
const isUpdatingPlan = ref(false)
const isLeavingProject = ref(false)

onMounted(() => {
  projectsStore.fetchProjects()
})

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getProjectInitial(title: string) {
  return title.charAt(0).toUpperCase()
}

function isProjectOwner(project: Project) {
  return project.userId === currentUserId.value
}

function getPlanBadgeClass(plan: ProjectPlan) {
  switch (plan) {
    case 'pro':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'business':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function openPlanModal(project: Project) {
  selectedProject.value = project
  showPlanModal.value = true
}

function openLeaveModal(project: Project) {
  selectedProject.value = project
  showLeaveModal.value = true
}

async function updateProjectPlan(plan: ProjectPlan) {
  if (!selectedProject.value) return

  isUpdatingPlan.value = true
  try {
    await projectsStore.updateProject(selectedProject.value.id, { plan })
    showPlanModal.value = false
    selectedProject.value = null
  } finally {
    isUpdatingPlan.value = false
  }
}

async function leaveProject() {
  if (!selectedProject.value || !currentUserId.value) return

  isLeavingProject.value = true
  try {
    // Find the collaborator record for current user and remove it
    const collaborators = projectsStore.getProjectCollaborators(selectedProject.value.id)
    const myCollaboration = collaborators.find(c => c.userId === currentUserId.value)

    if (myCollaboration) {
      await projectsStore.removeCollaborator(myCollaboration.id)
    }

    // Refresh projects list
    await projectsStore.fetchProjects()

    showLeaveModal.value = false
    selectedProject.value = null
  } finally {
    isLeavingProject.value = false
  }
}

function goToProject(projectId: string) {
  router.push({ name: 'editor', params: { projectId } })
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl text-foreground">Account Settings</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage your profile, preferences, and projects.</p>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Profile Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 class="text-sm font-medium text-foreground">Profile</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <!-- Avatar -->
            <div class="flex items-center gap-4">
              <div class="relative">
                <div
                  v-if="settings.profile.avatar"
                  class="w-16 h-16 rounded-full bg-cover bg-center"
                  :style="{ backgroundImage: `url(${settings.profile.avatar})` }"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg"
                >
                  {{ getInitials(settings.profile.name || 'U') }}
                </div>
                <button class="absolute -bottom-1 -right-1 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <svg class="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">{{ settings.profile.name || 'No name set' }}</p>
                <p class="text-xs text-muted-foreground">{{ settings.profile.email }}</p>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Full Name</label>
              <input
                type="text"
                :value="settings.profile.name"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Your name"
                @input="userStore.updateProfile({ name: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                :value="settings.profile.email"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="you@example.com"
                @input="userStore.updateProfile({ email: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div class="pt-2">
              <button
                class="text-xs font-medium text-primary hover:underline"
                @click="showPasswordModal = true"
              >
                Change password
              </button>
            </div>
          </div>
        </div>

        <!-- Preferences Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 class="text-sm font-medium text-foreground">Preferences</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Theme</label>
              <div class="flex gap-2">
                <button
                  v-for="option in themeOptions"
                  :key="option.value"
                  class="flex-1 h-9 px-3 text-sm font-medium rounded-md border transition-colors"
                  :class="settings.preferences.theme === option.value
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'"
                  @click="userStore.updatePreferences({ theme: option.value as 'light' | 'dark' | 'system' })"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <p class="text-sm font-medium text-foreground">Email Notifications</p>
                <p class="text-xs text-muted-foreground">Receive updates about your projects</p>
              </div>
              <button
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
                :class="settings.preferences.emailNotifications ? 'bg-primary' : 'bg-input'"
                @click="userStore.updatePreferences({ emailNotifications: !settings.preferences.emailNotifications })"
              >
                <span
                  class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                  :class="settings.preferences.emailNotifications ? 'translate-x-4' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <p class="text-sm font-medium text-foreground">Marketing Emails</p>
                <p class="text-xs text-muted-foreground">Receive tips, news, and offers</p>
              </div>
              <button
                class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors"
                :class="settings.preferences.marketingEmails ? 'bg-primary' : 'bg-input'"
                @click="userStore.updatePreferences({ marketingEmails: !settings.preferences.marketingEmails })"
              >
                <span
                  class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                  :class="settings.preferences.marketingEmails ? 'translate-x-4' : 'translate-x-0.5'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Section - Full Width -->
      <div class="mt-6 bg-card border border-border rounded-lg">
        <div class="px-5 py-4 border-b border-border">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <h2 class="text-sm font-medium text-foreground">Your Projects</h2>
            </div>
            <span class="text-xs text-muted-foreground">{{ projects.length }} project{{ projects.length !== 1 ? 's' : '' }}</span>
          </div>
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="project in projects"
            :key="project.id"
            class="p-4 hover:bg-muted/30 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Project Icon -->
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                  {{ getProjectInitial(project.title) }}
                </div>

                <!-- Project Info -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <button
                      class="text-sm font-medium text-foreground hover:text-primary truncate"
                      @click="goToProject(project.id)"
                    >
                      {{ project.title }}
                    </button>
                    <span
                      class="px-1.5 py-0.5 text-[10px] font-medium rounded capitalize"
                      :class="getPlanBadgeClass(project.plan)"
                    >
                      {{ project.plan }}
                    </span>
                    <span
                      v-if="!isProjectOwner(project)"
                      class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    >
                      Collaborator
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full" :class="project.isPublished ? 'bg-green-500' : 'bg-muted-foreground'"></span>
                    <span class="text-xs text-muted-foreground">{{ project.isPublished ? 'Published' : 'Draft' }}</span>
                    <span class="text-xs text-muted-foreground">·</span>
                    <span class="text-xs text-muted-foreground">Updated {{ new Date(project.updatedAt).toLocaleDateString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <template v-if="isProjectOwner(project)">
                  <button
                    class="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
                    @click="openPlanModal(project)"
                  >
                    Change Plan
                  </button>
                </template>
                <template v-else>
                  <button
                    class="h-8 px-3 text-xs font-medium text-destructive hover:text-destructive-foreground border border-destructive/30 rounded-md hover:bg-destructive transition-colors"
                    @click="openLeaveModal(project)"
                  >
                    Leave Project
                  </button>
                </template>
                <button
                  class="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted transition-colors"
                  @click="goToProject(project.id)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="projects.length === 0" class="p-8 text-center">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">No projects yet</p>
            <p class="text-xs text-muted-foreground mt-1">Create your first project from the sidebar</p>
          </div>
        </div>
      </div>

      <!-- Danger Zone - Full Width -->
      <div class="mt-6 bg-card border border-destructive/30 rounded-lg">
        <div class="px-5 py-4 border-b border-destructive/30">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-sm font-medium text-destructive">Danger Zone</h2>
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-foreground">Delete Account</p>
              <p class="text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
            </div>
            <button
              class="h-8 px-3 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:bg-destructive/90 transition-colors"
              @click="showDeleteModal = true"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <Teleport to="body">
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showPasswordModal = false"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">Change Password</h2>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Current Password</label>
              <input
                type="password"
                class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Enter current password"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Enter new password"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="showPasswordModal = false"
            >
              Cancel
            </button>
            <button class="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showDeleteModal = false"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">Delete Account</h2>
          <p class="text-sm text-muted-foreground mb-4">
            This action cannot be undone. All your projects and data will be permanently deleted.
          </p>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-foreground">
                Type <span class="font-mono text-destructive">delete my account</span> to confirm
              </label>
              <input
                v-model="deleteConfirmText"
                type="text"
                class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="delete my account"
              />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="showDeleteModal = false; deleteConfirmText = ''"
            >
              Cancel
            </button>
            <button
              class="h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="deleteConfirmText !== 'delete my account'"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Change Plan Modal -->
    <Teleport to="body">
      <div
        v-if="showPlanModal && selectedProject"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showPlanModal = false; selectedProject = null"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl p-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">Change Plan</h2>
          <p class="text-sm text-muted-foreground mb-6">
            Select a plan for <span class="font-medium text-foreground">{{ selectedProject.title }}</span>
          </p>

          <div class="grid grid-cols-3 gap-4">
            <button
              v-for="plan in planOptions"
              :key="plan.value"
              class="relative p-4 rounded-lg border text-left transition-all"
              :class="selectedProject.plan === plan.value
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-muted-foreground/50'"
              :disabled="isUpdatingPlan"
              @click="updateProjectPlan(plan.value)"
            >
              <div v-if="selectedProject.plan === plan.value" class="absolute top-2 right-2">
                <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-sm font-semibold text-foreground">{{ plan.label }}</p>
              <p class="text-lg font-bold text-foreground mt-1">{{ plan.price }}</p>
              <ul class="mt-3 space-y-1.5">
                <li v-for="feature in plan.features" :key="feature" class="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg class="w-3 h-3 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
            </button>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              :disabled="isUpdatingPlan"
              @click="showPlanModal = false; selectedProject = null"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Leave Project Modal -->
    <Teleport to="body">
      <div
        v-if="showLeaveModal && selectedProject"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="showLeaveModal = false; selectedProject = null"></div>
        <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 class="text-lg font-semibold text-foreground mb-2">Leave Project</h2>
          <p class="text-sm text-muted-foreground mb-4">
            Are you sure you want to leave <span class="font-medium text-foreground">{{ selectedProject.title }}</span>? You will lose access to this project and will need to be invited again to rejoin.
          </p>
          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              :disabled="isLeavingProject"
              @click="showLeaveModal = false; selectedProject = null"
            >
              Cancel
            </button>
            <button
              class="h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
              :disabled="isLeavingProject"
              @click="leaveProject"
            >
              {{ isLeavingProject ? 'Leaving...' : 'Leave Project' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
