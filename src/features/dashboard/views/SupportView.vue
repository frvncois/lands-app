<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  SignalIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

// ─── Support CTAs ───
const contacts = [
  {
    icon: EnvelopeIcon,
    label: 'Email support',
    description: 'Get a reply within 24 hours',
    action: () => window.open('mailto:support@lands.app'),
  },
  {
    icon: ChatBubbleLeftRightIcon,
    label: 'Community',
    description: 'Ask questions and share tips',
    action: () => window.open('https://discord.gg/lands'),
  },
  {
    icon: SignalIcon,
    label: 'Service status',
    description: 'Check if everything is running',
    action: () => window.open('https://status.lands.app'),
  },
]

// ─── Documentation ───
interface DocArticle {
  id: string
  category: string
  title: string
  description: string
}

const articles: DocArticle[] = [
  // Getting Started
  { id: 'gs-1', category: 'Getting started', title: 'Creating your first project', description: 'Learn how to create and name your first landing page.' },
  { id: 'gs-2', category: 'Getting started', title: 'Navigating the editor', description: 'Understand the sidebar, preview panel, and editor controls.' },
  { id: 'gs-3', category: 'Getting started', title: 'Publishing your land', description: 'How to go live on your lands.app subdomain.' },
  { id: 'gs-4', category: 'Getting started', title: 'Setting up your profile', description: 'Update your name, email, and password.' },

  // Editor
  { id: 'ed-1', category: 'Editor', title: 'Adding and reordering sections', description: 'Add sections from the picker and drag to reorder.' },
  { id: 'ed-2', category: 'Editor', title: 'Choosing a theme', description: 'Apply Minimal, Structure, or Baseline presets and customize colors.' },
  { id: 'ed-3', category: 'Editor', title: 'Typography options', description: 'Change the font style of your land.' },
  { id: 'ed-4', category: 'Editor', title: 'Saving and discarding changes', description: 'How auto-save, manual save, and discard work.' },
  { id: 'ed-5', category: 'Editor', title: 'Previewing your land', description: 'Switch between editor and preview modes.' },

  // Sections
  { id: 'sc-1', category: 'Sections', title: 'Header section', description: 'Set up your profile picture, name, and bio.' },
  { id: 'sc-2', category: 'Sections', title: 'Text section', description: 'Add rich text content with headings and paragraphs.' },
  { id: 'sc-3', category: 'Sections', title: 'Media section', description: 'Embed images or videos in your land.' },
  { id: 'sc-4', category: 'Sections', title: 'Content + Media section', description: 'Combine text and media side by side with links.' },
  { id: 'sc-5', category: 'Sections', title: 'List section', description: 'Display a list of items with titles, subtitles, and descriptions.' },
  { id: 'sc-6', category: 'Sections', title: 'Collection section', description: 'Showcase a grid of content items with covers and descriptions.' },
  { id: 'sc-7', category: 'Sections', title: 'Campaign section', description: 'Capture email subscribers from your landing page.' },
  { id: 'sc-8', category: 'Sections', title: 'Store section', description: 'Sell physical and digital products directly from your land.' },
  { id: 'sc-9', category: 'Sections', title: 'Footer section', description: 'Customize the bottom of your land with links and branding.' },

  // Integrations
  { id: 'int-1', category: 'Integrations', title: 'Connecting Mailchimp', description: 'Sync email subscribers to your Mailchimp audience.' },
  { id: 'int-2', category: 'Integrations', title: 'Connecting MailerLite', description: 'Add subscribers to a MailerLite group.' },
  { id: 'int-3', category: 'Integrations', title: 'Connecting Kit (ConvertKit)', description: 'Send subscribers to a Kit form.' },
  { id: 'int-4', category: 'Integrations', title: 'Connecting Flodesk', description: 'Add subscribers to a Flodesk segment.' },
  { id: 'int-5', category: 'Integrations', title: 'Connecting Brevo', description: 'Sync contacts to a Brevo list.' },
  { id: 'int-6', category: 'Integrations', title: 'Using a Webhook', description: 'POST subscriber data to your own endpoint.' },
  { id: 'int-7', category: 'Integrations', title: 'Connecting Stripe', description: 'Accept payments for your store.' },
  { id: 'int-8', category: 'Integrations', title: 'Google Analytics', description: 'Track visits and engagement with your GA4 account.' },

  // Custom Domain
  { id: 'cd-1', category: 'Custom domain', title: 'Connecting a custom domain', description: 'Point your own domain to your land.' },
  { id: 'cd-2', category: 'Custom domain', title: 'DNS configuration', description: 'Add the required CNAME record at your registrar.' },
  { id: 'cd-3', category: 'Custom domain', title: 'Troubleshooting domain issues', description: 'Common DNS problems and how to fix them.' },

  // Collaborators
  { id: 'co-1', category: 'Collaborators', title: 'Adding collaborators', description: 'Invite team members to edit your land.' },
  { id: 'co-2', category: 'Collaborators', title: 'Transferring project ownership', description: 'Hand off a project to another user.' },

  // Plans & Billing
  { id: 'pl-1', category: 'Plans & billing', title: 'Free vs Paid plan', description: 'Compare features and limits between plans.' },
  { id: 'pl-2', category: 'Plans & billing', title: 'Upgrading your plan', description: 'How to unlock advanced features for a project.' },
  { id: 'pl-3', category: 'Plans & billing', title: 'Managing your billing information', description: 'Update your card and payment details.' },
  { id: 'pl-4', category: 'Plans & billing', title: 'Understanding your invoices', description: 'Read and download your billing history.' },
  { id: 'pl-5', category: 'Plans & billing', title: 'Cancelling a plan', description: 'How to downgrade a project to the free plan.' },

  // Account
  { id: 'ac-1', category: 'Account', title: 'Updating your profile', description: 'Change your name and email address.' },
  { id: 'ac-2', category: 'Account', title: 'Changing your password', description: 'Reset or update your login password.' },
  { id: 'ac-3', category: 'Account', title: 'Deleting your account', description: 'Permanently remove your account and all projects.' },
]

const query = ref('')

const filteredArticles = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return null
  return articles.filter(a =>
    a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
  )
})

const categories = computed(() => {
  const seen = new Set<string>()
  return articles.map(a => a.category).filter(c => { if (seen.has(c)) return false; seen.add(c); return true })
})

function articlesByCategory(category: string) {
  return articles.filter(a => a.category === category)
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <section class="max-w-2xl m-auto pt-4 space-y-8">

      <h1 class="text-2xl">Support</h1>

      <!-- ── Get Help ── -->
      <div class="flex flex-col gap-4 pb-8">
        <div class="flex items-center gap-3">
          <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
            <QuestionMarkCircleIcon class="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">Get help</h2>
            <p class="text-xs text-gray-400">Reach out or check our service status</p>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="item in contacts"
            :key="item.label"
            class="flex flex-col gap-2 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
            @click="item.action()"
          >
            <div class="flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
              <component :is="item.icon" class="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ item.label }}</p>
              <p class="text-xs text-gray-400 leading-relaxed">{{ item.description }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- ── Documentation ── -->
      <div class="flex flex-col gap-4 pb-16">
        <div class="flex items-center gap-3">
          <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
            <BookOpenIcon class="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">Documentation</h2>
            <p class="text-xs text-gray-400">Everything you need to know about Lands</p>
          </div>
        </div>

        <!-- Search -->
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-900 pointer-events-none" />
          <input
            v-model="query"
            type="text"
            placeholder="Search documentation…"
            class="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04] transition-colors"
          />
        </div>

        <!-- Search results -->
        <template v-if="filteredArticles !== null">
          <div v-if="filteredArticles.length === 0" class="py-8 text-center text-sm text-gray-400">
            No results for "{{ query }}"
          </div>
          <div v-else class="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
            <button
              v-for="article in filteredArticles"
              :key="article.id"
              class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ article.title }}</p>
                <p class="text-xs text-gray-400">{{ article.category }} · {{ article.description }}</p>
              </div>
              <ChevronRightIcon class="h-4 w-4 text-gray-300 shrink-0" />
            </button>
          </div>
        </template>

        <!-- Grouped by category -->
        <template v-else>
          <div v-for="category in categories" :key="category" class="flex flex-col gap-2">
            <p class="text-xs font-medium text-gray-500 px-1">{{ category }}</p>
            <div class="flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
              <button
                v-for="article in articlesByCategory(category)"
                :key="article.id"
                class="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ article.title }}</p>
                  <p class="text-xs text-gray-400">{{ article.description }}</p>
                </div>
                <ChevronRightIcon class="h-4 w-4 text-gray-300 shrink-0" />
              </button>
            </div>
          </div>
        </template>

      </div>
    </section>
  </section>
</template>
