<script setup lang="ts">
import FeaturesFront from '@/components/storefront/FeaturesFront.vue';
import HeaderFront from '@/components/storefront/HeaderFront.vue';
import HeroFront from '@/components/storefront/HeroFront.vue';
import IntroFront from '@/components/storefront/IntroFront.vue';
import PreviewFront from '@/components/storefront/PreviewFront.vue';
import PricingFront from '@/components/storefront/PricingFront.vue';
import ShowcaseFront from '@/components/storefront/ShowcaseFront.vue';

</script>

<template>
  <main>
    <HeaderFront />
    <HeroFront />
    <PreviewFront />
    <IntroFront />
    <FeaturesFront />
    <ShowcaseFront />
    <PricingFront />
  </main>
</template>

<style scoped>
    main {
        background: white;
        color: black;
        min-height: 100vh;
    }
</style>