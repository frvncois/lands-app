<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const activeTab = ref('home')
const isMenuOpen = ref(false)

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

// Helper function to convert storage paths to public URLs
function getImageUrl(imagePath) {
  if (!imagePath) return ''
  
  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a storage path (/projects/...), convert to public URL
  if (imagePath.startsWith('/projects/')) {
    const storagePath = imagePath.replace('/projects/', '')
    const { data } = supabase.storage
      .from('projects')
      .getPublicUrl(storagePath)
    
    return data.publicUrl
  }
  
  // If it's base64 or other format, return as-is
  return imagePath
}

// Computed data from project - Vue's reactivity handles updates automatically
const projectTitle = computed(() => props.project?.name || 'Project Title')
const projectDescription = computed(() => props.project?.description || 'Project description goes here...')
const projectCover = computed(() => getImageUrl(props.project?.cover_image))

const releases = computed(() => props.project?.releases || [])
const shows = computed(() => props.project?.shows || [])
const merch = computed(() => props.project?.merch || [])
const socials = computed(() => props.project?.socials || [])

// Get latest release with converted image URL
const latestRelease = computed(() => {
  const release = releases.value[0] || null
  if (!release) return null
  
  return {
    ...release,
    img: getImageUrl(release.img)
  }
})

// Get limited items for home view with converted image URLs
const limitedShows = computed(() => 
  shows.value.slice(0, 3).map(show => ({
    ...show,
    img: getImageUrl(show.img)
  }))
)
const limitedMerch = computed(() => 
  merch.value.slice(0, 4).map(item => ({
    ...item,
    img: getImageUrl(item.img)
  }))
)

// Convert show images for full shows list
const showsWithImages = computed(() =>
  shows.value.map(show => ({
    ...show,
    img: getImageUrl(show.img)
  }))
)

// Convert release images for full releases list
const releasesWithImages = computed(() =>
  releases.value.map(release => ({
    ...release,
    img: getImageUrl(release.img)
  }))
)

// Convert merch images for full merch list
const merchWithImages = computed(() =>
  merch.value.map(item => ({
    ...item,
    img: getImageUrl(item.img)
  }))
)

function setActiveTab(tabId) {
  activeTab.value = tabId
  isMenuOpen.value = false // Close menu when selecting tab
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div class="minimal-theme theme-isolation" :style="themeStyles">
    <header>
      <nav>
        <button class="burger-menu" @click="toggleMenu" :class="{ active: isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
      <ul class="nav-menu" :class="{ open: isMenuOpen }">
        <li 
          v-for="item in navItems" 
          :key="item.id"
          :class="{ active: activeTab === item.id }"
          @click="setActiveTab(item.id)"
        >
          {{ item.label }}
        </li>
      </ul>
      <div class="cover">
        <img v-if="projectCover" :src="projectCover" :alt="projectTitle" />
        <div v-else class="cover-placeholder">
          Basic details cover image
        </div>
      </div>

        <h1>{{ projectTitle }}</h1>
    </header>

    <main>
      <!-- Home Tab - Overview -->
      <div v-if="activeTab === 'home'" class="section">
        <div class="about">
          <div class="content">{{ projectDescription }}</div>
        </div>

        <div class="shows" v-if="limitedShows.length > 0">
          <div class="section-title">
            <h1>Upcoming shows</h1>
            <button class="action" @click="setActiveTab('shows')">See all</button>
          </div>
          <ul class="shows-list">
            <li v-for="show in limitedShows" :key="show.id" class="show-item">
              <img v-if="show.img" class="show-background" :src="show.img" :alt="show.venue" />
              <div class="show-header">
                <h2>{{ show.date }}</h2>
                <h3>{{ show.location }}</h3>
              </div>
              <div class="show-details">
                <h4>{{ show.venue }}</h4>
                <a>Details →</a>
              </div>
            </li>
          </ul>
        </div>

        <div class="release" v-if="latestRelease">
          <div class="section-title">
            <h1>Listen</h1>
            <button class="action" @click="setActiveTab('releases')">See all</button>
          </div>
          <div class="release-cover">
            <img v-if="latestRelease.img" :src="latestRelease.img" :alt="latestRelease.name" />
          </div>
          <div class="release-content">
            <div class="release-info">
              <h2>{{ latestRelease.name }}</h2>
              <p>{{ latestRelease.description }}</p>
            </div>
            <div class="release-links">
              <h3>Stream on</h3>
            </div>
            <div class="release-links">
              <h3>Buy now</h3>
            </div>
          </div>
          <img v-if="latestRelease.img" class="release-background" :src="latestRelease.img" :alt="latestRelease.name" />
        </div>

        <div class="merch" v-if="limitedMerch.length > 0">
          <div class="section-title">
            <h1>Merch</h1>
            <button class="action" @click="setActiveTab('merch')">See all</button>
          </div>
          <div class="merch-grid">
            <div v-for="item in limitedMerch" :key="item.id" class="merch-item">
              <img v-if="item.img" :src="item.img" :alt="item.name" />
              <div class="merch-info">
                <h4>{{ item.name }}</h4>
                <span class="price">{{ item.price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Shows Tab -->
      <div v-else-if="activeTab === 'shows'" class="section">
          <div class="section-title">
            <h1>Upcoming shows</h1>
          </div>
        <ul class="shows-list">
          <li v-for="show in showsWithImages" :key="show.id" class="show-item">
            <img v-if="show.img" :src="show.img" :alt="show.venue" />
            <div class="show-header">
              <h2>{{ show.date }}</h2>
              <h3>{{ show.location }}</h3>
            </div>
            <div class="show-details">
              <h4>{{ show.venue }}</h4>
              <a v-if="show.link" :href="show.link" target="_blank">Tickets</a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Releases Tab -->
      <div v-else-if="activeTab === 'releases'" class="section">
        <ul class="releases-list">
          <li v-for="release in releasesWithImages" :key="release.id" class="release-item">
            <div class="release-cover">
              <img v-if="release.img" :src="release.img" :alt="release.name" />
            </div>
            <div class="release-content">
              <div class="release-info">
                <h2>{{ release.name }}</h2>
                <p>{{ release.description }}</p>
              </div>
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
      <div v-else-if="activeTab === 'about'" class="section">
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
      <div v-else-if="activeTab === 'merch'" class="section">
        <ul class="merch-list">
          <li v-for="item in merchWithImages" :key="item.id" class="merch-item">
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
      <div v-else-if="activeTab === 'contact'" class="section">
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
/* CSS ISOLATION - Reset all inherited styles */
.theme-isolation {
  /* Reset all CSS properties to initial values */
  all: initial;
  
  /* Re-establish basic styling context */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background: #fff;
  
  /* Ensure box-sizing is border-box for all children */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
}

.minimal-theme {
  /* Establish new stacking context */
  position: relative;
  z-index: 0;
  
  /* Theme-specific styling */
  font-family: var(--text-font);
  color: var(--text-color);
  background-color: var(--background-color);
  min-height: 100vh;
  
  /* Prevent inheritance of parent margins/padding */
  margin: 0;
  border: none;
  outline: none;
}

header {
  display: flex;
  flex-direction: column;
  text-align: center;
}

nav {
  position: relative;
  display: flex;
  justify-content: flex-end;
  padding: 1em;
}

.cover {
  width: 75%;
  height: 50vh;
  margin: auto;
  overflow: hidden;
  border-radius: 10em;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

h1 {
  font-size: 2rem;
  font-family: var(--title-font);
}

/* Burger Menu Styles */
.burger-menu {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1000;
}

.burger-menu span {
  width: 25px;
  height: 2px;
  background: var(--text-color);
  margin: 2px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.burger-menu.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-menu.active span:nth-child(2) {
  opacity: 0;
}

.burger-menu.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Navigation Menu */
.nav-menu {
  background: white;
  list-style: none;
  padding: 0;
  margin: 0;
  visibility: hidden;
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 999;
  max-height: 0px;
}

.nav-menu.open {
  opacity: 1;
  max-height: 1000px;
  visibility: visible;
}

.nav-menu li {
  cursor: pointer;
  padding: 1em;
  border-bottom: 1px solid black;
  transition: all 0.2s ease;
  text-align: left;
}

.nav-menu li:hover {
  background: #f5f5f5;
}

.nav-menu li.active {
  background: black;
  color: white;
}

.section {
  flex: 1;
}

.section-title {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding: 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title h1 {
  font-size: 1.5rem;
}

.action {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-color);
  text-decoration: underline;
}

.about .content {
  padding: 4em 2em;
  text-align: center;
  background: rgb(244, 182, 223);
}

.shows {
  display: flex;
  flex-direction: column;
}

.shows-list {
  display: flex;
  flex-direction: column;
  padding: 3em 0;
  list-style: none;
  margin: 0;
}

.show-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1em;
  gap: 0.5em;
  overflow: hidden;
  > img {
    width: 100%;
  }
}

.show-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  filter: blur(10px);
  opacity: 0.3;
}

.show-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid black;
  padding-bottom: 0.5em;
}

.show-header h2, 
.show-header h3 {
  font-size: 1.5em;
  margin: 0;
}

.show-details {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.show-details h4 {
  font-size: 1.2em;
  margin: 0;
}

.release {
  position: relative;
  overflow: hidden;
}

.release-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  filter: blur(10em);
  opacity: 0.5;
}

.release-cover {
  overflow: hidden;
  padding: 1em;
}

.release-cover img {
  width: 100%;
  object-fit: cover;
  aspect-ratio: 1;
}

.release-content {
  padding: 0 1em;
}

.release-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 1em 0;
  border-bottom: 1px solid rgb(122, 107, 107);
}

.release-info h2 {
  margin: 0;
}

.release-info p {
  margin: 0;
}

.release-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 0;
  border-bottom: 1px solid rgb(122, 107, 107);
  gap: 1rem;
}

.release-links a {
  background: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 12px;
}

.merch {
  display: flex;
  flex-direction: column;
}

.merch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.merch-item {
  text-align: center;
}

.merch-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.merch-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 14px;
}

.price {
  font-weight: bold;
  color: var(--accent-color);
}

.releases-list, .merch-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.release-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
}

.release-item:last-child {
  border-bottom: none;
}

.release-item .release-cover img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.merch-list .merch-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  background: white;
}

.merch-list .merch-item:last-child {
  border-bottom: none;
}

.merch-list .merch-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.merch-price {
  font-weight: bold;
  color: var(--accent-color);
  margin: 0.5rem 0;
}

.buy-button {
  background: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  display: inline-block;
}

.about-content, .contact-content {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.socials, .contact-links {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.socials a, .contact-links a {
  background: var(--accent-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
}
</style>