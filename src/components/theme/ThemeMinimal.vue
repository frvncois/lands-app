<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const activeTab = ref('home')

// Watch for project changes and log them
watch(() => props.project, (newProject) => {
  console.log('🎨 ThemeMinimal: Project updated', {
    id: newProject?.id,
    name: newProject?.name,
    hascover_image: !!newProject?.cover_image,
    cover_imageLength: newProject?.cover_image?.length || 0
  })
}, { deep: true })

// Watch specifically for cover_image changes
watch(() => props.project?.cover_image, (newcover_image, oldcover_image) => {
  console.log('🖼️ ThemeMinimal: Cover image changed', {
    old: oldcover_image ? 'had image' : 'no image',
    new: newcover_image ? 'has image' : 'no image',
    newLength: newcover_image?.length || 0
  })
})

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

// Navigation items
const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'shows', label: 'Shows' },
  { id: 'releases', label: 'Releases' },
  { id: 'about', label: 'About' },
  { id: 'merch', label: 'Merch' },
  { id: 'contact', label: 'Contact' }
]

// Computed data from project - with explicit reactivity
const projectTitle = computed(() => {
  const title = props.project?.name || 'Project Title'
  console.log('🏷️ ThemeMinimal: projectTitle computed:', title)
  return title
})

const projectDescription = computed(() => props.project?.description || 'Project description goes here...')

const projectCover = computed(() => {
  const cover = props.project?.cover_image || ''
  console.log('🖼️ ThemeMinimal: projectCover computed:', cover ? 'has image' : 'no image')
  return cover
})

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
          <!-- Debug info -->
          <small style="display: block; font-size: 10px; margin-top: 4px;">
            Debug: {{ projectCover ? 'Has image' : 'No image' }}
          </small>
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
                <span>{{ item.name }}</span>
              </div>
            </div>
          </li>
          <li class="action" @click="setActiveTab('merch')">See all</li>
        </ul>

        <ul class="contact">
          <li class="content">
            <div class="contact-links">
              <a v-for="social in socials" :key="social.id" :href="social.url" target="_blank">
                {{ social.name }}
              </a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Shows Tab -->
      <div v-if="activeTab === 'shows'" class="tab-content">
        <h2>All Shows</h2>
        <div v-if="shows.length > 0" class="shows-list">
          <div v-for="show in shows" :key="show.id" class="show-full">
            <span class="date">{{ show.date }}</span>
            <span class="venue">{{ show.venue }}</span>
            <span class="location">{{ show.location }}</span>
            <span class="tickets" v-if="show.ticketUrl">
              <a :href="show.ticketUrl" target="_blank">Tickets</a>
            </span>
          </div>
        </div>
        <p v-else>No shows scheduled</p>
      </div>

      <!-- Releases Tab -->
      <div v-if="activeTab === 'releases'" class="tab-content">
        <h2>All Releases</h2>
        <div v-if="releases.length > 0" class="releases-list">
          <div v-for="release in releases" :key="release.id" class="release-full">
            <img v-if="release.img" :src="release.img" :alt="release.name" />
            <div class="release-details">
              <h3>{{ release.name }}</h3>
              <p>{{ release.description }}</p>
              <div v-if="release.tracks" class="tracks">
                <h4>Tracks:</h4>
                <ol>
                  <li v-for="track in release.tracks" :key="track.number">
                    {{ track.title }} <span v-if="track.length">({{ track.length }})</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <p v-else>No releases available</p>
      </div>

      <!-- About Tab -->
      <div v-if="activeTab === 'about'" class="tab-content">
        <h2>About</h2>
        <div class="about-content">
          <p>{{ projectDescription }}</p>
        </div>
      </div>

      <!-- Merch Tab -->
      <div v-if="activeTab === 'merch'" class="tab-content">
        <h2>Merchandise</h2>
        <div v-if="merch.length > 0" class="merch-list">
          <div v-for="item in merch" :key="item.id" class="merch-full">
            <img v-if="item.img" :src="item.img" :alt="item.name" />
            <div class="merch-details">
              <h3>{{ item.name }}</h3>
              <p v-if="item.description">{{ item.description }}</p>
              <span class="price" v-if="item.price">${{ item.price }}</span>
            </div>
          </div>
        </div>
        <p v-else>No merchandise available</p>
      </div>

      <!-- Contact Tab -->
      <div v-if="activeTab === 'contact'" class="tab-content">
        <h2>Contact</h2>
        <div class="contact-full">
          <div v-if="socials.length > 0" class="social-links">
            <h3>Find us on:</h3>
            <a v-for="social in socials" :key="social.id" :href="social.url" target="_blank">
              {{ social.name }}
            </a>
          </div>
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