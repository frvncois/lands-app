<script setup lang="ts">
import { ref } from 'vue'
import { Card, Button, Icon } from '@/components/ui'
import AccountDelete from '@/components/modal/AccountDelete.vue'

const showDeleteModal = ref(false)
</script>

<template>
  <Card variant="destructive">
    <Card.Header :border-bottom="false">
      <template #icon>
        <Icon name="xmark-circle" class="text-sm" />
      </template>
      <h2 class="text-xs font-medium text-destructive">Danger Zone</h2>
      <template #action>
        <Button variant="destructive" size="sm" @click="showDeleteModal = true">
          Delete Account
        </Button>
      </template>
    </Card.Header>

    <AccountDelete v-model:open="showDeleteModal" />
  </Card>
</template>
