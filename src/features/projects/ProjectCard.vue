<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/types/project'
import { Card, Badge, Button, Dropdown, Spinner, Icon } from '@/components/ui'
import { useProjectActions } from './useProjectActions'

const props = defineProps<{
  project?: Project
  variant?: 'default' | 'new'
}>()

const emit = defineEmits<{
  create: []
  delete: [project: Project]
}>()

const isPublishing = ref(false)
const actions = useProjectActions()

// Format relative date
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

async function handlePublish() {
  if (!props.project) return
  isPublishing.value = true
  await actions.publish(props.project.id)
  isPublishing.value = false
}

async function handleUnpublish() {
  if (!props.project) return
  isPublishing.value = true
  await actions.unpublish(props.project.id)
  isPublishing.value = false
}

function handleOpenSite() {
  if (!props.project) return
  actions.openSite(props.project.slug, props.project.publishedUrl)
}

function handleDelete() {
  if (!props.project) return
  emit('delete', props.project)
}
</script>

<template>
  <!-- New Project Card -->
  <Card
    v-if="variant === 'new'"
    variant="outline"
    class="border-1 border-dotted border-border hover:border hover:bg-muted/25 transition-colors"
    aspect-ratio="4/3"
  >
    <button
      class="cursor-pointer flex flex-col items-center justify-center w-full h-full"
      @click="emit('create')"
    >
      <Icon name="plus" class="text-3xl text-muted-foreground mb-2" />
      <span class="text-sm font-medium text-muted-foreground">Create new project</span>
    </button>
  </Card>

  <!-- Project Card -->
  <Card v-else-if="project" variant="default">
    <Card.Thumbnail
      :src="project.thumbnail"
      :alt="project.title"
      class="cursor-pointer"
      @click="actions.edit(project.id)"
    >
      <template #overlay>
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center backdrop-blur-xs justify-center gap-3">
          <Button
            variant="default"
            size="sm"
            @click.stop="actions.edit(project.id)"
          >
            <Icon name="app-editor" class="text-xs" />
            Edit
          </Button>
          <Button
            variant="default"
            size="sm"
            @click.stop="actions.settings(project.id)"
          >
            <Icon name="app-settings" class="text-xs" />
            Settings
          </Button>
        </div>
      </template>
    </Card.Thumbnail>

    <Card.Content>
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-md font-medium text-foreground truncate">{{ project.title }}</h3>
          <p class="text-[10px] font-mono uppercase text-muted-foreground">{{ project.slug }}.lands.app</p>
        </div>
        <Dropdown icon="app-more">
          <Dropdown.Item icon="app-editor" @click="actions.edit(project.id)">
            Edit
          </Dropdown.Item>
          <Dropdown.Item icon="app-settings" @click="actions.settings(project.id)">
            Settings
          </Dropdown.Item>
          <Dropdown.Item icon="app-analytics" @click="actions.analytics(project.id)">
            Analytics
          </Dropdown.Item>
          <Dropdown.Item icon="app-duplicate" @click="actions.duplicate(project.id)">
            Duplicate
          </Dropdown.Item>
          <Dropdown.Divider />
          <template v-if="!project.isPublished">
            <Dropdown.Item
              icon="app-publish"
              :disabled="isPublishing"
              @click="handlePublish"
            >
              {{ isPublishing ? 'Publishing...' : 'Publish' }}
            </Dropdown.Item>
          </template>
          <template v-else>
            <Dropdown.Item icon="app-show" @click="handleOpenSite">
              View Site
            </Dropdown.Item>
            <Dropdown.Item
              icon="app-hide"
              :disabled="isPublishing"
              @click="handleUnpublish"
            >
              {{ isPublishing ? 'Unpublishing...' : 'Unpublish' }}
            </Dropdown.Item>
          </template>
          <Dropdown.Divider />
          <Dropdown.Item icon="app-delete" destructive @click="handleDelete">
            Delete
          </Dropdown.Item>
        </Dropdown>
      </div>
    </Card.Content>

    <Card.Footer>
      <div class="flex items-center justify-between">
        <Badge v-if="isPublishing" variant="secondary" size="xs">
          <Spinner size="xs" />
          Updating ...
        </Badge>
        <Badge
          v-else-if="project.isPublished"
          variant="success"
          size="xs"
          dot
          class="cursor-pointer hover:opacity-80"
          @click="handleOpenSite"
        >
          Published
        </Badge>
        <Badge v-else variant="draft" size="xs" dot>
          Draft
        </Badge>
        <span class="text-[10px] text-muted-foreground">Updated {{ formatDate(project.updatedAt) }}</span>
      </div>
    </Card.Footer>
  </Card>
</template>
