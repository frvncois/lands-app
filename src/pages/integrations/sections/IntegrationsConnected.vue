<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Card } from '@/components/ui'
import { useIntegrationsState } from '../composables/useIntegrationsState'

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)
const { connectedIntegrations, openDisconnect } = useIntegrationsState(projectId.value)
</script>

<template>
  <div v-if="connectedIntegrations?.length" class="mb-8">
    <h2 class="text-sm font-medium text-foreground mb-4">Connected</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="{ connection, definition } in connectedIntegrations"
        :key="connection.id"
      >
        <Card.Content class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <svg v-if="definition.category === 'email'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="definition.category === 'payment'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <svg v-else-if="definition.category === 'analytics'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <svg v-else class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-foreground">{{ definition.name }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span class="text-xs text-muted-foreground">
                    {{ connection.accountInfo?.email || connection.accountInfo?.name || 'Connected' }}
                  </span>
                </div>
              </div>
              <button
                class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                @click="openDisconnect(definition)"
              >
                Disconnect
              </button>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  </div>
</template>
