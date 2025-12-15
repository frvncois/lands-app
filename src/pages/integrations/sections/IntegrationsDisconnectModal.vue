<script setup lang="ts">
import { useIntegrationsState } from '../composables/useIntegrationsState'

const {
  selected,
  showDisconnect,
  isSaving,
  closeDisconnect,
  disconnectIntegration,
} = useIntegrationsState()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showDisconnect && selected"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="closeDisconnect"></div>
      <div class="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 class="text-lg font-semibold text-foreground mb-2">Disconnect {{ selected.name }}</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Are you sure you want to disconnect {{ selected.name }}? This will remove the integration from your project.
        </p>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            class="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            @click="closeDisconnect"
          >
            Cancel
          </button>
          <button
            class="h-9 px-4 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:bg-destructive/90 transition-colors disabled:opacity-50"
            :disabled="isSaving"
            @click="disconnectIntegration"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
