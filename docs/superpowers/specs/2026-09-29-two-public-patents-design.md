# Two published patents in the portfolio

## Goal

Show both verifiable utility-model patents in Meihan Qian's bilingual job portfolio. Describe her inventor role accurately without implying that she personally owns the employer's patents or disclosing unpublished project material.

## Verified public records

| Publication | Official Chinese title | Inventor listing | Published | Engineering focus |
| --- | --- | --- | --- | --- |
| [CN222839946U](https://patents.google.com/patent/CN222839946U/zh) | 用于BMS控制器壳体的卡扣结构和BMS控制器壳体 | 钱美含 | 2025-05-06 | Double-sided snap-fit that reduces the risk of housing disengagement. |
| [CN223978857U](https://patents.google.com/patent/CN223978857U/zh) | 电子装置 | 李雪、钱美含 | 2026-03-06 | Housing and PCB retention with improved creepage distance. |

Both records currently identify a company, not Meihan Qian, as the assignee. The résumé phrases “BMS 外壳多功能支撑结构” and “绝缘结构设计” describe the work but are not the publications' formal titles. The portfolio uses the formal titles and publication numbers.

## Content and presentation

- In the overview, change the patent proof point from `1 项 / 1 published` to `2 项 / 2 published` with labels that explicitly refer to published utility-model patents. Retain the previously discussed `4 年` experience metric, correct `3 类` to stamped, die-cast, and injection-molded **part design**, and add `3 种语言` for Chinese, English, and French B2. Do not imply equal proficiency across the languages.
- In the patent section, display two compact cards in ascending publication-date order: CN222839946U first, CN223978857U second. Each includes the publication number, formal bilingual title, publication status, a one-sentence summary grounded in the published abstract, inventor role, a note that the public record lists the employer as patent-right holder, and a link to that record. The English section heading becomes plural.
- Use only publicly published patent drawings as images. Keep the full drawing visible rather than using a cropped screenshot, credit the publication, and link back to the source. Do not add company CAD, test results, customer names, or unpublished project details.
- Keep the desktop patent presentation compact and visually balanced; stack cards naturally on narrow screens. Preserve the existing site palette and component language. The four overview proof points must remain readable and fit within the initial 1366 × 650 desktop viewport in both locales, while the phone layout may scroll naturally.
- The content remains editable through the existing content JSON and local editor workflow; public visitors remain read-only.

## Boundaries and checks

- Follow the existing React/JSON structure and limit changes to content, patent presentation, associated media metadata/assets, and necessary styles/tests. No new service, login, or publishing mechanism.
- Do not change the downloadable original résumés. This update is about the on-page summary and patent section only.
- Verify both publication numbers, inventor attribution, title, ownership wording, and link targets against the two public records; verify Chinese and English copy separately.
- Run the repository's type checks, tests, and build. Check browser layouts at 1366 × 650, 1440 × 900, and a narrow phone width for clipping, wrapping, image completeness, and horizontal overflow.
- Publish through the existing GitHub Pages workflow only after the changes and checks pass.
