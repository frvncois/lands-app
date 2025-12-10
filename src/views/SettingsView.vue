<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { useProjectsStore } from '@/stores/projects'
import { PLAN_DEFINITIONS, planHasFeature, type ProjectPlan } from '@/types/project'
import CollaboratorsSection from '@/components/settings/CollaboratorsSection.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'
import ProjectUnpublish from '@/components/modal/ProjectUnpublish.vue'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import InviteCollaborator from '@/components/modal/InviteCollaborator.vue'
import { Card, Button, Input, Textarea, FormField, Toggle, ToggleItem, Badge, Alert, Spinner, Header } from '@/components/ui'

// Upload modal state
const showOgImageUpload = ref(false)
const showFaviconUpload = ref(false)

function handleOgImageUploaded(url: string) {
  projectStore.updateSEO({ ogImage: url })
}

function handleFaviconUploaded(url: string) {
  projectStore.updateSEO({ favicon: url })
}

function removeOgImage() {
  projectStore.updateSEO({ ogImage: '' })
}

function removeFavicon() {
  projectStore.updateSEO({ favicon: '' })
}

const route = useRoute()
const projectStore = useProjectStore()
const projectsStore = useProjectsStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => route.params.projectId as string)

const showDeleteModal = ref(false)
const showUnpublishModal = ref(false)
const showUpgradeModal = ref(false)
const showInviteModal = ref(false)
const isPublishing = ref(false)
const isSettingUpAnalytics = ref(false)
const passwordChanged = ref(false)
const savedPassword = ref('')
const domainChanged = ref(false)
const savedDomain = ref({ subdomain: '', customDomain: '' })

// Plan helpers
const currentPlan = computed(() => PLAN_DEFINITIONS[settings.value.plan])
const canUseCustomDomain = computed(() => planHasFeature(settings.value.plan, 'customDomain'))
const canUseAnalytics = computed(() => planHasFeature(settings.value.plan, 'analytics'))
const canUseCollaborators = computed(() => planHasFeature(settings.value.plan, 'collaborators'))

// Load project settings when projectId changes
watch(
  projectId,
  async (newProjectId) => {
    if (newProjectId) {
      await projectStore.loadProject(newProjectId)
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


async function handlePublishToggle() {
  if (isPublishing.value) return

  if (settings.value.publish.isPublished) {
    showUnpublishModal.value = true
  } else {
    await doPublish()
  }
}

async function doPublish() {
  isPublishing.value = true

  try {
    if (!projectsStore.getProjectContent(projectId.value)) {
      await projectsStore.fetchProjectContent(projectId.value)
    }
    await projectsStore.publishProject(projectId.value)
    projectStore.updatePublish({ isPublished: true, publishedAt: new Date().toISOString() })

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
    projectStore.updatePublish({ visibility: 'public', password: '' })

    if (settings.value.publish.isPublished) {
      await doPublish()
    }
  } else {
    projectStore.updatePublish({ visibility: 'password' })
  }
}

async function handleAnalyticsToggle() {
  if (isSettingUpAnalytics.value) return

  const isCurrentlyEnabled = settings.value.analytics.umamiEnabled

  isSettingUpAnalytics.value = true

  try {
    if (isCurrentlyEnabled) {
      await projectStore.disableUmamiAnalytics()
    } else {
      await projectStore.setupUmamiAnalytics()
    }

    if (settings.value.publish.isPublished) {
      await doPublish()
    }
  } finally {
    isSettingUpAnalytics.value = false
  }
}

async function handleSaveSettings() {
  await projectStore.saveToDatabase()
}
</script>

<template>
  <div class="flex-1 h-full overflow-y-auto bg-background">
    <div class="max-w-6xl mx-auto p-8">
      <Header
        title="Project Settings"
        description="Manage your project configuration and publishing options."
      >
        <template #actions>
          <Button
            :disabled="!projectStore.hasUnsavedChanges"
            :loading="projectStore.isSaving"
            @click="handleSaveSettings"
          >
            Save
          </Button>
        </template>
      </Header>

      <!-- Masonry Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Left Column: General, Domain, SEO, Analytics, Collaborators -->
        <div class="space-y-8">
          <!-- General Card -->
          <Card>
            <Card.Header title="General" icon="lni-gear-1" />
            <Card.Content class="space-y-4">
              <FormField label="Project Title">
                <Input
                  :model-value="settings.title"
                  placeholder="My Project"
                  @update:model-value="projectStore.updateTitle($event as string)"
                />
              </FormField>

              <FormField label="Project Slug">
                <Input
                  :model-value="settings.slug"
                  placeholder="my-project"
                  prefix="lands.app/"
                  @update:model-value="projectStore.updateSlug($event as string)"
                />
              </FormField>

              <FormField label="Description">
                <Textarea
                  :model-value="settings.description"
                  placeholder="A brief description..."
                  :rows="2"
                  @update:model-value="projectStore.updateSettings({ description: $event })"
                />
              </FormField>
            </Card.Content>
          </Card>

          <!-- Domain Card -->
          <Card>
            <Card.Header title="Domain" icon="lni-globe-1" />
            <Card.Content class="space-y-4">
              <FormField label="Subdomain">
                <Input
                  :model-value="settings.domain.subdomain"
                  placeholder="mysite"
                  suffix=".lands.app"
                  @update:model-value="handleSubdomainInput($event as string)"
                />
              </FormField>

              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-medium text-muted-foreground">Custom Domain</label>
                  <Badge v-if="!canUseCustomDomain" variant="secondary" size="xs">Pro</Badge>
                </div>
                <Input
                  :model-value="settings.domain.customDomain"
                  placeholder="www.example.com"
                  :disabled="!canUseCustomDomain"
                  @update:model-value="handleCustomDomainInput($event as string)"
                />
                <button
                  v-if="!canUseCustomDomain"
                  class="text-xs text-primary hover:underline"
                  @click="showUpgradeModal = true"
                >
                  Upgrade to Pro to use custom domains
                </button>
              </div>

              <div v-if="settings.domain.customDomain && canUseCustomDomain" class="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <Badge :variant="settings.domain.customDomainVerified ? 'success' : 'warning'" size="sm">
                  {{ settings.domain.customDomainVerified ? 'Verified' : 'Pending' }}
                </Badge>
                <Button
                  v-if="!settings.domain.customDomainVerified"
                  variant="link"
                  size="xs"
                  class="ml-auto"
                >
                  Verify
                </Button>
              </div>

              <Alert v-if="domainChanged && settings.publish.isPublished" variant="warning">
                <div class="flex items-center justify-between">
                  <span>Update your site to apply domain changes</span>
                  <Button size="xs" :loading="isPublishing" @click="doPublish">
                    {{ isPublishing ? 'Updating...' : 'Update' }}
                  </Button>
                </div>
              </Alert>
            </Card.Content>
          </Card>

          <!-- Analytics Card -->
          <Card>
            <Card.Header title="Analytics" icon="lni-bar-chart-4" />
            <Card.Content class="space-y-4">
              <ToggleItem
                :model-value="settings.analytics.umamiEnabled || false"
                :disabled="isSettingUpAnalytics || !canUseAnalytics"
                @update:model-value="handleAnalyticsToggle"
              >
                <template #label>
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-foreground">Site Analytics</p>
                    <Badge v-if="!canUseAnalytics" variant="secondary" size="xs">Pro</Badge>
                  </div>
                </template>
                <template #description>
                  <p class="text-xs text-muted-foreground">
                    {{ !canUseAnalytics ? 'Upgrade to Pro to enable analytics' : 'Track visitors, page views, and more' }}
                  </p>
                </template>
              </ToggleItem>

              <button
                v-if="!canUseAnalytics"
                class="text-xs text-primary hover:underline"
                @click="showUpgradeModal = true"
              >
                Upgrade to Pro to enable analytics
              </button>

              <div v-if="isSettingUpAnalytics" class="flex items-center gap-2 text-xs text-muted-foreground">
                <Spinner size="xs" />
                {{ settings.analytics.umamiEnabled ? 'Disabling analytics...' : 'Setting up analytics...' }}
              </div>

              <Alert v-if="settings.analytics.umamiEnabled && settings.analytics.umamiSiteId" variant="success">
                Analytics is active and tracking visitors
              </Alert>

              <p v-if="canUseAnalytics" class="text-xs text-muted-foreground">
                Privacy-focused analytics powered by Umami. No cookies, GDPR compliant.
              </p>
            </Card.Content>
          </Card>

          <!-- Collaborators Card -->
          <Card>
            <Card.Header title="Collaborators" icon="lni-user-multiple-4">
              <template #action>
                <div class="flex items-center gap-2">
                  <Badge v-if="!canUseCollaborators" variant="secondary" size="xs">Pro</Badge>
                  <Button
                    v-if="canUseCollaborators"
                    variant="outline"
                    size="sm"
                    @click="showInviteModal = true"
                  >
                    Invite
                  </Button>
                </div>
              </template>
            </Card.Header>
            <Card.Content v-if="canUseCollaborators" :padded="false">
              <CollaboratorsSection :project-id="projectId" />
            </Card.Content>
            <Card.Content v-else class="space-y-3">
              <p class="text-xs text-muted-foreground">
                Invite team members to collaborate on this project. Share editing access with colleagues and clients.
              </p>
              <button
                class="text-xs text-primary hover:underline"
                @click="showUpgradeModal = true"
              >
                Upgrade to Pro to invite collaborators
              </button>
            </Card.Content>
          </Card>
        </div>

        <!-- Right Column: SEO, Publishing, Plan, Danger Zone -->
        <div class="space-y-8">
          <!-- SEO Card -->
          <Card>
            <Card.Header title="SEO" icon="app-seo" />
            <Card.Content class="space-y-4">
              <FormField label="Meta Title">
                <Input
                  :model-value="settings.seo.metaTitle"
                  placeholder="Page title for search engines"
                  @update:model-value="projectStore.updateSEO({ metaTitle: $event as string })"
                />
              </FormField>

              <FormField label="Meta Description">
                <Textarea
                  :model-value="settings.seo.metaDescription"
                  placeholder="Brief description for search results..."
                  :rows="2"
                  @update:model-value="projectStore.updateSEO({ metaDescription: $event })"
                />
              </FormField>

              <FormField label="Keywords">
                <Input
                  :model-value="settings.seo.keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  @update:model-value="projectStore.updateSEO({ keywords: $event as string })"
                />
              </FormField>

              <div class="grid grid-cols-2 gap-3">
                <FormField label="OG Image">
                  <div class="space-y-2">
                    <!-- Image preview -->
                    <div
                      v-if="settings.seo.ogImage"
                      class="relative group rounded-md overflow-hidden border border-border"
                    >
                      <img
                        :src="settings.seo.ogImage"
                        alt="OG Image"
                        class="w-full h-20 object-cover"
                      />
                      <!-- Overlay actions -->
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          class="w-7 h-7 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                          title="Replace image"
                          @click="showOgImageUpload = true"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="w-7 h-7 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors"
                          title="Remove image"
                          @click="removeOgImage"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- Upload button (when no image) -->
                    <button
                      v-else
                      type="button"
                      class="w-full h-20 border border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                      @click="showOgImageUpload = true"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-xs">Upload OG Image</span>
                    </button>
                  </div>
                </FormField>
                <FormField label="Favicon">
                  <div class="space-y-2">
                    <!-- Image preview -->
                    <div
                      v-if="settings.seo.favicon"
                      class="relative group rounded-md overflow-hidden border border-border"
                    >
                      <div class="w-full h-20 flex items-center justify-center bg-muted/50">
                        <img
                          :src="settings.seo.favicon"
                          alt="Favicon"
                          class="w-10 h-10 object-contain"
                        />
                      </div>
                      <!-- Overlay actions -->
                      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          class="w-7 h-7 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                          title="Replace favicon"
                          @click="showFaviconUpload = true"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          class="w-7 h-7 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors"
                          title="Remove favicon"
                          @click="removeFavicon"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- Upload button (when no image) -->
                    <button
                      v-else
                      type="button"
                      class="w-full h-20 border border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                      @click="showFaviconUpload = true"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-xs">Upload Favicon</span>
                    </button>
                  </div>
                </FormField>
              </div>
            </Card.Content>
          </Card>

          <!-- Publishing Card -->
          <Card>
            <Card.Header title="Publishing" icon="lni-globe-1" />
            <Card.Content class="space-y-4">
              <ToggleItem
                :model-value="settings.publish.isPublished"
                label="Publish Status"
                :description="isPublishing ? (settings.publish.isPublished ? 'Unpublishing...' : 'Publishing...') : 'Make your project live'"
                :disabled="isPublishing"
                @update:model-value="handlePublishToggle"
              />

              <ToggleItem
                :model-value="settings.publish.visibility === 'password'"
                label="Password Protection"
                description="Require a password to view your site"
                :disabled="isPublishing"
                @update:model-value="handlePasswordProtectionToggle"
              />

              <div v-if="settings.publish.visibility === 'password'" class="space-y-3">
                <FormField label="Password">
                  <Input
                    :model-value="settings.publish.password"
                    placeholder="Enter password"
                    @update:model-value="handlePasswordInput($event as string)"
                  />
                </FormField>

                <Alert v-if="passwordChanged && settings.publish.isPublished" variant="warning">
                  <div class="flex items-center justify-between">
                    <span>Update your site to apply password protection</span>
                    <Button size="xs" :loading="isPublishing" @click="doPublish">
                      {{ isPublishing ? 'Updating...' : 'Update' }}
                    </Button>
                  </div>
                </Alert>
              </div>

              <div v-if="settings.publish.publishedAt" class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon name="calendar-days" class="text-xs" />
                Last published: {{ new Date(settings.publish.publishedAt).toLocaleDateString() }}
              </div>
            </Card.Content>
          </Card>

          <!-- Plan Card -->
          <Card>
            <Card.Header title="Plan" icon="lni-credit-card-multiple" />
            <Card.Content class="space-y-4">
              <!-- Current Plan Display -->
              <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-foreground">{{ currentPlan.name }}</span>
                    <Badge v-if="settings.plan === 'pro'" variant="success" size="xs">Active</Badge>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ currentPlan.description }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-foreground">
                    {{ currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}` }}
                  </p>
                  <p v-if="currentPlan.price > 0" class="text-xs text-muted-foreground">/month</p>
                </div>
              </div>

              <!-- Plan Features -->
              <div class="space-y-2">
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan includes</p>
                <div class="grid grid-cols-1 gap-2">
                  <!-- Lands Subdomain - always included -->
                  <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
                    <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Lands subdomain (yoursite.lands.app)
                  </div>

                  <!-- Custom Domain -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'customDomain') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'customDomain') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'customDomain') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Custom domain support
                  </div>

                  <!-- No Watermark -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'noWatermark') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'noWatermark') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'noWatermark') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    No Lands watermark
                  </div>

                  <!-- Analytics -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'analytics') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'analytics') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'analytics') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Full analytics dashboard
                  </div>

                  <!-- Integrations -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'integrations') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'integrations') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'integrations') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    All integrations (email, payments, etc.)
                  </div>

                  <!-- Collaborators -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'collaborators') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'collaborators') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'collaborators') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Team collaboration
                  </div>

                  <!-- Custom Fonts -->
                  <div
                    class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
                    :class="planHasFeature(settings.plan, 'customFonts') ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
                  >
                    <div
                      class="rounded-full p-1"
                      :class="planHasFeature(settings.plan, 'customFonts') ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
                    >
                      <svg class="w-4 h-4" :class="planHasFeature(settings.plan, 'customFonts') ? 'text-green-500' : 'text-muted-foreground'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Custom Google Fonts
                  </div>
                </div>
              </div>

              <!-- Upgrade Button (only for free plan) -->
              <div v-if="settings.plan === 'free'" class="pt-2">
                <Button class="w-full" @click="showUpgradeModal = true">
                  Upgrade to Pro - $6/month
                </Button>
              </div>

              <!-- Manage Subscription (for pro plan) -->
              <div v-else class="pt-2">
                <Button variant="outline" class="w-full">
                  Manage Subscription
                </Button>
              </div>
            </Card.Content>
          </Card>

          <!-- Danger Zone Card -->
          <Card variant="destructive">
            <Card.Header :border-bottom="false">
              <template #icon>
                <Icon name="xmark-circle" class="text-sm" />
              </template>
              <h2 class="text-xs font-medium text-destructive">Danger Zone</h2>
              <template #action>
                <Button variant="destructive" size="sm" @click="showDeleteModal = true">
                  Delete Project
                </Button>
              </template>
            </Card.Header>
          </Card>
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

    <!-- Plan Upgrade Modal -->
    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />

    <!-- OG Image Upload Modal -->
    <ProjectUpload
      v-model:open="showOgImageUpload"
      :project-id="projectId"
      @uploaded="handleOgImageUploaded"
    />

    <!-- Favicon Upload Modal -->
    <ProjectUpload
      v-model:open="showFaviconUpload"
      :project-id="projectId"
      @uploaded="handleFaviconUploaded"
    />

    <!-- Invite Collaborator Modal -->
    <InviteCollaborator
      v-model:open="showInviteModal"
      :project-id="projectId"
    />
  </div>
</template>
