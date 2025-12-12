<script setup lang="ts">
import LandsLogo from '@/assets/LandsLogo.vue';

</script>

<template>
    <header>
        <div><LandsLogo/>Lands</div>
        <nav>
            <a href="#features">Features</a>
            <a href="#features">Templates</a>
            <a href="#features">Pricing</a>
            <a href="#features">About</a>
        </nav>
        <RouterLink to="/auth">Start now</RouterLink>
    </header>
</template>

<style scoped>
    header {
        position: sticky;
        top: 1em;
        left: auto;
        right: auto;
        margin: auto;
        max-width: 50em;
        border: 1px solid rgba(128, 128, 128, 0.12);
        display: grid;
        grid-template-columns: 0.5fr 1fr 0.5fr;
        justify-content: space-between;
        padding: 1em 1.5em;
        border-radius: 3em;
        backdrop-filter: blur(8px);
        background: #ffffffd5;
        > div {
            display: flex;
            align-items: center;
            gap: 0.25em;
            align-self: center;
            justify-self: start;
            > svg {
                height: 1em;
            }
        }
        > nav {
            display: flex;
            align-items: center;
            gap: 1em;
            align-self: center;
            justify-self: center;
        }
        > a {
            align-self: center;
            justify-self: end;
            background: black;
            color: white;
            padding: 0 1em;
            border-radius: 1em;
        }
    }
</style>