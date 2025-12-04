<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useProjectsStore } from '@/stores/projects'
import type { ProjectPlan } from '@/types/project'
import CollaboratorsSection from '@/components/settings/CollaboratorsSection.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import ProjectUnpublish from '@/components/modal/ProjectUnpublish.vue'

const route = useRoute()
const projectStore = useProjectStore()
const projectsStore = useProjectsStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => route.params.projectId as string)

const showDeleteModal = ref(false)
const showUnpublishModal = ref(false)
const isPublishing = ref(false)
const isSettingUpAnalytics = ref(false)
const passwordChanged = ref(false)
const savedPassword = ref('')
const domainChanged = ref(false)
const savedDomain = ref({ subdomain: '', customDomain: '' })

// Load project settings when projectId changes
watch(
  projectId,
  async (newProjectId) => {
    if (newProjectId) {
      await projectStore.loadProject(newProjectId)
      // Store the initial values
      savedPassword.value = projectStore.settings.publish.password || ''
      savedDomain.value = {
        subdomain: projectStore.settings.domain.subdomain || '',
        customDomain: projectStore.settings.domain.customDomain || ''
      }
      passwordChanged.value = false
      domainChanged.value = false
    }
  },
  { immediate: true }
)

const plans: { id: ProjectPlan; name: string; price: string; features: string[] }[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['1 project', 'Lands subdomain', 'Basic analytics', 'Community support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12/mo',
    features: ['Unlimited projects', 'Custom domain', 'Advanced analytics', 'Priority support', 'Remove branding'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$29/mo',
    features: ['Everything in Pro', 'Team collaboration', 'Custom code injection', 'API access', 'Dedicated support'],
  },
]

async function handlePublishToggle() {
  if (isPublishing.value) return

  if (settings.value.publish.isPublished) {
    // Show confirmation modal for unpublishing
    showUnpublishModal.value = true
  } else {
    // Publish directly
    await doPublish()
  }
}

async function doPublish() {
  isPublishing.value = true

  try {
    // Ensure content is loaded
    if (!projectsStore.getProjectContent(projectId.value)) {
      await projectsStore.fetchProjectContent(projectId.value)
    }
    await projectsStore.publishProject(projectId.value)
    projectStore.updatePublish({ isPublished: true, publishedAt: new Date().toISOString() })

    // Reset changed flags and update saved values
    savedPassword.value = settings.value.publish.password || ''
    savedDomain.value = {
      subdomain: settings.value.domain.subdomain || '',
      customDomain: settings.value.domain.customDomain || ''
    }
    passwordChanged.value = false
    domainChanged.value = false
  } finally {
    isPublishing.value = false
  }
}

function handlePasswordInput(value: string) {
  projectStore.updatePublish({ password: value })
  passwordChanged.value = value !== savedPassword.value
}

function handleSubdomainInput(value: string) {
  projectStore.updateDomain({ subdomain: value })
  checkDomainChanged()
}

function handleCustomDomainInput(value: string) {
  projectStore.updateDomain({ customDomain: value })
  checkDomainChanged()
}

function checkDomainChanged() {
  const currentSubdomain = settings.value.domain.subdomain || ''
  const currentCustomDomain = settings.value.domain.customDomain || ''
  domainChanged.value =
    currentSubdomain !== savedDomain.value.subdomain ||
    currentCustomDomain !== savedDomain.value.customDomain
}

async function handleUnpublishConfirm() {
  isPublishing.value = true

  try {
    await projectsStore.unpublishProject(projectId.value)
    projectStore.updatePublish({ isPublished: false })
    showUnpublishModal.value = false
  } finally {
    isPublishing.value = false
  }
}

async function handlePasswordProtectionToggle() {
  if (isPublishing.value) return

  const isCurrentlyProtected = settings.value.publish.visibility === 'password'

  if (isCurrentlyProtected) {
    // Removing password protection - update local state and republish if published
    projectStore.updatePublish({ visibility: 'public', password: '' })

    if (settings.value.publish.isPublished) {
      await doPublish()
    }
  } else {
    // Enabling password protection - just update local state (user will need to enter password and click Update)
    projectStore.updatePublish({ visibility: 'password' })
  }
}

async function handleAnalyticsToggle() {
  if (isSettingUpAnalytics.value) return

  const isCurrentlyEnabled = settings.value.analytics.umamiEnabled

  isSettingUpAnalytics.value = true

  try {
    if (isCurrentlyEnabled) {
      // Disable analytics
      await projectStore.disableUmamiAnalytics()
    } else {
      // Enable analytics - this creates the Umami site
      await projectStore.setupUmamiAnalytics()
    }

    // Republish if already published to include/remove analytics script
    if (settings.value.publish.isPublished) {
      await doPublish()
    }
  } finally {
    isSettingUpAnalytics.value = false
  }
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl text-foreground">Project Settings</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage your project configuration and publishing options.</p>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- General Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 class="text-sm text-foreground">General</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Project Title</label>
              <input
                type="text"
                :value="settings.title"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="My Project"
                @input="projectStore.updateTitle(($event.target as HTMLInputElement).value)"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Project Slug</label>
              <div class="flex">
                <span class="inline-flex items-center px-3 h-9 bg-muted border border-r-0 border-border rounded-l-md text-xs text-muted-foreground">
                  lands.app/
                </span>
                <input
                  type="text"
                  :value="settings.slug"
                  class="flex-1 h-9 px-3 bg-background border border-border rounded-r-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="my-project"
                  @input="projectStore.updateSlug(($event.target as HTMLInputElement).value)"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                :value="settings.description"
                rows="2"
                class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none"
                placeholder="A brief description..."
                @input="projectStore.updateSettings({ description: ($event.target as HTMLTextAreaElement).value })"
              />
            </div>
          </div>
        </div>

        <!-- Publishing Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 class="text-sm text-foreground">Publishing</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <p class="text-sm font-medium text-foreground">Publish Status</p>
                <p class="text-xs text-muted-foreground">
                  {{ isPublishing ? (settings.publish.isPublished ? 'Unpublishing...' : 'Publishing...') : 'Make your project live' }}
                </p>
              </div>
              <button
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
                :class="[
                  settings.publish.isPublished ? 'bg-primary' : 'bg-input',
                  isPublishing ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                ]"
                :disabled="isPublishing"
                @click="handlePublishToggle"
              >
                <span
                  class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                  :class="settings.publish.isPublished ? 'translate-x-4' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <p class="text-sm font-medium text-foreground">Password Protection</p>
                <p class="text-xs text-muted-foreground">Require a password to view your site</p>
              </div>
              <button
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
                :class="[
                  settings.publish.visibility === 'password' ? 'bg-primary' : 'bg-input',
                  isPublishing ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                ]"
                :disabled="isPublishing"
                @click="handlePasswordProtectionToggle"
              >
                <span
                  class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                  :class="settings.publish.visibility === 'password' ? 'translate-x-4' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <div v-if="settings.publish.visibility === 'password'" class="space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-muted-foreground">Password</label>
                <input
                  type="text"
                  :value="settings.publish.password"
                  class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="Enter password"
                  @input="handlePasswordInput(($event.target as HTMLInputElement).value)"
                />
              </div>

              <div v-if="passwordChanged && settings.publish.isPublished" class="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <div class="flex items-center gap-6">
                  <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-xs text-amber-600">Update your site to apply password protection</p>
                </div>
                <button
                  class="h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  :disabled="isPublishing"
                  @click="doPublish"
                >
                  <svg v-if="isPublishing" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isPublishing ? 'Updating...' : 'Update' }}
                </button>
              </div>
            </div>

            <div v-if="settings.publish.publishedAt" class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last published: {{ new Date(settings.publish.publishedAt).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- Domain Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <h2 class="text-sm text-foreground">Domain</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Subdomain</label>
              <div class="flex">
                <input
                  type="text"
                  :value="settings.domain.subdomain"
                  class="flex-1 h-9 px-3 bg-background border border-r-0 border-border rounded-l-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="mysite"
                  @input="handleSubdomainInput(($event.target as HTMLInputElement).value)"
                />
                <span class="inline-flex items-center px-3 h-9 bg-muted border border-border rounded-r-md text-xs text-muted-foreground">
                  .lands.app
                </span>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-medium text-muted-foreground">Custom Domain</label>
                <span v-if="settings.plan === 'free'" class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Pro</span>
              </div>
              <input
                type="text"
                :value="settings.domain.customDomain"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="www.example.com"
                :disabled="settings.plan === 'free'"
                @input="handleCustomDomainInput(($event.target as HTMLInputElement).value)"
              />
            </div>

            <div v-if="settings.domain.customDomain && settings.plan !== 'free'" class="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <span
                class="flex items-center gap-1.5 text-xs font-medium"
                :class="settings.domain.customDomainVerified ? 'text-green-600' : 'text-yellow-600'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="settings.domain.customDomainVerified ? 'bg-green-600' : 'bg-yellow-600'" />
                {{ settings.domain.customDomainVerified ? 'Verified' : 'Pending' }}
              </span>
              <button
                v-if="!settings.domain.customDomainVerified"
                class="ml-auto text-xs font-medium text-primary hover:underline"
              >
                Verify
              </button>
            </div>

            <!-- Update alert for domain changes -->
            <div v-if="domainChanged && settings.publish.isPublished" class="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <div class="flex items-center gap-6">
                <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-amber-600">Update your site to apply domain changes</p>
              </div>
              <button
                class="h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                :disabled="isPublishing"
                @click="doPublish"
              >
                <svg v-if="isPublishing" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isPublishing ? 'Updating...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>

        <!-- SEO Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 class="text-sm text-foreground">SEO</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Meta Title</label>
              <input
                type="text"
                :value="settings.seo.metaTitle"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="Page title for search engines"
                @input="projectStore.updateSEO({ metaTitle: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Meta Description</label>
              <textarea
                :value="settings.seo.metaDescription"
                rows="2"
                class="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background resize-none"
                placeholder="Brief description for search results..."
                @input="projectStore.updateSEO({ metaDescription: ($event.target as HTMLTextAreaElement).value })"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-medium text-muted-foreground">Keywords</label>
              <input
                type="text"
                :value="settings.seo.keywords"
                class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                placeholder="keyword1, keyword2, keyword3"
                @input="projectStore.updateSEO({ keywords: ($event.target as HTMLInputElement).value })"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-muted-foreground">OG Image</label>
                <input
                  type="text"
                  :value="settings.seo.ogImage"
                  class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="https://..."
                  @input="projectStore.updateSEO({ ogImage: ($event.target as HTMLInputElement).value })"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-muted-foreground">Favicon</label>
                <input
                  type="text"
                  :value="settings.seo.favicon"
                  class="w-full h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  placeholder="https://..."
                  @input="projectStore.updateSEO({ favicon: ($event.target as HTMLInputElement).value })"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 class="text-sm text-foreground">Analytics</h2>
            </div>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <div class="flex items-center gap-6">
                  <p class="text-sm font-medium text-foreground">Site Analytics</p>
                  <span v-if="settings.plan === 'free'" class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Pro</span>
                </div>
                <p class="text-xs text-muted-foreground">
                  {{ settings.plan === 'free' ? 'Upgrade to Pro to enable analytics' : 'Track visitors, page views, and more' }}
                </p>
              </div>
              <button
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
                :class="[
                  settings.analytics.umamiEnabled ? 'bg-primary' : 'bg-input',
                  (isSettingUpAnalytics || settings.plan === 'free') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                ]"
                :disabled="isSettingUpAnalytics || settings.plan === 'free'"
                @click="handleAnalyticsToggle"
              >
                <span
                  class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
                  :class="settings.analytics.umamiEnabled ? 'translate-x-4' : 'translate-x-0.5'"
                />
              </button>
            </div>

            <div v-if="isSettingUpAnalytics" class="flex items-center gap-2 text-xs text-muted-foreground">
              <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ settings.analytics.umamiEnabled ? 'Disabling analytics...' : 'Setting up analytics...' }}
            </div>

            <div v-if="settings.analytics.umamiEnabled && settings.analytics.umamiSiteId" class="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <div class="flex items-center gap-6">
                <svg class="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-xs text-green-600">Analytics is active and tracking visitors</p>
              </div>
            </div>

            <p v-if="settings.plan !== 'free'" class="text-xs text-muted-foreground">
              Privacy-focused analytics powered by Umami. No cookies, GDPR compliant.
            </p>
          </div>
        </div>

        <!-- Collaborators Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 class="text-sm text-foreground">Collaborators</h2>
            </div>
          </div>
          <div class="p-5">
            <CollaboratorsSection :project-id="projectId" />
          </div>
        </div>

        <!-- Plan Card -->
        <div class="bg-card border border-border rounded-lg">
          <div class="px-5 py-4 border-b border-border">
            <div class="flex items-center gap-6">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 class="text-sm text-foreground">Plan</h2>
            </div>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="plan in plans"
                :key="plan.id"
                class="flex flex-col p-3 rounded-lg border-2 transition-all text-left"
                :class="settings.plan === plan.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/25'"
                @click="projectStore.updatePlan(plan.id)"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-foreground">{{ plan.name }}</span>
                  <span
                    v-if="settings.plan === plan.id"
                    class="w-2 h-2 rounded-full bg-primary"
                  />
                </div>
                <span class="text-lg font-semibold text-foreground mb-2">{{ plan.price }}</span>
                <ul class="space-y-1">
                  <li
                    v-for="feature in plan.features.slice(0, 3)"
                    :key="feature"
                    class="flex items-center gap-1 text-[10px] text-muted-foreground"
                  >
                    <svg class="w-2.5 h-2.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ feature }}
                  </li>
                </ul>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone - Full Width -->
      <div class="mt-6 bg-card border border-destructive/30 rounded-lg">
        <div class="px-5 py-4 border-b border-destructive/30">
          <div class="flex items-center gap-6">
            <svg class="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 class="text-sm font-medium text-destructive">Danger Zone</h2>
          </div>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-foreground">Delete Project</p>
              <p class="text-xs text-muted-foreground">Permanently delete this project and all its data.</p>
            </div>
            <button
              class="h-8 px-3 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:bg-destructive/90 transition-colors"
              @click="showDeleteModal = true"
            >
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Project Modal -->
    <ProjectDelete
      v-model:open="showDeleteModal"
      :project-id="projectId"
      :project-title="settings.title"
    />

    <!-- Unpublish Project Modal -->
    <ProjectUnpublish
      v-model:open="showUnpublishModal"
      :project-title="settings.title"
      @confirm="handleUnpublishConfirm"
    />
  </div>
</template>
