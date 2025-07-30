<script setup>
import { RouterView } from 'vue-router'
import { useAccountStore } from './stores/account'

import NavMain from './components/global/NavMain.vue'
import AuthMain from './components/auth/AuthMain.vue'
import ProjectPreview from './components/project/ProjectPreview.vue'

const accountStore = useAccountStore()
</script>

<template>
  <main v-if="accountStore.isAuthenticated">
    <NavMain />
    <RouterView />
    <ProjectPreview/>
  </main>

  <main v-else>
    <AuthMain />
  </main>
</template>