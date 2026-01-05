/**
 * Generates unique class names for published HTML elements.
 * Format: {prefix}_{4-digit-id} or {parent}_{child}
 *
 * Usage:
 *   const gen = new ClassGenerator()
 *   gen.create('header')        // → "header_3847"
 *   gen.child('header_3847', 'inner')  // → "header_3847_inner"
 *   gen.child('header_3847', 'title')  // → "header_3847_title"
 */

export class ClassGenerator {
  private usedIds: Set<string> = new Set()

  create(prefix: string): string {
    let id: string
    let className: string

    do {
      id = String(Math.floor(1000 + Math.random() * 9000))
      className = `${prefix}_${id}`
    } while (this.usedIds.has(className))

    this.usedIds.add(className)
    console.log('[CLASS_GEN] Created class:', className)
    return className
  }

  child(parentClass: string, childName: string): string {
    const className = `${parentClass}_${childName}`
    this.usedIds.add(className)
    return className
  }

  reset(): void {
    this.usedIds.clear()
  }
}
