<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <div class="min-h-screen bg-background font-sans flex">
      <div class="flex-1 flex items-center justify-center p-6 sm:p-10">    
      <div class="w-full max-w-[300px]">
        <div class="lg:hidden flex items-center justify-center gap-2 mb-8">
          <LandsLogo />
          <span class="text-xl font-semibold text-foreground">Lands</span>
        </div>
        <RouterView />
      </div>
    </div>

    <div class="hidden lg:flex lg:w-1/2 bg-muted/30 border-r border-border flex-col justify-between p-10">
      <div class="space-y-6">
       
      </div>

      <p class="text-sm text-muted-foreground">
        Build beautiful landing pages, together.
      </p>
    </div>

  </div>
</template>
