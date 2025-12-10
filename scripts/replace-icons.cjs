const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '../src')

// Find all .vue and .ts files
function findFiles(dir, ext) {
  const files = []
  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, ext))
    } else if (ext.some(e => item.endsWith(e))) {
      files.push(fullPath)
    }
  }
  return files
}

// Replace <i class="lni lni-ICON ..."> with <Icon name="ICON" class="..." />
function replaceIcons(content) {
  // Pattern: <i class="lni lni-ICONNAME OPTIONAL_CLASSES"></i> or self-closing
  // Also handles: <i class="lni lni-ICONNAME OPTIONAL_CLASSES">

  let result = content

  // Replace patterns like: <i class="lni lni-home-2 text-lg"></i>
  // With: <Icon name="home-2" class="text-lg" />
  result = result.replace(
    /<i\s+class="lni\s+lni-([a-z0-9-]+)(?:\s+([^"]*))?"(?:\s*[^>]*)?>(?:<\/i>)?/g,
    (match, iconName, extraClasses) => {
      if (extraClasses && extraClasses.trim()) {
        return `<Icon name="${iconName}" class="${extraClasses.trim()}" />`
      }
      return `<Icon name="${iconName}" />`
    }
  )

  // Handle :class bindings with lni
  result = result.replace(
    /<i\s+:class="\['lni',\s*([^\]]+)\]"(?:\s*[^>]*)?>(?:<\/i>)?/g,
    (match, classExpr) => {
      // Extract icon name from expression like: iconSettings?.icon || 'lni-star-1'
      return `<Icon :name="${classExpr.replace(/lni-/g, '').replace(/'lni-([^']+)'/g, "'$1'")}" />`
    }
  )

  return result
}

// Process all files
const files = findFiles(srcDir, ['.vue', '.ts'])
let totalReplacements = 0

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8')
  const newContent = replaceIcons(content)

  if (content !== newContent) {
    const count = (content.match(/<i\s+class="lni/g) || []).length
    console.log(`${file}: ${count} replacements`)
    totalReplacements += count
    fs.writeFileSync(file, newContent)
  }
}

console.log(`\nTotal: ${totalReplacements} icons replaced`)
