# Hero action order

## Decision

Keep the existing six hero links and the desktop three-column, two-row layout. Do not add a bilingual resume, WeChat, blog, or patent button.

The visual and keyboard order in both Chinese and English is:

| Row | Left | Middle | Right |
| --- | --- | --- | --- |
| 1 | Chinese resume | English resume | LinkedIn |
| 2 | GitHub | Contact me | Learn more |

Chinese labels remain `中文简历`, `英文简历`, `LinkedIn`, `GitHub`, `联系我`, and `了解更多`. English labels remain their existing translations. `联系我` and `了解更多` are always the last two actions. Their targets remain `#contact` and `#education` respectively.

## Scope and behavior

- Reorder only the hero action markup. Keep button dimensions, colors, icons, resume file URLs, download names, update-date tooltips, and contact-section links unchanged.
- Preserve responsive behavior: three columns on wide desktop, two columns at the existing tablet/mobile breakpoints. The DOM order follows the table, so narrow layouts keep Contact me and Learn more last.
- Keep all six links keyboard accessible and maintain the current focus/hover states.

## Verification

- Unit test the exact six-link DOM order in both languages and the two anchor destinations.
- Run the existing project checks and browser tests, including narrow-viewport overflow checks.
- Visually inspect the hero in Chinese and English at desktop and phone widths; confirm labels do not wrap unexpectedly and light/dark styles remain legible.

## Out of scope

No new resume PDF, social account, third-party blog, section, or navigation item is introduced.
