<script setup lang="ts">
import ContentTab from '@/components/editor/panel/ContentTab.vue'
import DesignTab from '@/components/editor/panel/DesignTab.vue'
import { useEditorPanel } from '@/composables/useEditorPanel'

const { activeTab, activeDesignPanel, tabDirection } = useEditorPanel()
</script>

<template>
  <Transition :name="tabDirection === 'forward' ? 'modal-forward' : 'modal-back'" mode="out-in">
    <ContentTab v-if="activeTab === 'content'" key="content" />
    <DesignTab v-else :key="`design-${activeDesignPanel ?? 'list'}`" />
  </Transition>
</template>
