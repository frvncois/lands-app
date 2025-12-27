<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useIntegrationsState } from '../composables/useIntegrationsState'

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)

const {
  selected,
  showConnect,
  configInputs,
  isSaving,
  isConnected,
  closeConnect,
  connectIntegration,
} = useIntegrationsState(projectId.value)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showConnect && selected"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeConnect"></div>
      <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg v-if="selected.category === 'email'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <svg v-else-if="selected.category === 'payment'" class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <svg v-else class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-foreground">{{ isConnected?.(selected.id) ? 'Configure' : 'Connect' }} {{ selected.name }}</h2>
            <p class="text-xs text-muted-foreground">{{ selected.description }}</p>
          </div>
        </div>

        <div class="space-y-4">
          <!-- Dynamic config fields -->
          <div v-for="field in selected.configFields || []" :key="field.key" class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">
              {{ field.label }}
              <span v-if="!field.required" class="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              v-model="configInputs[field.key]"
              :type="field.type === 'password' ? 'password' : field.type === 'url' ? 'url' : 'text'"
              class="w-full h-10 px-3 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              :placeholder="field.placeholder"
            />
            <p v-if="field.helpText" class="text-xs text-muted-foreground">{{ field.helpText }}</p>
          </div>

          <!-- Webhook URL for payment integrations -->
          <div v-if="selected.category === 'payment'" class="space-y-1.5">
            <label class="text-sm font-medium text-foreground">Webhook URL</label>
            <div class="flex gap-2">
              <input
                type="text"
                readonly
                :value="`https://lands.app/api/webhooks/${projectId}/${selected.id}`"
                class="flex-1 h-10 px-3 bg-muted border border-border rounded-md text-sm text-muted-foreground"
              />
              <button class="h-10 px-3 border border-border rounded-md hover:bg-muted transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-muted-foreground">
              Add this URL to your {{ selected.name }} webhook settings.
            </p>
          </div>

          <!-- Docs link -->
          <div v-if="selected.docsUrl" class="pt-2">
            <a
              :href="selected.docsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              View {{ selected.name }} documentation
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            @click="closeConnect"
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            :disabled="isSaving"
            @click="connectIntegration"
          >
            {{ isConnected?.(selected.id) ? 'Save Changes' : 'Connect' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
