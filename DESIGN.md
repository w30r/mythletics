---
name: Mythletics
description: A living type specimen — training numbers set in one foundry face on near-black paper.
colors:
  primary: "oklch(0.72 0.12 78)"
  primary-foreground: "oklch(0.16 0.01 80)"
  background: "oklch(0.135 0.005 85)"
  foreground: "oklch(0.97 0.004 90)"
  card: "oklch(0.135 0.005 85)"
  card-foreground: "oklch(0.97 0.004 90)"
  popover: "oklch(0.155 0.005 85)"
  popover-foreground: "oklch(0.97 0.004 90)"
  muted: "oklch(0.205 0.006 85)"
  muted-foreground: "oklch(0.62 0.008 85)"
  secondary: "oklch(0.205 0.006 85)"
  secondary-foreground: "oklch(0.97 0.004 90)"
  accent: "oklch(0.205 0.006 85)"
  accent-foreground: "oklch(0.97 0.004 90)"
  border: "oklch(0.26 0.006 85)"
  input: "oklch(0.3 0.006 85)"
  ring: "oklch(0.72 0.12 78)"
  destructive: "oklch(0.637 0.208 25)"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
  heading:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.25em"
    textTransform: "uppercase"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.2em"
    textTransform: "uppercase"
rounded:
  none: "0"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.none}"
    padding: "8px 24px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "8px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "8px 24px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.none}"
    padding: "16px"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  wordmark:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "8px 10px"
---

# Design System: Mythletics

## Overview

**Creative North Star: "The Living Specimen"**

This is a type foundry made personal. Every surface in Mythletics reads like a working specimen sheet — near-black paper, ink-grey hairlines, and one gold foundry accent that appears only where it must. The dashboard is not a dashboard in the conventional sense; it is a foundry sheet of your training, where a giant letterform weights itself to your real numbers and the entire page is a typographic composition of your progress.

The aesthetic is high-contrast variable serif on dark ground: Bodoni Moda sets every display number and headline, Geist Mono sets every structural label in tracked uppercase caps, and Geist carries body text. Hierarchy comes from type scale alone — never from color weight or decorative flourish. There are no shadows, no gradients, no rounded corners. Depth is conveyed through tonal layering of near-black greys and 1px hairline rules that carve the page into ruled sections.

The visual world is deliberately restrained. Gold is used sparingly — a filled dot, a filled shape, raw text fill — and never as a border, stroke, outline, or gradient. The effect is one of quiet confidence: a dark sculptural surface where your real training data is the only ornament.

**Key Characteristics:**
- Near-black paper (oklch(0.135 0.005 85)) with ink-grey hairline rules and one gold accent (oklch(0.72 0.12 78))
- High-contrast variable display serif (Bodoni Moda, weight 100–900) for all display and headline text
- Tracked uppercase mono-caps (Geist Mono) for every structural label and section index
- Hierarchy from type scale alone, never color weight
- 1px hairline borders, sharp corners (radius 0), flat fills, no shadows
- Gold accent only as filled shapes or raw text fill — never as border, stroke, or gradient
- Tonal layering of near-black greys for depth (background, card, popover, muted surfaces)

## Colors

The palette is deliberately minimal: near-black paper, ink-grey structural tones, and one gold foundry accent. Every surface is a shade of near-black; every structural element is a step of warm grey; the only color is gold, and it appears only as filled shapes.

### Primary

- **Foundry Gold** (oklch(0.72 0.12 78)): The sole accent. Used for active navigation borders, the SpecimenHero weight readout, the AxisControl thumb and fill, section index numbers (01, 02, 03), the wordmark's inner display letter, and chart-1. Applied only as filled shapes or raw text fill — never as a border, stroke, outline, or gradient.
- **Gold Dark** (oklch(0.16 0.01 80)): The foreground color for gold-filled elements — text or icons rendered on top of the Foundry Gold fill.

### Neutral

- **Near-Black Paper** (oklch(0.135 0.005 85)): The base background for all surfaces — body, card, sidebar. The default ground of the entire system.
- **Off-White Ink** (oklch(0.97 0.004 90)): Primary text on any dark surface. Body copy, card text, display headings, nav labels.
- **Warm Popover** (oklch(0.155 0.005 85)): A slightly lifted surface for popovers and dropdown menus. One step lighter than paper.
- **Ink Grey** (oklch(0.205 0.006 85)): Secondary surfaces — muted backgrounds, card footers, inactive states. Also serves as secondary, muted, and accent backgrounds.
- **Muted Foreground** (oklch(0.62 0.008 85)): De-emphasized text — descriptions, labels, secondary information, status text.
- **Hairline Border** (oklch(0.26 0.006 85)): All structural borders, dividers, and ruled lines. A single pixel of warm grey that carves the page into sections.
- **Input Stroke** (oklch(0.3 0.006 85)): Input field borders — slightly lighter than hairline borders to distinguish interactive fields from structural rules.
- **Destructive** (oklch(0.637 0.208 25)): Error and destructive states — used sparingly for validation, danger actions, and destructive button variants.

### Named Rules

**The Filled-Only Rule.** Gold accent appears only as filled shapes or raw text fill — never as a border, stroke, outline, or gradient. Its rarity and solidity are the point.

**The Hairline Rule.** All rules and borders are exactly 1px. Sharp corners, no radius, no shadows, flat fills only. Depth is carved by lines, not lifted by surfaces.

## Typography

**Display Font:** Bodoni Moda (variable, weight 100–900) with Georgia fallback
**Body Font:** Geist with system-ui fallback
**Label/Mono Font:** Geist Mono with ui-monospace fallback

**Character:** A high-contrast didone serif paired with a geometric sans and a monospaced label face. The serif commands attention through sheer scale and weight variation; the mono face provides structural quiet. The combination reads as a foundry specimen — precise, deliberate, typographic.

### Hierarchy

- **Display** (weight 500, clamp(2.5rem, 7vw, 4.5rem), line-height 1): Hero headlines on the dashboard — "Dashboard", "Your training, set in one face." Rendered in Bodoni Moda at enormous scale.
- **Headline** (weight 500, clamp(1.5rem, 3vw, 2.25rem), line-height 1.1): Section headings — workout names, card titles. Still in Bodoni Moda, smaller but commanding.
- **Title** (weight 500, 1.5rem, line-height 1.25): Card titles — "Today's workout", "Recent sessions". Geist Mono for mono-caps structure, Bodoni for display titles.
- **Body** (weight 400, 0.875rem, line-height 1.5): Descriptions, explanatory text, card content. Geist, neutral and quiet.
- **Label** (weight 400, 0.75rem, letter-spacing 0.25em, uppercase): Section indices ("01", "02"), structural navigation, axis labels ("Streak", "Total time"). Geist Mono, tracked uppercase.
- **Mono** (weight 400, 0.6875rem, letter-spacing 0.2em, uppercase): Footer status bars, weight readouts, fine-grained metadata. Geist Mono, slightly smaller than Label.

### Named Rules

**The One Face Rule.** Every number the athlete owns — streak, reps, time, sessions, weight — is set in the display face (Bodoni Moda). No other display font appears on the surface. The variable weight axis is the only knob; scale and weight carry all hierarchy.

**The Scale Rule.** Hierarchy comes from type scale alone, never from color weight. A larger size always means a higher level. Color is reserved for accent (gold) and de-emphasis (muted-foreground), never for emphasis.

## Layout

The layout is a single-column composition on mobile, expanding to a two-column sidebar-plus-content arrangement on desktop (breakpoint at md/768px). The sidebar is 240px wide, ruled by a 1px hairline border on its right edge.

The dashboard page uses a vertical stack with generous vertical spacing (24–40px between sections). Each section is introduced by a `SectionLabel` — a gold mono-caps index number (01, 02, 03) followed by a tracked uppercase heading. Sections flow vertically: SpecimenHero, Today's Workout, Recent Sessions.

The SpecimenHero itself is a two-column grid on large screens (1.1fr / 1fr): the left column holds the headline, axis panel, and readout bar; the right column holds the ruled LetterBox with the weighted "M". On small screens it collapses to a single column.

The GlyphGrid is a 12-column hairline-ruled texture that runs full-width beneath the SpecimenHero. Each cell is a square, ruled by 1px borders that use the border color as a gap background, creating a grid of ink on paper.

Spacing rhythm: sections use 24px gaps, cards use 16px internal padding, nav links use 10px vertical / 16px left padding. The system favors generous negative space over density.

## Elevation & Depth

This system uses no shadows. Depth is conveyed entirely through tonal layering of near-black greys: the base paper (oklch(0.135 0.005 85)), the slightly lifted popover surface (oklch(0.155 0.005 85)), and the muted/secondary surfaces (oklch(0.205 0.006 85)). Each step is a subtle warm-grey lift that separates layers without lifting them off the page.

The 1px hairline border (oklch(0.26 0.006 85)) is the primary structural device — it carves ruled sections into the page like a specimen sheet's grid lines. There are no drop shadows, no box shadows, no backdrop blur. Flat fills only.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. No shadows appear at any state — hover, focus, active, or elevation. Depth is carved by tonal layering and ruled lines, never by lifting.

## Shapes

Every corner is sharp. The global radius is 0. There are no rounded corners on cards, buttons, inputs, navigation elements, or any other component. The visual language is rectangular and ruled — the foundry's grid of straight lines and right angles.

Borders are always 1px. The border color (oklch(0.26 0.006 85)) serves as the structural line throughout: card borders, section dividers, sidebar edge, GlyphGrid rules, input strokes. The only exception is the input stroke, which uses a slightly lighter value (oklch(0.3 0.006 85)) to distinguish interactive fields.

The one circular element in the system is the AxisControl slider thumb — a 14px gold dot. Its roundness is a deliberate counterpoint to the rigid geometry everywhere else: a single soft moment in a world of straight lines.

## Components

### Buttons

- **Shape:** Sharp corners (radius 0), 1px border.
- **Primary:** Foundry Gold fill (oklch(0.72 0.12 78)) with dark-on-gold text (oklch(0.16 0.01 80)). Padding: 8px 24px. Geist Mono, uppercase, tracked. Used for primary actions ("Start session", "Ask the AI coach").
- **Outline:** Transparent background, 1px hairline border, foreground text. Used for secondary actions ("Workout library", "Build a workout"). Hover fills with muted surface.
- **Ghost:** No background, no border. Foreground text. Used for navigation actions and sign-out. Hover fills with muted surface.
- **Focus:** 2px ring in gold (oklch(0.72 0.12 78)) with 50% opacity, offset 2px. Visible only on keyboard focus.
- **Active:** 1px translateY shift downward on press.

### Cards

- **Shape:** Sharp corners (radius 0), 1px hairline border.
- **Background:** Near-black paper (oklch(0.135 0.005 85)), same as page background — the card is defined by its ruled border, not by a lifted surface.
- **Border:** 1px Hairline Border (oklch(0.26 0.006 85)).
- **Internal Padding:** 16px (spacing-md).
- **Header:** Card titles in Bodoni Moda (font-heading, weight 500, 1rem). Descriptions in muted-foreground Geist.
- **Footer:** Muted surface background (oklch(0.205 0.006 85) at 50% opacity), 1px top border, 16px padding.

### Navigation

- **Style:** Vertical sidebar on desktop (240px), slide-out sheet on mobile. All navigation text is Geist Mono, uppercase, letter-spacing 0.2em.
- **Default:** Muted-foreground text, transparent background, no left border.
- **Active:** Foundry Gold text, 1px left border in gold, visible gold dot (6px circle) to the left of the label.
- **Hover:** Foreground text (off-white), muted background fill.
- **Mobile:** Full-height sheet from the left, same wordmark and nav links, 1px bottom border on the top bar.

### Wordmark

- **Shape:** A 32×32px bordered box containing a display "M" in Bodoni Moda (text-xl, foreground), beside tracked mono text "MYTHLETICS" (Geist Mono, text-sm, uppercase, letter-spacing 0.25em).
- **Border:** 1px Hairline Border on the M-box.
- **The M-box:** Near-black fill, gold "M" rendered at text-xl in the display face — the foundry's mark.

### SectionLabel

- **Index:** Gold mono-caps number ("01", "02", "03") in Geist Mono, text-xs, letter-spacing 0.15em, rendered in Foundry Gold.
- **Heading:** Tracked uppercase mono-caps in Geist Mono, text-sm, letter-spacing 0.3em, foreground text.
- **Composition:** Baseline-aligned flex row with 12px gap between index and heading.

### SpecimenHero

The signature component. A two-column composition: left column with headline, axis panel, and readout bar; right column with a ruled box containing a giant "M" that morphs its weight via the variable font axis.

- **LetterBox:** Full-width ruled container (1px border) holding a single "M" rendered at min(34vw, 420px) in Bodoni Moda. Weight is controlled by the slider (300–900). A mono-caps weight readout ("WGHT 485") sits in the top-right corner.
- **AxisControl:** A ruled panel (1px border, 20px padding) containing the axis label in mono-caps, the weight value in display gold, and a custom range slider (2px track, gold fill, 14px circular gold thumb).
- **ReadoutBar:** A full-width 1px top-and-bottom bordered strip with mono-caps metadata: weight value with gold dot, plus streak/total time/sessions/reps.
- **GlyphGrid:** A 12-column grid of 62 glyphs (A-Z, a-z, 0-9) rendered in Bodoni Moda at the current weight, muted-foreground at 50% opacity. Grid is formed by 1px border gaps on a border-colored background, each cell an aspect-square with near-black fill. Serves as decorative texture — a full specimen alphabet.

### Specimen Slider

- **Track:** 2px height, no border. Fill portion is Foundry Gold; unfilled portion is Hairline Border grey. Fill percentage is driven by CSS custom property `--fill`.
- **Thumb:** 14px circular (border-radius 9999px) Foundry Gold dot, no border. The only round shape in the system — a deliberate counterpoint to the rigid geometry.
- **Focus:** 2px outline in gold, offset 4px.

## Do's and Don'ts

### Do:
- **Do** use Bodoni Moda for every display number and headline. The variable weight axis (300–900) is the primary expressive tool.
- **Do** use Geist Mono for every structural label — section indices, axis labels, navigation, status bars. Always uppercase, always tracked.
- **Do** use 1px hairline borders to carve sections and create the ruled-sheet grid.
- **Do** layer near-black greys (paper, muted, popover) to create depth without shadows.
- **Do** use Foundry Gold sparingly — as a filled shape, a filled dot, or raw text fill. Its rarity is the point.
- **Do** keep all corners sharp (radius 0). The visual language is rectangular and ruled.
- **Do** let type scale carry hierarchy — larger always means more important, never a different color.

### Don't:
- **Don't** use gold as a border, stroke, outline, or gradient. Gold is always a filled solid.
- **Don't** add shadows, box-shadow, drop-shadow, or backdrop-blur to any element. Depth is tonal, not spatial.
- **Don't** use rounded corners on any component. The one exception is the AxisControl slider thumb.
- **Don't** introduce a second display font. Bodoni Moda is the only face for display and headline text.
- **Don't** use color weight for hierarchy. Never make text bolder by changing its color — only by changing its scale.
- **Don't** add gradients to backgrounds, text fills, or borders. Flat fills only.
- **Don't** use decorative imagery or illustration. The typography is the ornament.
