<script setup lang="ts">
import ContentTab from '@/features/editor/components/panel/ContentTab.vue'
import DesignTab from '@/features/editor/components/panel/DesignTab.vue'
import { useEditorPanel } from '@/features/editor/composables/useEditorPanel'

const { activeTab, activeDesignPanel, tabDirection } = useEditorPanel()
</script>

<template>
  <Transition :name="tabDirection === 'forward' ? 'modal-forward' : 'modal-back'" mode="out-in">
    <ContentTab v-if="activeTab === 'content'" key="content" />
    <DesignTab v-else :key="`design-${activeDesignPanel ?? 'list'}`" />
  </Transition>
</template>
