# FREEZE.md

> ⚠️ STATUS
> This document describes the **V2 frozen architecture**.
> It is retained for historical reference.
> The project is currently in Active Refactor Mode (V3).

This document defines the architectural freeze for Lands V2. It is the authoritative reference for contributors, auditors, and AI assistants working on this codebase.

---

## V2 Section System Freeze

The Lands V2 section architecture is **frozen**.

This freeze is intentional and enforced. The section system has been audited, cleaned, and locked to prevent architectural drift, feature creep, and technical debt accumulation.

The freeze applies to all development work on the V2 codebase. No exceptions are permitted without a full system audit.

---

## Approved Sections (Source of Truth)

The following 14 sections are the ONLY permitted section types in V2:

1. header
2. hero
3. media-text
4. text
5. cards
6. links
7. accordion
8. cta
9. subscribe
10. contact
11. gallery
12. footer
13. logoList
14. promo

**No other sections are permitted in V2.**

These sections are defined in `src/lib/section-registry.ts`. The registry is the single source of truth.

---

## What Is Frozen

The following elements of the V2 architecture are frozen and must not be modified:

### Section Registry
- The list of section types
- Section type identifiers
- Section display names
- Section icons

### Variants
- The variants defined for each section
- Variant identifiers
- Default variants per section

### Content Schemas
- Field definitions for each section
- Field types (text, richText, image, media, url, link, boolean, select, repeater)
- Field keys and labels
- Repeater item schemas
- Use-case-specific schemas (e.g., accordion)

### Style Options
- Global style options (`_global` key)
- Per-variant style options
- Layout options for carousel-based sections
- Option keys, types, and allowed values

### Inspector Behavior
- Content fields appear in SectionList sidebar
- Design fields appear in StyleInspector
- Button fields appear when button is active
- Field categories determine placement

### Storage Rules
- Content data stored in `section.data`
- Variant stored in `section.variant`
- Style options stored in `section.styles`
- Field style overrides stored in `section.fieldStyles`
- Item styles stored in `section.itemStyles`

---

## Rules That Must Never Be Broken

### No New Sections
Adding a new section type to V2 is **forbidden**. The 14 approved sections cover all use cases for V2. New section types must be developed in a V3 branch.

### No Variant Creep
Adding new variants to existing sections is **forbidden**. Each section has been designed with a specific set of variants. Adding variants without audit creates inconsistency.

### No Schema Modifications
Changing field schemas is **forbidden**. Field types, keys, and structures must remain stable. Changing schemas breaks existing project data.

### No Inspector UI Without Schema
Every inspector control must be backed by a schema field or style option. Orphaned UI that references non-existent data fields is **forbidden**.

### No Dead Code
Commented-out code, unused types, orphaned components, and "temporary" workarounds are **forbidden**. If code is not used, it must be deleted.

### No Theme/Layout Mixing
Themes must never contain layout logic. Sections must never contain theme logic. The separation is absolute:
- Themes define HOW things look (tokens)
- Sections define WHAT things are (structure + content)
- Variants define HOW content is arranged (layout)

### No Convenience Exceptions
Breaking these rules for convenience is **never** acceptable. Every exception creates technical debt that compounds over time.

---

## How to Extend Safely

The freeze does not prevent all extension. The following approaches are permitted:

### Client-Specific Custom Blocks
Custom sections for specific clients must be:
- Namespaced (e.g., `client-acme-testimonials`)
- Isolated in separate directories
- Never merged into core V2

### Client-Specific Themes
Custom themes for specific clients are permitted. Themes are pure data and do not affect architecture.

### V3 Development
Major architectural changes belong in V3. V3 work must be:
- Developed in a separate branch
- Completely isolated from V2
- Subject to its own architectural review

**Core V2 must not be bent for convenience.**

---

## Audit Requirement

A **full system self-audit** is required before any of the following changes:

- Adding a section type
- Adding a variant
- Changing a schema
- Adding style options
- Modifying registry structure
- Changing inspector behavior
- Modifying storage format

The audit must verify:
1. All sections match approved list
2. All variants match registry definitions
3. All schemas are consistent
4. No orphaned types or dead code exist
5. Inspector UI matches schema definitions
6. Storage format is correct

The audit must produce a written report before any change is implemented.

---

## Final Warning

The Lands V2 freeze exists to protect the system.

Breaking freeze rules causes exponential complexity. Each architectural violation makes the next one easier to justify. Technical debt compounds. The codebase becomes unmaintainable.

Convenience is not a valid reason to break architecture.

If a requirement cannot be met within V2 constraints, the correct response is to plan for V3, not to compromise V2.

This freeze is final.
