// /utils/urlValidation.js

// Reserved route names for the app
export const RESERVED_ROUTES = [
  'admin',
  'api',
  'app',
  'auth',
  'login',
  'register',
  'signup',
  'signin',
  'dashboard',
  'settings',
  'profile',
  'account',
  'billing',
  'payment',
  'subscribe',
  'subscription',
  'plans',
  'pricing',
  'help',
  'support',
  'contact',
  'about',
  'terms',
  'privacy',
  'legal',
  'blog',
  'news',
  'faq',
  'docs',
  'documentation',
  'guide',
  'tutorial',
  'www',
  'mail',
  'email',
  'ftp',
  'cdn',
  'static',
  'assets',
  'public',
  'private',
  'secure',
  'ssl',
  'test',
  'testing',
  'dev',
  'development',
  'staging',
  'production',
  'demo',
  'preview',
  'beta',
  'alpha',
  'v1',
  'v2',
  'v3',
  'version',
  'release',
  'update',
  'download',
  'upload',
  'files',
  'images',
  'media',
  'video',
  'audio',
  'music',
  'player',
  'stream',
  'live',
  'broadcast',
  'feed',
  'rss',
  'xml',
  'json',
  'sitemap',
  'robots',
  'ads',
  'analytics',
  'tracking',
  'pixel',
  'tag',
  'script',
  'widget',
  'embed',
  'iframe',
  'frame',
  'window',
  'popup',
  'modal',
  'overlay',
  'notification',
  'alert',
  'error',
  '404',
  '500',
  'redirect',
  'forward',
  'proxy',
  'gateway',
  'bridge',
  'tunnel',
  'vpn',
  'ssh',
  'root',
  'administrator',
  'moderator',
  'user',
  'guest',
  'anonymous',
  'public',
  'home',
  'index',
  'main',
  'default',
  'landing',
  'welcome',
  'intro'
]

// Bad words/inappropriate content
export const BAD_WORDS = [
  'fraud',
  'scam',
  'phishing',
  'spam',
  'virus',
  'malware',
  'hack',
  'hacker',
  'torrent',
  'download',
]

// URL validation functions
export function validateUrl(url) {
  const errors = []
  const warnings = []
  
  // Basic format validation
  if (!url || url.trim() === '') {
    errors.push('URL is required')
    return { isValid: false, errors, warnings }
  }
  
  // Clean and normalize URL
  const cleanUrl = url.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
  
  // Length validation
  if (cleanUrl.length < 3) {
    errors.push('URL must be at least 3 characters long')
  }
  
  if (cleanUrl.length > 50) {
    errors.push('URL must be less than 50 characters long')
  }
  
  // Character validation
  if (!/^[a-z0-9-]+$/.test(cleanUrl)) {
    errors.push('URL can only contain letters, numbers, and hyphens')
  }
  
  // Cannot start or end with hyphen
  if (cleanUrl.startsWith('-') || cleanUrl.endsWith('-')) {
    errors.push('URL cannot start or end with a hyphen')
  }
  
  // Cannot have consecutive hyphens
  if (cleanUrl.includes('--')) {
    errors.push('URL cannot contain consecutive hyphens')
  }
  
  // Reserved routes check
  if (RESERVED_ROUTES.includes(cleanUrl)) {
    errors.push('This URL is reserved and cannot be used')
  }
  
  // Bad words check
  const foundBadWords = BAD_WORDS.filter(word => cleanUrl.includes(word))
  if (foundBadWords.length > 0) {
    errors.push('URL contains inappropriate content')
  }
  
  // Numeric only check
  if (/^\d+$/.test(cleanUrl)) {
    warnings.push('URLs with only numbers may be confusing for users')
  }
  
  // Single character check
  if (cleanUrl.length === 1) {
    warnings.push('Single character URLs may be hard to remember')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleanUrl
  }
}

export function checkUrlAvailability(url, existingProjects = []) {
  // This will be replaced with actual database check later
  const isAvailable = !existingProjects.some(project => 
    project.settings?.url?.toLowerCase() === url.toLowerCase()
  )
  
  return {
    available: isAvailable,
    message: isAvailable 
      ? 'URL is available' 
      : 'URL is already taken'
  }
}

export function generateUrlSuggestions(baseName, existingProjects = []) {
  const suggestions = []
  const cleanBase = baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Original
  suggestions.push(cleanBase)
  
  // With numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${cleanBase}${i}`)
    suggestions.push(`${cleanBase}-${i}`)
  }
  
  // With common suffixes
  const suffixes = ['music', 'band', 'artist', 'official', 'page', 'site']
  suffixes.forEach(suffix => {
    suggestions.push(`${cleanBase}-${suffix}`)
    suggestions.push(`${cleanBase}${suffix}`)
  })
  
  // Filter out taken URLs and validate
  return suggestions
    .filter(url => {
      const validation = validateUrl(url)
      const availability = checkUrlAvailability(url, existingProjects)
      return validation.isValid && availability.available
    })
    .slice(0, 5) // Return top 5 suggestions
}