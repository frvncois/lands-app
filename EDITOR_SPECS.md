

# 📘 `EDITOR_SPEC.md`

## Lands Page Builder — Editor & Styling System Specification

> **Status:** Canonical
> **Audience:** Core contributors only
> **Goal:** Preserve consistency, prevent schema drift, and stop ad-hoc exceptions

---

## 1. Core Mental Model

The Lands editor is built on **three structural primitives**:

| Primitive   | Description                          | Nesting Rules              |
| ----------- | ------------------------------------ | -------------------------- |
| **Section** | Top-level layout and content unit    | Cannot be nested           |
| **Group**   | Repeater collection inside a section | Must live inside a Section |
| **Child**   | Individual item inside a Group       | Must live inside a Group   |

### Invariants

* Sections do **not** nest
* Groups do **not** exist outside Sections
* Children do **not** exist outside Groups
* Children **never** own visual styles

---

## 2. Styling Scopes & Responsibilities

Styling is intentionally split across **three scopes**.

| Scope            | Owns                               | Can Override     |
| ---------------- | ---------------------------------- | ---------------- |
| **Section**      | Background, container spacing X/Y  | Theme defaults   |
| **Group**        | Space between items                | Section defaults |
| **Shared Child** | ALL visuals of children in a Group | Group + Section  |
| **Field**        | Visuals of non-repeater fields     | Section + Theme  |

### Critical Rule

> **There is NO per-child styling.**
> All children inside a Group share the same visual styles.

---

## 3. Selection → StyleInspector Contract

Selection determines **which scope can be edited**.

| Selected Entity        | Inspector Shows                    |
| ---------------------- | ---------------------------------- |
| Section                | Section-level styles only          |
| Group (no item active) | Group styles + Shared Child styles |
| Child (item selected)  | Content fields ONLY                |
| Field (non-repeater)   | Field-level styles                 |

If a child is selected and style controls appear → **this is a bug**.

---

## 4. Section Schema

Each section declares:

* Allowed layouts
* Section-level styles
* Allowed Groups
* Special constraints (if any)

| Section     | Layouts                               | Section Styles              | Groups                  |
| ----------- | ------------------------------------- | --------------------------- | ----------------------- |
| Hero        | overlay, split, stacked, presentation | bgColor, spacingX, spacingY | buttons                 |
| Cards       | grid, row, carousel, split            | bgColor, spacingX, spacingY | items                   |
| Products    | grid, row, carousel, split            | bgColor, spacingX, spacingY | items                   |
| Accordion   | list, split                           | bgColor, spacingX, spacingY | items                   |
| Links       | grid, split, stacked                  | bgColor, spacingX, spacingY | items                   |
| **Contact** | stacked, split                        | bgColor, spacingX, spacingY | formFields, socialLinks |
| CTA         | split, stacked                        | bgColor, spacingX, spacingY | buttons                 |
| Gallery     | grid, carousel, masonry               | bgColor, spacingX, spacingY | items                   |
| Header      | fixed                                 | bgColor, spacingX, spacingY | navigation              |
| Footer      | fixed                                 | bgColor, spacingX, spacingY | links                   |
| Text        | fixed                                 | bgColor, spacingX, spacingY | —                       |
| Media-Text  | split, stacked                        | bgColor, spacingX, spacingY | —                       |

---

## 5. Group Schema

Groups are **repeaters** and own:

* Spacing between items
* Shared child visuals

| Group             | Parent Section(s) | Shared Child Styles |
| ----------------- | ----------------- | ------------------- |
| items (Cards)     | cards             | card*               |
| items (Products)  | products          | product*            |
| items (Accordion) | accordion         | accordion*          |
| items (Links)     | links             | link*               |
| formFields        | contact           | formInput*          |
| socialLinks       | contact           | link*               |
| buttons           | hero, cta         | button*             |
| navigation        | header            | navLink*            |
| links             | footer            | footerLink*         |

### Naming Note

The group key `items` is **scoped by section type**.
This is intentional but must not leak across sections.

---

## 6. Child Rules (NON-NEGOTIABLE)

| Rule                                             | Status |
| ------------------------------------------------ | ------ |
| Children are deletable (unless explicitly fixed) | ✅      |
| Children have content only                       | ✅      |
| Children never expose style controls             | ✅      |
| Children inherit Group shared styles             | ✅      |

If a feature requires per-item visuals → it **must not** be a Group child.

---

## 7. Style Storage Model

### Section Styles

Stored at top level:

```ts
sectionStyles.sectionBackgroundColor
sectionStyles.sectionSpacingX
sectionStyles.sectionSpacingY
```

### Group Styles

Stored nested:

```ts
sectionStyles.{groupKey}Group.spaceBetween
```

### Shared Child Styles

Stored flat, prefixed:

```ts
cardPaddingX
productBorderColor
linkLabelFontSize
formInputFontSize
```

> Flat storage is historical. Resolvers abstract this away.
> Do NOT access style keys directly in components.

---

## 8. Resolver Functions (Authoritative)

All styles must pass through resolvers:

| Scope          | Resolver                       |
| -------------- | ------------------------------ |
| Section        | `resolveSectionStyles()`       |
| Group          | `resolveRepeaterGroupStyles()` |
| Shared Child   | `resolveShared*Styles()`       |
| Field (Text)   | `getTextStyle()`               |
| Field (Button) | `getButtonStyle()`             |

Resolvers must:

* Be pure
* Have no side effects
* Return partial style objects only

---

## 9. Contact Section — Explicit Exceptions

### Structure

* Headline (field)
* Subheadline (field)
* Paragraphs (field array, fixed count)
* **Form Group** (`formFields`)
* **Social Links Group** (`socialLinks`)
* **Submit Button** (field)

### Submit Button Exception

The Contact submit button:

* Is a **field**, not a Group child
* Uses `getButtonStyle()`
* Cannot be deleted
* Can be hidden
* Is always rendered after `formFields`

This creates **two valid button systems**:

1. Repeater buttons → shared child styles
2. Singular buttons → field-level styles

This is intentional and documented.

---

## 10. Style UI Groupings (Inspector)

When editing **Shared Child styles**, controls are grouped visually:

* Spacing
* Borders
* Background
* Media
* Headline
* Subheadline
* Paragraph
* Button
* Label
* Description
* Typography (Form inputs)

UI labels may differ from schema keys, but **must not change semantics**.

---

## 11. Hard Invariants (Do Not Break)

1. ❌ No per-child styling
2. ❌ No inline styles in render components
3. ❌ No section-specific styling pipelines
4. ❌ No StyleInspector logic based on assumptions
5. ❌ No “temporary” exceptions

Violating any of these requires:

* Updating this spec
* Explicit justification
* Versioned migration plan

---

## 12. Contribution Checklist (MANDATORY)

Before adding or modifying a section:

* [ ] Does it fit Section → Group → Child?
* [ ] Are visuals owned by Group or Field?
* [ ] Are styles resolved via existing resolvers?
* [ ] Does StyleInspector selection behave correctly?
* [ ] Does this violate any invariant above?

If unsure → stop.

---

## Final Note

This editor is **intentionally restrictive**.
That is a feature, not a limitation.

Consistency > flexibility
Predictability > cleverness
Boring systems scale.

---

**END OF SPEC**
