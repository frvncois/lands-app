<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue'
</script>

<template>
  <div class="min-h-screen bg-background font-sans flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-muted/30 border-r border-border flex-col justify-between p-10">
      <div class="flex items-center gap-2">
        <LandsLogo class="w-8 h-8" />
        <span class="text-xl font-semibold text-foreground">Lands</span>
      </div>

      <div class="space-y-6">
        <blockquote class="text-lg text-foreground/80 leading-relaxed">
          "Lands has completely transformed how we build and manage our landing pages. The collaboration features are incredible."
        </blockquote>
        <div>
          <p class="font-medium text-foreground">Sarah Chen</p>
          <p class="text-sm text-muted-foreground">Product Designer at Acme Inc</p>
        </div>
      </div>

      <p class="text-sm text-muted-foreground">
        Build beautiful landing pages, together.
      </p>
    </div>

    <!-- Right side - Auth form -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-[380px]">
        <!-- Mobile logo -->
        <div class="lg:hidden flex items-center justify-center gap-2 mb-8">
          <LandsLogo class="w-8 h-8" />
          <span class="text-xl font-semibold text-foreground">Lands</span>
        </div>

        <RouterView />
      </div>
    </div>
  </div>
</template>
