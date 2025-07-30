export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  
  const now = new Date()
  const past = new Date(timestamp)
  const diffInSeconds = Math.floor((now - past) / 1000)
  
  const timeUnits = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 }
  ]
  
  if (diffInSeconds < 60) return 'just now'
  
  for (const { unit, seconds } of timeUnits) {
    const count = Math.floor(diffInSeconds / seconds)
    if (count >= 1) {
      return count === 1 ? `1 ${unit} ago` : `${count} ${unit}s ago`
    }
  }
  
  return 'just now'
}

export function getCurrentTimestamp() {
  return new Date().toISOString()
}