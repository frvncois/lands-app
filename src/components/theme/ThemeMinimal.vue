<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const activeTab = ref('home')

// REMOVED THE DEEP WATCHER - this was causing the infinite loop
// Instead, use computed properties for reactivity without triggering watchers

// Navigation items
const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'shows', label: 'Shows' },
  { id: 'releases', label: 'Releases' },
  { id: 'about', label: 'About' },
  { id: 'merch', label: 'Merch' },
  { id: 'contact', label: 'Contact' }
]

// Computed styles using project design colors and fonts
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

// Computed data from project - Vue's reactivity handles updates automatically
const projectTitle = computed(() => props.project?.name || 'Project Title')
const projectDescription = computed(() => props.project?.description || 'Project description goes here...')
const projectCover = computed(() => props.project?.cover_image || '')

const releases = computed(() => props.project?.releases || [])
const shows = computed(() => props.project?.shows || [])
const merch = computed(() => props.project?.merch || [])
const socials = computed(() => props.project?.socials || [])

// Get latest release
const latestRelease = computed(() => releases.value[0] || null)

// Get limited items for home view
const limitedShows = computed(() => shows.value.slice(0, 3))
const limitedMerch = computed(() => merch.value.slice(0, 4))

function setActiveTab(tabId) {
  activeTab.value = tabId
}
</script>

<template>
  <div class="minimal-theme" :style="themeStyles">
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

<style scoped>
.minimal-theme {
  /* CSS variables will be set dynamically from project design */
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: var(--text-font);
  min-height: 100vh;
}

header {
  text-align: center;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.cover {
  width: 100%;
  height: 30vh;
  margin-bottom: var(--spacing);
  overflow: hidden;
  background: var(--dark);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-style: italic;
}

header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

nav {
  padding: var(--spacing);
  border-bottom: 1px solid #eee;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: calc(var(--spacing) * 2);
  justify-content: center;
}

nav li {
  cursor: pointer;
  padding: calc(var(--spacing) / 2) var(--spacing);
  border-radius: 4px;
  transition: all 0.2s ease;
}

nav li:hover {
  background-color: #f5f5f5;
}

nav li.active {
  background-color: var(--accent-color);
  color: white;
}

main {
  padding: var(--spacing);
  max-width: 1200px;
  margin: 0 auto;
}

.tab-content > ul {
  list-style: none;
  margin: 0 0 calc(var(--spacing) * 2) 0;
  padding: 0;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.tab-content > ul li.content {
  padding: var(--spacing);
}

.tab-content > ul li.action {
  padding: calc(var(--spacing) / 2) var(--spacing);
  background-color: #f9f9f9;
  color: var(--accent-color);
  cursor: pointer;
  text-align: center;
  border-top: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.tab-content > ul li.action:hover {
  background-color: #f0f0f0;
}

/* Home tab specific styles */
.show-item, .show-full {
  display: flex;
  gap: var(--spacing);
  padding: calc(var(--spacing) / 2) 0;
  border-bottom: 1px solid #eee;
}

.show-item:last-child, .show-full:last-child {
  border-bottom: none;
}

.date {
  font-weight: 600;
  min-width: 100px;
}

.venue {
  font-weight: 500;
  flex: 1;
}

.location {
  color: #666;
}

.release-item, .release-full {
  display: flex;
  gap: var(--spacing);
  align-items: center;
}

.release-item img, .release-full img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.release-full img {
  width: 150px;
  height: 150px;
}

.release-info h3, .release-details h3 {
  margin: 0 0 calc(var(--spacing) / 2) 0;
  font-size: 1.2rem;
}

.release-info p, .release-details p {
  margin: 0;
  color: #666;
}

.merch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing);
}

.merch-item, .merch-full {
  text-align: center;
}

.merch-item img, .merch-full img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: calc(var(--spacing) / 2);
}

.merch-full {
  display: flex;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
  padding-bottom: var(--spacing);
  border-bottom: 1px solid #eee;
}

.merch-full img {
  width: 150px;
  height: 150px;
}

.contact-links, .social-links {
  display: flex;
  gap: var(--spacing);
  flex-wrap: wrap;
}

.contact-links a, .social-links a {
  color: var(--accent-color);
  text-decoration: none;
  padding: calc(var(--spacing) / 2) var(--spacing);
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.contact-links a:hover, .social-links a:hover {
  background-color: var(--accent-color);
  color: white;
}

/* Full tab styles */
.tab-content h2 {
  margin: 0 0 var(--spacing) 0;
  font-size: 1.8rem;
  color: var(--accent-color);
}

.shows-list, .releases-list, .merch-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.tracks {
  margin-top: var(--spacing);
}

.tracks h4 {
  margin: 0 0 calc(var(--spacing) / 2) 0;
  font-size: 1rem;
}

.tracks ol {
  margin: 0;
  padding-left: var(--spacing);
}

.tracks li {
  padding: calc(var(--spacing) / 4) 0;
}

.price {
  font-weight: 600;
  color: var(--accent-color);
  font-size: 1.2rem;
}

.tickets a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
}

.tickets a:hover {
  text-decoration: underline;
}
</style>