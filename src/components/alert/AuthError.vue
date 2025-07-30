<script setup>
import AlertIcon from '@/assets/icons/AlertIcon.vue';
defineProps({
  message: String
})
</script>

<template>
  <li class="alert">
    <AlertIcon/>
    <p>{{ message }}</p>
  </li>
</template>

<style scoped>
li.alert {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    background: var(--alert);
    border: 1px solid var(--alert-border);
    padding: var(--space-md);
    text-align: center;
    border-radius: var(--radius-md);
    p {
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
        margin: 0;
    }
    svg {
        color: var(--alert-border);
    }
}
</style>