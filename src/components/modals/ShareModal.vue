<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShareIcon, QrCodeIcon, LinkIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import { useLandStore } from '@/stores/land'

const emit = defineEmits<{ close: [] }>()

const landStore = useLandStore()

const publicUrl = computed(() => {
  const land = landStore.activeLand
  if (!land) return ''
  if (land.custom_domain && land.custom_domain_status === 'active') {
    return `https://${land.custom_domain}`
  }
  return land.handle ? `https://${land.handle}.lands.app` : ''
})

// Permanent URL using land ID — survives handle changes
const permanentUrl = computed(() => {
  const id = landStore.activeLand?.id
  return id ? `https://lands.app/${id}` : ''
})

const qrUrl = computed(() =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&bgcolor=ffffff&data=${encodeURIComponent(permanentUrl.value)}`
)

// ─── Copy link ───
const copied = ref(false)
async function copyLink() {
  if (!publicUrl.value) return
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Platforms ───
interface Platform {
  id: string
  name: string
  color: string
  profileUrl: string
  steps: string[]
}

const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    profileUrl: 'https://instagram.com',
    steps: [
      'Open the Instagram app and go to your profile',
      'Tap <strong>Edit profile</strong>',
      'Paste your link into the <strong>Website</strong> or <strong>Bio links</strong> field',
      'Tap <strong>Done</strong> to save',
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#010101',
    profileUrl: 'https://tiktok.com',
    steps: [
      'Open the TikTok app and go to your profile',
      'Tap <strong>Edit profile</strong>',
      'Paste your link into the <strong>Website</strong> field',
      'Tap <strong>Save</strong>',
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    color: '#000000',
    profileUrl: 'https://x.com',
    steps: [
      'Go to your X profile',
      'Click <strong>Edit profile</strong>',
      'Paste your link into the <strong>Website</strong> field',
      'Click <strong>Save</strong>',
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    profileUrl: 'https://linkedin.com',
    steps: [
      'Go to your LinkedIn profile',
      'Click the <strong>pencil icon</strong> next to your intro',
      'Scroll to <strong>Contact info → Website</strong>',
      'Paste your link and click <strong>Save</strong>',
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    profileUrl: 'https://facebook.com',
    steps: [
      'Go to your Facebook profile',
      'Click <strong>Edit profile</strong>',
      'Find the <strong>Website</strong> field under "About"',
      'Paste your link and click <strong>Save</strong>',
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    profileUrl: 'https://youtube.com',
    steps: [
      'Go to <strong>YouTube Studio</strong>',
      'Click <strong>Customization → Basic info</strong>',
      'Under <strong>Links</strong>, click <strong>Add link</strong>',
      'Paste your link and click <strong>Publish</strong>',
    ],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    profileUrl: 'https://pinterest.com',
    steps: [
      'Go to your Pinterest profile',
      'Click <strong>Edit profile</strong>',
      'Paste your link into the <strong>Website</strong> field',
      'Click <strong>Save</strong>',
    ],
  },
  {
    id: 'threads',
    name: 'Threads',
    color: '#101010',
    profileUrl: 'https://threads.net',
    steps: [
      'Open the Threads app and go to your profile',
      'Tap <strong>Edit profile</strong>',
      'Paste your link into the <strong>Link</strong> field',
      'Tap <strong>Done</strong>',
    ],
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    color: '#FFFC00',
    profileUrl: 'https://snapchat.com',
    steps: [
      'Open Snapchat and go to your profile',
      'Tap the <strong>pencil icon</strong> to edit',
      'Tap <strong>Website</strong> and paste your link',
      'Tap <strong>Save</strong>',
    ],
  },
]

// ─── Navigation ───
type ActiveView = 'list' | 'qr' | Platform['id']

const active = ref<ActiveView>('list')
const direction = ref<'forward' | 'back'>('forward')
const contentWrapper = ref<HTMLElement | null>(null)

const activePlatform = computed(() =>
  platforms.find(p => p.id === active.value) ?? null
)

const headerTitle = computed(() => {
  if (active.value === 'list') return 'Share'
  if (active.value === 'qr') return 'QR Code'
  return activePlatform.value?.name ?? 'Share'
})

function goTo(view: ActiveView) {
  direction.value = 'forward'
  active.value = view
}

function goBack() {
  direction.value = 'back'
  active.value = 'list'
}

function onBeforeLeave() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = contentWrapper.value.scrollHeight + 'px'
  contentWrapper.value.style.overflow = 'hidden'
}

function onEnter(el: Element) {
  if (!contentWrapper.value) return
  const newHeight = (el as HTMLElement).scrollHeight
  contentWrapper.value.style.transition = 'height 0.22s ease'
  contentWrapper.value.style.height = newHeight + 'px'
}

function onAfterEnter() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = ''
  contentWrapper.value.style.overflow = ''
  contentWrapper.value.style.transition = ''
}
</script>

<template>
  <div class="fixed top-20 left-78 w-80 z-50 bg-white shadow-xl rounded-2xl overflow-hidden origin-top-left border border-gray-200">

    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
      <div class="flex items-center gap-2">
        <Transition name="modal-fade" mode="out-in">
          <ShareIcon v-if="active === 'list'" key="share" class="h-4 w-4 text-gray-900" />
          <QrCodeIcon v-else-if="active === 'qr'" key="qr" class="h-4 w-4 text-gray-900" />
          <div v-else :key="active" class="h-4 w-4 rounded-full shrink-0" :style="{ background: activePlatform?.color }" />
        </Transition>
        <Transition name="modal-title" mode="out-in">
          <h2 :key="active" class="text-sm font-semibold text-gray-900">{{ headerTitle }}</h2>
        </Transition>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <BaseButton v-if="active !== 'list'" variant="outline" size="xs" @click="goBack">Back</BaseButton>
        <BaseButton v-else variant="outline" size="xs" @click="emit('close')">Close</BaseButton>
      </div>
    </div>

    <!-- Content -->
    <div ref="contentWrapper">
      <Transition
        :name="direction === 'forward' ? 'modal-forward' : 'modal-back'"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
      >

        <!-- List view -->
        <div v-if="active === 'list'" key="list" class="flex flex-col gap-1 p-4">

          <!-- Copy link -->
          <button
            class="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
            @click="copyLink"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                <LinkIcon class="h-3.5 w-3.5" />
              </div>
              <p class="text-xs text-gray-500 truncate">{{ publicUrl }}</p>
            </div>
            <span
              class="text-xs font-semibold shrink-0 transition-colors"
              :class="copied ? 'text-green-600' : 'text-gray-900'"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </span>
          </button>

          <!-- QR Code -->
          <button
            class="w-full flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
            @click="goTo('qr')"
          >
            <div class="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
              <QrCodeIcon class="h-3.5 w-3.5" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-medium text-gray-900">QR Code</p>
              <p class="text-xs text-gray-400">Download or screenshot</p>
            </div>
            <ChevronRightIcon class="h-4 w-4 text-gray-300 shrink-0" />
          </button>

          <!-- Divider -->
          <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-3 mb-1 px-1">Add to your bio</p>

          <!-- Social platforms -->
          <button
            v-for="platform in platforms"
            :key="platform.id"
            class="w-full flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors"
            @click="goTo(platform.id)"
          >
            <div class="h-2 w-2 rounded-full shrink-0" :style="{ background: platform.color }" />
            <p class="text-sm text-gray-900 flex-1 text-left">{{ platform.name }}</p>
            <ChevronRightIcon class="h-4 w-4 text-gray-300 shrink-0" />
          </button>
        </div>

        <!-- QR Code view -->
        <div v-else-if="active === 'qr'" key="qr" class="flex flex-col items-center gap-4 p-6">
          <div class="rounded-xl overflow-hidden border border-gray-100 p-2">
            <img :src="qrUrl" alt="QR Code" class="h-40 w-40" />
          </div>
          <p class="text-xs text-gray-400 text-center leading-relaxed">
            This QR code always points to your project — even if you change your handle.
          </p>
          <a
            :href="qrUrl"
            download="qr-code.png"
            class="w-full"
          >
            <BaseButton variant="outline" size="sm" class="w-full justify-center">Download PNG</BaseButton>
          </a>
        </div>

        <!-- Platform drill-in -->
        <div v-else-if="activePlatform" :key="activePlatform.id" class="flex flex-col gap-4 p-4">

          <!-- Steps -->
          <ol class="flex flex-col gap-2 list-decimal pl-4">
            <li
              v-for="(step, i) in activePlatform.steps"
              :key="i"
              class="text-xs text-gray-500 leading-relaxed"
              v-html="step"
            />
          </ol>

          <!-- Copy link -->
          <button
            class="w-full flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors"
            @click="copyLink"
          >
            <p class="text-xs text-gray-500 truncate">{{ publicUrl }}</p>
            <span
              class="text-xs font-semibold shrink-0 transition-colors"
              :class="copied ? 'text-green-600' : 'text-gray-900'"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </span>
          </button>

          <!-- Open platform -->
          <a :href="activePlatform.profileUrl" target="_blank" class="w-full">
            <BaseButton variant="outline" size="sm" class="w-full justify-center">
              Go to my {{ activePlatform.name }}
            </BaseButton>
          </a>
        </div>

      </Transition>
    </div>

  </div>
</template>
