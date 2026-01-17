<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project, ProjectPlan } from '@/types/project'
import { useAccountProjectActions } from './useAccountProjectActions'
import { ListItem, Badge, Button, Dropdown } from '@/components/ui'
import PlanChange from '@/components/modal/PlanChange.vue'
import ProjectLeave from '@/components/modal/ProjectLeave.vue'
import ProjectDelete from '@/components/modal/ProjectDelete.vue'

const props = defineProps<{
  project: Project
}>()

const actions = useAccountProjectActions()

const isOwner = computed(() => actions.isOwner(props.project))

// Modal state
const showPlanModal = ref(false)
const showLeaveModal = ref(false)
const showDeleteModal = ref(false)

function handlePlanChanged(plan: ProjectPlan) {
  actions.changePlan(props.project.id, plan)
}

async function handleProjectLeft() {
  await actions.leaveProject(props.project)
}
</script>

<template>
  <ListItem>
    <ListItem.Thumbnail :initial="project.title.charAt(0).toUpperCase()" />

    <div class="min-w-0 flex-1 space-y-2">
      <ListItem.Title>
        <Button
          variant="link"
          size="xs"
          class="h-auto p-0 truncate"
          @click="actions.openDesigner(project.id)"
        >
          {{ project.title }}
        </Button>
      </ListItem.Title>

      <ListItem.Content>
        <Badge :variant="project.isPublished ? 'success' : 'secondary'" size="xs" dot>
          {{ project.isPublished ? 'Published' : 'Draft' }}
        </Badge>
        <Badge
          :variant="project.plan === 'pro' ? 'info' : 'outline'"
          size="xs"
          dot
        >
          {{ project.plan === 'pro' ? 'Pro' : 'Free' }}
        </Badge>
        <Badge v-if="!isOwner" variant="warning" size="xs">
          Collaborator
        </Badge>
      </ListItem.Content>
    </div>

    <ListItem.Actions>
      <Dropdown>
        <Dropdown.Item v-if="project.isPublished" icon="app-show" @click="actions.viewSite(project)">
          View Site
        </Dropdown.Item>
        <Dropdown.Item icon="lni-pencil-1" @click="actions.openDesigner(project.id)">
          Open Designer
        </Dropdown.Item>
        <Dropdown.Item icon="lni-bar-chart-4" @click="actions.openAnalytics(project.id)">
          Analytics
        </Dropdown.Item>
        <Dropdown.Item icon="lni-gear-1" @click="actions.openSettings(project.id)">
          Settings
        </Dropdown.Item>
        <Dropdown.Item v-if="isOwner" icon="lni-credit-card-multiple" @click="showPlanModal = true">
          Change Plan
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item v-if="isOwner" icon="lni-trash-3" destructive @click="showDeleteModal = true">
          Delete Project
        </Dropdown.Item>
        <Dropdown.Item v-if="!isOwner" icon="app-logout" destructive @click="showLeaveModal = true">
          Leave Project
        </Dropdown.Item>
      </Dropdown>
    </ListItem.Actions>

    <!-- Modals -->
    <PlanChange
      v-model:open="showPlanModal"
      :project="project"
      @changed="handlePlanChanged"
    />
    <ProjectLeave
      v-model:open="showLeaveModal"
      :project="project"
      @left="handleProjectLeft"
    />
    <ProjectDelete
      v-model:open="showDeleteModal"
      :project-id="project.id"
      :project-title="project.title"
    />
  </ListItem>
</template>
