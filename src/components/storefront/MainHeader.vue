<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue';

</script>

<template>
    <header>
        <div class="logo"><LandsLogo/><h1>Lands</h1></div>
        <nav>
            <p>Showcase</p>
            <p>Features</p>
            <p>Pricing</p>
            <RouterLink to="/auth">Get started</RouterLink>
        </nav>
    </header>
</template>

<style scoped>
header {
    position: fixed;
    z-index: 50;
    color: white;
    top: 2em;
    left: 2em;
    right: 2em;
    margin: auto;
    height: 4em;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .logo {
        display: flex;
        align-items: center;
        gap: 2em;
        > svg {
            height: 1.75em;
        }
    }
    h1 {
        font-size: 1.15em;
        letter-spacing: 0.5px;
    }
    nav {
        display: flex;
        align-items: center;
        gap: 2em;
        background: rgba(249, 249, 249, 0.947);
        color: black;
        border-radius: 1.25em;
        padding: 0.25em 0.25em 0.25em 2em;
        backdrop-filter: blur(10px);
    }
    a {
        background: black;
        color: white;
        padding: 0.5em 1em;
        border-radius: 1em;
    }

}
</style>