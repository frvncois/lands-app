<script setup lang="ts">
import HomeHero from '@/components/storefront/HomeHero.vue';
import FeaturesSection from '@/components/storefront/FeaturesSection.vue';
import { useRouter } from 'vue-router'
import MainHeader from '@/components/storefront/MainHeader.vue';
import ShowcaseSection from '@/components/storefront/ShowcaseSection.vue';
import PricingSection from '@/components/storefront/PricingSection.vue';

const router = useRouter()
</script>

<template>
  <MainHeader/>
  <HomeHero/>
  <FeaturesSection/>
  <ShowcaseSection/>
  <PricingSection/>
</template>
