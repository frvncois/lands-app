<script setup lang="ts">
interface Props {
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
})
</script>

<script lang="ts">
import ListThumbnail from './ListThumbnail.vue'
import ListTitle from './ListTitle.vue'
import ListContent from './ListContent.vue'
import ListActions from './ListActions.vue'

export default {
  Thumbnail: ListThumbnail,
  Title: ListTitle,
  Content: ListContent,
  Actions: ListActions,
}
</script>

<template>
  <div
    :class="[
      'p-3.5 border rounded-2xl',
    ]"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3.5 flex-1 pr-1.5">
        <slot />
      </div>
    </div>
  </div>
</template>
