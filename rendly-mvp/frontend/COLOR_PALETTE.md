# Rendly Color Palette Guide

## Palette 1: Modern Dark-to-Cyan

### Black Scale (with Cyan accents)
- **black.500** `#000505` - Primary dark
- **black.700** `#00cfcf` - Bright cyan
- **black.800** `#35ffff` - Accent cyan
- **black.900** `#9affff` - Light cyan

### Purple Tones
- **space_indigo.500** `#3b3355` - Primary purple (use for text, buttons)
- **space_indigo.700** `#8073ab` - Medium purple
- **space_indigo.900** `#d5d0e3` - Light purple

### Muted Purples
- **dusty_grape.500** `#5d5d81` - Muted purple (secondary text)
- **dusty_grape.800** `#bdbdcf` - Very light purple

### Light Blues
- **pale_sky_1.500** `#bfcde0` - Muted blue (for text)
- **pale_sky_1.900** `#f2f5f9` - Very light blue (backgrounds)

### Whites
- **white_1.500** `#fefcfd` - Off-white (main background)

---

## Palette 2: Blue-Grey Professional

### Deep Blue (Dark)
- **ink_black.500** `#04080f` - Foreground text
- **ink_black.800** `#648ed6` - Medium blue

### Primary Blue
- **glaucous.500** `#507dbc` - Secondary color (buttons, accents)
- **glaucous.700** `#97b2d7` - Light blue

### Sky Blues
- **powder_blue.500** `#a1c6ea` - Light accent
- **pale_sky_2.500** `#bbd1ea` - Lighter accent

### Greys
- **alabaster_grey.500** `#dae3e5` - Border color
- **alabaster_grey.800** `#f1f4f5` - Very light background

---

## Semantic Usage (Light Theme)

| Element | Color | Hex |
|---------|-------|-----|
| **Background** | white_1 | #fefcfd |
| **Foreground/Text** | ink_black | #04080f |
| **Primary Button** | space_indigo | #3b3355 |
| **Secondary Button** | glaucous | #507dbc |
| **Accent/CTA** | black.800 (cyan) | #35ffff |
| **Borders** | alabaster_grey | #dae3e5 |
| **Input Background** | pale_sky_1.900 | #f2f5f9 |
| **Card Background** | white_1 | #fefcfd |
| **Secondary Text** | muted-foreground | #5d5d81 |
| **Disabled State** | pale_sky_1 | #bfcde0 |

---

## Component Examples

### Button
```html
<!-- Primary -->
<button class="bg-primary text-white_1 hover:bg-space_indigo">
  Primary Button
</button>

<!-- Secondary -->
<button class="bg-secondary text-white_1 hover:bg-glaucous">
  Secondary Button
</button>

<!-- Outline -->
<button class="border-2 border-border text-primary hover:bg-input-bg">
  Outline Button
</button>

<!-- Accent -->
<button class="bg-accent text-ink_black hover:bg-black-700">
  Accent Button
</button>
```

### Card
```html
<div class="bg-card-bg border border-border rounded-lg p-4 shadow-sm-light">
  <h3 class="text-primary font-bold">Card Title</h3>
  <p class="text-muted-foreground text-sm">Card description...</p>
</div>
```

### Text
```html
<!-- Primary text -->
<p class="text-primary">Primary text</p>

<!-- Secondary text -->
<p class="text-secondary">Secondary text</p>

<!-- Muted text -->
<p class="text-muted-foreground">Muted text</p>

<!-- Accent text -->
<p class="text-accent">Accent text</p>
```

---

## Dark Mode (if needed in future)

Just add `darkMode: 'class'` to tailwind.config.ts and use:
```html
<button class="bg-primary dark:bg-ink_black">
  Button
</button>
```

Currently set to light theme only: `darkMode: false`
