<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue';

</script>

<template>
    <header>
        <div class="logo"><LandsLogo/>Lands</div>
        <nav>
            <p>Showcase</p>
            <p>Features</p>
            <p>Pricing</p>
        </nav>
        <RouterLink to="/auth">Get started</RouterLink>
    </header>
</template>

<style scoped>
header {
    position: fixed;
    color: white;
    background: rgb(48, 48, 48);
    top: 1em;
    left: 16vw;
    right: 16vw;
    border-radius: 2em;
    margin: auto;
    height: 4em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2em 1em 2em 2em;
    .logo {
        display: flex;
        align-items: center;
        gap: 2em;
    }
    nav {
        display: flex;
        gap: 2em;
    }
    a {
        background: white;
        color: black;
        padding: 0.5em 1em;
        border-radius: 5em;
    }

}
</style>