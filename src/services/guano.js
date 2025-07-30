// src/services/guano.js
// MusicBrainz API integration service (Backend Proxy Version)

const API_BASE_URL = 'http://localhost:3000/api/musicbrainz' // Your backend URL

// Search for artist by name
export async function searchArtist(artistName) {
  if (!artistName?.trim()) {
    throw new Error('Artist name is required')
  }
  
  console.log('🎵 Searching for artist:', artistName)
  
  try {
    const response = await fetch(`${API_BASE_URL}/artist/search?query=${encodeURIComponent(artistName.trim())}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.artists || []
  } catch (error) {
    console.error('Error searching artist:', error)
    throw error
  }
}

// Get detailed artist information including releases
export async function getArtistDetails(artistId) {
  console.log('🎵 Fetching artist details for ID:', artistId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/artist/${artistId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching artist details:', error)
    throw error
  }
}

// Get release details including tracks
export async function getReleaseDetails(releaseId) {
  console.log('🎵 Fetching release details for ID:', releaseId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/release/${releaseId}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching release details:', error)
    throw error
  }
}

// Get cover art for a release
export async function getCoverArt(releaseId) {
  console.log('🎨 Fetching cover art for release ID:', releaseId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/coverart/${releaseId}`)
    
    if (!response.ok) {
      console.log('No cover art found for release:', releaseId)
      return null
    }
    
    const data = await response.json()
    return data.images?.[0] || null // Return first image
  } catch (error) {
    console.error('Error fetching cover art:', error)
    return null
  }
}

// Transform MusicBrainz data to our project structure
export function transformToProjectData(artistData, releasesWithDetails = []) {
  const currentTime = new Date().toISOString()
  
  // Transform releases with tracks
  const transformedReleases = releasesWithDetails.map(release => {
    // Extract tracks from media
    const tracks = []
    if (release.media) {
      release.media.forEach(medium => {
        if (medium.tracks) {
          medium.tracks.forEach((track, index) => {
            tracks.push({
              number: track.number || (index + 1).toString(),
              title: track.title,
              length: track.length || null,
              recordingId: track.recording?.id || null
            })
          })
        }
      })
    }
    
    return {
      name: release.title || 'Untitled Release',
      url: `https://musicbrainz.org/release/${release.id}`,
      img: release.coverArt || '', // Cover art URL from previous fetch
      description: `Released: ${release.date || 'Unknown date'}`,
      tracks: tracks, // Add tracks array
      saved: true,
      createdAt: currentTime,
      updatedAt: null,
      musicbrainzId: release.id,
      musicbrainzType: 'release'
    }
  })
  
  // Transform social links from artist URLs
  const transformedSocials = []
  if (artistData.relations) {
    artistData.relations
      .filter(rel => rel.type === 'social network' || rel.type === 'official homepage')
      .forEach(rel => {
        if (rel.url?.resource) {
          transformedSocials.push({
            name: getSocialPlatformName(rel.url.resource),
            url: rel.url.resource,
            img: '',
            description: rel.type === 'official homepage' ? 'Official Website' : 'Social Media',
            saved: true,
            createdAt: currentTime,
            updatedAt: null,
            musicbrainzId: artistData.id,
            musicbrainzType: 'artist-relation'
          })
        }
      })
  }
  
  return {
    description: `${artistData.name} - Data imported from MusicBrainz`,
    releases: transformedReleases,
    socials: transformedSocials,
    musicbrainzData: {
      artistId: artistData.id,
      artistName: artistData.name,
      lastFetch: currentTime,
      type: artistData.type,
      country: artistData.country,
      lifeSpan: artistData['life-span']
    }
  }
}

// Helper function to determine social platform name
function getSocialPlatformName(url) {
  const domain = new URL(url).hostname.toLowerCase()
  
  if (domain.includes('facebook')) return 'Facebook'
  if (domain.includes('twitter') || domain.includes('x.com')) return 'Twitter/X'
  if (domain.includes('instagram')) return 'Instagram'
  if (domain.includes('youtube')) return 'YouTube'
  if (domain.includes('spotify')) return 'Spotify'
  if (domain.includes('bandcamp')) return 'Bandcamp'
  if (domain.includes('soundcloud')) return 'SoundCloud'
  if (domain.includes('apple.com/')) return 'Apple Music'
  if (domain.includes('last.fm')) return 'Last.fm'
  if (domain.includes('discogs')) return 'Discogs'
  
  return 'Website'
}

// Main function to fetch all data for an artist
export async function fetchArtistData(artistName) {
  console.log('🚀 Starting Guano fetch for:', artistName)
  
  try {
    // Step 1: Search for artist
    const searchResults = await searchArtist(artistName)
    
    if (!searchResults.length) {
      throw new Error(`No artists found for "${artistName}"`)
    }
    
    // Use first result or let user choose later
    const artist = searchResults[0]
    console.log('🎯 Selected artist:', artist.name, '(Score:', artist.score, ')')
    
    // Step 2: Get detailed artist info
    const artistDetails = await getArtistDetails(artist.id)
    
    // Step 3: Get releases (limit to avoid overwhelming the user)
    const releases = artistDetails.releases?.slice(0, 10) || []
    
    // Step 4: Fetch detailed release info with tracks and cover art
    const releasesWithDetails = []
    for (const release of releases) {
      console.log('🎵 Processing release:', release.title)
      
      // Fetch detailed release info (includes tracks)
      const releaseDetails = await getReleaseDetails(release.id)
      
      // Fetch cover art
      const coverArt = await getCoverArt(release.id)
      
      releasesWithDetails.push({
        ...releaseDetails,
        coverArt: coverArt?.image || null
      })
    }
    
    // Step 5: Transform to our project structure
    const projectData = transformToProjectData(artistDetails, releasesWithDetails)
    
    console.log('✅ Guano fetch completed successfully')
    console.log('📊 Imported:', {
      releases: projectData.releases.length,
      socials: projectData.socials.length
    })
    
    return {
      success: true,
      data: projectData,
      searchResults, // Include all search results for user selection
      selectedArtist: artist
    }
    
  } catch (error) {
    console.error('❌ Guano fetch failed:', error)
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}