<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Modal, Button, Icon } from '@/components/ui'

const props = defineProps<{
  open: boolean
  projectId: string
  projectSlug: string
  customDomain?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const router = useRouter()

const siteUrl = computed(() => {
  if (props.customDomain) {
    return props.customDomain
  }
  return `${props.projectSlug}.lands.app`
})

const fullUrl = computed(() => {
  return `https://${siteUrl.value}`
})

function close() {
  emit('update:open', false)
}

function visitSite() {
  window.open(fullUrl.value, '_blank')
}

function copyUrl() {
  navigator.clipboard.writeText(fullUrl.value)
}

function shareTwitter() {
  const text = encodeURIComponent(`Check out my new site!`)
  const url = encodeURIComponent(fullUrl.value)
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
}

function shareFacebook() {
  const url = encodeURIComponent(fullUrl.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

function shareLinkedIn() {
  const url = encodeURIComponent(fullUrl.value)
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
}

function goToAnalytics() {
  close()
  router.push({ name: 'analytics', params: { projectId: props.projectId } })
}

function goToIntegrations() {
  close()
  router.push({ name: 'integration', params: { projectId: props.projectId } })
}

function goToSettings() {
  close()
  router.push({ name: 'settings', params: { projectId: props.projectId } })
}
</script>

<template>
  <Modal :open="open" size="md" @update:open="emit('update:open', $event)">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <Icon name="checkmark-circle" class="text-lg text-green-500" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Project Published!</h2>
          <p class="text-sm text-muted-foreground">Your site is now live</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Site URL -->
      <div class="p-4 bg-secondary/50 rounded-lg">
        <p class="text-xs text-muted-foreground mb-2">Your project is live at:</p>
        <div class="flex items-center gap-2">
          <a
            :href="fullUrl"
            target="_blank"
            class="text-base font-semibold text-foreground hover:text-primary transition-colors"
          >
            {{ siteUrl }}
          </a>
          <button
            type="button"
            class="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy URL"
            @click="copyUrl"
          >
            <Icon name="files-1" class="text-sm" />
          </button>
          <button
            type="button"
            class="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Visit site"
            @click="visitSite"
          >
            <Icon name="link-external" class="text-sm" />
          </button>
        </div>

        <!-- Custom domain prompt -->
        <div v-if="!customDomain" class="mt-3 pt-3 border-t border-border">
          <button
            type="button"
            class="text-xs text-primary hover:underline"
            @click="goToSettings"
          >
            Want to use a custom domain? Add one in settings
          </button>
        </div>
      </div>

      <!-- Share section -->
      <div>
        <p class="text-xs text-muted-foreground mb-3">Share your project</p>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="shareTwitter">
            <Icon name="twitter-x" class="text-sm" />
            Twitter
          </Button>
          <Button variant="outline" size="sm" @click="shareFacebook">
            <Icon name="facebook" class="text-sm" />
            Facebook
          </Button>
          <Button variant="outline" size="sm" @click="shareLinkedIn">
            <Icon name="linkedin" class="text-sm" />
            LinkedIn
          </Button>
        </div>
      </div>

      <!-- Quick links -->
      <div class="flex items-center gap-2 pt-2 border-t border-border">
        <Button variant="ghost" size="sm" @click="goToAnalytics">
          <Icon name="app-analytics" class="text-xs" />
          Analytics
        </Button>
        <Button variant="ghost" size="sm" @click="goToIntegrations">
          <Icon name="app-integration" class="text-xs" />
          Integrations
        </Button>
        <Button variant="ghost" size="sm" @click="goToSettings">
          <Icon name="app-settings" class="text-xs" />
          Settings
        </Button>
      </div>
    </div>

    <template #footer>
      <Button @click="close">
        Close
      </Button>
    </template>
  </Modal>
</template>
