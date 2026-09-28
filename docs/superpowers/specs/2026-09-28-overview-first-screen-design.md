# Overview in the first desktop screen

## Goal

When the portfolio opens at a 1366 × 650 CSS-pixel desktop viewport, visitors can see the whole Overview area without scrolling: name, role, introduction, six links, portrait, and all three proof points (`4 年`, `3 类`, `1 项`). The bottom border of the proof-point strip is within the viewport in both Chinese and English.

The current desktop layout puts the strip bottom at about 686 px at that viewport height, so roughly 36 px is cut off.

## Design

Reduce the reserved vertical height of the desktop hero so the proof-point strip starts higher. Keep the existing split layout, type sizes, portrait size, three-column proof-point layout, button arrangement, and all content. Do not overlap elements or hide overflow to simulate a fit.

The overview should still breathe at taller desktop sizes such as 1440 × 900. At tablet and phone widths, retain the current responsive stacking and natural scroll; the full overview is not required to fit in a short phone viewport.

## Implementation boundary

Only the hero's vertical sizing and, if needed for the target desktop height, its block padding change in `src/styles/global.css`. The proof-point markup, metric values, images, navigation, and content JSON remain untouched.

## Acceptance checks

- At 1366 × 650, in both languages, the proof-point strip's bottom is at or above `window.innerHeight`, with all six links and portrait visible.
- At 1440 × 900, the hero and proof-point strip retain clear visual spacing and no text or buttons wrap unexpectedly.
- Existing phone and tablet layouts remain readable, with no horizontal overflow at 360 × 800.
- Existing unit, build, and browser tests pass; a browser test locks the 1366 × 650 first-screen requirement.
