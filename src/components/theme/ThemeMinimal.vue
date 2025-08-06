<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  aiStyles: {
    type: String,
    default: ''
  }
})

const activeTab = ref('home')

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'shows', label: 'Shows' },
  { id: 'releases', label: 'Releases' },
  { id: 'about', label: 'About' },
  { id: 'merch', label: 'Merch' },
  { id: 'contact', label: 'Contact' }
]

const themeStyles = computed(() => {
  const design = props.project?.design || {}
  return {
    '--spacing': '1rem',
    '--background-color': design.backgroundColor || '#ffffff',
    '--text-color': design.textColor || '#333333',
    '--accent-color': design.accentColor || '#007acc',
    '--title-font': design.titleFont ? `'${design.titleFont}', sans-serif` : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '--text-font': design.textFont ? `'${design.textFont}', sans-serif` : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
})

const projectTitle = computed(() => props.project?.name || 'Project Title')
const projectDescription = computed(() => props.project?.description || 'Project description goes here...')
const projectCover = computed(() => props.project?.cover_image || '')

const releases = computed(() => props.project?.releases || [])
const shows = computed(() => props.project?.shows || [])
const merch = computed(() => props.project?.merch || [])
const socials = computed(() => props.project?.socials || [])

const latestRelease = computed(() => releases.value[0] || null)
const limitedShows = computed(() => shows.value.slice(0, 3))
const limitedMerch = computed(() => merch.value.slice(0, 4))

function setActiveTab(tabId) {
  activeTab.value = tabId
}

onMounted(() => {
  if (!props.aiStyles) return

  const match = props.aiStyles.match(/<style scoped>([\s\S]*?)<\/style>/)
  if (!match?.[1]) return

  let css = match[1]

  // ⚠️ Scope everything under `.minimal-theme` (this is critical)
  css = css.replace(/(^|\})\s*([^{\s][^{]*)\s*\{/g, (full, brace, selector) => {
    selector = selector.trim()

    // Handle :root separately — move vars to .minimal-theme
    if (selector === ':root') return `${brace} .minimal-theme {`

    // Already scoped? leave it
    if (selector.startsWith('.minimal-theme')) return full

    return `${brace} .minimal-theme ${selector} {`
  })

  // Inject CSS
  const style = document.createElement('style')
  style.id = 'theme-minimal-style'
  style.type = 'text/css'
  style.innerHTML = css

  // Remove old style if exists
  const old = document.getElementById('theme-minimal-style')
  if (old) old.remove()

  document.head.appendChild(style)
})




</script>

<template>
  <div class="minimal-theme">
    <header>
      <div class="cover">
        <img v-if="projectCover" :src="projectCover" :alt="projectTitle" />
        <div v-else class="cover-placeholder">
          Basic details cover image
        </div>
      </div>
      <h1>{{ projectTitle }}</h1>
    </header>

    <nav>
      <ul>
        <li 
          v-for="item in navItems" 
          :key="item.id"
          :class="{ active: activeTab === item.id }"
          @click="setActiveTab(item.id)"
        >
          {{ item.label }}
        </li>
      </ul>
    </nav>

    <main>
      <!-- Home Tab - Overview -->
      <div v-if="activeTab === 'home'" class="tab-content">
        <ul class="about">
          <li class="content">{{ projectDescription }}</li>
          <li class="action" @click="setActiveTab('about')">See more</li>
        </ul>

        <ul class="shows" v-if="limitedShows.length > 0">
          <li class="content">
            <div v-for="show in limitedShows" :key="show.id" class="show-item">
              <span class="date">{{ show.date }}</span>
              <span class="venue">{{ show.venue }}</span>
              <span class="location">{{ show.location }}</span>
            </div>
          </li>
          <li class="action" @click="setActiveTab('shows')">See all</li>
        </ul>

        <ul class="releases" v-if="latestRelease">
          <li class="content">
            <div class="release-item">
              <img v-if="latestRelease.img" :src="latestRelease.img" :alt="latestRelease.name" />
              <div class="release-info">
                <h3>{{ latestRelease.name }}</h3>
                <p>{{ latestRelease.description }}</p>
              </div>
            </div>
          </li>
          <li class="action" @click="setActiveTab('releases')">See all</li>
        </ul>

        <ul class="merch" v-if="limitedMerch.length > 0">
          <li class="content">
            <div class="merch-grid">
              <div v-for="item in limitedMerch" :key="item.id" class="merch-item">
                <img v-if="item.img" :src="item.img" :alt="item.name" />
                <div class="merch-info">
                  <h4>{{ item.name }}</h4>
                  <span class="price">{{ item.price }}</span>
                </div>
              </div>
            </div>
          </li>
          <li class="action" @click="setActiveTab('merch')">See all</li>
        </ul>
      </div>

      <!-- Shows Tab -->
      <div v-else-if="activeTab === 'shows'" class="tab-content">
        <ul class="shows-list">
          <li v-for="show in shows" :key="show.id" class="show-item">
            <div class="show-date">{{ show.date }}</div>
            <div class="show-details">
              <h3>{{ show.venue }}</h3>
              <p>{{ show.location }}</p>
            </div>
            <div class="show-action">
              <a v-if="show.link" :href="show.link" target="_blank">Tickets</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Releases Tab -->
      <div v-else-if="activeTab === 'releases'" class="tab-content">
        <ul class="releases-list">
          <li v-for="release in releases" :key="release.id" class="release-item">
            <img v-if="release.img" :src="release.img" :alt="release.name" />
            <div class="release-info">
              <h3>{{ release.name }}</h3>
              <p>{{ release.description }}</p>
              <div class="release-links">
                <a v-if="release.spotify" :href="release.spotify" target="_blank">Spotify</a>
                <a v-if="release.apple" :href="release.apple" target="_blank">Apple Music</a>
                <a v-if="release.youtube" :href="release.youtube" target="_blank">YouTube</a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- About Tab -->
      <div v-else-if="activeTab === 'about'" class="tab-content">
        <div class="about-content">
          <p>{{ projectDescription }}</p>
          <ul class="socials" v-if="socials.length > 0">
            <li v-for="social in socials" :key="social.id">
              <a :href="social.link" target="_blank">{{ social.platform }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Merch Tab -->
      <div v-else-if="activeTab === 'merch'" class="tab-content">
        <ul class="merch-list">
          <li v-for="item in merch" :key="item.id" class="merch-item">
            <img v-if="item.img" :src="item.img" :alt="item.name" />
            <div class="merch-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="merch-price">{{ item.price }}</div>
              <a v-if="item.link" :href="item.link" target="_blank" class="buy-button">Buy Now</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Contact Tab -->
      <div v-else-if="activeTab === 'contact'" class="tab-content">
        <div class="contact-content">
          <p>Get in touch</p>
          <ul class="contact-links">
            <li v-for="social in socials" :key="social.id">
              <a :href="social.link" target="_blank">{{ social.platform }}</a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

