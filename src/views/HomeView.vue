<script setup lang="ts">
import HeaderFront from '@/components/storefront/HeaderFront.vue';
import HeroFront from '@/components/storefront/HeroFront.vue';
import PreviewFront from '@/components/storefront/PreviewFront.vue';

</script>

<template>
<main>
    <HeaderFront/>
    <HeroFront />
    <PreviewFront />
</main>
</template>

<style scoped>
    main {
        background: white;
        color: black;
        min-height: 100vh;
    }
</style>