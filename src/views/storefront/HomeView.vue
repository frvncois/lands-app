<script setup lang="ts">
import HomeHero from '@/components/storefront/HomeHero.vue';
import FeaturesSection from '@/components/storefront/FeaturesSection.vue';
import MainHeader from '@/components/storefront/MainHeader.vue';
import ShowcaseSection from '@/components/storefront/ShowcaseSection.vue';
import PricingSection from '@/components/storefront/PricingSection.vue';
import CardsSection from '@/components/storefront/CardsSection.vue';

</script>

<template>
  <main>
    <MainHeader/>
    <HomeHero/>
    <ShowcaseSection/>
    <FeaturesSection/>
    <CardsSection/>
    <PricingSection/>
  </main>
</template>

<style lang="css" scoped>
main {
  background: black;
  color: white;
}
</style>
