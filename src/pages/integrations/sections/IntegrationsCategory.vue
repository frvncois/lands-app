<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Card } from '@/components/ui'
import { useIntegrationsState } from '../composables/useIntegrationsState'

const props = defineProps<{
  category: string
}>()

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)
const { categories, openConnect, isConnected } = useIntegrationsState(projectId.value)

const categoryData = computed(() =>
  categories?.value?.find(c => c.category === props.category)
)
</script>

<template>
  <div v-if="categoryData" class="mb-8">
    <div class="flex items-center gap-2 mb-4">
      <svg v-if="categoryData.category === 'email'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <svg v-else-if="categoryData.category === 'payment'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <svg v-else-if="categoryData.category === 'analytics'" class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <svg v-else class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <h2 class="text-sm font-medium text-foreground">{{ categoryData.label }}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="integration in categoryData.integrations"
        :key="integration.id"
        hoverable
      >
        <Card.Content class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <svg v-if="categoryData.category === 'email'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="categoryData.category === 'payment'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <svg v-else-if="categoryData.category === 'analytics'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <svg v-else class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-foreground">{{ integration.name }}</p>
              <span v-if="isConnected?.(integration.id)" class="flex items-center gap-1 text-xs text-green-600">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Connected
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ integration.description }}</p>
            <button
              v-if="!isConnected?.(integration.id)"
              class="mt-3 h-7 px-3 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
              @click="openConnect(integration)"
            >
              Connect
            </button>
            <button
              v-else
              class="mt-3 h-7 px-3 border border-border text-xs font-medium rounded-md hover:bg-muted transition-colors"
              @click="openConnect(integration)"
            >
              Configure
            </button>
          </div>
        </Card.Content>
      </Card>
    </div>
  </div>
</template>
