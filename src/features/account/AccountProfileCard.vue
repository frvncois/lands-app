<script setup lang="ts">
import { ref } from 'vue'
import { useAccountActions } from './useAccountActions'
import { Card, Input, FormField, Button } from '@/components/ui'
import PasswordChange from '@/components/modal/PasswordChange.vue'

const { settings, updateProfile } = useAccountActions()
const showPasswordModal = ref(false)
</script>

<template>
  <Card>
    <Card.Header
      title="Profile"
      icon="lni-user-4"
    />
    <Card.Content class="space-y-5">
      <div class="space-y-3">
        <FormField label="Full Name">
          <Input
            :model-value="settings.profile.name"
            placeholder="Your name"
            @update:model-value="updateProfile({ name: $event as string })"
          />
        </FormField>

        <FormField label="Email">
          <Input
            :model-value="settings.profile.email"
            type="email"
            placeholder="you@example.com"
            @update:model-value="updateProfile({ email: $event as string })"
          />
        </FormField>
      </div>

      <Button
        variant="default"
        size="sm"
        class="h-auto p-0"
        @click="showPasswordModal = true"
      >
        Change password
      </Button>
    </Card.Content>

    <PasswordChange v-model:open="showPasswordModal" />
  </Card>
</template>
