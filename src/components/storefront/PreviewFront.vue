<script lang="ts">
</script>

<template>
    <section>
        <div class="preview">123</div>
        <div class=""></div>
    </section>
</template>

<style scoped>
    section {
        max-width: 1200px;
        margin: auto;
        padding: 0 4em;
    }
    h1 {
        font-size: 0.75em;
        text-transform: uppercase;
        border: 1px solid gray;
        border-radius: 3em;
        padding: 0 0.5em;
    }
    h2, h3 {
        font-size: 6em;
        line-height: 0.8;
        text-transform: uppercase;
    }
    p {
        max-width: 35ch;
        text-align: center;
    }
    .preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: black;
        aspect-ratio: 16 / 9;
        border-radius: 1em;
    }
</style>