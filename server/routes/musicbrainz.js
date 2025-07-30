// server/routes/musicbrainz.js
const express = require('express')
// Remove the node-fetch import - use built-in fetch in Node.js 18+
const router = express.Router()

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2'
const COVERART_BASE_URL = 'https://coverartarchive.org'

// Rate limiting
let lastRequestTime = 0
const RATE_LIMIT_DELAY = 1100

async function rateLimitedFetch(url) {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Lands.app/1.0 (contact@lands.app)'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// Search artist
router.get('/artist/search', async (req, res) => {
  try {
    const { query } = req.query
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' })
    }
    
    console.log('🎵 Searching for artist:', query)
    
    const encodedQuery = encodeURIComponent(query)
    const url = `${MUSICBRAINZ_BASE_URL}/artist?query=artist:${encodedQuery}&fmt=json&limit=10`
    
    const data = await rateLimitedFetch(url)
    res.json(data)
  } catch (error) {
    console.error('Error searching artist:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get artist details
router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🎵 Fetching artist details for ID:', id)
    
    const url = `${MUSICBRAINZ_BASE_URL}/artist/${id}?inc=releases+release-groups+recordings+url-rels&fmt=json`
    
    const data = await rateLimitedFetch(url)
    res.json(data)
  } catch (error) {
    console.error('Error fetching artist details:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get release details
router.get('/release/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🎵 Fetching release details for ID:', id)
    
    const url = `${MUSICBRAINZ_BASE_URL}/release/${id}?inc=recordings+artist-credits+release-groups+media&fmt=json`
    
    const data = await rateLimitedFetch(url)
    res.json(data)
  } catch (error) {
    console.error('Error fetching release details:', error)
    res.status(500).json({ error: error.message })
  }
})

// Get cover art
router.get('/coverart/:releaseId', async (req, res) => {
  try {
    const { releaseId } = req.params
    console.log('🎨 Fetching cover art for release ID:', releaseId)
    
    const url = `${COVERART_BASE_URL}/release/${releaseId}`
    
    const response = await fetch(url)
    if (!response.ok) {
      return res.status(404).json({ error: 'No cover art found' })
    }
    
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching cover art:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router