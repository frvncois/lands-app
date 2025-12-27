<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Header, Card, Button, Icon, Badge } from '@/components/ui'
import SupportChat from '@/components/modal/SupportChat.vue'

const route = useRoute()
const showChat = ref(false)
const now = ref(new Date())
const activeTab = ref<'general' | 'documentation'>(
  route.query.tab === 'documentation' ? 'documentation' : 'general'
)

// Update time every minute
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60000)
})
onUnmounted(() => clearInterval(timer))

// Check if currently online (8am-6pm Mon-Fri Montreal time)
const chatStatus = computed(() => {
  const montrealTime = new Date(now.value.toLocaleString('en-US', { timeZone: 'America/Toronto' }))
  const day = montrealTime.getDay() // 0 = Sunday, 6 = Saturday
  const hour = montrealTime.getHours()
  const minutes = montrealTime.getMinutes()

  const isWeekday = day >= 1 && day <= 5
  const isBusinessHours = hour >= 8 && hour < 18

  if (isWeekday && isBusinessHours) {
    return { online: true, message: 'Now online' }
  }

  // Calculate time until next opening
  let nextOpen = new Date(montrealTime)

  if (day === 0) {
    // Sunday -> Monday 8am
    nextOpen.setDate(nextOpen.getDate() + 1)
    nextOpen.setHours(8, 0, 0, 0)
  } else if (day === 6) {
    // Saturday -> Monday 8am
    nextOpen.setDate(nextOpen.getDate() + 2)
    nextOpen.setHours(8, 0, 0, 0)
  } else if (hour >= 18) {
    // After 6pm on weekday -> next day 8am (or Monday if Friday)
    if (day === 5) {
      nextOpen.setDate(nextOpen.getDate() + 3)
    } else {
      nextOpen.setDate(nextOpen.getDate() + 1)
    }
    nextOpen.setHours(8, 0, 0, 0)
  } else if (hour < 8) {
    // Before 8am on weekday -> same day 8am
    nextOpen.setHours(8, 0, 0, 0)
  }

  const diffMs = nextOpen.getTime() - montrealTime.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  let timeUntil = ''
  if (diffHours > 0) {
    timeUntil = `${diffHours}h ${diffMinutes}m`
  } else {
    timeUntil = `${diffMinutes}m`
  }

  return { online: false, message: `Opens in ${timeUntil}` }
})

const documentationSections = [
  {
    title: 'Getting Started',
    icon: 'lni-rocket-2',
    articles: [
      { title: 'Creating your first project', slug: 'creating-first-project' },
      { title: 'Understanding the editor', slug: 'understanding-editor' },
      { title: 'Publishing your landing page', slug: 'publishing-landing-page' },
      { title: 'Connecting a custom domain', slug: 'custom-domain' },
    ],
  },
  {
    title: 'Sections & Content',
    icon: 'lni-layout-1',
    articles: [
      { title: 'Adding and arranging sections', slug: 'adding-sections' },
      { title: 'Editing text and images', slug: 'editing-content' },
      { title: 'Working with buttons and links', slug: 'buttons-links' },
      { title: 'Using the style inspector', slug: 'style-inspector' },
    ],
  },
  {
    title: 'Design & Styling',
    icon: 'lni-brush-1',
    articles: [
      { title: 'Choosing and customizing themes', slug: 'themes' },
      { title: 'Typography and fonts', slug: 'typography' },
      { title: 'Colors and branding', slug: 'colors-branding' },
      { title: 'Responsive design tips', slug: 'responsive-design' },
    ],
  },
  {
    title: 'Integrations',
    icon: 'lni-link-2',
    articles: [
      { title: 'Connecting email providers', slug: 'email-providers' },
      { title: 'Setting up analytics', slug: 'analytics-setup' },
      { title: 'Payment integrations', slug: 'payments' },
      { title: 'Third-party tools', slug: 'third-party-tools' },
    ],
  },
]
</script>

<template>
  <div class="max-w-6xl mx-auto p-10">
    <Header
      title="Support"
      description="Get help, learn Lands, and connect with our team."
    />

    <!-- Tabs -->
    <div class="flex items-center gap-1 mb-6 border-b border-border">
      <button
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === 'general'
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'"
        @click="activeTab = 'general'"
      >
        General
      </button>
      <button
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === 'documentation'
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'"
        @click="activeTab = 'documentation'"
      >
        Documentation
      </button>
    </div>

    <!-- General Tab -->
    <template v-if="activeTab === 'general'">
      <!-- Chat Support - Full Width -->
    <Card class="relative overflow-hidden mb-6 border-primary/20">
      <Card.Content class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="lni-comment-1-text" class="text-3xl text-primary" />
            </div>
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-xl font-semibold text-foreground">Chat with us</h3>
                <span
                  v-if="chatStatus.online"
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20"
                  style="box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  {{ chatStatus.message }}
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
                  Offline
                  <span class="text-foreground/70">· {{ chatStatus.message }}</span>
                </span>
              </div>
              <p class="text-sm text-muted-foreground max-w-lg">
                Get quick answers from our support team.
                <span v-if="!chatStatus.online" class="text-muted-foreground/80">
                  You can still leave a message and we'll get back to you when we're online.
                </span>
                <span v-else>
                  We typically respond within minutes during business hours.
                </span>
              </p>
            </div>
          </div>
          <Button size="lg" @click="showChat = true">
            <Icon name="lni-comment-1" class="text-sm" />
            Start Chat
          </Button>
        </div>
      </Card.Content>
    </Card>

    <!-- Contact Options -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- Email Support -->
      <Card>
        <Card.Content class="p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Icon name="lni-envelope-1" class="text-2xl text-blue-500" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground mb-1">Email us</h3>
              <p class="text-sm text-muted-foreground mb-4">
                For detailed inquiries or feature requests, send us an email.
              </p>
              <Button variant="outline" as="a" href="mailto:hello@lands.app">
                <Icon name="lni-envelope-1" class="text-sm" />
                hello@lands.app
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>

      <!-- Video Meeting -->
      <Card>
        <Card.Content class="p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <Icon name="lni-video-1" class="text-2xl text-green-500" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground mb-1">Book a call</h3>
              <p class="text-sm text-muted-foreground mb-4">
                Schedule a video meeting with our team for personalized help.
              </p>
              <Button variant="outline">
                <Icon name="lni-calendar-1" class="text-sm" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>

    <!-- Training Sessions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <!-- Free 30-min Training -->
      <Card class="border-primary/30 bg-primary/5">
        <Card.Content class="p-6">
          <div class="flex items-start justify-between mb-4">
            <Badge variant="success" size="sm">Free</Badge>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">
            30-Minute One-on-One Training
          </h3>
          <p class="text-muted-foreground mb-4">
            New to Lands? Book a free 30-minute session with our team. We'll walk you through the basics,
            answer your questions, and help you get started on the right foot.
          </p>
          <ul class="space-y-2 mb-6">
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-green-500" />
              Learn the editor basics
            </li>
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-green-500" />
              Understand sections and themes
            </li>
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-green-500" />
              Get personalized tips
            </li>
          </ul>
          <Button size="lg">
            <Icon name="lni-calendar-1" class="text-sm" />
            Book Free Training
          </Button>
        </Card.Content>
      </Card>

      <!-- Pro Setup Session -->
      <Card class="border-amber-500/30 bg-amber-500/5">
        <Card.Content class="p-6">
          <div class="flex items-start justify-between mb-4">
            <Badge variant="warning" size="sm">Pro Plan</Badge>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">
            Full Project Setup Session
          </h3>
          <p class="text-muted-foreground mb-4">
            Get a dedicated 1-hour session where we help you set up your first project from scratch.
            We'll show you all the features, best practices, and how to make the most of Lands.
          </p>
          <ul class="space-y-2 mb-6">
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-amber-500" />
              Complete project setup
            </li>
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-amber-500" />
              All features walkthrough
            </li>
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-amber-500" />
              Custom domain & integrations
            </li>
            <li class="flex items-center gap-2 text-sm text-foreground">
              <Icon name="lni-checkmark-circle" class="text-amber-500" />
              Best practices & optimization
            </li>
          </ul>
          <Button variant="outline" size="lg">
            <Icon name="lni-video-1" class="text-sm" />
            Book Setup Session
          </Button>
        </Card.Content>
      </Card>
    </div>
    </template>

    <!-- Documentation Tab -->
    <template v-if="activeTab === 'documentation'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card v-for="section in documentationSections" :key="section.title">
          <Card.Content class="p-5">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icon :name="section.icon" class="text-lg text-foreground" />
              </div>
              <h3 class="font-semibold text-foreground">{{ section.title }}</h3>
            </div>
            <ul class="space-y-2">
              <li v-for="article in section.articles" :key="article.slug">
                <a
                  href="#"
                  class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <Icon name="lni-document-1" class="text-xs opacity-50" />
                  {{ article.title }}
                </a>
              </li>
            </ul>
          </Card.Content>
        </Card>
      </div>
    </template>
  </div>

  <!-- Chat Modal -->
  <SupportChat v-model:open="showChat" />
</template>
