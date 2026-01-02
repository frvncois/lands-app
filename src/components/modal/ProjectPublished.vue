<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import { Icon, Button, Badge } from '@/components/ui'

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
const projectStore = useProjectStore()

const siteUrl = computed(() => {
  if (props.customDomain) {
    return props.customDomain
  }
  return `${props.projectSlug}.lands.app`
})

const fullUrl = computed(() => {
  return `https://${siteUrl.value}`
})

const isPro = computed(() => projectStore.settings?.plan === 'pro')

function close() {
  emit('update:open', false)
}

function visitSite() {
  window.open(fullUrl.value, '_blank')
  close()
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

function upgradeToProForDomain() {
  close()
  router.push({ name: 'settings', params: { projectId: props.projectId } })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        @click="close"
      />

      <!-- Modal -->
      <div
        class="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10"
          @click="close"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Content -->
        <div class="p-8 space-y-6">
          <!-- Glowing Icon -->
          <div class="flex justify-center">
            <div class="relative">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-green-500/30 blur-2xl rounded-full animate-pulse" />
              <!-- Icon container -->
              <div class="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/50 animate-bounce-subtle">
                <Icon name="app-publish" class="text-3xl text-white" />
              </div>
            </div>
          </div>

          <!-- Success message -->
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold text-foreground animate-fadeInUp">
              Project Published Successfully!
            </h2>
            <p class="text-sm text-muted-foreground animate-fadeInUp animation-delay-100">
              Your site is now live and ready to share with the world
            </p>
          </div>

          <!-- Site URL -->
          <div class="p-4 bg-muted/50 border border-border rounded-xl space-y-3 animate-fadeInUp animation-delay-200">
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your live site</p>
            <div class="flex items-center gap-2 flex-wrap">
              <a
                :href="fullUrl"
                target="_blank"
                class="text-lg font-semibold text-foreground hover:text-primary transition-colors flex-1 min-w-0 truncate"
              >
                {{ siteUrl }}
              </a>
              <div class="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  class="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
                  title="Copy URL"
                  @click="copyUrl"
                >
                  <Icon name="files-1" class="text-sm" />
                </button>
                <button
                  type="button"
                  class="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors"
                  title="Visit site"
                  @click="visitSite"
                >
                  <Icon name="link-external" class="text-sm" />
                </button>
              </div>
            </div>
          </div>

          <!-- Pro upgrade CTA (if not on Pro and no custom domain) -->
          <div
            v-if="!customDomain && !isPro"
            class="relative overflow-hidden p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 rounded-xl animate-fadeInUp animation-delay-300"
          >
            <!-- Decorative gradient -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

            <div class="relative flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon name="lni-crown-1" class="text-xl text-primary" />
              </div>
              <div class="flex-1 space-y-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-foreground">Want a custom domain?</h3>
                    <Badge variant="default" size="xs">Pro</Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Upgrade to Pro for custom domains, remove watermarks, analytics, and more — just $6/mo per project.
                  </p>
                </div>
                <Button size="sm" @click="upgradeToProForDomain">
                  <Icon name="lni-crown-1" class="text-sm" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>

          <!-- Share section -->
          <div class="space-y-3 animate-fadeInUp animation-delay-400">
            <div class="flex items-center gap-2">
              <Icon name="lni-share-1" class="text-sm text-muted-foreground" />
              <p class="text-sm font-medium text-foreground">Share your site</p>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <button
                class="group flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 rounded-xl transition-all hover:scale-105"
                @click="shareTwitter"
              >
                <div class="w-10 h-10 rounded-full bg-[#1DA1F2]/10 group-hover:bg-[#1DA1F2]/20 flex items-center justify-center transition-colors">
                  <Icon name="lni-twitter-x" class="text-lg text-[#1DA1F2]" />
                </div>
                <span class="text-xs font-medium text-foreground">Twitter</span>
              </button>

              <button
                class="group flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 rounded-xl transition-all hover:scale-105"
                @click="shareFacebook"
              >
                <div class="w-10 h-10 rounded-full bg-[#1877F2]/10 group-hover:bg-[#1877F2]/20 flex items-center justify-center transition-colors">
                  <Icon name="lni-facebook" class="text-lg text-[#1877F2]" />
                </div>
                <span class="text-xs font-medium text-foreground">Facebook</span>
              </button>

              <button
                class="group flex flex-col items-center gap-2 p-4 bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 rounded-xl transition-all hover:scale-105"
                @click="shareLinkedIn"
              >
                <div class="w-10 h-10 rounded-full bg-[#0A66C2]/10 group-hover:bg-[#0A66C2]/20 flex items-center justify-center transition-colors">
                  <Icon name="lni-linkedin" class="text-lg text-[#0A66C2]" />
                </div>
                <span class="text-xs font-medium text-foreground">LinkedIn</span>
              </button>
            </div>
          </div>

          <!-- Primary action -->
          <div class="pt-2 animate-fadeInUp animation-delay-500">
            <Button class="w-full" size="lg" @click="visitSite">
              <Icon name="link-external" class="text-sm" />
              Visit Your Live Site
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}

.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out backwards;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-500 {
  animation-delay: 0.5s;
}
</style>
