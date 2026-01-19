<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useProjectSettings } from './useProjectSettings'
import CollaboratorsSection from '@/components/settings/CollaboratorsSection.vue'
import InviteCollaborator from '@/components/modal/InviteCollaborator.vue'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import { Card, Button, Badge } from '@/components/ui'

const projectStore = useProjectStore()
const projectId = computed(() => projectStore.currentProjectId || '')

const { canUseCollaborators } = useProjectSettings()

const showInviteModal = ref(false)
const showUpgradeModal = ref(false)
</script>

<template>
  <Card>
    <Card.Header
      title="Collaborators"
      icon="lni-user-multiple-4"
    >
      <template #action>
        <div class="flex items-center gap-2">
          <Badge
            v-show="!canUseCollaborators"
            variant="secondary"
            size="xs"
          >
            Pro
          </Badge>
          <Button
            v-show="canUseCollaborators"
            variant="outline"
            size="sm"
            @click="showInviteModal = true"
          >
            Invite
          </Button>
        </div>
      </template>
    </Card.Header>
    <Card.Content
      v-show="canUseCollaborators"
      :padded="false"
    >
      <CollaboratorsSection :project-id="projectId" />
    </Card.Content>
    <Card.Content
      v-show="!canUseCollaborators"
      class="space-y-3"
    >
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

    <InviteCollaborator
      v-model:open="showInviteModal"
      :project-id="projectId"
    />
    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />
  </Card>
</template>
