<script setup lang="ts">
import { computed } from 'vue';

const featureTitles = [
    'Link-in-bio',
    'Digital showcase',
    'Event promo',
    'Product landing',
    'Service page',
    'Presave page',
];

const marqueeItems = computed(() => [...featureTitles, ...featureTitles]);
const MARQUEE_DURATION = 16;

const marqueeStyles = computed(() => ({
    '--marquee-duration': `${MARQUEE_DURATION}s`,
}));
</script>

<template>
  <section>
    <div class="container">
      <div>
        <h2>Build better</h2>
        <div class="marquee-window">
          <ul
            class="marquee-track"
            :style="marqueeStyles"
          >
            <li
              v-for="(title, index) in marqueeItems"
              :key="`${title}-${index}`"
            >
              <p>{{ title }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
    section {
        background: black;
        color: white;
        padding-top: 30em;
        margin-top: -20em;
    }
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        max-width: 1800px;
        margin: auto;
        padding: 0 4em;
        > div {
            flex: 1;
            > h2, p {
                font-size: 10em;
                line-height: 1;
                text-transform: uppercase;
            }
            > .marquee-window {
                height: 10em;
                overflow: hidden;
                margin-bottom: 10em;
            }
            > .marquee-window > .marquee-track {
                list-style: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                animation: marquee-up var(--marquee-duration, 16s) linear infinite;
                will-change: transform;
            }
            > .marquee-window > .marquee-track > li {
                height: 10em;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            > .marquee-window > .marquee-track > li > p {
                margin: 0;
                width: 100%;
            }
        }
    }

    @keyframes marquee-up {
        from {
            transform: translateY(0);
        }
        to {
            transform: translateY(-50%);
        }
    }
</style>
